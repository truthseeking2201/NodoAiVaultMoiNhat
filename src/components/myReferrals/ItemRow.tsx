import { Copy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ItemRowProps {
  className?: string;
  title?: string;
  value?: string;
}

export function ItemRow({
  className = "",
  title = "",
  value = "",
}: ItemRowProps) {
  const { toast } = useToast();

  const handleCopy = async () => {
    if (value) {
      await navigator.clipboard.writeText(value);
      toast({
        title: "Copied",
        description: "",
        duration: 2000,
      });
    }
  };

  return (
    <div className={`${className}`}>
      <div className="text-075 text-sm mb-2">{title}</div>
      <div className="bg-gradient-to-r from-[#F2BB89] via-[#F3D2B5] to-[#F5C8A4] rounded-[14px]	p-[1px]">
        <button
          onClick={handleCopy}
          className="relative w-full text-left bg-black rounded-[14px] p-4 group"
        >
          <span className="text-lg font-medium text-white block truncate pr-8 font-mono">
            {value}
          </span>
          <div className="absolute right-3 top-1/2 -translate-y-1/2 bg-white rounded-lg group-hover:bg-white/20 w-8 h-8 flex items-center justify-center flex-shrink-0">
            <Copy className="w-4 h-4 text-black" />
          </div>
        </button>
      </div>
    </div>
  );
}
