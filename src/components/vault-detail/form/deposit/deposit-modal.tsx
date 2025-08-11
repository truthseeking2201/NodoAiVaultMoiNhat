import arrowBack from "@/assets/icons/arrow-back.svg";
import gradientLink from "@/assets/icons/gradient-arrow-link.svg";
import successAnimationData from "@/assets/lottie/circle_checkmark_success.json";
import ConditionRenderer from "@/components/shared/condition-renderer";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import VideoModal from "@/components/ui/video-modal";
import Web3Button from "@/components/ui/web3-button";
import { ADD_NDLP_WALLET_TUTORIAL_LINK } from "@/config/constants";
import { EXCHANGE_CODES_MAP } from "@/config/vault-config";
import useBreakpoint from "@/hooks/use-breakpoint";
import { cn, formatAmount } from "@/lib/utils";
import { BasicVaultDetailsType } from "@/types/vault-config.types";
import { truncateBetween } from "@/utils/truncate";
import Lottie from "lottie-react";
import { X } from "lucide-react";
import { useState } from "react";
import { DepositSuccessData } from "./deposit-form";
import { useCurrentWallet } from "@mysten/dapp-kit";

interface DepositModalProps {
  vault: BasicVaultDetailsType;
  isOpen: boolean;
  depositStep: number;
  onOpenChange: () => void;
  onDeposit?: () => void;
  onDepositSuccess?: () => void;
  onDone?: () => void;
  confirmData: {
    amount: number;
    ndlp: number;
    conversionRate: number;
  };
  loading: boolean;
  depositSuccessData?: DepositSuccessData;
  collateralToken: {
    symbol: string;
    decimals: number;
  };
}

const GradientText = ({ text }: { text: string }) => {
  return (
    <span
      style={{
        background:
          "linear-gradient(90deg, #FFE8C9 0%, #F9F4E9 25%, #E3F6FF 60%, #C9D4FF 100%)",
        backgroundClip: "text",
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
      }}
      className="font-bold text-base font-mono"
    >
      {text}
    </span>
  );
};

const VaultInfo = ({
  poolName,
  valutName,
  exchangeId,
}: {
  poolName: string;
  valutName: string;
  exchangeId: number;
}) => {
  const token1 = poolName.split("-")[0];
  const token2 = poolName.split("-")[1];
  const dex = EXCHANGE_CODES_MAP[exchangeId] || null;

  return (
    <>
      <div className="flex items-center justify-between">
        <span className="text-13px md:text-base text-[#9CA3AF]">Vault</span>
        <div className="flex items-center gap-2">
          <div className="relative flex">
            <img
              src={`/coins/${token1?.toLowerCase()}.png`}
              alt={token1}
              className=" absolute right-[18px] z-0"
            />
            <img
              src={`/coins/${token2?.toLowerCase()}.png`}
              alt={token2}
              className="w-6 h-6 z-10"
            />
          </div>

          <span className="font-mono text-sm md:text-lg text-white">
            {valutName}
          </span>
        </div>
      </div>
      {dex && (
        <div className="flex items-center justify-between">
          <span className="text-13px md:text-base text-[#9CA3AF]">DEX</span>
          <div className="flex items-center gap-1">
            <img src={dex.image} alt={dex.name} className=" w-4 h-4 inline" />
            <span className="font-sans text-sm md:text-base font-bold text-white">
              {dex.name}
            </span>
          </div>
        </div>
      )}
    </>
  );
};

