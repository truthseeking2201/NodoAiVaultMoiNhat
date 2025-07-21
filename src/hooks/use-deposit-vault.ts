import { executionProfitData } from "@/apis/vault";
import { CLOCK, RATE_DENOMINATOR } from "@/config/vault-config";
import { UserCoinAsset } from "@/types/coin.types";
import { useSignAndExecuteTransaction, useSuiClient } from "@mysten/dapp-kit";
import { Transaction } from "@mysten/sui/transactions";
import BigNumber from "bignumber.js";
import { Buffer } from "buffer";
import { useMergeCoins } from "./use-merge-coins";
import { useGetDepositVaultById, useGetVaultConfig } from "./use-vault";
import { useWallet } from "./use-wallet";

export const useDepositVault = (vaultId: string) => {
  const { mutateAsync: signAndExecuteTransaction } =
    useSignAndExecuteTransaction();
  const { address } = useWallet();
  const suiClient = useSuiClient();
  const vaultConfig = useGetDepositVaultById(vaultId);

  const { mergeCoins } = useMergeCoins();

  const deposit = async (
    coin: UserCoinAsset,
    amount: number,
    onDepositSuccessCallback?: (data: any) => void
  ) => {
    try {
      if (!address) {
        throw new Error("No account connected");
      }

      const profitData: any = await executionProfitData(vaultConfig.vault_id);
      if (!profitData || !profitData?.signature) {
        throw new Error("Failed to get signature");
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
      const _arguments: any = [
        tx.object(vaultConfig.metadata.vault_config_id),
        tx.object(vaultConfig.vault_id),
        splitCoin,
        tx.pure.u64(profitData.vault_value_usd),
        tx.pure.u64(new BigNumber(profitData.profit_amount).abs().toString()),
        tx.pure.bool(profitData.negative),
        tx.pure.u64(profitData.expire_time),
        tx.pure.u64(profitData.last_credit_time),
        tx.pure(
          "vector<vector<u8>>",
          [profitData.signer_publickey].map((key) =>
            Array.from(Buffer.from(key, "hex"))
          )
        ),
        tx.pure(
          "vector<vector<u8>>",
          [profitData.signature].map((key) =>
            Array.from(Buffer.from(key, "hex"))
          )
        ),
        tx.object(CLOCK),
      ];

      tx.moveCall({
        target: `${vaultConfig.metadata.package_id}::${vaultConfig.vault_module}::deposit_with_sigs_credit_time`,
        arguments: _arguments,
        typeArguments: [
          vaultConfig.collateral_token,
          vaultConfig.vault_lp_token,
        ],
      });
      // console.log("🧱 Inputs:", tx.blockData.inputs);
      // console.log("📄 Raw tx:", JSON.stringify(tx.serialize(), null, 2));
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
              event.type.includes("vault::DepositWithSigTimeEvent")
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
