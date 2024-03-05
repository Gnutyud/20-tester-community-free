"use client";
import GroupCard from "@/components/group-card";
import { NoOpenGroupCard } from "@/components/no-open-group-card";
import Sidebar from "@/components/sidebar";
import { Container } from "@/components/ui/container";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GroupItem, StatusTypes } from "@/types";
import { useEffect, useState } from "react";

export default function Home() {
  const [groupData, setGroupData] = useState<GroupItem[]>([]);
  const openData = groupData.filter((data) => data.status === StatusTypes.OPEN);
  const inprogressData = groupData.filter(
    (data) => data.status !== StatusTypes.OPEN && data.status !== StatusTypes.COMPLETE
  );
  const completeData = groupData.filter((data) => data.status === StatusTypes.COMPLETE);

  useEffect(() => {
    const fetchGroupData = async () => {
      const data = await fetch("/api/group");
      const response = await data.json();
      setGroupData(response);
    };
    fetchGroupData();
  }, []);

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
                      users={group.users}
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
                      users={group.users}
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
                      users={group.users}
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
