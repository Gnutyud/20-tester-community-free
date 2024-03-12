"use client";

import { GroupWelcome } from "@/components/group/group-welcome";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { useCurrentUser } from "@/hooks/use-current-user";
import { GroupItem } from "@/types";
import axios from "axios";
import { Bell } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";

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
          {group.notifications.map((notification) => (
            <Alert className="mb-3" key={notification.id}>
              <Bell className="h-4 w-4" />
              <AlertTitle>{notification.title}</AlertTitle>
              <AlertDescription>{notification.message}</AlertDescription>
            </Alert>
          ))}
        </div>
        <div className="col-span-2">
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
        </div>
      </div>
    </div>
  );
}

export default GroupDetails;
