import USDCIcon from "@/assets/images/usdc.png";
import SUIIcon from "@/assets/images/sui-wallet.png";
import CetusIcon from "@/assets/images/cetus.png";
import DeepIcon from "@/assets/images/deep.png";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/utils/currency";

const VaultCard = ({ pool }) => {
  const tokenImgs = {
    USDC: USDCIcon,
    SUI: SUIIcon,
    CETUS: CetusIcon,
    DEEP: DeepIcon,
  };
  return (
    <div
      className={cn(
        "bg-white rounded-xl shadow w-[calc(100%/3-0.5rem)] p-[1.5px]",
        !pool.isLive && "opacity-50"
      )}
      style={{
        background: pool.isLive
          ? "linear-gradient(90deg, #FFF -3.93%, #0090FF 22.06%, #FF6D9C 48.04%, #FB7E16 74.02%, #FFF 100%)"
          : "#5C5C5C",
      }}
    >
      <div
        className="flex flex-col p-4 rounded-xl"
        style={{
          background: pool.isLive
            ? "linear-gradient(135deg, #212121 22.8%, #060606 90.81%)"
            : "linear-gradient(135deg, #212121 22.8%, #060606 90.81%)",
        }}
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center">
            {pool?.tokens?.length > 0 &&
              pool.tokens.map((token, index) => (
                <img
                  key={token}
                  src={tokenImgs[token]}
                  alt={token}
                  className={cn(
                    "w-[36px] h-[36px] mr-2",
                    index > 0 && "ml-[-15px]"
                  )}
                />
              ))}
          </div>
          <div
            className={cn(
              "font-medium text-xs bg-[#44EF8B] px-2 py-1 rounded-xl",
              pool.isLive ? "bg-[#44EF8B]" : "bg-[#FFFFFF33]",
              pool.isLive ? "text-black" : "text-white"
            )}
          >
            {pool.isLive ? "Live" : "Coming Soon"}
          </div>
        </div>
        <div>
          {pool.tokens.map((token, index) => (
            <span key={token} className={"text-white text-md font-bold"}>
              {token}
              {index < pool.tokens.length - 1 ? " - " : ""}
            </span>
          ))}
        </div>
        <div className="mt-2.5">
          <span className=" text-white/50 text-[18px] text-left">
            APR:{" "}
            <span className="font-bold text-[24px] text-white">
              {pool.APR && pool.APR !== 0
                ? `${formatCurrency(pool.APR, 0, 0, 2, "decimal")}%`
                : "--"}
            </span>
          </span>
        </div>
        <div className="mt-4 bg-[#FFFFFF26] py-[6px] px-2 rounded-[6px] w-full text-sm flex items-center justify-between">
          <span className="text-white/50">Your holding: </span>
          <span className="text-white font-bold">
            {pool.holding && pool.holding !== 0
              ? `$${formatCurrency(pool.holding)}`
              : "--"}
          </span>
        </div>
      </div>
    </div>
  );
};

export default VaultCard;
