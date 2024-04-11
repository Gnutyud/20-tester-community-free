"use client";

import { GroupWelcome } from "@/components/group/group-welcome";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
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
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useCurrentUser } from "@/hooks/use-current-user";
import { GroupItem } from "@/types";
import { App } from "@prisma/client";
import axios from "axios";
import { Bell, Copy } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";

function GroupDetails({ params }: { params: { id: string } }) {
  const id = params.id;
  const [group, setGroup] = useState<GroupItem | null>(null);
  const curentUser = useCurrentUser();
  const [selectedApp, setSelectedApp] = useState<App | null>(null);

  useEffect(() => {
    const fetchGroup = async () => {
      const res = await axios.get(`/api/group/${id}`);
      console.log(res.data);
      setGroup(res.data);
    };
    fetchGroup();
  }, [id]);

  const onCopy = (url?: string) => {
    if (url) {
      navigator.clipboard.writeText(url);
      toast.success("URL copied to clipboard.");
    }
  };

  const handleRequest = async () => {
    try {
      await axios.post("/api/request", {
        groupId: group?.id,
        userId: curentUser?.id,
        appUserId: selectedApp?.userId,
      });
      toast.success("Request sent successfully.");
      setSelectedApp(null);
    } catch (error) {
      toast.error("Failed to send request.");
    }
  }

  if (!group) {
    return <div>Loading...</div>;
  }

  return (
    <div className="py-4">
      <GroupWelcome name={id} maxMembers={group.maxMembers} />
      <div className="grid grid-cols-5 gap-8 py-4">
        <div className="col-span-3">
          <Tabs defaultValue="testing" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="testing">Todo</TabsTrigger>
              <TabsTrigger value="notification">Tested</TabsTrigger>
            </TabsList>
            <TabsContent value="testing">
              {group.apps.map((app) => (
                <div
                  key={app.id}
                  className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-md mb-3"
                >
                  <p className="text-sm font-medium">{app.appName} ({app.packageName})</p>
                  <Button disabled={(app as any).requestSent} onClick={() => setSelectedApp(app)}>{'Click to test'}</Button>
                </div>
              ))}
            </TabsContent>
            <TabsContent value="notification">
              {group.notifications.map((notification) => (
                <Alert className="mb-3" key={notification.id}>
                  <Bell className="h-4 w-4" />
                  <AlertTitle>{notification.title}</AlertTitle>
                  <AlertDescription>{notification.message}</AlertDescription>
                </Alert>
              ))}
            </TabsContent>
          </Tabs>
        </div>
        <div className="col-span-2">
          <Accordion type="single" defaultValue="activity" collapsible className="w-full">
            <AccordionItem value="activity">
              <AccordionTrigger>Group activity</AccordionTrigger>
              <AccordionContent>
                {group.notifications.length > 0 ? (
                  group.notifications.map((notification) => (
                    <Alert className="mb-3" key={notification.id}>
                      <Bell className="h-4 w-4" />
                      <AlertTitle>{notification.title}</AlertTitle>
                      <AlertDescription>{notification.message}</AlertDescription>
                    </Alert>
                  ))
                ) : (
                  <div className="text-sm text-muted-foreground">No Activity</div>
                )}
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="members">
              <AccordionTrigger>Members ({group.users.length})</AccordionTrigger>
              <AccordionContent>
                <ul role="list" className="border rounded-lg p-4 shadow-md">
                  {group.users.map((person, index) => (
                    <div key={person.email}>
                      <li className="flex justify-between gap-x-6 py-2">
                        <div className="flex min-w-0 gap-x-4">
                          <Image
                            className="h-12 w-12 flex-none rounded-full bg-gray-50"
                            width={20}
                            height={20}
                            src={person.avatar}
                            alt={person.name}
                          />
                          <div className="min-w-0 flex-auto">
                            <p className="text-sm font-semibold leading-6">{person.name}</p>
                            <p className="mt-1 truncate text-xs leading-5 text-gray-500">{person.email}</p>
                          </div>
                        </div>
                        <div className="hidden shrink-0 sm:flex sm:flex-col sm:items-end">
                          <p className="text-sm leading-6 ">{"User"}</p>
                          {person.email === curentUser?.email ? (
                            <p className="mt-1 text-xs leading-5 text-gray-500">
                              Last seen <time dateTime={"2024/02/28"}>{"2024/02/28"}</time>
                            </p>
                          ) : (
                            <div className="mt-1 flex items-center gap-x-1.5">
                              <div className="flex-none rounded-full bg-emerald-500/20 p-1">
                                <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                              </div>
                              <p className="text-xs leading-5 text-gray-500">Online</p>
                            </div>
                          )}
                        </div>
                      </li>
                      {index !== group.users.length - 1 && <Separator className="my-2" />}
                    </div>
                  ))}
                </ul>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </div>
      <AlertDialog open={!!selectedApp}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Please follow step below to test this app</AlertDialogTitle>
            <AlertDialogDescription>
              <p className="mb-2">Step 1: Copy Google Group Test Url and join the group</p>
              <p className="mb-2">Step 2: Install the app using the install url</p>
              <p className="mb-2">Step 3: Click the button below to confirm you have tested the app</p>
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
                    <Copy className="mr-2 h-4 w-4" onClick={() => onCopy(selectedApp?.installUrl)} />
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
                <p className="text-sm font-medium mb-2">Google Group Test Url</p>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Copy className="mr-2 h-4 w-4" onClick={() => onCopy(selectedApp?.googleGroupUrl)} />
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
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setSelectedApp(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleRequest}>
              Confirm became tester
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default GroupDetails;
