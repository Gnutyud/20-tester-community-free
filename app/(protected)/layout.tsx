import AppLayout from "@/components/layout";

interface ProtectedLayoutProps {
  children: React.ReactNode;
}

const ProtectedLayout = ({ children }: ProtectedLayoutProps) => {
  return (
    <AppLayout>
      <div className="flex justify-center">
        <div className="md:max-w-6xl w-full">{children}</div>
      </div>
    </AppLayout>
  );
};

export default ProtectedLayout;
