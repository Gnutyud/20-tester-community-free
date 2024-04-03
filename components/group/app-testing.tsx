import { App } from "@prisma/client";
import { Card, CardContent, CardHeader } from "../ui/card";

interface AppTestingProps {
  app: App;
}

const AppTesting = ({ app }: AppTestingProps) => {
  return (
    <Card key={app.id} className="w-[600px] shadow-md mb-4">
      <CardHeader>
        <p className="text-2xl font-semibold text-center">{app.appName}</p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col rounded-lg border p-3 shadow-sm">
          <p className="text-sm font-medium mb-2">Package Name</p>
          <p className="truncate text-xs font-mono p-1 bg-slate-100 dark:bg-slate-800 rounded-md">{app.packageName}</p>
        </div>
        <div className="flex flex-col rounded-lg border p-3 shadow-sm">
          <p className="text-sm font-medium mb-2">Install Url</p>
          <p className="truncate text-xs font-mono p-1 bg-slate-100 dark:bg-slate-800 rounded-md">{app.installUrl}</p>
        </div>
        <div className="flex flex-col rounded-lg border p-3 shadow-sm">
          <p className="text-sm font-medium mb-2">Google Group Test Url</p>
          <p className="truncate text-xs font-mono p-1 bg-slate-100 dark:bg-slate-800 rounded-md">
            {app.googleGroupUrl}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default AppTesting;
