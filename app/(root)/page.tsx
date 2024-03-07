"use client";
import GroupCard from "@/components/group-card";
import { NoOpenGroupCard } from "@/components/no-open-group-card";
import Sidebar from "@/components/sidebar";
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
import { Container } from "@/components/ui/container";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCurrentUser } from "@/hooks/use-current-user";
import { GroupItem, StatusTypes } from "@/types";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

export default function Home() {
  const [groupData, setGroupData] = useState<GroupItem[]>([]);
  const [groupId, setGroupId] = useState<number | null>(null);
  const [appId, setAppId] = useState<number | null>(null);
  const [open, setIsOpen] = useState<boolean>(false);
  const curentUser = useCurrentUser();
  const router = useRouter();
  const [apps, setApps] = useState<any[]>([]);

  const openData = groupData.filter((data) => data.status === StatusTypes.OPEN);
  const inprogressData = groupData.filter(
    (data) => data.status !== StatusTypes.OPEN && data.status !== StatusTypes.COMPLETE
  );
  const completeData = groupData.filter((data) => data.status === StatusTypes.COMPLETE);

  useEffect(() => {
    const fetchGroupData = async () => {
      const response: { data: GroupItem[] } = await axios.get("/api/group");
      setGroupData(response.data);
    };
    fetchGroupData();
  }, []);

  useEffect(() => {
    const fetchGroupData = async () => {
      const response: any = await axios.get("/api/app");
      setApps(response.data);
    };
    fetchGroupData();
  }, []);

  const onSelectGroupToJoin = (groupId: number) => {
    setIsOpen(true);
    setGroupId(groupId);
  };

  const handleJoinGroup = async () => {
    try {
      if (!curentUser) {
        router.push("/auth/login");
      } else {
        await axios.post(`/api/group/${groupId}`, {
          appId: appId,
        });
        toast.success("Joined group successfully");
      }
      setIsOpen(false);
      setGroupId(null);
    } catch (error) {
      toast.error("Error joining group");
      setIsOpen(false);
      setGroupId(null);
    }
  };

  return (
    <>
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
                        onJoin={onSelectGroupToJoin}
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
      <AlertDialog open={open} onOpenChange={setIsOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Select your app to join this group</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will add your app to the group and start testing.
            </AlertDialogDescription>
            <Select onValueChange={(value) => setAppId(Number(value))} defaultValue={appId?.toString()}>
              <SelectTrigger>
                <SelectValue placeholder="Select your app to join this group" />
              </SelectTrigger>
              <SelectContent>
                {apps.map((app) => (
                  <SelectItem key={app.id} value={app.id.toString()}>
                    {app.appName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction disabled={!appId} onClick={handleJoinGroup}>
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
