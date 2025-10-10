import { RowItem } from "@/components/ui/row-item";
import { VaultItemData } from "./vault-list";
import { cn, formatPercentage } from "@/lib/utils";
import Web3Button from "@/components/ui/web3-button";
import { ButtonGradient } from "@/components/ui/button-gradient";
import VaultHolding from "./vault-holding";
import VaultRewards from "./vault-rewards";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LabelWithTooltip } from "@/components/ui/label-with-tooltip";
import ApyTooltipContent from "./apy-tooltip-content";

type VaultCardProps = {
  item: VaultItemData;
  idLoadingClaim?: string;
  reloadDataWithdraw: () => void;
  onRowClick: (item: VaultItemData) => void;
  onClaim: (item: VaultItemData) => void;
  HOLDING_TYPE: { label: string; value: string }[];
  holdingShowMode: string;
  setHoldingShowMode: (mode: string) => void;
};

const VaultItemMobile = ({
  item,
  idLoadingClaim,
  onRowClick,
  onClaim,
  reloadDataWithdraw = () => {},
  HOLDING_TYPE,
  holdingShowMode,
  setHoldingShowMode,
}: VaultCardProps) => {
  const classLabel = "text-[#9C9C9C]";
  const classValue = "font-medium font-mono text-white text-base";

  return (
    <div
      className={cn("rounded-lg border border-white/10 p-4 mt-4 first:mt-0")}
    >
      <RowItem
        className="items-start"
        classNameLabel={classLabel}
        classNameValue={classValue}
        label="Pools"
      >
        <div className="flex flex-col items-end gap-1">
          <div className="flex items-center justify-center gap-2">
            {item.token_pools?.length > 0 &&
              item.token_pools.map((token, index) => (
                <img
                  key={token.name}
                  src={token.image}
                  alt={token.name}
                  className={cn(
                    "rounded-full w-[24px] h-[24px]",
                    index > 0 && "ml-[-15px]"
                  )}
                />
              ))}
            <div className="font-bold text-white text-base truncate max-w-[150px]">
              {item.vault_name}
            </div>
          </div>
          <div className="flex gap-1 items-center text-xs font-medium">
            <img
              src={item.exchange_image}
              alt={item.exchange_name}
              className="h-[14px]"
            />
            {item.exchange_name}
          </div>
        </div>
      </RowItem>

      <RowItem
        className="mt-3"
        classNameLabel={classLabel}
        classNameValue={classValue}
        label="TVL"
      >
        {item.total_value_usd_show}
      </RowItem>

      <RowItem
        className="mt-3"
        classNameLabel={classLabel}
        classNameValue={cn(classValue, "text-green-increase")}
        label="APY"
      >
        {/* {item.vault_apy_show} */}

        <LabelWithTooltip
          hasIcon={false}
          label={formatPercentage(+item.daily_compounding_apy || 0)}
          labelClassName="text-green-increase font-medium font-mono text-base break-all"
          contentClassName="md:min-w-[352px] w-full shadow-[0_2px_4px_rgba(255,255,255,0.25)]"
          type="underline"
          tooltipContent={<ApyTooltipContent {...item} />}
        />
      </RowItem>

      <RowItem
        className="mt-3"
        classNameLabel={classLabel}
        classNameValue={classValue}
        label="24h Rewards"
      >
        {item.rewards_24h_usd_show}
      </RowItem>

      <RowItem
        className="mt-3"
        classNameLabel={classLabel}
        classNameValue={classValue}
        label="Rewards"
      >
        <VaultRewards item={item} />
      </RowItem>

      <RowItem
        className="mt-3 !block w-full"
        classNameLabel={cn(classLabel, "w-full")}
        classNameValue={classValue}
        label={
          <div
            className="flex items-center justify-between !w-full"
            onClick={(e) => {
              e.stopPropagation();
            }}
          >
            <div>Your Holdings</div>
            <Tabs value={holdingShowMode} onValueChange={setHoldingShowMode}>
              <TabsList className="p-1 flex gap-1">
                {HOLDING_TYPE.map((tab, index) => (
                  <TabsTrigger
                    key={`holding-type-${index}`}
                    value={tab.value}
                    className="!text-xs"
                  >
                    {tab.label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>
        }
      ></RowItem>

      <div className="px-3 py-2 rounded-md bg-white bg-opacity-4 mt-3">
        <VaultHolding
          item={item}
          reloadData={reloadDataWithdraw}
          classRow="justify-between"
          classLabel="text-white/70 font-mono text-xs"
          classValue="font-medium font-mono text-white text-sm"
          HOLDING_TYPE={HOLDING_TYPE}
          holdingShowMode={holdingShowMode}
        />
      </div>

      <div className="mt-4 flex flex-col gap-2">
        <Web3Button
          onClick={(e) => {
            e.stopPropagation();
            onRowClick(item);
          }}
          className="w-full text-sm h-[36px]"
        >
          Deposit
        </Web3Button>
        {(item?.withdrawing?.is_ready === true ||
          item?.withdrawing?.is_over_time === true) && (
          <ButtonGradient
            onClick={(e: React.FormEvent) => {
              e.stopPropagation();
              e.preventDefault();
              onClaim(item);
            }}
            variant="outline"
            className="w-full"
            loading={idLoadingClaim === item.vault_id}
            disabled={!!idLoadingClaim || !item?.withdrawing?.is_ready}
            hideContentOnLoading={true}
          >
            Claim
          </ButtonGradient>
        )}
      </div>
    </div>
  );
};

export default VaultItemMobile;
