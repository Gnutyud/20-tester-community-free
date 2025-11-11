import { Prisma, StatusTypes } from "@prisma/client";

import { checkAndUpdateGroupStatus } from "@/data/group";
import { db } from "@/lib/db";
import { sendQueueReminderEmail } from "@/lib/mail";

const MATCH_WINDOW_MS = 48 * 60 * 60 * 1000;
const MIN_MEMBERS = 5;
const MAX_MEMBERS = 25;
const REMINDER_THRESHOLDS = [
  {
    stage: 1,
    hours: 24,
    notificationTitle: "Still waiting for more testers",
    notificationMessage:
      "Your app is still in the matchmaking queue. Invite a few friends so we can reach the minimum of five members faster.",
  },
  {
    stage: 2,
    hours: 48,
    notificationTitle: "Queue still waiting for a full group",
    notificationMessage:
      "We haven’t found enough testers yet. Your app remains queued and we’ll notify you as soon as a group is ready.",
  },
] as const;

type TransactionClient = Prisma.TransactionClient;

const QUEUE_ENTRY_INCLUDE = {
  app: {
    select: {
      id: true,
      userId: true,
      targetTesterCount: true,
      fulfilledTesterCount: true,
    },
  },
  user: {
    select: {
      id: true,
      email: true,
      name: true,
    },
  },
} satisfies Prisma.QueueEntryInclude;

type QueueEntryWithApp = Prisma.QueueEntryGetPayload<{
  include: typeof QUEUE_ENTRY_INCLUDE;
}>;

const reserveNextGroupNumber = async (tx: TransactionClient) => {
  const existingCounter = await tx.counter.findUnique({
    where: { model: "Group" },
  });

  if (!existingCounter) {
    await tx.counter.create({
      data: {
        model: "Group",
        sequence: 1,
      },
    });

    return 1;
  }

  const next = existingCounter.sequence + 1;

  await tx.counter.update({
    where: { model: "Group" },
    data: { sequence: next },
  });

  return next;
};

const getInviteLink = () => {
  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL || process.env.APP_URL || "";
  return baseUrl ? `${baseUrl.replace(/\/$/, "")}/group/create` : "/group/create";
};

const handleQueueReminders = async (entries: QueueEntryWithApp[]) => {
  if (!entries.length) return;

  const now = new Date();
  const inviteLink = getInviteLink();

  for (const entry of entries) {
    if (!entry.user?.email) {
      continue;
    }

    const waitingHours =
      (now.getTime() - entry.joinedAt.getTime()) / (1000 * 60 * 60);

    for (const threshold of REMINDER_THRESHOLDS) {
      if (
        waitingHours >= threshold.hours &&
        entry.reminderStage < threshold.stage
      ) {
        await db.notification.create({
          data: {
            userId: entry.userId,
            groupId: null,
            title: threshold.notificationTitle,
            message: `${threshold.notificationMessage} Share this link: ${inviteLink}`,
          },
        });

        await sendQueueReminderEmail(
          entry.user.email,
          threshold.hours,
          inviteLink
        );

        await db.queueEntry.update({
          where: { id: entry.id },
          data: {
            reminderStage: threshold.stage,
            lastReminderAt: now,
          },
        });
      }
    }
  }
};

export const processQueue = async () => {
  while (true) {
    const queueEntries = await db.queueEntry.findMany({
      orderBy: { joinedAt: "asc" },
      include: QUEUE_ENTRY_INCLUDE,
    });

    if (queueEntries.length < MIN_MEMBERS) {
      await handleQueueReminders(queueEntries);
      return;
    }

    await handleQueueReminders(queueEntries);

    const firstEntry = queueEntries[0];
    const windowLimit = new Date(firstEntry.joinedAt.getTime() + MATCH_WINDOW_MS);

    const selectedEntries: QueueEntryWithApp[] = [];
    const usedUsers = new Set<string>();

    for (const entry of queueEntries) {
      if (usedUsers.has(entry.userId)) {
        continue;
      }

      if (selectedEntries.length === 0) {
        selectedEntries.push(entry);
        usedUsers.add(entry.userId);
        continue;
      }

      if (entry.joinedAt > windowLimit && selectedEntries.length < MIN_MEMBERS) {
        // Wait for more members inside the same 48h window
        return;
      }

      if (entry.joinedAt > windowLimit && selectedEntries.length >= MIN_MEMBERS) {
        break;
      }

      selectedEntries.push(entry);
      usedUsers.add(entry.userId);

      if (selectedEntries.length === MAX_MEMBERS) {
        break;
      }
    }

    if (selectedEntries.length < MIN_MEMBERS) {
      // We may have sent reminders above, nothing else to do.
      return;
    }

    const { groupId } = await db.$transaction(async (tx) => {
      const groupNumber = await reserveNextGroupNumber(tx);
      const ownerId = selectedEntries[0].userId;

      const group = await tx.group.create({
        data: {
          ownerId,
          groupNumber,
          maxMembers: selectedEntries.length,
          status: StatusTypes.OPEN,
          groupUsers: {
            create: selectedEntries.map((entry) => ({
              userId: entry.userId,
            })),
          },
        },
      });

      const testerSlots = selectedEntries.length - 1;
      const now = new Date();

      for (const entry of selectedEntries) {
        await tx.groupApps.create({
          data: {
            appId: entry.appId,
            groupId: group.id,
          },
        });

        await tx.app.update({
          where: { id: entry.appId },
          data: {
            fulfilledTesterCount: {
              increment: testerSlots,
            },
          },
        });

        const updatedRemaining = entry.remainingSlots - testerSlots;

        if (updatedRemaining <= 0) {
          await tx.queueEntry.delete({
            where: { id: entry.id },
          });
        } else {
          await tx.queueEntry.update({
            where: { id: entry.id },
            data: {
              remainingSlots: updatedRemaining,
              joinedAt: now,
            },
          });
        }
      }

      const notificationMessage = `A new group has been created for you! Coordinate with fellow members to reach the testing phase quickly.`;

      for (const entry of selectedEntries) {
        await tx.notification.create({
          data: {
            groupId: group.id,
            userId: entry.userId,
            title: "You have been matched to a group!",
            message: notificationMessage,
          },
        });
      }

      return { groupId: group.id };
    });

    await checkAndUpdateGroupStatus(groupId);
  }
};

