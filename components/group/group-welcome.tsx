import { StatusTypes } from "@prisma/client";
import { Hash } from "lucide-react";

interface GroupWelcomeProps {
  name: string;
  maxMembers: number;
  status: StatusTypes;
  members: number;
}

export const GroupWelcome = ({ name, maxMembers, status, members }: GroupWelcomeProps) => {
  return (
    <div className="space-y-2 px-4 mb-4">
      <div className="h-[75px] w-[75px] rounded-full bg-zinc-500 dark:bg-zinc-700 flex items-center justify-center">
        <Hash className="h-12 w-12 text-white" />
      </div>
      <div>
        {status === StatusTypes.OPEN && (
          <span className="bg-gray-100 text-gray-800 text-xs font-medium me-2 px-2.5 py-0.5 rounded-full dark:bg-gray-700 dark:text-gray-300">
            Open to join
          </span>
        )}
        {status === StatusTypes.PENDING && (
          <span className="bg-yellow-100 text-yellow-800 text-xs font-medium me-2 px-2.5 py-0.5 rounded-full dark:bg-yellow-900 dark:text-yellow-300">
            Become a tester
          </span>
        )}
        {status === StatusTypes.INPROGRESS && (
          <span className="bg-green-100 text-green-800 text-xs font-medium me-2 px-2.5 py-0.5 rounded-full dark:bg-green-900 dark:text-green-300">
            Inprogress
          </span>
        )}
        {status === StatusTypes.COMPLETE && (
          <span className="bg-red-100 text-red-800 text-xs font-medium me-2 px-2.5 py-0.5 rounded-full dark:bg-red-900 dark:text-red-300">
            Complete
          </span>
        )}
      </div>
      <p className="text-xl md:text-3xl font-bold">
        {"Welcome to group #"}
        {name} ({members}/{maxMembers})
      </p>
      <p className="text-zinc-600 dark:text-zinc-400 text-sm">{`This is the group will help ${maxMembers} apps pass the Google Play Console closed tesing required.`}</p>
    </div>
  );
};
