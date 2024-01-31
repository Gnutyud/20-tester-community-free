"use client";
import GroupCard from "@/components/group-card";
import { NoOpenGroupCard } from "@/components/no-open-group-card";
import Sidebar from "@/components/sidebar";
import { Container } from "@/components/ui/container";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GroupItem } from "@/types";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";

export default function Home() {
  const notify = () => toast("Here is your toast.");
  const { data: session } = useSession();
  console.log("session", session);
  const groupData: GroupItem[] = [
    {
      id: 1,
      members: ["tda@gmail.com", "hello@gmail.com"],
      maxMembers: 25,
      status: "open",
      becameTesterNumber: 0,
      startedTestDate: null,
    },
    {
      id: 2,
      members: ["tda2@gmail.com", "hello2@gmail.com", "hello2@gmail.com", "hello2@gmail.com", "hello2@gmail.com"],
      maxMembers: 5,
      status: "become a tester",
      becameTesterNumber: 3,
      startedTestDate: null,
    },
    {
      id: 3,
      members: [
        "tdmlhn2@gmail.com",
        "asd@gmail.com",
        "asd@gmail.com",
        "asd@gmail.com",
        "asd@gmail.com",
        "asd@gmail.com",
        "asd@gmail.com",
        "asd@gmail.com",
        "asd@gmail.com",
        "asd@gmail.com",
      ],
      maxMembers: 10,
      status: "inprogress",
      becameTesterNumber: 10,
      startedTestDate: "2024-01-20",
    },

    {
      id: 4,
      members: ["tda1@gmail.com", "hello1@gmail.com"],
      maxMembers: 2,
      status: "complete",
      becameTesterNumber: 2,
      startedTestDate: "2024-01-15",
    },
  ];
  const openData = groupData.filter((data) => data.status === "open");
  const inprogressData = groupData.filter((data) => data.status !== "open" && data.status !== "complete");
  const completeData = groupData.filter((data) => data.status === "complete");
  return (
    <main>
      <Container>
        <section className="grid grid-cols-4 gap-8 py-4">
          <div className="col-span-3">
            <Tabs defaultValue="open" className="w-full">
              <TabsList>
                <TabsTrigger value="open">Open</TabsTrigger>
                <TabsTrigger value="inprogress">Inprogress</TabsTrigger>
                <TabsTrigger value="complete">Complete</TabsTrigger>
              </TabsList>
              <TabsContent value="open">
                <div className="grid grid-cols-1 gap-4">
                  {openData.length === 0 && (
                    <div className="flex justify-center items-center">
                      <NoOpenGroupCard />
                    </div>
                  )}
                  {openData.map((group) => (
                    <GroupCard
                      key={group.id}
                      id={group.id}
                      maxMembers={group.maxMembers}
                      status={group.status as any}
                      members={group.members}
                      becameTesterNumber={group.becameTesterNumber}
                      startedTestDate={group.startedTestDate}
                    />
                  ))}
                </div>
              </TabsContent>
              <TabsContent value="inprogress">
                <div className="grid grid-cols-1 gap-4">
                  {inprogressData.map((group) => (
                    <GroupCard
                      key={group.id}
                      id={group.id}
                      maxMembers={group.maxMembers}
                      status={group.status as any}
                      members={group.members}
                      becameTesterNumber={group.becameTesterNumber}
                      startedTestDate={group.startedTestDate}
                    />
                  ))}
                </div>
              </TabsContent>
              <TabsContent value="complete">
                <div className="grid grid-cols-1 gap-4">
                  {completeData.map((group) => (
                    <GroupCard
                      key={group.id}
                      id={group.id}
                      maxMembers={group.maxMembers}
                      status={group.status as any}
                      members={group.members}
                      becameTesterNumber={group.becameTesterNumber}
                      startedTestDate={group.startedTestDate}
                    />
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </div>
          <Sidebar />
        </section>
      </Container>
    </main>
  );
}
