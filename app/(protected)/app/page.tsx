"use client";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { AlertTriangle, RocketIcon } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function MyApps() {
  const [apps, setApps] = useState<any[]>([]);

  useEffect(() => {
    const fetchGroupData = async () => {
      const data = await fetch("/api/app");
      const response = await data.json();
      console.log(response);
      setApps(response);
    };
    fetchGroupData();
  }, []);

  return (
    <div className="my-8">
      <h1 className="text-3xl font-semibold mb-8">My Apps</h1>
      {apps.map((app: any) => (
        <Card key={app.id} className="w-[600px] shadow-md mb-4">
          <CardHeader>
            <p className="text-2xl font-semibold text-center">{app.appName}</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col rounded-lg border p-3 shadow-sm">
              <p className="text-sm font-medium mb-2">Package Name</p>
              <p className="truncate text-xs font-mono p-1 bg-slate-100 dark:bg-slate-800 rounded-md">
                {app.packageName}
              </p>
            </div>
            <div className="flex flex-col rounded-lg border p-3 shadow-sm">
              <p className="text-sm font-medium mb-2">Install Url</p>
              <p className="truncate text-xs font-mono p-1 bg-slate-100 dark:bg-slate-800 rounded-md">
                {app.installUrl}
              </p>
            </div>
          </CardContent>
        </Card>
      ))}
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
