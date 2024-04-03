"use client";

import AppTesting from "@/components/group/app-testing";
import { GroupWelcome } from "@/components/group/group-welcome";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCurrentUser } from "@/hooks/use-current-user";
import { GroupItem } from "@/types";
import axios from "axios";
import { Bell, AppleIcon } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

function GroupDetails({ params }: { params: { id: string } }) {
  const id = params.id;
  const [group, setGroup] = useState<GroupItem | null>(null);
  const curentUser = useCurrentUser();

  useEffect(() => {
    const fetchGroup = async () => {
      const res = await axios.get(`/api/group/${id}`);
      console.log(res.data);
      setGroup(res.data);
    };
    fetchGroup();
  }, [id]);

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
              <TabsTrigger value="testing">Testing</TabsTrigger>
              <TabsTrigger value="notification">Notifications</TabsTrigger>
            </TabsList>
            <TabsContent value="testing">
              {group.apps.map((app) => (
                <div
                  key={app.id}
                  className="group relative flex items-center gap-x-6 rounded-lg p-4 text-sm leading-6 hover:bg-gray-500"
                >
                  <div className="flex h-11 w-11 flex-none items-center justify-center rounded-lg group-hover:bg-gray-50 bg-white">
                    <AppleIcon className="h-6 w-6 text-gray-600 group-hover:text-indigo-600" aria-hidden="true" />
                  </div>
                  <div className="flex-auto">
                    <a href={app.installUrl} className="block font-semibold dark:text-white text-gray-900">
                      {app.appName}
                      <span className="absolute inset-0" />
                    </a>
                    <p className="mt-1 dark:text-whitetext-gray-600">{app.installUrl}</p>
                  </div>
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
    </div>
  );
}

export default GroupDetails;
