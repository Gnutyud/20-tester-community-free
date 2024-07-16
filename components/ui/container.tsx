import { ReactNode } from "react";

export const Container = ({ children }: { children: ReactNode }) => {
  return (
    <div className="w-full flex justify-center">
      <div className="md:max-w-6xl w-full">{children}</div>
    </div>
  );
};
