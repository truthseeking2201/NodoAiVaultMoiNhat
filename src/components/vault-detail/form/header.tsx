import { LabelWithTooltip } from "@/components/ui/label-with-tooltip";
import {
  useGetLpToken,
  useGetVaultConfig,
  useWallet,
} from "@/hooks";
import { useVaultBasicDetails } from "@/hooks/use-vault";
import { cn, formatAmount } from "@/lib/utils";
import { formatShortCurrency } from "@/utils/currency";
import { calculateUserHoldings, getNDLPTotalSupply } from "@/utils/helpers";
import { ChevronDown } from "lucide-react";
import { useMemo, useState } from "react";

export const FormHeader = ({ vault_id }: { vault_id: string }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const { data: vaultDetails } = useVaultBasicDetails(vault_id);
  const lpToken = useGetLpToken(vaultDetails?.vault_lp_token, vault_id);
  const { vaultConfig } = useGetVaultConfig(vault_id);
  const { isAuthenticated } = useWallet();

  const ndlpTotalSupply = getNDLPTotalSupply(vaultConfig, lpToken?.decimals);
  const userHoldings = calculateUserHoldings(
    vaultConfig,
    lpToken?.balance || "0"
  );

  const shareValue = useMemo(() => {
    if (Number(vaultDetails?.user_balance) === 0) return 0;

    return (Number(vaultDetails?.user_balance) / Number(ndlpTotalSupply)) * 100;
  }, [vaultDetails, ndlpTotalSupply]);

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div id="form-header">
      <div className="flex justify-between items-center">
        <div className="text-center pl-6">
          <div className="text-white/80 text-xs mb-2">Total Liquidity</div>
          <div className="font-mono text-2xl font-medium">
            {userHoldings
              ? formatShortCurrency(userHoldings)
              : isAuthenticated
              ? "$0.00"
              : "$--"}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="mr-6">
            <LabelWithTooltip
              label="NDLP Balance"
              labelClassName="text-white/80 text-xs"
              labelContainerClassName="justify-center mb-2"
            />
            <div className="font-mono text-2xl font-medium text-center">
              {lpToken?.balance && lpToken?.balance !== "0"
                ? formatAmount({
                    amount: lpToken?.balance || 0,
                    precision: lpToken?.decimals || 6,
                  })
                : isAuthenticated
                ? "$0.00"
                : "--"}
            </div>
          </div>

          <div
            className="rounded-full bg-[#282828] p-2 cursor-pointer transition-all duration-300 hover:opacity-80"
            id="toggle-more-info"
            onClick={toggleExpanded}
          >
            <ChevronDown
              className={`w-4 h-4 transition-transform duration-200 ${
                isExpanded ? "rotate-180" : ""
              }`}
            />
          </div>
        </div>
      </div>
      <div
        className={cn(
          "rounded-lg bg-white/15 p-4 flex flex-col gap-2 mt-6 transition-all duration-300 ease-in-out select-none relative z-0",
          isExpanded
            ? "max-h-32 opacity-100 transform translate-y-0"
            : "max-h-0 opacity-0 transform translate-y-2 p-0 mt-0"
        )}
      >
        <div className="flex items-center justify-between">
          <LabelWithTooltip
            label="Share"
            tooltipContent={
              <div className="text-white/80 text-xs max-w-[200px] font-sans">
                Your percentage ownership of this vault. Calculated as your NDLP
                tokens divided by total NDLP supply. Higher share means larger
                portion of vault rewards.
              </div>
            }
            labelClassName="text-white/80 text-sm font-sans"
          />

          <div className="text-white text-sm font-mono">
            {shareValue.toFixed(2)}%
          </div>
        </div>
        <div className="flex items-center justify-between">
          <LabelWithTooltip
            label="Break-Even Price"
            tooltipContent={
              <div className="text-white/80 text-xs max-w-[200px] font-sans">
                Your average entry price across all deposits. When NDLP price
                exceeds this level, your position is profitable.
              </div>
            }
            labelClassName="text-white/80 text-sm font-sans"
          />
          <div className="text-white text-sm font-mono">
            ${vaultDetails?.user_break_even_price.toFixed(2)}
          </div>
        </div>
      </div>
    </div>
  );
};
