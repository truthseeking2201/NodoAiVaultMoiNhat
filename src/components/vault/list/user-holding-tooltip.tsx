import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const UserHoldingTooltip = ({ children }: { children: React.ReactNode }) => {
  return (
    <Tooltip>
      <TooltipTrigger
        className="w-full text-left underline underline-offset-2 decoration-dotted decoration-gray-400"
        type="button"
      >
        {children}
      </TooltipTrigger>
      <TooltipContent className="shadow-[0_2px_4px_rgba(255,255,255,0.25)]">
        <div className="text-white/80 font-sans text-xs py-1 max-w-[200px] text-left">
          Auto-reinvested fees earned each time; value varies with price, range
          & IL(impermanent loss); included in your holdings and not claimable
          separately.
          <br /> <br /> When withdrawing, you’ll receive principal ± P&L, which
          already reflects these rewards and market movement.
        </div>
      </TooltipContent>
    </Tooltip>
  );
};

export default UserHoldingTooltip;
