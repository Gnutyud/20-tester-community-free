import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";

const Loading = () => {
  return (
    <div>
      <Alert className="mb-4">
        <AlertTitle>
          <Skeleton className="h-4 w-[200px]" />
        </AlertTitle>
        <AlertDescription>
          <Skeleton className="h-4 w-[1000px]" />
        </AlertDescription>
      </Alert>
      <Alert className="mb-4">
        <AlertTitle>
          <Skeleton className="h-4 w-[200px]" />
        </AlertTitle>
        <AlertDescription>
          <Skeleton className="h-4 w-[1000px]" />
        </AlertDescription>
      </Alert>
      <Alert className="mb-4">
        <AlertTitle>
          <Skeleton className="h-4 w-[200px]" />
        </AlertTitle>
        <AlertDescription>
          <Skeleton className="h-4 w-[1000px]" />
        </AlertDescription>
      </Alert>
      <Alert className="mb-4">
        <AlertTitle>
          <Skeleton className="h-4 w-[200px]" />
        </AlertTitle>
        <AlertDescription>
          <Skeleton className="h-4 w-[1000px]" />
        </AlertDescription>
      </Alert>
    </div>
  );
};

export default Loading;
