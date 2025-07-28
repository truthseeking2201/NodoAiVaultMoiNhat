import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

type DetailWrapperProps = {
  title: string;
  titleComponent?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
  isLoading?: boolean;
  loadingStyle?: string;
};

export const DetailWrapper = ({
  title,
  titleComponent,
  children,
  className = "",
  isLoading = false,
  loadingStyle = "default",
}: DetailWrapperProps) => {
  return (
    <div className="rounded-lg bg-[#1C1C1C]">
      {isLoading ? (
        <>
          <div
            className={cn(
              "flex items-center justify-between p-4",
              titleComponent ? "h-[72px]" : "h-[60px]"
            )}
          >
            <Skeleton className="w-[200px] h-6 " />
            {titleComponent && <Skeleton className="w-[300px] h-6" />}
          </div>
          <div
            className={cn(
              className,
              "bg-black p-5 rounded-b-lg border border-white/15 border-t-0"
            )}
          >
            <Skeleton className={cn("h-6 w-[200px]", loadingStyle)} />
          </div>
        </>
      ) : (
        <>
          <div className="flex items-center justify-between p-5">
            <div className="text-white text-lg font-semibold">{title}</div>
            <div className="flex items-center gap-2">
              {titleComponent && titleComponent}
            </div>
          </div>
          <div
            className={cn(
              className,
              "bg-black p-5 rounded-b-lg border border-white/15 border-t-0"
            )}
          >
            {children}
          </div>
        </>
      )}
    </div>
  );
};
