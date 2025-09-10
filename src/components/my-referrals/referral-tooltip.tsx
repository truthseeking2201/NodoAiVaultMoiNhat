import { useState } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ReferralContent } from "./referral-content";

interface ReferralTooltipProps {
  children: React.ReactNode;
}

export default function ReferralTooltip({ children }: ReferralTooltipProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent className="w-80 bg-[#1A1B21] text-white p-0" align="end">
        <ReferralContent className="py-6 px-4 border border-white/20 rounded-[12px]" />
      </PopoverContent>
    </Popover>
  );
}