const DepositModal = (props: DepositModalProps) => {
  const {
    isOpen,
    depositStep,
    onOpenChange,
    onDeposit,
    onDone,
    confirmData,
    depositSuccessData,
    loading,
    collateralToken,
    vault,
  } = props;

  const [tutorialVideoOpen, setTutorialVideoOpen] = useState(false);

  const { isMd } = useBreakpoint();
  const { symbol: collateralTokenName = "" } = collateralToken;
  const { amount, ndlp, conversionRate } = confirmData;
  const { currentWallet } = useCurrentWallet();

  const formattedAmount = formatAmount({
    amount: amount,
    precision: collateralToken?.decimals || 6,
    stripZero: true,
  });

  const formattedNdlp = formatAmount({
    amount: ndlp,
    precision: 6,
    stripZero: true,
  });

  const suiScanUrl = `https://suiscan.xyz/${
    import.meta.env.VITE_SUI_NETWORK
  }/tx/${depositSuccessData?.digest}`;

  const handleDeposit = () => {
    onDeposit();
  };

  const isHideNdlpSlushTutorial =
    localStorage.getItem("hide_ndlp_slush_tutorial") === "true";

  const [hideNdlpSlushTutorial, setHideNdlpSlushTutorial] = useState(false);

  const handleHideNdlpSlushTutorial = (value: boolean) => {
    setHideNdlpSlushTutorial(value);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent
        hideIconClose
        className={cn(
          "py-6 px-4 md:py-8 gap-6 bg-[#141517] rounded-2xl border-white/10",
          depositStep === 2 && !isMd && "py-0"
        )}
      >
        <DialogHeader className="flex flex-row justify-between items-center">
          {depositStep === 1 && (
            <>
              <DialogTitle className="text-base md:text-xl font-bold m-0">
                Confirm Your Deposit
              </DialogTitle>
              <DialogDescription className="sr-only">
                Confirm Your Deposit
              </DialogDescription>
              <Button
                variant="icon"
                className="w-8 h-8 bg-white/5 p-2 text-gray-400 !mt-0"
                onClick={onOpenChange}
              >
                <X size={20} className="text-white" />
              </Button>
            </>
          )}
        </DialogHeader>
        {depositStep === 1 && (
          <div className="flex flex-col gap-2 p-4 border border-white/15 rounded-xl bg-white/5">
            <VaultInfo
              poolName={vault?.pool?.pool_name}
              valutName={vault?.vault_name}
              exchangeId={vault?.exchange_id}
            />
            <div className="flex items-center justify-between">
              <span className="text-13px md:text-base text-[#9CA3AF]">
                Amount
              </span>
              <span className="font-mono text-sm md:text-lg text-white">
                {formattedAmount} {collateralTokenName}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-13px md:text-base text-[#9CA3AF]">
                Rate
              </span>
              <span className="font-mono text-sm md:text-lg text-white">
                1 {collateralTokenName} ={" "}
                {formatAmount({
                  amount: conversionRate,
                  precision: vault.vault_lp_token_decimals,
                })}{" "}
                NDLP
              </span>
            </div>
            <div className="border-t border-white/15 my-2" />
            <div className="flex items-center justify-between">
              <span className="text-13px md:text-base text-[#9CA3AF]">
                Est. Max Receive
              </span>
              <div className="font-mono font-bold text-sm md:text-lg flex items-center gap-1">
                <img
                  src="/coins/ndlp.png"
                  alt="NDLP"
                  className="w-6 h-6 mr-1"
                />
                {formattedNdlp} NDLP
              </div>
            </div>
          </div>
        )}
        {depositStep === 2 && (
          <div className="flex flex-col gap-2">
            <Lottie
              animationData={successAnimationData}
              loop={false}
              autoplay={true}
              className="w-24 h-24 mx-auto"
            />
            <h3 className="text-center text-lg md:text-xl font-bold mb-2">
              Deposit Successful!
            </h3>
            <div className="flex flex-col gap-3 p-4 border border-white/15 rounded-lg bg-white/5">
              <VaultInfo
                poolName={vault?.pool?.pool_name}
                valutName={vault?.vault_name}
                exchangeId={vault?.exchange_id}
              />
              <div className="flex items-center justify-between">
                <span className="text-13px md:text-base text-[#9CA3AF]">
                  Amount
                </span>
                <span className="font-mono text-sm md:text-lg text-white">
                  {formattedAmount} {collateralTokenName}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-13px md:text-base text-[#9CA3AF]">
                  TxHash
                </span>
                <div className="flex justify-center items-center gap-2 mt-2">
                  <img
                    src={gradientLink}
                    alt="Gradient Link"
                    className="w-4 h-4"
                  />

                  <a
                    href={suiScanUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#9CA3AF] hover:underline transition duration-300"
                  >
                    <GradientText
                      text={`${truncateBetween(
                        depositSuccessData?.digest || "",
                        6,
                        4
                      )}`}
                    />
                  </a>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-13px md:text-base text-[#9CA3AF]">
                  Conversion Rate
                </span>
                <span className="font-mono text-sm md:text-lg text-white">
                  1 {collateralTokenName} ={" "}
                  {formatAmount({
                    amount: depositSuccessData?.rateAfterSuccess,
                    precision: vault.vault_lp_token_decimals,
                  })}{" "}
                  NDLP
                </span>
              </div>

              <div
                className="flex items-center justify-between p-2 rounded-lg mt-1"
                style={{
                  background:
                    "linear-gradient(87deg, rgba(157, 235, 255, 0.22) -0.54%, rgba(0, 255, 94, 0.22) 97.84%)",
                }}
              >
                <div className="font-mono text-sm md:text-base font-medium flex items-center gap-1">
                  NDLP Received
                </div>
                <div className="flex items-center gap-1">
                  <img
                    src="/coins/ndlp.png"
                    alt="NDLP"
                    className="w-6 h-6 mr-1"
                  />
                  <span className="font-mono font-bold text-sm md:text-lg text-white">
                    {formatAmount({
                      amount: depositSuccessData?.depositLpAmount,
                      precision: vault.vault_lp_token_decimals,
                      stripZero: true,
                    })}{" "}
                    NDLP
                  </span>
                </div>
              </div>
            </div>

            <ConditionRenderer
              when={
                !isHideNdlpSlushTutorial || currentWallet?.name !== "Phantom"
              }
            >
              <div className="flex flex-col gap-3 p-4 border border-white/15 rounded-lg bg-white/5 mt-4 font-medium leading-5">
                Slush doesn't auto-display NDLP. You need to add it manually for
                each vault:
                <div className="text-sm font-normal font-sans mt-2 border border-b-white/20 pb-4">
                  To show NDLP:
                  <ul className="list-disc ml-8 mt-1">
                    <li>Open Slush Wallet and search for “NDLP”</li>
                    <li>Enable it and pin to your home screen </li>
                  </ul>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      checked={hideNdlpSlushTutorial}
                      onCheckedChange={handleHideNdlpSlushTutorial}
                    />
                    Hide this next time
                  </div>
                  <div
                    className="flex items-center gap-2 rounded-md font-sans text-sm bg-white/10 p-2 px-2 cursor-pointer"
                    onClick={() => setTutorialVideoOpen(true)}
                  >
                    <img src={arrowBack} alt="Arrow Back" className="w-6 h-6" />
                    Watch Tutorial
                  </div>
                </div>
              </div>
            </ConditionRenderer>
          </div>
        )}
        <DialogFooter>
          {depositStep === 1 && (
            <div className="flex gap-2 w-full">
              <Button
                onClick={onOpenChange}
                variant="outline"
                size={isMd ? "lg" : "default"}
                className="w-[50%] bg-white/5 max-md:h-[40px] max-md:text-sm max-md:rounded-lg"
              >
                Back
              </Button>
              <Web3Button
                onClick={handleDeposit}
                className="md:w-full md:text-base text-sm max-sm:text-xs rounded-lg max-md:h-[40px] w-[50%]"
                loading={loading}
                hideContentOnLoading={loading && !isMd}
              >
                Confirm Deposit
              </Web3Button>
            </div>
          )}
          {depositStep === 2 && (
            <div className="w-full max-md:pb-4">
              <Web3Button
                onClick={() => {
                  if (hideNdlpSlushTutorial) {
                    localStorage.setItem("hide_ndlp_slush_tutorial", "true");
                  }
                  onDone();
                }}
                className="w-full rounded-lg font-semibold text-base py-3 max-md:h-[40px]"
              >
                Done
              </Web3Button>
              <VideoModal
                title="Show NDLP in Slush Wallet"
                videoUrl={ADD_NDLP_WALLET_TUTORIAL_LINK}
                open={tutorialVideoOpen}
                onOpenChange={() => setTutorialVideoOpen(false)}
              />
            </div>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DepositModal;
