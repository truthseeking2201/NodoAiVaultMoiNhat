import { RowItem } from "@/components/ui/row-item";

import { showFormatNumber } from "@/lib/number";
import { truncateStringWithSeparator } from "@/utils/helpers";

type Props = {
  summary?: any;
  lpData?: any;
  address?: string;
};

const ClaimToken = ({ summary, lpData, address }: Props) => {
  /**
   * HOOKS
   */

  /**
   * FUNCTION
   */

  /**
   * LIFECYCLES
   */

  /**
   * RENDER
   */
  return (
    <div className="p-4 border border-white/15 rounded-lg">
      <RowItem label="Amount">
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
        label="Withdraw Fee"
        className="mt-3"
      >
        {showFormatNumber(summary?.fee || 0)} {lpData?.token_symbol}
      </RowItem>
      <hr className="w-full border-t border-white/15 mt-3 mb-3" />
      <RowItem label="You’ll Receive">
        <div className="flex items-center font-bold">
          <img
            src={lpData?.token_image}
            alt="NODOAIx Token"
            className="w-6 h-6 mr-2"
          />
          {showFormatNumber(summary?.receive || 0)} {lpData?.token_symbol}
        </div>
      </RowItem>
      <RowItem
        label="Recipient"
        className="mt-3"
      >
        {truncateStringWithSeparator(address, 13, "...", 6)}
      </RowItem>
    </div>
  );
};

export default ClaimToken;
