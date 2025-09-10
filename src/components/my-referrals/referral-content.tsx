import { useState, useMemo, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { RowCopy } from "./row-copy";
import { MyReferralsDashboardModal } from "./my-referrals-dashboard-modal";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowRightContained } from "@/assets/icons";
import { useWhitelistWallet } from "@/hooks";
import ExternalIcon from "@/assets/icons/external-gradient.svg?react";
import { cn } from "@/lib/utils";

interface ReferralContentProps {
  className?: string;
  forType?: "leaderboard" | "tooltip";
}

type valueTab = "code" | "link";

export const ReferralContent = ({
  className = "",
  forType = "tooltip",
}: ReferralContentProps) => {
  const tabs = [
    { value: "code", label: "Code" },
    { value: "link", label: "Link" },
  ];
  const [activeTab, setActiveTab] = useState<valueTab>("code");
  const [openModalRefer, setOpenModalRefer] = useState(false);
  const { walletDetails, refetch } = useWhitelistWallet();
  const dataRefer = useMemo(() => {
    const referCode = walletDetails?.invite_code?.code;
    const href = window.location?.origin;
    return {
      referCode: referCode,
      referLinkCode: `${href}?invite-ref=${referCode}`,
      referTotal: walletDetails?.total_referrals,
    };
  }, [walletDetails]);

  useEffect(() => {
    const handler = setTimeout(() => {
      if (walletDetails && !walletDetails?.invite_code?.code) {
        refetch();
      }
    }, 3000);

    return () => clearTimeout(handler);
  }, [walletDetails, refetch]);

  return (
    <>
      <div className={`flex flex-col md:gap-4 gap-3 p-4 ${className}`}>
        <div className="flex items-end justify-between">
          <div>
            <p
              className={cn(
                "text-gray-400 mb-1",
                forType == "leaderboard" ? "md:text-base text-sm" : "text-sm"
              )}
            >
              Total Referrals
            </p>
            <p
              className={cn(
                "font-bold text-white mb-0 font-mono",
                forType == "leaderboard" ? "md:text-3xl text-xl" : "text-2xl"
              )}
            >
              {dataRefer.referTotal}
            </p>
          </div>
          <div className="flex items-center">
            <Tabs
              value={activeTab}
              onValueChange={(value) => setActiveTab(value as valueTab)}
              // className="bg-black border rounded-lg"
            >
              <TabsList className="p-1 flex gap-1">
                {tabs.map((el) => (
                  <TabsTrigger
                    key={el.value}
                    value={el.value}
                    className={cn(
                      "w-[68px]",
                      forType == "leaderboard" ? "md:h-[30px] h-6" : "h-[30px]"
                    )}
                  >
                    {el.label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>
        </div>
        <RowCopy
          value={
            activeTab === "code" ? dataRefer.referCode : dataRefer.referLinkCode
          }
        />

        {forType == "leaderboard" && (
          <div className="flex items-center jsujustify-start">
            <Button
              size="sm"
              className="font-semibold md:text-base text-sm p-0 h-fit hover:opacity-80 justify-start"
              onClick={() => {
                setOpenModalRefer(true);
              }}
            >
              <span className="gradient-3rd-underline">
                My Referral Dashboard
              </span>

              <ExternalIcon className="!w-5 !h-5" />
            </Button>
          </div>
        )}
        {forType == "tooltip" && (
          <Button
            size="sm"
            className="font-semibold text-sm p-0 h-fit w-full hover:opacity-80"
            onClick={() => {
              setOpenModalRefer(true);
            }}
          >
            <span className="bg-gradient-to-r from-[#FFE8C9] via-[#F9F4E9] via-[#E3F6FF] to-[#C9D4FF] text-transparent bg-clip-text">
              My Referral Dashboard
            </span>

            <ArrowRightContained className="!w-4 !h-4" />
          </Button>
        )}
      </div>
      <MyReferralsDashboardModal
        isOpen={openModalRefer}
        onClose={() => {
          setOpenModalRefer(false);
        }}
      />
    </>
  );
};
