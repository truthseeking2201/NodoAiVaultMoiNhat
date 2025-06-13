import { useBreakpoint } from "@/hooks/useBreakpoint";
import { useCollateralLPRate } from "@/hooks/useDepositVault";
import { useGetCoinBalance } from "@/hooks/useMyAssets";
import { useDepositVaultStore } from "@/hooks/useStore";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/utils/currency";
import { VaultPool } from ".";
import { EXCHANGE_CODES_MAP } from "@/config/vault-config";

const APR = ({ text, is2xl }: { text: string; is2xl: boolean }) => {
  return (
    <div
      className={cn(
        "font-sans font-bold bg-gradient-to-r from-[#9DEBFF] to-[#00FF5E] bg-clip-text text-transparent",
        is2xl ? "text-[22px]" : "text-[16px]"
      )}
    >
      {text}
    </div>
  );
};

const VaultCard = ({ pool }: { pool: VaultPool }) => {
  const { is2xl } = useBreakpoint();
  const exchange = EXCHANGE_CODES_MAP[pool.exchange_id];

  const { balance: ndlpAmount } = useGetCoinBalance(
    pool.vault_lp_token,
    pool.vault_lp_token_decimals
  );

  const conversionRate = useCollateralLPRate(true, pool.vault_id);
  const userHolding = ndlpAmount * conversionRate;
  const isSelected = pool.isSelected && pool.isLive;
  const { setDepositVault } = useDepositVaultStore();

  return (
    <div
      className={cn(
        "bg-white rounded-xl shadow w-[calc(100%/3-0.5rem)] p-[2px] cursor-pointer group transition-transform duration-300",
        !pool.isLive && "opacity-50",
        !isSelected && "hover:scale-[1.04]"
      )}
      style={{
        background: isSelected
          ? "linear-gradient(90deg, #FFF -3.93%, #0090FF 22.06%, #FF6D9C 48.04%, #FB7E16 74.02%, #FFF 100%)"
          : "#5C5C5C",
      }}
      onMouseEnter={(e) => {
        if (pool.isLive) {
          e.currentTarget.style.background =
            "linear-gradient(90deg, #FFF -3.93%, #0090FF 22.06%, #FF6D9C 48.04%, #FB7E16 74.02%, #FFF 100%)";
        }
      }}
      onMouseLeave={(e) => {
        if (!isSelected) {
          e.currentTarget.style.background = "#5C5C5C";
        }
      }}
      onClick={() => {
        if (pool.isLive) {
          setDepositVault(pool.vault_id);
        }
      }}
    >
      <div
        className={cn("flex flex-col rounded-xl h-full", is2xl ? "p-4" : "p-2")}
        style={{
          background: "linear-gradient(135deg, #212121 22.8%, #060606 90.81%)",
        }}
      >
        <div className="flex items-start justify-center mb-5 gap-2">
          <div className="flex items-center justify-center">
            {pool.tokens.map((token, index) => (
              <span
                key={token}
                className={cn(
                  "text-white font-bold",
                  is2xl ? "text-md" : "text-sm"
                )}
              >
                {token}
                {index < pool.tokens.length - 1 ? " - " : ""}
              </span>
            ))}
          </div>
          <div
            className={cn(
              "font-medium text-xs bg-[#44EF8B] rounded-xl",
              pool.isLive ? "bg-[#44EF8B]" : "bg-[#FFFFFF33]",
              pool.isLive ? "text-black" : "text-white",
              is2xl
                ? "text-[12px] px-2 pt-1 pb-0.5"
                : "text-[10px] px-1.5 py-0.5"
            )}
          >
            {pool.isLive ? "Live" : "Coming Soon"}
          </div>
        </div>
        <div className="flex items-center justify-center">
          {pool?.tokens?.length > 0 &&
            pool.tokens.map((token, index) => (
              <img
                key={token}
                src={`/coins/${token?.toLowerCase()}.png`}
                alt={token}
                className={cn(
                  "mr-2 rounded-full",
                  is2xl ? "w-[36px] h-[36px]" : "w-[24px] h-[24px]",
                  index > 0 && "ml-[-15px]"
                )}
              />
            ))}
        </div>
        <div className="mt-5 flex items-center justify-between">
          <span
            className={cn(" text-white/50", is2xl ? "text-base" : "text-xs")}
          >
            APR:
          </span>
          <APR
            is2xl={is2xl}
            text={
              pool.APR && pool.APR !== 0
                ? `${formatCurrency(
                    pool.APR < 0 ? 0 : pool.APR,
                    0,
                    0,
                    2,
                    "decimal"
                  )}%`
                : "--"
            }
          />
        </div>
        <div className="flex items-center justify-between mt-2">
          <div className={cn("text-white/50", is2xl ? "text-base" : "text-xs")}>
            DEX
          </div>
          <div className="flex gap-1 items-center text-base">
            <img
              src={`/dexs/${exchange?.code}.png`}
              className={cn(is2xl ? "h-[16px]" : "h-[12px]")}
            />
            <div
              className={cn(
                "font-sans font-bold",
                is2xl ? "text-base" : "text-xs"
              )}
            >
              {exchange.name}
            </div>
          </div>
        </div>
        <div
          className={cn(
            "mt-4 bg-[#FFFFFF26] py-[6px] px-2 rounded-[6px] w-full  flex items-center justify-between",
            is2xl ? "text-sm" : "text-xs"
          )}
        >
          <span className={"text-white/50"}>Your holding: </span>
          <span className="text-white font-bold">
            {userHolding && userHolding !== 0
              ? `${formatCurrency(userHolding)}` // Assuming 9 decimals, adjust as needed
              : "--"}
          </span>
        </div>
      </div>
    </div>
  );
};

export default VaultCard;
