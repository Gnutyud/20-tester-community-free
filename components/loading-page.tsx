const LoadingPage = (props: { text?: string }) => {
  return (
    <div className="fixed top-0 left-0 right-0 bottom-0 w-full h-screen z-50 overflow-hidden bg-black/[0.6] opacity-75 flex flex-col items-center justify-center">
      <div className="rounded-md h-12 w-12 border-4 border-t-4 border-blue-500 animate-spin"></div>
      <h2 className="text-center text-white text-xl font-semibold mt-4">
        {props.text || "Loading..."}
      </h2>
    </div>
  );
};

export default LoadingPage;
