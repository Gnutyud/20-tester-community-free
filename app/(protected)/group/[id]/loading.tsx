import { Skeleton } from "@/components/ui/skeleton";

const Loading = () => {
  return (
    <div className="flex flex-col space-y-3 py-4">
      <Skeleton className="h-[75px] w-[75px] rounded-xl mb-4" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-[100px]" />
        <Skeleton className="h-4 w-[200px]" />
        <Skeleton className="h-4 w-[1000px]" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-5 gap-8 py-4">
        <div className="md:col-span-3">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-[75px] w-full mt-3" />
          <Skeleton className="h-[75px] w-full mt-3" />
        </div>
        <div className="md:col-span-2">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full mt-3" />
        </div>
      </div>
    </div>
  );
};

export default Loading;
