"use client";
import GroupCard from "@/components/group-card";
import { NoOpenGroupCard } from "@/components/no-open-group-card";
import Sidebar from "@/components/sidebar";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Container } from "@/components/ui/container";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCurrentUser } from "@/hooks/use-current-user";
import { GroupItem, StatusTypes } from "@/types";
import axios from "axios";
import { AlertTriangle } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import Loading from "./loading";

type TabName = "open" | "inprogress" | "complete";

export default function Home() {
  const [groupData, setGroupData] = useState<GroupItem[]>([]);
  const curentUser = useCurrentUser();
  const router = useRouter();
  const [apps, setApps] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const tabName = searchParams.get("tab");
  const [defaultTab, setDefaultTab] = useState<TabName>(
    tabName === "inprogress"
      ? "inprogress"
      : tabName === "complete"
      ? "complete"
      : "open"
  );

  const openData = groupData.filter((data) => data.status === StatusTypes.OPEN);
  const inprogressData = groupData.filter(
    (data) =>
      data.status !== StatusTypes.OPEN && data.status !== StatusTypes.COMPLETE
  );
  const completeData = groupData.filter(
    (data) => data.status === StatusTypes.COMPLETE
  );

  useEffect(() => {
    const fetchGroupData = async () => {
      try {
        const response: { data: GroupItem[] } = await axios.post("/api/group");
        setGroupData(response.data);
        setLoading(false);
      } catch (error) {
        console.log("Error fetching group data", error);
        setLoading(false);
      }
    };
    fetchGroupData();
  }, []);

  useEffect(() => {
    if (!curentUser) {
      setApps([]);
      return;
    }

    let isMounted = true;
    const fetchApps = async () => {
      try {
        const response: any = await axios.get("/api/app");
        if (isMounted) {
          setApps(response.data);
        }
      } catch (error) {
        console.error("Error fetching apps", error);
        if (isMounted) {
          setApps([]);
        }
      }
    };
    fetchApps();

    return () => {
      isMounted = false;
    };
  }, [curentUser]);

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
    // <pathname>?tab=complete
    router.push(pathname + "?" + createQueryString("tab", value));
  };

  if (loading && groupData.length === 0) {
    return <Loading />;
  }

  return (
    <>
      <main>
        <Container>
          <section className="grid grid-cols-1 md:grid-cols-4 gap-8 py-4">
            <div className="col-span-3">
              {!apps.length && (
                <Alert className="mb-4">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>No apps found!</AlertTitle>
                  <AlertDescription>
                    You have not added any app please click{" "}
                    <span className="text-sky-500 text-2xl">
                      <Link href={"/app/create"}>HERE</Link>
                    </span>{" "}
                    to add new app
                  </AlertDescription>
                </Alert>
              )}
              <Tabs defaultValue={defaultTab} className="w-full">
                <TabsList>
                  <TabsTrigger value="open" onClick={() => setParams("open")}>
                    Open
                  </TabsTrigger>
                  <TabsTrigger
                    value="inprogress"
                    onClick={() => setParams("inprogress")}
                  >
                    Inprogress
                  </TabsTrigger>
                  <TabsTrigger
                    value="complete"
                    onClick={() => setParams("complete")}
                  >
                    Complete
                  </TabsTrigger>
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
                        groupNumber={group.groupNumber}
                      />
                    ))}
                  </div>
                </TabsContent>
                <TabsContent value="inprogress">
                  <div className="grid grid-cols-1 gap-4">
                    {inprogressData.length === 0 && (
                      <div className="flex justify-center items-center">
                        <NoOpenGroupCard />
                      </div>
                    )}
                    {inprogressData.map((group) => (
                      <GroupCard
                        key={group.id}
                        id={group.id}
                        maxMembers={group.maxMembers}
                        status={group.status as any}
                        users={group.users}
                        becameTesterNumber={group.becameTesterNumber}
                        startedTestDate={group.startedTestDate}
                        groupNumber={group.groupNumber}
                      />
                    ))}
                  </div>
                </TabsContent>
                <TabsContent value="complete">
                  <div className="grid grid-cols-1 gap-4">
                    {completeData.length === 0 && (
                      <div className="flex justify-center items-center">
                        <NoOpenGroupCard />
                      </div>
                    )}
                    {completeData.map((group) => (
                      <GroupCard
                        key={group.id}
                        id={group.id}
                        maxMembers={group.maxMembers}
                        status={group.status as any}
                        users={group.users}
                        becameTesterNumber={group.becameTesterNumber}
                        startedTestDate={group.startedTestDate}
                        groupNumber={group.groupNumber}
                      />
                    ))}
                  </div>
                </TabsContent>
              </Tabs>
            </div>
            <div className="hidden md:block">
              <Sidebar />
            </div>
          </section>
        </Container>
      </main>
    </>
  );
}
