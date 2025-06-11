import suiWallet from "@/assets/images/sui-wallet.png";
import RegisterForWhiteLayout from "@/components/dashboard/request-whitelist-button/RegisterForWhiteLayout";
import ConditionRenderer from "@/components/shared/ConditionRenderer";
import { Button } from "@/components/ui/button";
import { FormattedNumberInput } from "@/components/ui/formatted-number-input";
import { IconErrorToast } from "@/components/ui/icon-error-toast";
import { RowItem } from "@/components/ui/row-item";
import { useToast } from "@/components/ui/use-toast";
import DepositModal from "@/components/vault/deposit/DepositModal";
import { useCurrentDepositVault, useGetDepositVaults } from "@/hooks";
import {
  useCalculateNDLPReturn,
  useCollateralLPRate,
  useDepositVault,
} from "@/hooks/useDepositVault";
import { useGetCoinBalance, useMyAssets } from "@/hooks/useMyAssets";
import { useWallet } from "@/hooks/useWallet";
import { useWhitelistWallet } from "@/hooks/useWhitelistWallet";
import { formatNumber } from "@/lib/number";
import { formatAmount } from "@/lib/utils";
import { useCurrentAccount } from "@mysten/dapp-kit";
import { AlertCircle, ArrowRight } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import SuccessfulToast from "./SuccessfulToast";

type DepositSuccessData = {
  amount: number;
  apr: number;
  ndlp: number;
  conversionRate: number;
};

const MIN_DEPOSIT_AMOUNT = 0.01;

