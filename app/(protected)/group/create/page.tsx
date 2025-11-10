"use client";

import axios from "axios";
import { useEffect, useMemo, useState, useTransition } from "react";

import { FormError } from "@/components/form-error";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Loader2 } from "lucide-react";
import { toast } from "react-hot-toast";

interface QueueEntry {
  id: string;
  appId: string;
  remainingSlots: number;
  joinedAt: string;
  app: {
    id: string;
    appName: string;
    fulfilledTesterCount: number;
    targetTesterCount: number;
  };
}

interface AppItem {
  id: string;
  appName: string;
  packageName: string;
  installUrl: string;
  googleGroupUrl: string;
  targetTesterCount: number;
  fulfilledTesterCount: number;
}

function QueueManager() {
  const [apps, setApps] = useState<AppItem[]>([]);
  const [queueEntries, setQueueEntries] = useState<QueueEntry[]>([]);
  const [loading, startTransition] = useTransition();
  const [error, setError] = useState<string | undefined>();

  const fetchData = async () => {
    try {
      const [appsResponse, queueResponse] = await Promise.all([
        axios.get("/api/app"),
        axios.get("/api/queue"),
      ]);
      setApps(appsResponse.data);
      setQueueEntries(queueResponse.data);
    } catch (err) {
      console.error(err);
      setError("Failed to load queue data");
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const queueMap = useMemo(() => {
    const map = new Map<string, QueueEntry>();
    queueEntries.forEach((entry) => {
      map.set(entry.appId, entry);
    });
    return map;
  }, [queueEntries]);

  const handleJoinQueue = (appId: string) => {
    startTransition(async () => {
      try {
        await axios.post("/api/queue", { appId });
        toast.success("App added to the queue");
        await fetchData();
      } catch (err: any) {
        const message = err?.response?.data?.message || "Failed to join the queue";
        toast.error(message);
      }
    });
  };

  const handleLeaveQueue = (appId: string) => {
    startTransition(async () => {
      try {
        await axios.delete("/api/queue", { data: { appId } });
        toast.success("Removed from queue");
        await fetchData();
      } catch (err: any) {
        const message = err?.response?.data?.message || "Failed to update queue";
        toast.error(message);
      }
    });
  };

  return (
    <Container>
      <div className="my-8 space-y-6">
        <div>
          <h1 className="text-2xl font-semibold">Matchmaking Queue</h1>
          <p className="text-sm text-muted-foreground mt-2">
            Add your apps to the automated queue. Once five or more unique developers are waiting within a 48-hour
            window, we create a group of up to 25 members and move everyone directly into the testing phase.
          </p>
        </div>
        {error && <FormError message={error} />}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold">Your apps</h2>
          <div className="grid gap-4">
            {apps.map((app) => {
              const queueEntry = queueMap.get(app.id);
              const remaining = Math.max(app.targetTesterCount - app.fulfilledTesterCount, 0);
              return (
                <Card key={app.id} className="shadow-md">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>{app.appName}</span>
                      <span className="text-sm font-normal text-muted-foreground">
                        {app.fulfilledTesterCount} / {app.targetTesterCount} testers matched
                      </span>
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Package: {app.packageName}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-sm">
                      {remaining > 0
                        ? `${remaining} more tester${remaining > 1 ? "s" : ""} needed`
                        : "Tester goal achieved 🎉"}
                    </p>
                    {queueEntry ? (
                      <div className="flex flex-col gap-2">
                        <p className="text-xs text-muted-foreground">
                          In queue since {new Date(queueEntry.joinedAt).toLocaleString()} – waiting for the next cohort.
                        </p>
                        <Button
                          variant="outline"
                          className="w-fit"
                          disabled={loading}
                          onClick={() => handleLeaveQueue(app.id)}
                        >
                          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Leave queue"}
                        </Button>
                      </div>
                    ) : (
                      <Button
                        className="w-fit"
                        disabled={loading || remaining <= 0}
                        onClick={() => handleJoinQueue(app.id)}
                      >
                        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Join queue"}
                      </Button>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
          {!apps.length && (
            <Card>
              <CardHeader>
                <CardTitle>No apps found</CardTitle>
                <CardDescription>
                  Add an app first, then you can join the matchmaking queue.
                </CardDescription>
              </CardHeader>
            </Card>
          )}
        </section>
        <Separator />
        <section className="space-y-3">
          <h2 className="text-xl font-semibold">How it works</h2>
          <ol className="list-decimal list-inside text-sm space-y-2 text-muted-foreground">
            <li>Add any app that still needs testers to the queue.</li>
            <li>When at least five unique developers are queued within 48 hours, we auto-create a group.</li>
            <li>Each match gives your app up to 24 potential testers (group size minus yourself).</li>
            <li>If you still need more testers, the app stays queued until the goal is met.</li>
          </ol>
        </section>
      </div>
    </Container>
  );
}

export default QueueManager;
