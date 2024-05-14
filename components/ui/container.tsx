import { ReactNode } from "react";

export const Container = ({ children }: { children: ReactNode }) => {
  return (
    <div className="w-full flex justify-center">
      <div className="lg:max-w-6xl lg:w-full">{children}</div>
    </div>
  );
};
