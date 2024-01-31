import { ReactNode } from "react";
import Footer from "./footer";
import { Header } from "./header";

const AppLayout = ({ children }: { children: ReactNode }) => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="flex-1">{children}</div>
      <Footer />
    </div>
  );
};

export default AppLayout;
