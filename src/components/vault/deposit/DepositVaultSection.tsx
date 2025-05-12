import suiWallet from "@/assets/images/sui-wallet.png";
import { Button } from "@/components/ui/button";
import { FormattedNumberInput } from "@/components/ui/formatted-number-input";
import { IconErrorToast } from "@/components/ui/icon-error-toast";
import { useToast } from "@/components/ui/use-toast";
import DepositModal from "@/components/vault/deposit/DepositModal";
import { COIN_TYPES_CONFIG } from "@/config/coin-config";
import { RATE_DENOMINATOR } from "@/config/vault-config";
import {
  useCalculateNDLPReturn,
  useDepositVault,
} from "@/hooks/useDepositVault";
import { useMyAssets } from "@/hooks/useMyAssets";
import { useGetVaultConfig } from "@/hooks/useVault";
import { useWallet } from "@/hooks/useWallet";
import { formatNumber } from "@/lib/number";
import { useCurrentAccount } from "@mysten/dapp-kit";
import { AlertCircle } from "lucide-react";
import { useCallback, useMemo, useState } from "react";

export default function DepositVaultSection() {
  const [depositAmount, setDepositAmount] = useState("");
  const [error, setError] = useState<string>("");
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [depositStep, setDepositStep] = useState<number>(1);
  const [depositSuccessData, setDepositSuccessData] = useState<any>(null);
  const { vaultConfig } = useGetVaultConfig();
  const currentAccount = useCurrentAccount();
  const isConnected = !!currentAccount?.address;

  const { openConnectWalletDialog } = useWallet();
  const { assets, refreshBalance } = useMyAssets();
  const { deposit } = useDepositVault();
  const { toast } = useToast();

  const usdcCoin = useMemo(
    () =>
      assets.find(
        (asset) => asset.coin_type === COIN_TYPES_CONFIG.USDC_COIN_TYPE
      ),
    [assets]
  );

  const ndlpCoin = useMemo(
    () =>
      assets.find(
        (asset) => asset.coin_type === COIN_TYPES_CONFIG.NDLP_COIN_TYPE
      ),
    [assets]
  );

  const ndlpAmountWillGet = useCalculateNDLPReturn(
    Number(depositAmount),
    usdcCoin?.decimals || 9,
    ndlpCoin?.decimals || 9
  );

  const conversionRate = +vaultConfig?.rate / RATE_DENOMINATOR;

  const handleValidateDepositAmount = useCallback(
    (value: string) => {
      if (!value) {
        setError("Please enter an amount.");
        return;
      }

      if (value && Number(value) < 1) {
        setError("Minimum amount is 1 USDC.");
        return;
      }

      if (value && Number(value) > Number(usdcCoin?.balance)) {
        setError("Not enough balance to deposit. Please top-up your wallet.");
        return;
      }

      setError("");
    },
    [usdcCoin?.balance]
  );

  const handleMaxAmount = useCallback(() => {
    handleValidateDepositAmount(usdcCoin?.balance.toString() || "0");
    setDepositAmount(usdcCoin?.balance.toString() || "0");
  }, [usdcCoin?.balance, handleValidateDepositAmount]);

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
        usdcCoin,
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
      setDepositAmount("");
      console.error(error);
      setLoading(false);
    }
  }, [depositAmount]);

  const handleDepositSuccessCallback = useCallback((data) => {
    setTimeout(() => {
      setDepositSuccessData(data);
      refreshBalance();
      setLoading(false);
      setDepositStep(2);
    }, 2000);
  }, []);

  const handleDone = useCallback(() => {
    setIsDepositModalOpen(false);
    setDepositStep(1);
    setDepositAmount("");
  }, []);

  const disabledDeposit = useMemo(() => {
    if (!isConnected) return false;

    return !!error || !depositAmount;
  }, [isConnected, error, depositAmount]);

  return (
    <div className="p-6 bg-black rounded-b-2xl rounded-tr-2xl">
      <div className="mb-6">
        <div className="flex justify-between">
          <div className="font-body text-075 !font-medium">Amount (USDC)</div>
          <div className="font-body text-075">
            Balance:{" "}
            <span className="font-mono text-text-primary">
              {isConnected
                ? `${formatNumber(usdcCoin?.balance || 0)} USDC`
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
          <div className="font-caption text-075">You will get</div>
          <div className="flex items-center">
            <img src="/coins/ndlp.png" alt="NDLP" className="w-6 h-6 mr-1" />
            <span className="font-mono font-bold text-lg">
              {ndlpAmountWillGet} NDLP
            </span>
          </div>
        </div>
        <hr className="w-full border-t border-white/15" />

        <div className="flex justify-between items-center mb-3 mt-3">
          <div className="font-caption text-075">Conversion Rate</div>
          <div className="font-mono text-white">
            {conversionRate
              ? `1 USDC = ${formatNumber(conversionRate, 2, 6)} NDLP`
              : "Unable to fetch conversion rate. Please try again later."}
          </div>
        </div>

        <div className="flex justify-between items-center">
          <div className="font-caption text-075">Network</div>
          <div className="flex items-center">
            <img src={suiWallet} className="w-5 h-5 mr-2" />
            <span className="font-mono">SUI</span>
          </div>
        </div>
      </div>

      <Button
        variant="primary"
        size="xl"
        onClick={isConnected ? handleDeposit : handleConnectWallet}
        className="w-full font-semibold text-lg"
        disabled={disabledDeposit}
      >
        {isConnected ? "Deposit" : "Connect Wallet"}
      </Button>

      <DepositModal
        isOpen={isDepositModalOpen}
        depositStep={depositStep}
        onOpenChange={handleCloseDepositModal}
        onDeposit={handleSendRequestDeposit}
        onDone={handleDone}
        confirmData={{
          amount: Number(depositAmount),
          apr: 18.7,
          estReturn: 10.76,
          ndlp: Number(ndlpAmountWillGet),
        }}
        depositSuccessData={depositSuccessData}
        loading={loading}
      />
    </div>
  );
}