export default function DepositVaultSection() {
  const [depositAmount, setDepositAmount] = useState("");
  const [error, setError] = useState<string>("");
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [depositStep, setDepositStep] = useState<number>(1);
  const [depositSuccessData, setDepositSuccessData] =
    useState<DepositSuccessData>(null);

  const depositVault = useCurrentDepositVault();
  const { refetch: refetchDepositVaults } = useGetDepositVaults();
  const { refetch: refetchNdlpBalance } = useGetCoinBalance(
    depositVault.vault_lp_token,
    depositVault.vault_lp_token_decimals
  );
  const apr = depositVault?.apr;
  const currentAccount = useCurrentAccount();
  const isConnected = !!currentAccount?.address;

  const { openConnectWalletDialog } = useWallet();
  const { assets, refreshBalance } = useMyAssets();
  const { deposit } = useDepositVault(depositVault.vault_id);
  const { toast, dismiss } = useToast();

  const { isWhitelisted } = useWhitelistWallet();

  const collateralToken = useMemo(
    () =>
      assets.find((asset) => asset.coin_type === depositVault.collateral_token),
    [assets]
  );

  const ndlpAmountWillGet = useCalculateNDLPReturn(
    Number(depositAmount),
    depositVault.collateral_token_decimals,
    depositVault.vault_lp_token_decimals,
    depositVault.vault_id
  );

  const conversionRate = useCollateralLPRate(false, depositVault.vault_id);

  const handleValidateDepositAmount = useCallback(
    (value: string) => {
      if (!value) {
        setError("Please enter an amount.");
        return;
      }

      if (value && Number(value) < MIN_DEPOSIT_AMOUNT) {
        setError(
          `Minimum amount is ${MIN_DEPOSIT_AMOUNT} ${collateralToken?.display_name}.`
        );
        return;
      }

      if (value && Number(value) > Number(collateralToken?.balance)) {
        setError("Not enough balance to deposit. Please top-up your wallet.");
        return;
      }

      setError("");
    },
    [collateralToken?.balance]
  );

  const handleMaxAmount = useCallback(() => {
    handleValidateDepositAmount(collateralToken?.balance.toString() || "0");
    setDepositAmount(collateralToken?.balance.toString() || "0");
  }, [collateralToken?.balance, handleValidateDepositAmount]);

  const handleConnectWallet = useCallback(() => {
    openConnectWalletDialog();
  }, [openConnectWalletDialog]);

  const handleDeposit = useCallback(() => {
    if (isConnected) {
      // TODO: Handle deposit
      setIsDepositModalOpen(true);
    } else {
      handleConnectWallet();
    }
  }, [isConnected, handleConnectWallet]);

  const handleCloseDepositModal = useCallback(() => {
    setIsDepositModalOpen(false);
  }, []);

  const handleSendRequestDeposit = useCallback(async () => {
    // TODO: Handle deposit request
    try {
      setLoading(true);
      await deposit(
        collateralToken,
        Number(depositAmount),
        handleDepositSuccessCallback
      );
    } catch (error) {
      toast({
        title: "Deposit failed",
        description: error?.message || error,
        variant: "error",
        duration: 5000,
        icon: <IconErrorToast />,
      });
      console.error(error);
      setLoading(false);
    }
  }, [depositAmount]);

  const handleDepositSuccessCallback = useCallback(
    (data) => {
      const timeoutId = setTimeout(async () => {
        setDepositSuccessData(data);
        refreshBalance();
        setLoading(false);
        setDepositStep(2);
        refetchDepositVaults();
        refetchNdlpBalance();
        clearTimeout(timeoutId);
      }, 1000);
    },
    [refreshBalance, refetchDepositVaults, refetchNdlpBalance]
  );

  const handleDone = useCallback(() => {
    setIsDepositModalOpen(false);
    setDepositStep(1);
    setDepositAmount("");
    toast({
      duration: 5000,
      description: (
        <SuccessfulToast
          title="Deposit successful!"
          content={`${depositAmount} USDC deposited — ${formatAmount({
            amount: +ndlpAmountWillGet || 0,
          })} NDLP minted to your account. Check your wallet for Tx details`}
          closeToast={() => dismiss()}
        />
      ),
      variant: "success",
      hideClose: true,
    });
  }, [toast, dismiss, depositAmount, ndlpAmountWillGet]);

  const disabledDeposit = useMemo(() => {
    if (!isConnected) return false;
    if (!depositVault?.ready) return true;
    return !!error || !depositAmount;
  }, [isConnected, error, depositAmount, depositVault.ready]);

  return (
    <div className="p-6 bg-black rounded-b-2xl rounded-tr-2xl">
      <div className="mb-6">
        <div className="flex justify-between">
          <div className="font-body text-075 !font-medium">Amount (USDC)</div>
          <div className="font-body text-075">
            Balance:{" "}
            <span className="font-mono text-text-primary">
              {isConnected
                ? `${formatNumber(collateralToken?.balance || 0)} USDC`
                : "--"}
            </span>
          </div>
        </div>
        <FormattedNumberInput
          value={depositAmount}
          onChange={setDepositAmount}
          onValidate={handleValidateDepositAmount}
          onMaxAmount={handleMaxAmount}
          onBlur={handleValidateDepositAmount}
          placeholder="0.00"
          className="input-vault w-full font-heading-lg"
        />
        {error && (
          <div className="text-red-error text-sm mt-1 flex items-center">
            <AlertCircle className="w-4 h-4 mr-2" />
            {error}
          </div>
        )}
      </div>

      <div className="mb-6 p-4 border border-white/15 rounded-xl">
        <div className="flex justify-between items-center mb-3">
          <div className="text-gray-200 font-medium">You will get</div>
          <div className="flex items-center">
            <img src="/coins/ndlp.png" alt="NDLP" className="w-6 h-6 mr-1" />
            <span className="font-mono font-bold text-lg">
              {formatAmount({ amount: +ndlpAmountWillGet || 0 })} NDLP
            </span>
          </div>
        </div>
        <hr className="w-full border-t border-white/15" />
        <RowItem label="Conversion Rate" className="mt-3">
          {conversionRate
            ? `1 USDC = ${formatAmount({ amount: conversionRate })} NDLP`
            : "Unable to fetch conversion rate. Please try again later."}
        </RowItem>

        <RowItem label="Network" className="mt-3">
          <div className="flex items-center">
            <img src={suiWallet} className="w-5 h-5 mr-2" />
            <span className="font-mono">SUI</span>
          </div>
        </RowItem>
      </div>

      <ConditionRenderer
        when={isConnected}
        fallback={
          <Button
            variant="primary"
            size="xl"
            onClick={handleConnectWallet}
            className="w-full font-semibold text-lg"
          >
            Connect Wallet
            <ArrowRight size={16} className="ml-2" />
          </Button>
        }
      >
        <ConditionRenderer
          when={isWhitelisted}
          fallback={<RegisterForWhiteLayout />}
        >
          <Button
            variant="primary"
            size="xl"
            onClick={handleDeposit}
            disabled={disabledDeposit}
            className="w-full font-semibold text-lg"
          >
            Deposit
          </Button>
        </ConditionRenderer>
      </ConditionRenderer>

      <DepositModal
        isOpen={isDepositModalOpen}
        depositStep={depositStep}
        onOpenChange={handleCloseDepositModal}
        onDeposit={handleSendRequestDeposit}
        onDone={handleDone}
        confirmData={{
          amount: Number(depositAmount),
          apr,
          ndlp: Number(ndlpAmountWillGet),
          conversionRate: conversionRate,
        }}
        depositSuccessData={depositSuccessData}
        loading={loading}
      />
    </div>
  );
}
