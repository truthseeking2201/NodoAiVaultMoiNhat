import { DynamicFontText } from "@/components/ui/dynamic-font-text";
import { IconErrorToast } from "@/components/ui/icon-error-toast";
import { LabelWithTooltip } from "@/components/ui/label-with-tooltip";
import Web3Button from "@/components/ui/web3-button";
import SuccessfulToast from "@/components/vault/deposit/successful-toast";
import { USDC_CONFIG } from "@/config";
import {
  useEstimateDeposit,
  useGetLpToken,
  useGetVaultConfig,
  useSwapDepositInfo,
  useUserAssetsStore,
  useVaultBasicDetails,
  useWallet,
} from "@/hooks";
import { useDepositVault } from "@/hooks/use-deposit-vault";
import { useToast } from "@/hooks/use-toast";
import { getBalanceAmountForInput, getDecimalAmount } from "@/lib/number";
import { formatAmount } from "@/lib/utils";
import BigNumber from "bignumber.js";
import debounce from "lodash-es/debounce";
import { TriangleAlert } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import ConversationRate from "../conversation-rate";
import DepositInput from "./deposit-input";
import DepositModal from "./deposit-modal";

export type DepositSuccessData = {
  digest: string;
  depositLpAmount: number;
  rateAfterSuccess: number;
};

export type DepositForm = {
  amount: string;
  token: string;
};

