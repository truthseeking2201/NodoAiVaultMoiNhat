import gradientLink from "@/assets/icons/gradient-arrow-link.svg";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import Web3Button from "@/components/ui/web3-button";
import { formatAmount } from "@/lib/utils";
import { BasicVaultDetailsType } from "@/types/vault-config.types";
import { truncateBetween } from "@/utils/truncate";
import { X } from "lucide-react";
import { DepositSuccessData } from "./deposit-form";
import Lottie from "lottie-react";
import successAnimationData from "@/assets/lottie/circle_checkmark_success.json";
import { EXCHANGE_CODES_MAP } from "@/config/vault-config";

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
      className="font-bold text-sm"
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
        <span className="text-base text-[#9CA3AF]">Vault</span>
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

          <span className="font-mono text-lg text-white">{valutName}</span>
        </div>
      </div>
      {dex && (
        <div className="flex items-center justify-between">
          <span className="text-base text-[#9CA3AF]">DEX</span>
          <div className="flex items-center gap-1">
            <img
              src={`/dexs/${dex.code}.png`}
              alt={dex.name}
              className=" w-4 h-4 inline"
            />
            <span className="font-sans text-base font-bold text-white">
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

  const { symbol: collateralTokenName = "" } = collateralToken;
  const { amount, ndlp, conversionRate } = confirmData;

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

  return (
    <Dialog
      open={isOpen}
      onOpenChange={onOpenChange}
    >
      <DialogContent
        hideIconClose
        className="py-8 gap-6 bg-[#141517] border border-white/10"
      >
        <DialogHeader className="flex flex-row justify-between items-center">
          {depositStep === 1 && (
            <>
              <DialogTitle className="text-xl font-bold m-0">
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
                <X
                  size={20}
                  className="text-white"
                />
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
              <span className="text-base text-[#9CA3AF]">Amount</span>
              <span className="font-mono text-lg text-white">
                {formattedAmount} {collateralTokenName}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-base text-[#9CA3AF]">Rate</span>
              <span className="font-mono text-lg text-white">
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
              <span className="text-base text-[#9CA3AF]">Est. Max Receive</span>
              <div className="font-mono font-bold text-lg flex items-center gap-1">
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
            <h3 className="text-center text-xl font-bold my-2">
              Deposit Successful!
            </h3>
            <div className="font-sans text-center font-medium text-base mb-5 text-[#9CA3AF]">
              Your deposit of {formattedAmount + " "} {collateralTokenName} to
              Nodo AI Vault was successful.
            </div>
            <div className="flex flex-col gap-3 p-4 border border-white/15 rounded-lg bg-white/5">
              <VaultInfo
                poolName={vault?.pool?.pool_name}
                valutName={vault?.vault_name}
                exchangeId={vault?.exchange_id}
              />
              <div className="flex items-center justify-between">
                <span className="text-base text-[#9CA3AF]">Amount</span>
                <span className="font-mono text-lg text-white">
                  {formattedAmount} {collateralTokenName}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-base text-[#9CA3AF]">Rate</span>
                <span className="font-mono text-lg text-white">
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
                <div className="font-mono text-base font-medium flex items-center gap-1">
                  NDLP Received
                </div>
                <div className="flex items-center gap-1">
                  <img
                    src="/coins/ndlp.png"
                    alt="NDLP"
                    className="w-6 h-6 mr-1"
                  />
                  <span className="font-mono font-bold text-lg text-white">
                    {formatAmount({
                      amount: depositSuccessData?.depositLpAmount,
                      precision: vault.vault_lp_token_decimals,
                      stripZero: true,
                    })}{" "}
                    NDLP
                  </span>
                </div>
              </div>

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
                    text={`Tx ${truncateBetween(
                      depositSuccessData?.digest || "",
                      6,
                      6
                    )}`}
                  />
                </a>
              </div>
            </div>
          </div>
        )}
        <DialogFooter>
          {depositStep === 1 && (
            <div className="flex gap-2 w-full">
              <Button
                onClick={onOpenChange}
                variant="outline"
                size="lg"
                className="w-[50%] bg-white/5"
              >
                Back
              </Button>
              <Web3Button
                onClick={handleDeposit}
                className="w-full rounded-lg"
                loading={loading}
              >
                Confirm Deposit
              </Web3Button>
            </div>
          )}
          {depositStep === 2 && (
            <div className="w-full">
              <Web3Button
                onClick={onDone}
                className="w-full rounded-lg font-semibold text-base py-3"
              >
                Done
              </Web3Button>
            </div>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DepositModal;
