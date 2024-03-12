import { Notification } from '@prisma/client';

export const filterUniqueNotificationMessages = (notifications: Notification[]): Notification[] => {
    const uniqueMessages = new Set<string>();
    const filteredNotifications: Notification[] = [];
    for (const notification of notifications) {
      if (!uniqueMessages.has(notification.message)) {
        uniqueMessages.add(notification.message);
        filteredNotifications.push(notification);
      }
    }
    return filteredNotifications;
  };