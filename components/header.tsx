"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { DarkModeDropDown } from "./dark-mode-drop-down";
import { Button } from "./ui/button";
import { UserButton } from "./user-button";
import { useCurrentUser } from "@/hooks/use-current-user";

export const Header = () => {
  const router = useRouter();
  const user = useCurrentUser();
  return (
    <div className="w-full flex justify-center shadow dark:bg-gray-800 bg-white">
      <div className="lg:max-w-5xl lg:w-full">
        <div className="flex items-center justify-between font-mono text-sm lg:flex py-4 ">
          <Link href={"/"} className="text-3xl font-extrabold text-gray-900 dark:text-white">
            <span className="text-transparent bg-clip-text bg-gradient-to-r to-emerald-600 from-sky-400">
              20 Tester
            </span>{" "}
            Community
          </Link>

          <div className="flex items-center justify-between">
            <DarkModeDropDown />
            {!user && <Button onClick={() => router.push("/auth/login")} className="ml-4">
              Login
            </Button>}
            <Button
              onClick={() => router.push("/new-group")}
              className="ml-4 text-white bg-gradient-to-br from-green-400 to-blue-600 hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-green-200 dark:focus:ring-green-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center"
            >
              Create group
            </Button>
            {user && (
              <div className="ml-4">
                <UserButton />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
