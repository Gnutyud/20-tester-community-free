"use client";
import { useCurrentUser } from "@/hooks/use-current-user";
import { GroupItem, StatusTypes } from "@/types";
import clsx from "clsx";
import dayjs from "dayjs";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Button } from "./ui/button";
import { on } from "events";

interface GroupCardProps extends GroupItem {
  onJoin?: (groupId: number) => void;
}

const StepListing = ({
  title,
  isComplete,
  isCurrentStep,
}: {
  title: string;
  isComplete: boolean;
  isCurrentStep: boolean;
}) => {
  return (
    <>
      {isComplete ? (
        <li className="flex items-center">
          <svg
            className="flex-shrink-0 w-4 h-4 text-blue-600 dark:text-blue-500"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5Zm3.707 8.207-4 4a1 1 0 0 1-1.414 0l-2-2a1 1 0 0 1 1.414-1.414L9 10.586l3.293-3.293a1 1 0 0 1 1.414 1.414Z" />
          </svg>
          <span className="text-base font-normal leading-tight text-gray-500 dark:text-gray-400 ms-3">{title}</span>
        </li>
      ) : (
        <li
          className={clsx(
            "flex items-center line-through decoration-gray-500",
            isCurrentStep ? "decoration-black dark:decoration-white" : null
          )}
        >
          <svg
            className={clsx(
              "flex-shrink-0 w-4 h-4 text-gray-400 dark:text-gray-500",
              isCurrentStep ? "text-black dark:text-white" : null
            )}
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5Zm3.707 8.207-4 4a1 1 0 0 1-1.414 0l-2-2a1 1 0 0 1 1.414-1.414L9 10.586l3.293-3.293a1 1 0 0 1 1.414 1.414Z" />
          </svg>
          <span
            className={clsx(
              "text-base font-normal leading-tight text-gray-500 ms-3",
              isCurrentStep ? "text-black dark:text-white" : null
            )}
          >
            {title}
          </span>
        </li>
      )}
    </>
  );
};

const GroupCard = ({ id, maxMembers, status, users, becameTesterNumber, startedTestDate, onJoin }: GroupCardProps) => {
  const numberOfDaysInTest = startedTestDate ? dayjs().diff(dayjs(startedTestDate), "day") : 0;
  const curentUser = useCurrentUser();
  const router = useRouter();

  const handleJoinGroup = async () => {
    onJoin && onJoin(id);
    // try {
    //   if (!curentUser) {
    //     router.push("/auth/login");
    //   } else {
    //     await fetch(`/api/group/${id}`, {
    //       method: "POST",
    //     });
    //     toast.success("Joined group successfully");
    //   }
    // } catch (error) {
    //   toast.error("Error joining group");
    // }
  };

  const handleViewGroup = () => {
    router.push(`/group/${id}`);
  };

  return (
    <>
      <div className="w-full p-6 bg-white border border-gray-200 rounded-lg shadow dark:bg-gray-800 dark:border-gray-700">
        <div className="flex flex-row items-center justify-between">
          <h5 className="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">{`Group #${id}`}</h5>
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
        </div>
        <p className="mb-3 font-normal text-gray-700 dark:text-gray-400">{`This group has a max capacity of ${maxMembers} members`}</p>
        <ul role="list" className="space-y-5 my-7">
          <StepListing
            title={`${maxMembers} team members ${
              status === StatusTypes.OPEN ? `(currently ${users.length || 0}/${maxMembers})` : ""
            }`}
            isComplete={users.length === maxMembers}
            isCurrentStep={status === StatusTypes.OPEN}
          />
          <StepListing
            title={`All the members became testers ${
              becameTesterNumber !== 0 && status === StatusTypes.PENDING
                ? `(currently ${becameTesterNumber} testers opt in)`
                : ""
            }`}
            isComplete={becameTesterNumber === maxMembers}
            isCurrentStep={status === StatusTypes.PENDING}
          />
          <StepListing
            title={`Run a closed test for a minimum of 14 days ${
              startedTestDate && status === StatusTypes.INPROGRESS ? `(currently ${numberOfDaysInTest} days)` : ""
            }`}
            isComplete={numberOfDaysInTest !== 0 && numberOfDaysInTest >= 14}
            isCurrentStep={status === StatusTypes.INPROGRESS}
          />
        </ul>
        {!curentUser ||
          (curentUser && !users.includes(curentUser.email!) && (
            <Button
              disabled={status !== StatusTypes.OPEN}
              onClick={handleJoinGroup}
              className="inline-flex items-center px-3 py-2 text-sm font-medium text-center text-white bg-blue-700 rounded-lg hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
            >
              Join now
              <svg
                className="rtl:rotate-180 w-3.5 h-3.5 ms-2"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 14 10"
              >
                <path
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M1 5h12m0 0L9 1m4 4L9 9"
                />
              </svg>
            </Button>
          ))}
        {curentUser && users.includes(curentUser.email!) && (
          <Button
            onClick={handleViewGroup}
            className="inline-flex items-center px-3 py-2 text-sm font-medium text-center text-white bg-blue-700 rounded-lg hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
          >
            View
          </Button>
        )}
      </div>
    </>
  );
};

export default GroupCard;
