import { RowItem } from "@/components/ui/row-item";
import { LabelWithTooltip } from "@/components/ui/label-with-tooltip";

import { showFormatNumber } from "@/lib/number";
// import { truncateStringWithSeparator } from "@/utils/helpers";

type Props = {
  summary?: any;
  lpData?: any;
  configVault?: any;
  address?: string;
};

const SummaryConfirmWithdraw = ({
  summary,
  lpData,
  configVault,
  address,
}: Props) => {
  return (
    <div className="p-4 border border-white/15 rounded-lg">
      <RowItem label="Vault">
        <div className="flex items-center gap-2">
          <div className="relative flex">
            <img
              src={lpData.token_image}
              alt={lpData.token_symbol}
              className=" absolute right-[18px] z-0"
            />
            <img
              src={lpData.quote_image}
              alt={lpData.quote_symbol}
              className="w-6 h-6 z-10"
            />
          </div>

          <span className="font-mono text-lg text-white">
            {lpData.vault_name}
          </span>
        </div>
      </RowItem>
      {lpData?.exchange && (
        <RowItem
          label="DEX"
          className="mt-3"
        >
          <div className="flex items-center gap-1">
            <img
              src={`/dexs/${lpData.exchange.code}.png`}
              alt={lpData.exchange.name}
              className=" w-4 h-4 inline"
            />
            <span className="font-sans text-base font-bold text-white">
              {lpData.exchange.name}
            </span>
          </div>
        </RowItem>
      )}
      <RowItem
        label="Amount"
        className="mt-3"
      >
        <div className="flex items-center">
          <img
            src={lpData?.lp_image}
            alt="NODOAIx Token"
            className="w-6 h-6 mr-2"
          />
          {showFormatNumber(summary?.amount || 0)} {lpData?.lp_symbol}
        </div>
      </RowItem>
      <RowItem
        label="Conversion Rate"
        className="mt-3 tracking-tighter"
      >
        <span className="mr-1.5">1</span>
        {summary?.conversion_rate?.from_symbol}
        <span className="mx-1.5">=</span>
        {showFormatNumber(summary?.conversion_rate?.amount, 0, 4)}
        <span className="ml-1.5">{summary?.conversion_rate?.to_symbol}</span>
      </RowItem>
      <hr className="w-full border-t border-white/15 mt-3 mb-3" />

      <RowItem className="mt-3">
        <RowItem.Label>
          <LabelWithTooltip
            label="Est. Max Receive"
            labelClassName="text-base text-gray-400 font-sans"
            tooltipContent="Estimated amount based on current NDLP price. Final amount may vary slightly due to market conditions during processing."
            asChild={true}
          />
        </RowItem.Label>
        <RowItem.Value>
          <div className="flex items-center">
            <img
              src={summary.tokenReceive?.image}
              alt={summary.tokenReceive?.token_symbol}
              className="w-6 h-6 mr-2"
            />
            <span className="text-gray-200 font-bold">
              {summary?.receive
                ? `${showFormatNumber(summary.receive)} `
                : "--"}
            </span>
          </div>
        </RowItem.Value>
      </RowItem>
      <RowItem
        label="Transaction Fee"
        className="mt-3"
      >
        Free
      </RowItem>
      {/* <RowItem
        label="Recipient"
        className="mt-3"
      >
        {truncateStringWithSeparator(address, 13, "...", 6)}
      </RowItem> */}
    </div>
  );
};

export default SummaryConfirmWithdraw;
