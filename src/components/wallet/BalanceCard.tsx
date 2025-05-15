import { COIN_TYPES_CONFIG } from "@/config";
import { useMyAssets } from "@/hooks";

import arrowDown from "@/assets/icons/arrow-down.svg";
import { useUSDCLPRate } from "@/hooks/useDepositVault";
import { formatAmount } from "@/lib/utils";

interface BalanceCardProps {
  className?: string;
}

export function BalanceCard({ className = "" }: BalanceCardProps) {
  const { assets } = useMyAssets();
  const ndlpAmount =
    assets.find((asset) => asset.coin_type === COIN_TYPES_CONFIG.NDLP_COIN_TYPE)
      ?.balance || 0;

  const conversionRate = useUSDCLPRate(true);
  const usdcEquivalent = ndlpAmount * conversionRate;
  const usdcDollarRate = usdcEquivalent * 1;

  return (
    <div
      className={`bg-black backdrop-blur-sm rounded-2xl p-6 font-sans ${className}`}
    >
      <h2 className="text-white text-2xl font-bold mb-6">Balance</h2>
      <div className="flex items-center gap-4">
        <img src="/coins/ndlp.png" alt="NDLP" className="w-10" />
        <div>
          <div className="text-white/70 text-sm">You have</div>
          <div className="text-white text-xl font-bold">
            {formatAmount({ amount: ndlpAmount })} NDLP
          </div>
          <div className="text-white/70 text-xs">
            1 NDLP = {conversionRate} USDC
          </div>
        </div>
      </div>

      <div className="ml-1 py-4">
        <img src={arrowDown} alt="Arrow Down" className="w-8 h-8" />
      </div>

      <div className="flex items-center gap-4">
        <img src="/coins/usdc.png" alt="USDC" className="w-10" />
        <div>
          <div className="text-white/70 text-sm">You will get</div>
          <div className="text-white text-xl font-bold">
            {formatAmount({ amount: usdcEquivalent })} USDC
          </div>
          <div className="text-white/70 text-xs">
            ${formatAmount({ amount: usdcDollarRate })}
          </div>
        </div>
      </div>
    </div>
  );
}
