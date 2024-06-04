import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";


export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const timeCalculation = (endDate: string) => {
  let currentDayTime = new Date().getTime();
  const endDay = new Date(endDate);
  endDay.setDate(endDay.getDate() + Number(process.env.NUMBER_OF_DAYS_TO_COMPLETE || 14));
  const totalRemaining = endDay.getTime() - currentDayTime;
  
  currentDayTime += 1000;

  if (totalRemaining <= 0) {
    return false;
  }

  const days = Math.floor(totalRemaining / (1000 * 60 * 60 * 24));
  const hours = Math.floor((totalRemaining / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((totalRemaining / (1000 * 60)) % 60);
  const seconds = Math.floor((totalRemaining / 1000) % 60);

  return [days, hours, minutes, seconds];
};

