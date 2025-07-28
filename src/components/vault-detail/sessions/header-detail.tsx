import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import ShinyText from "@/components/ui/shiny-text";
import { ArrowDecreasing, ArrowIncreasing } from "@/assets/icons";
import { BasicVaultDetailsType } from "@/types/vault-config.types";

type VaultInfoProps = {
  vault: any;
  exchange: {
    code: string;
    name: string;
  };
  tokens: string[];
  vaultInfo: any;
  isDetailLoading: boolean;
  vaultDetails?: BasicVaultDetailsType;
};

const HeaderDetail = ({
  vault,
  exchange,
  tokens,
  vaultInfo = [],
  isDetailLoading,
  vaultDetails,
}: VaultInfoProps) => {
  return (
    <header className="mb-6 flex items-center justify-between">
      {isDetailLoading ? (
        <div className="flex gap-4 h-[58px]">
          <div className="flex items-center justify-center">
            <Skeleton className="h-12 w-12 rounded-full" />
            <Skeleton className="h-12 w-12 rounded-full ml-[-15px]" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-[250px]" />
            <Skeleton className="h-4 w-[200px]" />
          </div>
        </div>
      ) : (
        <div className="flex gap-4">
          <div className="flex items-center justify-center">
            {tokens?.length > 0 &&
              tokens.map((token: any, index: any) => (
                <img
                  key={token}
                  src={`/coins/${token?.toLowerCase()}.png`}
                  alt={token}
                  className={cn(
                    "mr-2 w-12 h-12 rounded-full",
                    index > 0 && "ml-[-15px]"
                  )}
                />
              ))}
          </div>
          <div>
            <ShinyText text={vault.vault_name} className="text-2xl font-bold" textColor="text-white/75" />
            <div className="flex items-center gap-1">
              <div className="text-white/50"> Powered by </div>
              <img
                src={`/dexs/${exchange.code}.png`}
                alt={vaultDetails?.exchange}
                className=" w-4 h-4 inline"
              />
              <div className="text-white">{vaultDetails?.exchange}</div>
              <div className="text-white/50">on</div>
              <img
                src={`/chains/sui.png`}
                alt="SUI"
                className="w-4 h-4 inline"
              />
              <div className="text-white font-bold">SUI</div>
            </div>
          </div>
        </div>
      )}
      {isDetailLoading ? (
        <div className="flex items-end gap-10">
          {vaultInfo.map((info) => (
            <div key={info.label} className="flex flex-col items-end space-y-2">
              <Skeleton className="h-3 w-[50px] rounded bg-gray-700" />
              <Skeleton className="h-5 w-[80px] rounded bg-gray-700" />
            </div>
          ))}
        </div>
      ) : (
        <div className="flex items-end gap-10">
          {vaultInfo.map((info) => (
            <div key={info.label}>
              <div className="flex items-center gap-1 justify-end mb-1">
                <div className="text-white/80 text-xs text-right">
                  {info.label}
                </div>
                <TooltipProvider delayDuration={0}>
                  <Tooltip>
                    <TooltipTrigger>
                      <HelpCircle className="h-3 w-3 text-white/80" />
                    </TooltipTrigger>
                    <TooltipContent className="shadow-[0_2px_4px_rgba(255,255,255,0.25)] p-3">
                      {info?.tooltip?.map((tooltipItem: any, index: number) => (
                        <div
                          key={`${info.label}-${index}`}
                          className="flex items-center justify-between gap-2 min-w-[200px] mb-1"
                        >
                          <div className="text-xs text-white/80">
                            {tooltipItem.label}
                          </div>
                          {tooltipItem.isHighlighted ? (
                            <div
                              className={cn(
                                "text-sm font-mono flex items-center",
                                tooltipItem.isIncreasing
                                  ? "text-[#64EBBC]"
                                  : "text-red-400"
                              )}
                            >
                              {tooltipItem.isIncreasing ? (
                                <ArrowIncreasing />
                              ) : (
                                <ArrowDecreasing />
                              )}
                              {tooltipItem.prefix || ""}
                              {tooltipItem.value}
                              {tooltipItem.suffix || ""}
                            </div>
                          ) : (
                            <div className="text-sm font-semibold text-white font-mono">
                              {tooltipItem.prefix || ""}
                              {tooltipItem.value}
                              {tooltipItem.suffix || ""}
                            </div>
                          )}
                        </div>
                      )) || "No additional info available."}
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>

              <div className="text-white font-medium text-right text-xl font-mono">
                {`${info.prefix || ""}${info.value}${info.suffix || ""}`}
              </div>
            </div>
          ))}
        </div>
      )}
    </header>
  );
};

export default HeaderDetail;
