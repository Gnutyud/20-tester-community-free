import AppLayout from "@/components/layout";

interface ProtectedLayoutProps {
  children: React.ReactNode;
}

const ProtectedLayout = ({ children }: ProtectedLayoutProps) => {
  return (
    <AppLayout>
      <div className="flex justify-center">
        <div className="lg:max-w-6xl lg:w-full">{children}</div>
      </div>
    </AppLayout>
  );
};

export default ProtectedLayout;
