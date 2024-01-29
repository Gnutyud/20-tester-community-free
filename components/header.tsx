"use client";

import { DarkModeDropDown } from "./dark-mode-drop-down";
import { Button } from "./ui/button";

export const Header = () => {
  return (
    <div className="w-full flex justify-center shadow dark:bg-gray-800 bg-white">
      <div className="lg:max-w-5xl lg:w-full">
        <div className="flex items-center justify-between font-mono text-sm lg:flex py-4 ">
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">
            <span className="text-transparent bg-clip-text bg-gradient-to-r to-emerald-600 from-sky-400">20 Tester</span>{" "}
            Community
          </h1>

          <div className="flex items-center justify-between">
            <DarkModeDropDown />
            <Button className="ml-4">Login</Button>
          </div>
        </div>
      </div>
    </div>
  );
};
