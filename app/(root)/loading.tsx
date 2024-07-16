import Sidebar from "@/components/sidebar";
import { Container } from "@/components/ui/container";
import { Skeleton } from "@/components/ui/skeleton";

const Loading = () => {
  return (
    <Container>
      <section className="grid grid-cols-1 md:grid-cols-4 gap-8 py-4">
        <div className="col-span-3">
          <Skeleton className="h-8 w-[250px] bg-gray-500 dark:bg-white" />
          <div className="w-full p-6 bg-white border border-gray-200 rounded-lg shadow dark:bg-gray-800 dark:border-gray-700 mt-5">
            <div className="flex flex-row items-center justify-between">
              <Skeleton className="h-4 w-[50px] md:w-[150px] bg-gray-500 dark:bg-white" />
              <Skeleton className="h-4 w-[50px] md:w-[150px] rounded-xl mt-4 bg-gray-500 dark:bg-white" />
            </div>
            <Skeleton className="h-4 w-[170px] md:w-[350px] mb-3 bg-gray-500 dark:bg-white" />
            <ul
              role="list"
              className="space-y-5 my-7 bg-white dark:bg-gray-800"
            >
              <Skeleton className="h-4 w-[150px] md:w-[550px] mb-3 bg-gray-500 dark:bg-white" />
              <Skeleton className="h-4 w-[220px] md:w-[650px] mb-3 bg-gray-500 dark:bg-white" />
              <Skeleton className="h-4 w-[250px] md:w-[750px] mb-3 bg-gray-500 dark:bg-white" />
            </ul>
            <Skeleton className="h-[40px] w-[100px] rounded-xl mb-3 bg-gray-500 dark:bg-white" />
          </div>
          <div className="w-full p-6 bg-white border border-gray-200 rounded-lg shadow dark:bg-gray-800 dark:border-gray-700 mt-5">
            <div className="flex flex-row items-center justify-between">
              <Skeleton className="h-4 w-[50px] md:w-[150px] bg-gray-500 dark:bg-white" />
              <Skeleton className="h-4 w-[50px] md:w-[150px] rounded-xl mt-4 bg-gray-500 dark:bg-white" />
            </div>
            <Skeleton className="h-4 w-[170px] md:w-[350px] mb-3 bg-gray-500 dark:bg-white" />
            <ul
              role="list"
              className="space-y-5 my-7 bg-white dark:bg-gray-800"
            >
              <Skeleton className="h-4 w-[150px] md:w-[550px] mb-3 bg-gray-500 dark:bg-white" />
              <Skeleton className="h-4 w-[220px] md:w-[650px] mb-3 bg-gray-500 dark:bg-white" />
              <Skeleton className="h-4 w-[250px] md:w-[750px] mb-3 bg-gray-500 dark:bg-white" />
            </ul>
            <Skeleton className="h-[40px] w-[100px] rounded-xl mb-3 bg-gray-500 dark:bg-white" />
          </div>
          <div className="w-full p-6 bg-white border border-gray-200 rounded-lg shadow dark:bg-gray-800 dark:border-gray-700 mt-5">
            <div className="flex flex-row items-center justify-between">
              <Skeleton className="h-4 w-[50px] md:w-[150px] bg-gray-500 dark:bg-white" />
              <Skeleton className="h-4 w-[50px] md:w-[150px] rounded-xl mt-4 bg-gray-500 dark:bg-white" />
            </div>
            <Skeleton className="h-4 w-[170px] md:w-[350px] mb-3 bg-gray-500 dark:bg-white" />
            <ul
              role="list"
              className="space-y-5 my-7 bg-white dark:bg-gray-800"
            >
              <Skeleton className="h-4 w-[150px] md:w-[550px] mb-3 bg-gray-500 dark:bg-white" />
              <Skeleton className="h-4 w-[220px] md:w-[650px] mb-3 bg-gray-500 dark:bg-white" />
              <Skeleton className="h-4 w-[250px] md:w-[750px] mb-3 bg-gray-500 dark:bg-white" />
            </ul>
            <Skeleton className="h-[40px] w-[100px] rounded-xl mb-3 bg-gray-500 dark:bg-white" />
          </div>
        </div>
        <div className="hidden md:block">
          <Sidebar />
        </div>
      </section>
    </Container>
  );
};

export default Loading;
