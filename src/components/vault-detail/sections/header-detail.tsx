import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import ShinyText from "@/components/ui/shiny-text";
import { BasicVaultDetailsType } from "@/types/vault-config.types";
import ConditionRenderer from "@/components/shared/condition-renderer";
import useBreakpoint from "@/hooks/use-breakpoint";
import { VaultInfo } from "@/pages/vault-detail";

type VaultInfoProps = {
  vault: any;
  exchange: {
    code: string;
    name: string;
    image: string;
  };
  tokens: string[];
  vaultInfo: any;
  isDetailLoading: boolean;
  vaultDetails?: BasicVaultDetailsType;
  vaultId?: string;
};

const PairIcons = ({ tokens }: { tokens: string[] }) => {
  return (
    <div className={"flex items-center md:justify-center"}>
      {tokens?.length > 0 &&
        tokens.map((token: any, index: any) => (
          <img
            key={token}
            src={`/coins/${token?.toLowerCase()}.png`}
            alt={token}
            className={cn(
              "mr-2 w-12 h-12 rounded-full max-md:w-8 max-md:h-8",
              index > 0 && "ml-[-15px]"
            )}
          />
        ))}
    </div>
  );
};

const Statistic = ({
  vaultInfo,
  isMobile,
}: {
  vaultInfo: VaultInfo[];
  isMobile: boolean;
}) => {
  return (
    <div
      className={cn(
        "flex items-end gap-10",
        isMobile && "flex-col gap-1.5 min-w-[160px]"
      )}
    >
      {vaultInfo.map((info) => {
        const textContent = (
          <div className="text-white font-medium text-right text-xl font-mono max-md:text-sm">
            {typeof info.prefix === "string" ? (
              `${info.prefix || ""}${info.value}${info.suffix || ""}`
            ) : (
              <div className="flex items-center justify-end gap-1">
                {info.prefix} {info.value}
                {info.suffix}
              </div>
            )}
          </div>
        );
        return (
          <div key={info.label} className="w-full">
            <div className="flex items-center gap-1 justify-end mb-1 max-md:justify-between max-md:w-full">
              <div className="flex items-center gap-1">
                <TooltipProvider delayDuration={0}>
                  <Tooltip>
                    <TooltipTrigger>
                      <div
                        className={cn(
                          "text-white/80 text-xs text-right max-md:text-xs underline underline-offset-8 decoration-dotted decoration-gray-600 whitespace-nowrap"
                        )}
                      >
                        {info.label}
                      </div>
                    </TooltipTrigger>
                    <TooltipContent
                      className={cn(
                        "shadow-[0_2px_4px_rgba(255,255,255,0.25)] p-3 max-w-[229px] text-white/80 text-xs",
                        info.tooltipClassName
                      )}
                    >
                      {info.tooltip}
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>

              <ConditionRenderer when={isMobile}>
                {textContent}
              </ConditionRenderer>
            </div>

            <ConditionRenderer when={!isMobile}>
              {textContent}
            </ConditionRenderer>
          </div>
        );
      })}
    </div>
  );
};

const HeaderDetail = ({
  vault,
  exchange,
  tokens,
  vaultInfo = [],
  isDetailLoading,
  vaultDetails,
  vaultId,
}: VaultInfoProps) => {
  const { isMd } = useBreakpoint();
  const isMobile = !isMd;
  if (isMobile) {
    if (isDetailLoading) {
      return (
        <div className="flex gap-4 h-[118px] w-full justify-between">
          <div className="flex flex-col items-center gap-2">
            <div className="flex items-center justify-center">
              <Skeleton className="h-10 w-10 rounded-full" />
              <Skeleton className="h-10 w-10 rounded-full ml-[-15px]" />
            </div>
            <div className="space-y-2 flex flex-col ">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-[60px]" />
            </div>
          </div>
          <div className="space-y-4 flex flex-col">
            <Skeleton className="h-4 w-[200px]" />
            <Skeleton className="h-4 w-[200px]" />
            <Skeleton className="h-4 w-[200px]" />
          </div>
        </div>
      );
    }
    return (
      <header className="mb-6">
        <div className="w-full flex items-center justify-between">
          <div>
            <PairIcons tokens={tokens} />
            <ShinyText
              text={vault.vault_name}
              className="text-base font-bold mt-3"
              textColor="text-white/50"
            />
            <div className="flex items-center gap-1 mt-1">
              <img
                src={exchange.image}
                alt={vaultDetails?.exchange}
                className=" w-4 h-4 inline"
              />
              <div className="text-white text-sm">{vaultDetails?.exchange}</div>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="4"
                height="4"
                viewBox="0 0 4 4"
                fill="none"
              >
                <circle cx="2.18164" cy="2" r="1.44336" fill="#A5A5A5" />
              </svg>
              <img
                src={`/chains/sui.png`}
                alt="SUI"
                className="w-4 h-4 inline"
              />
              <div className="text-white text-sm font-bold">SUI</div>
            </div>
          </div>
          <Statistic vaultInfo={vaultInfo} isMobile={isMobile} />
        </div>
      </header>
    );
  }
  return (
    <header className="mb-4 flex items-center justify-between">
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
            <PairIcons tokens={tokens} />
          </div>
          <div>
            <ShinyText
              text={vault.vault_name}
              className="text-2xl font-bold"
              textColor="text-white/50"
            />
            <div className="flex items-center gap-1">
              <div className="text-white/50"> Powered by </div>
              <img
                src={exchange.image}
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
      <ConditionRenderer
        when={isDetailLoading}
        fallback={<Statistic vaultInfo={vaultInfo} isMobile={isMobile} />}
      >
        <div className="flex items-end gap-6">
          {vaultInfo.map((info) => (
            <div key={info.label} className="flex flex-col items-end space-y-2">
              <Skeleton className="h-3 w-[50px] rounded bg-gray-700" />
              <Skeleton className="h-5 w-[80px] rounded bg-gray-700" />
            </div>
          ))}
        </div>
      </ConditionRenderer>
    </header>
  );
};

export default HeaderDetail;
