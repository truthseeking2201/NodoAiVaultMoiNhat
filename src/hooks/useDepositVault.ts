import { RATE_DENOMINATOR } from "@/config/vault-config";
import { UserCoinAsset } from "@/types/coin.types";
import {
  useCurrentAccount,
  useSignAndExecuteTransaction,
  useSuiClient,
} from "@mysten/dapp-kit";
import { Transaction } from "@mysten/sui/transactions";
import { useMergeCoins } from "./useMergeCoins";
import { useGetDepositVaultById, useGetVaultConfig } from "./useVault";
import { roundDownBalance } from "@/lib/utils";

export const useDepositVault = (vaultId: string) => {
  const { mutateAsync: signAndExecuteTransaction } =
    useSignAndExecuteTransaction();
  const account = useCurrentAccount();
  const suiClient = useSuiClient();
  const vaultConfig = useGetDepositVaultById(vaultId);

  const { mergeCoins } = useMergeCoins();

  const deposit = async (
    coin: UserCoinAsset,
    amount: number,
    onDepositSuccessCallback?: (data: any) => void
  ) => {
    try {
      if (!account?.address) {
        throw new Error("No account connected");
      }

      // Merge coins first
      const mergedCoinId = await mergeCoins(coin.coin_type);
      if (!mergedCoinId) {
        throw new Error("No coins available to deposit");
      }

      const tx = new Transaction();

      // Split from the merged coin
      const [splitCoin] = tx.splitCoins(tx.object(mergedCoinId), [
        tx.pure.u64(Math.floor(amount * 10 ** coin.decimals)),
      ]);

      tx.moveCall({
        target: `${vaultConfig.metadata.package_id}::${vaultConfig.vault_module}::deposit`,
        arguments: [
          tx.object(vaultConfig.metadata.vault_config_id),
          tx.object(vaultConfig.vault_id),
          splitCoin,
        ],
        typeArguments: [
          vaultConfig.collateral_token,
          vaultConfig.vault_lp_token,
        ],
      });

      const result = await signAndExecuteTransaction(
        {
          transaction: tx,
        },
        {
          onSuccess: async (data) => {
            const { digest } = data;

            const txResponse = await suiClient.waitForTransaction({
              digest,
              options: {
                showEvents: true,
              },
            });

            const events = txResponse?.events;

            const depositEvent = events.find((event) =>
              event.type.includes("vault::DepositEvent")
            );
            // Pass the event data to your callback
            onDepositSuccessCallback?.({
              ...data,
              depositAmount: (depositEvent?.parsedJson as { amount?: number })
                ?.amount,
              depositLpAmount: (depositEvent?.parsedJson as { lp?: number })
                ?.lp,
            });
          },
          onError: (error) => {
            console.error("Deposit failed:", error);
            throw error;
          },
        }
      );

      return result;
    } catch (error) {
      console.error("Error in deposit:", error);
      throw error;
    }
  };

  return {
    deposit,
  };
};

export const useCalculateNDLPReturn = (
  amount: number,
  collateralTokenDecimals: number,
  ndlpDecimals: number,
  vaultId: string
) => {
  const { vaultConfig } = useGetVaultConfig(vaultId);
  const vaultRate = +vaultConfig?.rate || 1000000;

  if (!amount || !vaultConfig || !collateralTokenDecimals || !ndlpDecimals) {
    return 0;
  }

  const rawAmount = amount * 10 ** collateralTokenDecimals;
  const fee = (rawAmount * +vaultConfig.deposit.fields.fee_bps) / 10000;
  const net_amount = rawAmount - fee;

  const lp = (net_amount * RATE_DENOMINATOR) / vaultRate;

  const ndlpAmountWillGet = lp / Math.pow(10, ndlpDecimals);

  return Number(ndlpAmountWillGet);
};

// calculate the rate of 1 collateral = ? NDLP
export const useCollateralLPRate = (isReverse = false, vaultId: string) => {
  const { vaultConfig } = useGetVaultConfig(vaultId);

  if (!vaultConfig) {
    return 1;
  }

  const vaultRate = +vaultConfig?.rate;

  const rate = vaultRate / RATE_DENOMINATOR;

  const collateralTokenRate = isReverse ? rate : 1 / rate;

  return collateralTokenRate;
};
