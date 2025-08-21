import { executionProfitData } from "@/apis/vault";
import { SUI_CONFIG, USDC_CONFIG } from "@/config/coin-config";
import { CLOCK, RATE_DENOMINATOR } from "@/config/vault-config";
import { getBalanceAmountForInput } from "@/lib/number";
import {
  SCVaultConfig,
  VaultSwapDepositInfo,
} from "@/types/vault-config.types";
import { useSignAndExecuteTransaction, useSuiClient } from "@mysten/dapp-kit";
import { SuiClient } from "@mysten/sui/client";
import { Transaction } from "@mysten/sui/transactions";
import BigNumber from "bignumber.js";
import { Buffer } from "buffer";
import { useMergeCoins } from "./use-merge-coins";
import { useGetVaultConfig, useVaultBasicDetails } from "./use-vault";
import { useWallet } from "./use-wallet";
import { logger } from "@/utils/logger";

type DepositCoin = {
  coin_type: string;
  decimals: number;
};

type DepositArgs = {
  coin: DepositCoin;
  amount: number;
  swapDepositInfo: VaultSwapDepositInfo;
  collateralToken: string;
  onDepositSuccessCallback?: (data: any) => void;
};

const MODULE_ADAPTERS = {
  mmt: "mmt_adapter",
  bluefin: "bluefin_adapter",
  cetus: "cetus_adapter",
};

const buildTarget = (
  coin: DepositCoin,
  vaultPackageId: string,
  swapDepositInfo: VaultSwapDepositInfo,
  collateralToken: string
) => {
  if (coin.coin_type === collateralToken) {
    return `${vaultPackageId}::vault::deposit_with_sigs_credit_time`;
  }
  if (!swapDepositInfo) {
    throw new Error("No swap deposit info");
  }
  const { vault_package_id, vault_package_module, vault_package_function } =
    swapDepositInfo;

  return `${vault_package_id}::${vault_package_module}::${vault_package_function}`;
};

const validateDepositGasFee = async (suiClient: SuiClient, address: string) => {
  const suiCoins = await suiClient.getCoins({
    owner: address,
    coinType: SUI_CONFIG.coinType,
  });

  const totalSuiBalance = getBalanceAmountForInput(
    suiCoins.data.reduce((sum, coin) => {
      return sum.plus(new BigNumber(coin.balance || "0"));
    }, new BigNumber(0)),
    SUI_CONFIG.decimals,
    SUI_CONFIG.decimals
  );

  // Check if user is trying to deposit coin with insufficient SUI balance
  if (totalSuiBalance < SUI_CONFIG.gas_fee) {
    throw new Error(
      `Insufficient SUI balance. You need at least ${SUI_CONFIG.gas_fee} SUI ` +
        `(${
          SUI_CONFIG.gas_fee
        } for gas fees). Current balance: ${totalSuiBalance.toFixed(6)} SUI`
    );
  }

  return totalSuiBalance;
};

const validateDepositSui = async (totalSuiBalance: number, amount: number) => {
  const amountWithGasFee = amount + SUI_CONFIG.gas_fee;

  if (totalSuiBalance - amountWithGasFee < 0) {
    throw new Error(
      `Insufficient SUI balance. You need at least ${amountWithGasFee} SUI ` +
        `(${
          SUI_CONFIG.gas_fee
        } for gas fees). Current balance: ${totalSuiBalance.toFixed(6)} SUI`
    );
  }
};

export const useDepositVault = (vaultId: string) => {
  const { mutateAsync: signAndExecuteTransaction } =
    useSignAndExecuteTransaction();
  const { address } = useWallet();
  const suiClient = useSuiClient();
  const { data: vaultConfig } = useVaultBasicDetails(vaultId);

  const { mergeCoins } = useMergeCoins();

  const deposit = async ({
    coin,
    amount,
    swapDepositInfo,
    collateralToken,
    onDepositSuccessCallback,
  }: DepositArgs) => {
    try {
      const packageId = vaultConfig.metadata.package_id;
      if (!address) {
        throw new Error("No account connected");
      }

      if (!packageId) {
        throw new Error("No package id");
      }

      const totalSuiBalance = await validateDepositGasFee(suiClient, address);

      if (coin.coin_type === SUI_CONFIG.coinType) {
        await validateDepositSui(totalSuiBalance, amount);
      }

      const profitData: any = await executionProfitData(vaultConfig.vault_id);
      if (!profitData || !profitData?.signature) {
        throw new Error("Failed to get signature");
      }

      const tx = new Transaction();
      let splitCoin;

      // Calculate the exact amount to split (with proper precision)
      const splitAmount = new BigNumber(amount)
        .multipliedBy(new BigNumber(10).pow(coin.decimals))
        .toString();

      // Handle SUI vs other tokens differently
      if (coin.coin_type === SUI_CONFIG.coinType) {
        // For SUI: Split directly from gas coin to avoid gas coin conflicts
        [splitCoin] = tx.splitCoins(tx.gas, [tx.pure.u64(splitAmount)]);
      } else {
        // For other tokens: Use the normal merge and split flow
        const mergedCoinId = await mergeCoins(coin.coin_type);
        if (!mergedCoinId) {
          throw new Error("No coins available to deposit");
        }

        [splitCoin] = tx.splitCoins(tx.object(mergedCoinId), [
          tx.pure.u64(splitAmount),
        ]);
      }

      const baseParams = [
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

      const slippageBps = 300; // 3%
      let _arguments: any = [];
      let _typeArguments: any = [];
      if (coin.coin_type === collateralToken) {
        _arguments = [
          tx.object(vaultConfig.metadata.vault_config_id),
          tx.object(vaultConfig.vault_id),
          splitCoin,
          ...baseParams,
        ];
        _typeArguments = [
          vaultConfig.collateral_token,
          vaultConfig.vault_lp_token,
        ];
      } else {
        _typeArguments = [
          coin.coin_type,
          swapDepositInfo.vault_collateral_token,
          swapDepositInfo.vault_lp_token,
        ];
        switch (swapDepositInfo.vault_package_module) {
          case MODULE_ADAPTERS.mmt:
            _arguments = [
              tx.object(swapDepositInfo.vault_config),
              tx.object(swapDepositInfo.vault_id),
              tx.object(swapDepositInfo.pool_address),
              tx.object(swapDepositInfo.version),
              splitCoin,
              tx.pure.u128(slippageBps),
              ...baseParams,
            ];
            break;
          case MODULE_ADAPTERS.bluefin:
          case MODULE_ADAPTERS.cetus:
            _arguments = [
              tx.object(swapDepositInfo.vault_config),
              tx.object(swapDepositInfo.vault_id),
              tx.object(swapDepositInfo.global_config),
              tx.object(swapDepositInfo.pool_address),
              splitCoin,
              tx.pure.u128(slippageBps),
              ...baseParams,
            ];
            break;
          default:
            throw new Error("Invalid vault package module");
        }
      }

      const target = buildTarget(
        coin,
        packageId,
        swapDepositInfo,
        collateralToken
      );
      tx.moveCall({
        target,
        arguments: _arguments,
        typeArguments: _typeArguments,
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
            logger.debug("🚀 ~ depositEvent:", depositEvent);
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
export const useCollateralLPRate = (
  isReverse = false,
  vaultConfig: SCVaultConfig
) => {
  if (!vaultConfig) {
    return 1;
  }

  const vaultRate = +vaultConfig?.rate;

  const rate = vaultRate / RATE_DENOMINATOR;

  const collateralTokenRate = isReverse ? rate : 1 / rate;

  return collateralTokenRate;
};
