"use client";

import { GroupWelcome } from "@/components/group/group-welcome";
import LoadingPage from "@/components/loading-page";
import { ConfirmModal } from "@/components/modal/confirm-modal";
import { Timer } from "@/components/timer/timer";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { UploadImageInputDropzone } from "@/components/upload-image";
import { useCurrentUser } from "@/hooks/use-current-user";
import { GroupActions, GroupItem } from "@/types";
import {
  App,
  Notification,
  RequestStatus,
  StatusTypes,
  UserRole,
} from "@prisma/client";
import axios from "axios";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { Bell, Copy } from "lucide-react";
import {
  redirect,
  usePathname,
  useRouter,
  useSearchParams,
} from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import Loading from "./loading";

type TabName = "testing" | "confirm" | "tested";
interface AppInfo {
  appName: string;
  packageName: string;
  id: string;
}
dayjs.extend(relativeTime);

function GroupDetails({ params }: { params: { id: string } }) {
  const id = params.id;
  const [group, setGroup] = useState<GroupItem | null>(null);
  const curentUser = useCurrentUser();
  const [selectedApp, setSelectedApp] = useState<App | null>(null);
  const [imageUrl, setImageUrl] = useState<string>("");
  const [imageUploadMethod, setImageUploadMethod] = useState<"link" | "upload">(
    "link"
  );
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const tabName = searchParams.get("tab");
  const [defaultTab, setDefaultTab] = useState<TabName>(
    tabName === "confirm"
      ? "confirm"
      : tabName === "tested"
      ? "tested"
      : "testing"
  );
  const [showConfirm, setShowConfirm] = useState<boolean>(false);
  const [selectedRequest, setSelectedRequest] = useState<{
    requestId: string;
    actionType: RequestStatus;
  } | null>(null);
  const [confirmLoading, setConfirmLoading] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const isOwnerGroup = curentUser?.id === group?.ownerId;
  const IS_MEMBER = group?.users
    .map((user) => user.email)
    .includes(curentUser?.email!);
  const IS_ADMIN = curentUser?.role === UserRole.ADMIN;

  useEffect(() => {
    if (
      group?.users &&
      curentUser?.id &&
      !group.users.some((user) => user.id === curentUser.id) &&
      curentUser.role !== UserRole.ADMIN
    )
      redirect("/");
  }, [curentUser, group?.users]);

  const myApp = group?.apps.find((app) => app.userId === curentUser?.id);
  const COMBINE_APPS = group?.apps
    .filter((a) => a.userId !== curentUser?.id)
    .map((app) => {
      let myRequest = group?.confirmRequests.find(
        (request) =>
          request.userId === curentUser?.id &&
          request.userRequested === app.userId
      );
      if (myRequest)
        return {
          ...app,
          requestSent: true,
          requestStatus: myRequest?.status,
          requestId: myRequest?.id,
        };
      return app;
    });
  const TESTED_APPS =
    COMBINE_APPS?.filter((app) => (app as any)?.requestStatus === "ACCEPTED") ||
    [];
  const TODO_APPS =
    COMBINE_APPS?.filter((app) => (app as any)?.requestStatus !== "ACCEPTED") ||
    [];
  const COMBINE_REQUESTS_TO_ME = (
    group?.confirmRequests.filter(
      (request) =>
        request.userRequested === curentUser?.id && request.status === "PENDING"
    ) || []
  ).map((request) => {
    let user = group?.users.find((user) => user.id === request.userId);
    if (!user) return request;
    return {
      ...request,
      userEmail: user?.email,
      userName: user?.name,
      userAvatar: user?.avatar,
    };
  });
  // Create a map to store user app information
  const userAppMap: Record<string, AppInfo[]> = {};
  // Populate the map with app info
  group?.apps.forEach((app) => {
    if (!userAppMap[app.userId]) {
      userAppMap[app.userId] = [];
    }
    userAppMap[app.userId].push({
      appName: app.appName,
      packageName: app.packageName,
      id: app.id,
    });
  });

  // Add app info to users
  const updatedUsers = group?.users.map((user) => {
    return {
      ...user,
      apps: userAppMap[user.id] || [],
    };
  });

  const fetchGroup = async () => {
    const res = await axios.get(`/api/group/${id}`);
    setGroup(res.data);
    makeAllAsRead(res?.data?.notifications || []);
  };

  useEffect(() => {
    fetchGroup();
  }, [id]);

  // searchParams with a provided key/value pair
  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set(name, value);

      return params.toString();
    },
    [searchParams]
  );

  const setParams = (value: TabName) => {
    // <pathname>?tab=testing
    router.push(pathname + "?" + createQueryString("tab", value));
  };

  const onCopy = (url?: string) => {
    if (url) {
      navigator.clipboard.writeText(url);
      toast.success("URL copied to clipboard.");
    }
  };

  const handleRequest = async () => {
    try {
      if (!(selectedApp as any)?.requestId) {
        await axios.post("/api/request", {
          groupId: group?.id,
          userId: curentUser?.id,
          appUserId: selectedApp?.userId,
          imageUrl: imageUrl,
        });
      } else {
        await axios.put("/api/request", {
          id: (selectedApp as any)?.requestId,
          imageUrl: imageUrl,
        });
      }
      toast.success("Request sent successfully.");
      setSelectedApp(null);
      setImageUrl("");
      fetchGroup();
    } catch (error) {
      toast.error("Failed to send request.");
    }
  };

  const handleConfirm = async () => {
    try {
      if (!selectedRequest) {
        setShowConfirm(false);
        return;
      }
      setConfirmLoading(true);
      const { requestId, actionType } = selectedRequest;
      await axios.post("/api/request/confirm", {
        requestId,
        actionType,
        groupId: group?.id,
      });
      toast.success("Send response successfully.");
      handleCancelRequest();
      fetchGroup();
    } catch (error) {
      toast.error("Failed to confirm request.");
      handleCancelRequest();
    }
  };

  const handleCancelRequest = () => {
    setSelectedRequest(null);
    setShowConfirm(false);
    setConfirmLoading(false);
  };

  const makeAllAsRead = async (notifications: Notification[]) => {
    try {
      const requests = notifications
        .filter((noti) => noti.unread && noti.userId === curentUser?.id)
        .map((noti) => axios.post("/api/notification", { id: noti.id }));
      await Promise.all(requests);
    } catch (error) {
      console.log("Failed to update all notification.");
    }
  };

  const handleLeaveGroup = async (appId: string, userId?: string) => {
    try {
      if (!curentUser) {
        router.push(`/auth/login`);
      } else {
        setLoading(true);
        await axios.post(`/api/group/${group?.id}`, {
          appId: appId,
          action: GroupActions.LEAVE,
          userId,
        });
        toast.success("You left the group successfully!");
        setLoading(false);
        if (userId) {
          fetchGroup();
        } else {
          router.push("/");
        }
      }
    } catch (error) {
      toast.error("Leave group error");
      setLoading(false);
    }
  };

  const isUserActive = (lastActiveAt: string) => {
    const lastActiveAtConvert = new Date(lastActiveAt).getTime();
    const now = Date.now();
    const activeThreshold = 10 * 60 * 1000; // 10 minutes in milliseconds

    return now - lastActiveAtConvert <= activeThreshold;
  };

  if (!group) {
    return <Loading />;
  }

  return (
    <div className="py-4">
      {loading && <LoadingPage text="Leaving..." />}
      <div className="flex justify-between">
        <GroupWelcome
          name={group.groupNumber}
          maxMembers={group.maxMembers}
          status={group.status}
          members={group.users.length}
        />
        {IS_MEMBER && (
          <Button
            className="text-white bg-red-700 hover:bg-red-800 dark:bg-red-600 dark:hover:bg-red-700"
            onClick={() => handleLeaveGroup(myApp?.id!)}
          >
            Leave
          </Button>
        )}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-5 gap-8 py-4">
        <div className="md:col-span-3">
          {group?.status !== StatusTypes.INPROGRESS &&
            group?.status !== StatusTypes.COMPLETE && (
              <Tabs defaultValue={defaultTab} className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger
                    value="testing"
                    onClick={() => setParams("testing")}
                  >
                    Todo ({TODO_APPS.length || 0})
                  </TabsTrigger>
                  <TabsTrigger
                    value="confirm"
                    onClick={() => setParams("confirm")}
                  >
                    Confirm ({COMBINE_REQUESTS_TO_ME.length || 0})
                  </TabsTrigger>
                  <TabsTrigger
                    value="tested"
                    onClick={() => setParams("tested")}
                  >
                    Tested ({TESTED_APPS.length || 0})
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="testing">
                  {TODO_APPS.length > 0 ? (
                    TODO_APPS.map((app) => (
                      <div
                        key={app.id}
                        className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-md mb-3"
                      >
                        <p className="text-sm font-medium">
                          {app.appName} ({app.packageName})
                        </p>
                        <div>
                          {IS_MEMBER && (
                            <>
                              {!(app as any).requestSent ? (
                                <Button onClick={() => setSelectedApp(app)}>
                                  {"Click to test"}
                                </Button>
                              ) : (app as any)?.requestStatus ===
                                RequestStatus.REJECTED ? (
                                <Button
                                  className="bg-green-500 text-white"
                                  onClick={() => setSelectedApp(app)}
                                >
                                  Re-test
                                </Button>
                              ) : (
                                <Button className="bg-yellow-500 text-white">
                                  {(app as any)?.requestStatus ===
                                  RequestStatus.REJECTED
                                    ? "Re-test"
                                    : (app as any)?.requestStatus}
                                </Button>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-sm text-muted-foreground">
                      No apps to test please wait for all members become a
                      tester for each other!
                    </div>
                  )}
                </TabsContent>
                <TabsContent value="confirm">
                  {COMBINE_REQUESTS_TO_ME.length > 0 ? (
                    COMBINE_REQUESTS_TO_ME.map((request) => (
                      <HoverCard key={request.id}>
                        <HoverCardTrigger>
                          <div className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-md mb-3">
                            <p className="text-sm font-medium">
                              {(request as any)?.userName} (
                              {(request as any)?.userEmail}) just asked you to
                              confirm that he had installed your app
                            </p>
                            <>
                              <Button
                                className="mr-2 bg-red-800 text-white"
                                onClick={() => {
                                  setSelectedRequest({
                                    requestId: request.id,
                                    actionType: RequestStatus.REJECTED,
                                  });
                                  setShowConfirm(true);
                                }}
                              >
                                {"Reject"}
                              </Button>
                              <Button
                                className="bg-green-800 text-white"
                                onClick={() => {
                                  setSelectedRequest({
                                    requestId: request.id,
                                    actionType: RequestStatus.ACCEPTED,
                                  });
                                  setShowConfirm(true);
                                }}
                              >
                                {"Confirm"}
                              </Button>
                            </>
                          </div>
                        </HoverCardTrigger>
                        <HoverCardContent>
                          <div className="flex justify-center items-center">
                            <img
                              className="w-auto h-[400px]"
                              src={request?.imageUrl || ""}
                              alt="evidence image preview"
                            />
                          </div>
                        </HoverCardContent>
                      </HoverCard>
                    ))
                  ) : (
                    <div className="text-sm text-muted-foreground">
                      No apps to confirm right now!
                    </div>
                  )}
                </TabsContent>
                <TabsContent value="tested">
                  {TESTED_APPS.length > 0 ? (
                    TESTED_APPS.map((app) => (
                      <div
                        key={app?.id}
                        className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-md mb-3"
                      >
                        <p className="text-sm font-medium">
                          {app?.appName} ({app?.packageName})
                        </p>
                        <Button className="bg-green-800 text-white">
                          {(app as any)?.requestStatus}
                        </Button>
                      </div>
                    ))
                  ) : (
                    <div className="text-sm text-muted-foreground">
                      You have not tested any apps yet
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            )}
          {group?.status === StatusTypes.INPROGRESS && (
            <Timer endDate={group?.startedTestDate!} />
          )}
          {group?.status === StatusTypes.COMPLETE && (
            <div className="mt-4 font-red-hat text-4xl dark:text-white duration-300 ease-in text-center text-back">
              Group test has been completed!
            </div>
          )}
        </div>
        <div className="md:col-span-2">
          <Accordion
            type="single"
            defaultValue="activity"
            collapsible
            className="w-full"
          >
            <AccordionItem value="activity">
              <AccordionTrigger>Group activity</AccordionTrigger>
              <AccordionContent className="max-h-[500px] overflow-auto">
                {group.notifications.length > 0 ? (
                  group.notifications
                    .sort((a, b) => {
                      return (
                        new Date(b.createdAt).getTime() -
                        new Date(a.createdAt).getTime()
                      );
                    })
                    .map((notification) => (
                      <Alert className="mb-3" key={notification.id}>
                        <Bell className="h-4 w-4" />
                        <AlertTitle>{`${dayjs(notification.createdAt).format(
                          "MMM D, YYYY h:mm A"
                        )} - ${notification.title}`}</AlertTitle>
                        <AlertDescription>
                          {notification.message}
                        </AlertDescription>
                      </Alert>
                    ))
                ) : (
                  <div className="text-sm text-muted-foreground">
                    No Activity
                  </div>
                )}
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="members">
              <AccordionTrigger>
                Members ({group.users.length}/{group.maxMembers})
              </AccordionTrigger>
              <AccordionContent>
                <ul role="list" className="border rounded-lg p-4 shadow-md">
                  {updatedUsers?.map((person, index) => (
                    <div key={person.email}>
                      <li className="flex justify-between gap-x-6 py-2">
                        <div className="flex min-w-0 gap-x-4">
                          <Avatar className="inline-block h-12 w-12 rounded-full ring-2 ring-white">
                            <AvatarImage
                              src={person.avatar}
                              alt={person.name}
                            />
                            <AvatarFallback>
                              {person?.name?.charAt(0)?.toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0 flex-auto">
                            <p className="text-sm font-semibold leading-6">
                              {person.name}{" "}
                              {person.id === curentUser?.id && "(You)"}
                            </p>
                            <p className="mt-1 truncate text-xs leading-5 text-gray-500">
                              {person.email}
                            </p>
                            <p className="mt-1 truncate text-xs leading-5 text-gray-500">
                              App: {person.apps[0].appName} (
                              {person.apps[0].packageName})
                            </p>
                            {((isOwnerGroup && curentUser?.id !== person.id) ||
                              curentUser?.role === UserRole.ADMIN) && (
                              <Button
                                className="text-white bg-red-700 hover:bg-red-800 dark:bg-red-600 dark:hover:bg-red-700 mt-4"
                                onClick={() =>
                                  handleLeaveGroup(person.apps[0].id, person.id)
                                }
                              >
                                Kick
                              </Button>
                            )}
                          </div>
                        </div>
                        <div className="hidden shrink-0 sm:flex sm:flex-col sm:items-end">
                          <p className="text-sm leading-6 ">{person.role}</p>
                          {person.lastActiveAt && (
                            <div className="mt-1 flex items-center gap-x-1.5">
                              <div
                                className={`flex-none rounded-full ${
                                  !isUserActive(person.lastActiveAt)
                                    ? "bg-neutral-500/20"
                                    : "bg-emerald-500/20"
                                } p-1`}
                              >
                                <div
                                  className={`h-1.5 w-1.5 rounded-full ${
                                    !isUserActive(person.lastActiveAt)
                                      ? "bg-neutral-500"
                                      : "bg-emerald-500"
                                  }`}
                                />
                              </div>
                              <p className="text-xs leading-5 text-gray-500">
                                {isUserActive(person.lastActiveAt)
                                  ? "Online"
                                  : dayjs(person.lastActiveAt).fromNow()}
                              </p>
                            </div>
                          )}
                        </div>
                      </li>
                      {index !== group.users.length - 1 && (
                        <Separator className="my-2" />
                      )}
                    </div>
                  ))}
                </ul>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </div>
      <AlertDialog open={!!selectedApp}>
        <AlertDialogContent className="max-h-[90%] overflow-auto">
          <AlertDialogHeader>
            <AlertDialogTitle>
              Please follow step below to test this app
            </AlertDialogTitle>
            <AlertDialogDescription>
              <p className="mb-2">
                Step 1: Copy Google Group Test Url and join the group
              </p>
              <p className="mb-2">
                Step 2: Install the app using the install url
              </p>
              <p className="mb-2">
                Step 3: Click the button below to confirm you have tested the
                app
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="max-w-full">
            <div className="flex flex-col rounded-lg border p-3 shadow-sm mb-3">
              <p className="text-sm font-medium mb-2">Package Name</p>
              <p className="text-xs font-mono p-1 bg-slate-100 dark:bg-slate-800 rounded-md">
                {selectedApp?.packageName}
              </p>
            </div>
            <div className="flex flex-col rounded-lg border p-3 shadow-sm mb-3">
              <div className="flex flex-row justify-between items-center">
                <p className="text-sm font-medium mb-2">Install Url</p>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Copy
                      className="mr-2 h-4 w-4"
                      onClick={() => onCopy(selectedApp?.installUrl)}
                    />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Copy url</p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <p className="text-xs font-mono p-1 bg-slate-100 dark:bg-slate-800 rounded-md">
                {selectedApp?.installUrl}
              </p>
            </div>
            <div className="flex flex-col rounded-lg border p-3 shadow-sm mb-3">
              <div className="flex flex-row justify-between items-center">
                <p className="text-sm font-medium mb-2">
                  Google Group Test Url
                </p>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Copy
                      className="mr-2 h-4 w-4"
                      onClick={() => onCopy(selectedApp?.googleGroupUrl)}
                    />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Copy url</p>
                  </TooltipContent>
                </Tooltip>
              </div>

              <p className="text-xs font-mono p-1 bg-slate-100 dark:bg-slate-800 rounded-md">
                {selectedApp?.googleGroupUrl}
              </p>
            </div>
            <div className="flex flex-col rounded-lg border p-3 shadow-sm mb-3">
              <p className="text-sm font-medium mb-2">
                Evidence image url (optional)
              </p>
              <div className="flex mb-4 justify-center">
                <div className="flex items-center mr-4">
                  <input
                    onChange={() => setImageUploadMethod("link")}
                    id="link-image"
                    type="radio"
                    value="link"
                    checked={imageUploadMethod === "link"}
                    name="link-image"
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300"
                  />
                  <label
                    htmlFor="link-image"
                    className="ml-2 text-sm font-medium text-gray-900 dark:text-white"
                  >
                    Insert Url
                  </label>
                </div>
                <div className="flex items-center mr-4">
                  <input
                    onChange={() => setImageUploadMethod("upload")}
                    id="upload-image"
                    value="upload"
                    checked={imageUploadMethod === "upload"}
                    type="radio"
                    name="upload-image"
                    className="w-4 h-4 checked:bg-green-500 text-red-600 bg-gray-100 border-gray-300"
                  />
                  <label
                    htmlFor="upload-image"
                    className="ml-2 text-sm font-medium text-gray-900 dark:text-white"
                  >
                    Upload file
                  </label>
                </div>
              </div>
              {imageUploadMethod === "link" ? (
                <Input
                  type="text"
                  id="image"
                  placeholder="Insert your evidence image url to prove that you installed app."
                  value={imageUrl}
                  onChange={(event) => setImageUrl(event.target.value)}
                />
              ) : (
                <UploadImageInputDropzone
                  setValue={(value: string) => setImageUrl(value)}
                />
              )}
              {imageUrl && (
                <div className="mt-4 flex justify-center items-center">
                  <img
                    className="w-auto h-[200px]"
                    src={imageUrl}
                    alt="evidence image preview"
                  />
                </div>
              )}
            </div>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                setSelectedApp(null);
                setImageUrl("");
              }}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleRequest}>
              Confirm became tester
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <ConfirmModal
        open={showConfirm}
        onClose={handleCancelRequest}
        onConfirm={handleConfirm}
        content={`This action cannot be undone.`}
        loading={confirmLoading}
      />
    </div>
  );
}

export default GroupDetails;
