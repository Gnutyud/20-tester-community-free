import AppLayout from "@/components/layout";

interface ProtectedLayoutProps {
  children: React.ReactNode;
}

const ProtectedLayout = ({ children }: ProtectedLayoutProps) => {
  return <AppLayout><div className="w-full min-h-screen flex justify-center items-center">{children}</div></AppLayout>;
};

export default ProtectedLayout;