const DepositForm = ({ vault_id }: { vault_id: string }) => {
  const { openConnectWalletDialog, isConnected } = useWallet();
  const { assets, setRefetch } = useUserAssetsStore();
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
  const [depositStep, setDepositStep] = useState(1);
  const [depositSuccessData, setDepositSuccessData] =
    useState<DepositSuccessData | null>(null);
  const [loading, setLoading] = useState(false);
  const { data: vault, refetch: refetchVaultBasicDetails } =
    useVaultBasicDetails(vault_id);
  const { refetch: refetchVaultConfig } = useGetVaultConfig(vault_id);
  const [debounceAmount, setDebounceAmount] = useState<string>("0");

  const { toast, dismiss } = useToast();

  const { deposit } = useDepositVault(vault_id);
  const { isAuthenticated } = useWallet();

  const paymentTokens = useMemo(
    () =>
      vault?.tokens
        ?.map((token) => {
          const asset = assets.find(
            (asset) => asset.coin_type === token?.token_address
          );

          return {
            symbol: token?.token_symbol,
            decimals: token.decimal,
            balance: isAuthenticated ? asset?.balance || "0" : "0",
            token_address: token?.token_address,
            min_deposit_amount: token?.min_deposit_amount,
            min_deposit_amount_usd: token?.min_deposit_amount_usd,
          };
        })
        .sort((a, b) =>
          new BigNumber(b.balance).minus(new BigNumber(a.balance)).toNumber()
        ) || [
        {
          symbol: USDC_CONFIG.symbol,
          decimals: USDC_CONFIG.decimals,
          balance: "0",
          token_address: USDC_CONFIG.coinType,
          min_deposit_amount: "0",
          min_deposit_amount_usd: "0",
        },
      ],
    [vault, assets, isAuthenticated]
  );

  const lpToken = useGetLpToken(vault.vault_lp_token, vault_id);

  const methods = useForm({
    defaultValues: {
      amount: "",
      token: USDC_CONFIG.coinType,
    },
    mode: "onChange",
  });

  const { watch, setValue } = methods;

  const depositAmount = Number(methods.watch("amount"));
  const paymentToken = methods.watch("token");
  const collateralToken = paymentTokens.find(
    (token) => token.token_address.toLowerCase() === paymentToken?.toLowerCase()
  );

  const { data: swapDepositInfo } = useSwapDepositInfo(
    vault_id,
    collateralToken?.symbol?.toLowerCase() !== USDC_CONFIG.symbol.toLowerCase()
      ? collateralToken?.token_address || ""
      : ""
  );

  // Debounced effect for estimate deposit API call
  useEffect(() => {
    const debouncedCb = debounce((formValue) => {
      if (collateralToken?.token_address) {
        setDebounceAmount(
          formValue.amount
            ? getDecimalAmount(
                formValue.amount,
                collateralToken.decimals
              ).toString()
            : "0"
        );
      } else {
        setDebounceAmount("0");
      }
    }, 500);

    const subscription = watch(debouncedCb);
    return () => subscription.unsubscribe();
  }, [watch, collateralToken]);

  const estimatedDepositAmount = useMemo(() => {
    return +debounceAmount > 0
      ? debounceAmount
      : new BigNumber(1).dividedBy(collateralToken.decimals).toString();
  }, [debounceAmount, collateralToken]);

  const {
    data: dataEstDeposit,
    rate,
    refetch: refetchEstimateDeposit,
    isCalculating,
  } = useEstimateDeposit(vault_id, {
    amount: estimatedDepositAmount,
    deposit_token: collateralToken?.token_address,
  });

  const conversionRate = useMemo(() => {
    if (!rate) {
      return 0;
    }

    return new BigNumber(1).dividedBy(rate).toNumber();
  }, [rate]);

  const ndlpAmount = useMemo(() => {
    if (+debounceAmount > 0) {
      return dataEstDeposit?.estimated_ndlp
        ? dataEstDeposit?.estimated_ndlp
        : 0;
    }

    return 0;
  }, [dataEstDeposit, debounceAmount]);

  const errors = methods.formState.errors;

  const onSubmit = (data: DepositForm) => {
    setIsDepositModalOpen(true);
  };

  const handleCloseDepositModal = () => {
    setIsDepositModalOpen(false);
    setLoading(false);
  };

  const handleDepositSuccessCallback = ({
    digest,
    ...rest
  }: DepositSuccessData) => {
    const timeoutId = setTimeout(async () => {
      setDepositSuccessData({
        rateAfterSuccess: conversionRate,
        digest,
        depositLpAmount: rest.depositLpAmount
          ? getBalanceAmountForInput(
              rest.depositLpAmount,
              vault.vault_lp_token_decimals,
              vault.vault_lp_token_decimals
            )
          : +ndlpAmount,
      });
      setLoading(false);
      setDepositStep(2);
      setRefetch();
      clearTimeout(timeoutId);
    }, 1000);
  };

  const handleSendRequestDeposit = async () => {
    try {
      setLoading(true);
      const depositCoin = {
        coin_type: collateralToken?.token_address,
        decimals: collateralToken?.decimals,
      };
      await deposit({
        coin: depositCoin,
        amount: depositAmount,
        swapDepositInfo,
        onDepositSuccessCallback: handleDepositSuccessCallback,
      });
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
  };

  const handleDone = () => {
    const actualNdlpAmount = depositSuccessData?.depositLpAmount || ndlpAmount;
    setValue("amount", "");
    setIsDepositModalOpen(false);
    setDepositSuccessData(null);
    setDepositStep(1);
    setDebounceAmount("0");
    refetchVaultBasicDetails();
    refetchVaultConfig();

    toast({
      duration: 5000,
      description: (
        <SuccessfulToast
          title="Deposit successful!"
          content={`${formatAmount({
            amount: Number(depositAmount),
          })} ${collateralToken?.symbol} deposited — ${formatAmount({
            amount: actualNdlpAmount,
            precision: vault.vault_lp_token_decimals,
          })} NDLP minted to your account. Check your wallet for Tx details`}
          closeToast={() => dismiss()}
        />
      ),
      variant: "success",
      hideClose: true,
    });
  };

  return (
    <FormProvider {...methods}>
      <div className="mt-8">
        <form onSubmit={methods.handleSubmit(onSubmit)}>
          <div className="mb-2 font-sans text-base font-medium text-white/50">
            Deposit Amount
          </div>

          <DepositInput
            paymentTokens={paymentTokens}
            currentToken={collateralToken}
          />
          {errors?.amount && (
            <div className="flex flex-row items-center bg-red-error/20 gap-2 py-2 px-4">
              <TriangleAlert className="w-4 h-4 text-red-error" />
              <span className="text-red-error text-xs font-medium font-sans">
                {errors.amount.message}
              </span>
            </div>
          )}

          <div className="rounded-b-lg border border-white/0.15 p-4 mb-6">
            <div className=" bg-black flex items-center justify-between pb-2">
              <LabelWithTooltip
                label="Est. Receive"
                labelClassName="text-gray-200 text-base font-bold"
                tooltipContent="Estimated amount based on current NDLP price. Final amount may vary slightly due to market conditions during processing."
              />
            </div>
            <div className="flex justify-between text-gray-200 text-base font-bold font-mono items-center mb-3">
              <DynamicFontText
                maxWidth={300}
                breakpoints={[
                  { minLength: 0, fontSize: "text-3xl" },
                  { minLength: 15, fontSize: "text-2xl" },
                  { minLength: 20, fontSize: "text-xl" },
                ]}
                defaultFontSize="text-2xl"
              >
                {ndlpAmount
                  ? ` ${formatAmount({
                      amount: ndlpAmount,
                      precision: vault.vault_lp_token_decimals,
                      stripZero: true,
                    })} `
                  : "--"}
              </DynamicFontText>
              <div className="flex items-center gap-2 text-lg font-bold">
                <img src="/coins/ndlp.png" alt="NDLP" className="w-6 h-6" />
                {lpToken?.display_name}
              </div>
            </div>
            <hr className="w-full border-t border-white/15" />
            <div className="flex flex-col gap-2 mt-3">
              <ConversationRate
                sourceToken={collateralToken}
                targetToken={{
                  symbol: lpToken?.display_name,
                  decimals: lpToken?.decimals,
                }}
                rate={conversionRate}
                isCalculating={isCalculating}
                label="Rate"
                onRefresh={refetchEstimateDeposit}
              />
              <div className="flex items-center justify-between">
                <div className="font-sans text-sm text-white/80">Network</div>
                <div className="text-sm font-mono text-white inline-flex items-center">
                  <img
                    src="/chains/sui.png"
                    alt="SUI"
                    className="w-6 h-6 mr-2"
                  />
                  SUI
                </div>
              </div>
            </div>
          </div>

          <Web3Button
            className="w-full rounded-lg py-3 font-semibold text-lg"
            type="button"
            disabled={!rate || !collateralToken || isCalculating}
            onClick={() => {
              if (!isConnected) {
                openConnectWalletDialog();
              } else {
                methods.handleSubmit(onSubmit)();
              }
            }}
          >
            Deposit
          </Web3Button>
        </form>
      </div>
      <DepositModal
        isOpen={isDepositModalOpen}
        depositStep={depositStep}
        onOpenChange={handleCloseDepositModal}
        onDeposit={handleSendRequestDeposit}
        onDone={handleDone}
        confirmData={{
          amount: Number(depositAmount),
          ndlp: Number(ndlpAmount),
          conversionRate: conversionRate,
        }}
        depositSuccessData={depositSuccessData}
        loading={loading}
        collateralToken={collateralToken}
        vault={vault}
      />
    </FormProvider>
  );
};

export default DepositForm;
