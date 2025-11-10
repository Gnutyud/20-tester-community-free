"use client";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import axios from "axios";
import { AlertTriangle, Copy, ExternalLink } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";

interface DetailRowProps {
  label: string;
  value?: string;
  onCopy: () => void;
  href?: string;
}

const DetailRow = ({ label, value, onCopy, href }: DetailRowProps) => {
  if (!value) return null;

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
        <span>{label}</span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:text-primary/80"
            onClick={onCopy}
          >
            <Copy className="h-3.5 w-3.5" />
            Copy
          </button>
          {href && (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:text-primary/80"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              Open
            </a>
          )}
        </div>
      </div>
      <code className="block max-h-14 w-full overflow-auto rounded-lg border border-border/50 bg-muted/40 px-3 py-2 text-xs font-mono break-words whitespace-pre-wrap">
        {value}
      </code>
    </div>
  );
};

export default function MyApps() {
  const [apps, setApps] = useState<any[]>([]);
  const router = useRouter();

  useEffect(() => {
    const fetchGroupData = async () => {
      const response = await axios.get("/api/app");
      setApps(response.data);
    };
    fetchGroupData();
  }, []);

  const handleCopy = (value: string, label: string) => {
    navigator.clipboard.writeText(value);
    toast.success(`${label} copied to clipboard`);
  };

  return (
    <div className="my-8 mx-auto w-full max-w-6xl px-4 lg:px-6">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-semibold">My Apps</h1>
        <Button onClick={() => router.push("/app/create")}>Add new app</Button>
      </div>
      <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2">
        {apps.map((app: any) => (
          <Card
            key={app.id}
            className="relative rounded-2xl border border-border/60 bg-gradient-to-b from-background/90 via-background to-background shadow-lg transition hover:shadow-xl"
          >
            <CardHeader className="space-y-5">
              <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                <CardTitle className="text-xl font-semibold leading-tight tracking-tight">
                  {app.appName}
                </CardTitle>
                <Badge
                  variant={
                    app.fulfilledTesterCount >= app.targetTesterCount
                      ? "secondary"
                      : "outline"
                  }
                  className="w-fit rounded-full px-3 py-1 text-xs uppercase tracking-wide"
                >
                  {app.fulfilledTesterCount >= app.targetTesterCount
                    ? "Goal met"
                    : `${Math.max(
                        app.targetTesterCount - app.fulfilledTesterCount,
                        0
                      )} testers needed`}
                </Badge>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs font-medium uppercase tracking-[0.15em] text-muted-foreground">
                  <span>Tester Progress</span>
                  <span className="text-sm font-semibold text-foreground">
                    {app.fulfilledTesterCount} / {app.targetTesterCount}
                  </span>
                </div>
                <div className="relative h-2 w-full overflow-hidden rounded-full bg-muted/70">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-primary to-primary/60 transition-all"
                    style={{
                      width: `${Math.min(
                        (app.fulfilledTesterCount / app.targetTesterCount) * 100,
                        100
                      )}%`,
                    }}
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <dl className="grid gap-5 text-sm">
                <DetailRow
                  label="Package"
                  value={app.packageName}
                  onCopy={() => handleCopy(app.packageName, "Package name")}
                />
                <DetailRow
                  label="Install"
                  value={app.installUrl}
                  onCopy={() => handleCopy(app.installUrl, "Install URL")}
                  href={app.installUrl}
                />
                <DetailRow
                  label="Google Group"
                  value={app.googleGroupUrl}
                  onCopy={() =>
                    handleCopy(app.googleGroupUrl, "Google Group URL")
                  }
                  href={app.googleGroupUrl}
                />
              </dl>
              <Separator />
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-xs leading-relaxed text-muted-foreground">
                  Need more testers? Keep this app in the queue and we will match it with the next cohort automatically.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.push("/group/create")}
                >
                  Manage queue
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      {!apps.length && (
        <Alert>
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
    </div>
  );
}
