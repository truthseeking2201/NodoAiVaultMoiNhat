import { Copy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "../ui/button";

interface ItemRowProps {
  className?: string;
  value?: string;
}

export function RowCopy({ className = "", value = "" }: ItemRowProps) {
  const { toast } = useToast();

  const handleCopy = async () => {
    if (value) {
      await navigator.clipboard.writeText(value);
      toast({
        variant: "success",
        title: "Referral code copied",
        description: "Referral code copied to clipboard",
        duration: 2000,
      });
    }
  };

  return (
    <div className={`${className}`}>
      <div className="bg-black border border-gray-700 rounded-[12px]">
        <Button
          variant="icon"
          onClick={handleCopy}
          className="flex items-center justify-between w-full text-left bg-black rounded-[14px] px-4 py-1 group hover:bg-white/10"
        >
          <span className="text-lg font-medium text-white block truncate pr-4 font-mono">
            {value}
          </span>
          <Copy
            className="bg-white rounded-md p-[6px] !w-6 !h-6"
            stroke="black"
          />
        </Button>
      </div>
    </div>
  );
}
