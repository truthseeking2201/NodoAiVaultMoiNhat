import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { ItemRow } from "./ItemRow";
import { MyReferralsDashboardModal } from "./MyReferralsDashboardModal";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";
import { useWhitelistWallet } from "@/hooks/useWhitelistWallet";
interface MyReferralsCardProps {
  className?: string;
}

export function MyReferralsCard({ className = "" }: MyReferralsCardProps) {
  const [openModalRefer, setOpenModalRefer] = useState(false);

  /**
   * HOOKS
   */
  const { walletDetails } = useWhitelistWallet();
  const dataRefer = useMemo(() => {
    const referCode = walletDetails?.invite_code?.code;
    const href = window.location?.origin;
    return {
      referCode: referCode,
      referLinkCode: `${href}?invite-ref=${referCode}`,
      referTotal: walletDetails?.total_referrals,
    };
  }, [walletDetails]);

  /**
   * RENDER
   */
  return (
    <>
      {dataRefer?.referCode && (
        <div
          className={`bg-black/80 backdrop-blur-sm rounded-xl p-6 mb-6 font-sans text-left flex flex-col gap-4 ${className}`}
        >
          <h3 className="font-heading-md text-100 mb-0">My Referrals</h3>
          <ItemRow
            title="Your Referral Code"
            value={dataRefer.referCode}
          />
          <ItemRow
            title="Your Referral Link"
            value={dataRefer.referLinkCode}
          />
          <div>
            <div className="text-075 text-sm mb-2">Total Referrals</div>
            <div className="text-white text-2xl font-bold font-mono">
              {dataRefer.referTotal}
            </div>
          </div>

          <Button
            size="lg"
            className="font-semibold text-base p-0 h-fit"
            onClick={() => {
              setOpenModalRefer(true);
            }}
          >
            <span className="gradient-3rd-underline hover:opacity-80">
              My Referral Dashboard
            </span>

            <ExternalLink
              size={40}
              strokeWidth={2}
              className="text-[#F2BB89]"
            />
          </Button>

          <MyReferralsDashboardModal
            isOpen={openModalRefer}
            onClose={() => {
              setOpenModalRefer(false);
            }}
          />
        </div>
      )}
    </>
  );
}
