import { useEffect, useState } from "react";
import { timeCalculation } from "@/lib/utils";

export const Timer = ({ endDate }: { endDate: string }) => {
  const [countdown, setCountdown] = useState(() => timeCalculation(endDate) || []);
  const timerID = ["days", "hours", "minutes", "seconds"];

  useEffect(() => {
    const updateCountdown = setInterval(() => {
      const newCountdown = timeCalculation(endDate) || [];
      setCountdown(newCountdown);
    }, 1000);

    return () => {
      clearInterval(updateCountdown);
    };
  }, [countdown]);

  return (
    <div>
      {countdown.length === 0 ? (
        <p className="font-red-hat text-4xl text-white duration-300	ease-in">Some thing went wrong!</p>
      ) : (
        <div>
          <div className="p-4 d-flex justify-center items-center">
		  <p className="font-red-hat text-4xl dark:text-white duration-300 ease-in text-center text-back">Enjoy this moment!</p>
		  <p className="font-red-hat text-2xl dark:text-gray-400 duration-300 ease-in text-center text-gray-500">Your app will be done soon, we will let you know later.</p>
          </div>

          <div className="grid grid-cols-4 gap-4">
            {countdown.map((count, index) => (
              <div key={index} className="w-full">
                {/* // flip-card */}
                <div className="text-soft-red inline-flex flex-col text-7.5xl w-full items-center justify-center card-shadow relative leading-loose mobile:text-3xl mobile:leading-[4rem]">
                  {/* top */}
                  <div className="bg-[#2a2c41] w-full flex justify-center overflow-hidden rounded-lg border-b border-b-black-blue">
                    <p className="">{count < 10 ? `0${count}` : count}</p>
                  </div>
                </div>

                <p className="text-sm text-grayish text-center mt-9 tracking-widest border-teal-200 mobile:text-[0.5rem] mobile:mt-2">
                  {timerID[index]}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
