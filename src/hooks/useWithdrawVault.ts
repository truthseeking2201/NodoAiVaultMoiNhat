import { useState, useEffect, useRef, useCallback } from "react";
import {
  useCurrentAccount,
  useSignAndExecuteTransaction,
  useSuiClient,
} from "@mysten/dapp-kit";
import { getFullnodeUrl, SuiClient } from "@mysten/sui/client";
import { Transaction } from "@mysten/sui/transactions";
import { useMergeCoins } from "./useMergeCoins";
import { RATE_DENOMINATOR } from "@/config/vault-config";
import { getDecimalAmount, getBalanceAmount } from "@/lib/number";
import { getLatestWithdrawal } from "@/apis/vault";
import { NDLP } from "@/config/lp-config";
import LpType from "@/types/lp.type";
import DataClaimType from "@/types/data-claim.types.d";

const network = import.meta.env.VITE_SUI_NETWORK;

export const useWithdrawVault = () => {
  const { mutateAsync: signAndExecuteTransaction } =
    useSignAndExecuteTransaction();
  const account = useCurrentAccount();
  const suiClient = useSuiClient();

  const { mergeCoins } = useMergeCoins();

  const getRequestClaim = async (sender_address): Promise<DataClaimType> => {
    try {
      const res = await getLatestWithdrawal(sender_address);
      console.log("------initDataClaim", res);
      return null;
      // TODO format
      // return {
      //   id: 1,
      //   timeUnlock: new Date(Date.now() + 25 * 60 * 1000).valueOf(),
      //   status: "NEW",
      //   withdrawAmount: 200,
      //   withdrawSymbol: NDLP.lp_symbol,
      //   receiveAmount: 199,
      //   receiveSymbol: NDLP.token_symbol,
      //   feeAmount: 1,
      //   feeSymbol: NDLP.token_symbol,
      //   configLp: NDLP,
      // };
    } catch (error) {
      return null;
    }
  };

  const withdraw = async (amountLp: number, fee: number, configLp: LpType) => {
    try {
      if (!account?.address) {
        throw new Error("No account connected");
      }

      // Merge coins first
      const mergedCoinId = await mergeCoins(configLp.lp_coin_type);
      if (!mergedCoinId) {
        throw new Error("No coins available to deposit");
      }

      const tx = new Transaction();

      // Split from the merged coin
      const rawAmount = getDecimalAmount(
        amountLp,
        configLp.lp_decimals
      ).toFixed();
      console.log("--------rawAmount", rawAmount);

      const [splitCoin] = tx.splitCoins(tx.object(mergedCoinId), [
        tx.pure.u64(rawAmount),
      ]);

      const _arguments = [
        tx.object(configLp.vault_config_id),
        tx.object(configLp.vault_id),
        splitCoin,
        tx.object(configLp.clock),
      ];
      const typeArguments = [configLp.token_coin_type, configLp.lp_coin_type];

      console.log("------_arguments", { _arguments, typeArguments });

      tx.moveCall({
        target: `${configLp.package_id}::vault::withdraw`,
        arguments: _arguments,
        typeArguments: typeArguments,
      });

      const result = await signAndExecuteTransaction({
        transaction: tx,
      });
      return result;
    } catch (error) {
      console.error("Error in withdraw:", error);
      throw error;
    }
  };

  const redeem = async (configLp: LpType) => {
    try {
      if (!account?.address) {
        throw new Error("No account connected");
      }
      const tx = new Transaction();
      const _arguments = [
        tx.object(configLp.vault_config_id),
        tx.object(configLp.vault_id),
        tx.object(configLp.clock),
      ];
      const typeArguments = [configLp.token_coin_type, configLp.lp_coin_type];

      console.log("------_arguments", { _arguments, typeArguments });

      tx.moveCall({
        target: `${configLp.package_id}::vault::redeem`,
        arguments: _arguments,
        typeArguments: typeArguments,
      });

      const result = await signAndExecuteTransaction({
        transaction: tx,
      });

      console.log("--------result", result);
      return result;
    } catch (error) {
      console.error("Error in redeem:", error);
      throw error;
    }
  };

  return { getRequestClaim, withdraw, redeem };
};

export const useEstWithdrawVault = (amountLp: number, configLp: LpType) => {
  const configVaultDefault = {
    withdraw: { fee_bps: "0", min: "0", total_fee: "0" },
    rate: "0",
    lock_duration_ms: 0,
  };

  const amountEstDefault = {
    amount: 0,
    receive: 0,
    fee: 0,
    rateFee: 0,
  };
  const count = useRef<string>("0");
  const [configVault, setConfigVault] = useState(configVaultDefault);

  const [amountEst, setAmountEst] = useState(amountEstDefault);

  const suiClient = useSuiClient();

  const getConfigVault = useCallback(async () => {
    try {
      console.log("-----getConfigVault");
      const res: any = await suiClient.getObject({
        id: configLp.vault_id,
        options: {
          showContent: true,
        },
      });
      const fields = res?.data?.content?.fields;
      setConfigVault({
        withdraw: fields?.withdraw?.fields,
        rate: fields?.rate || "0",
        lock_duration_ms: fields?.lock_duration_ms || "0",
      });
    } catch (error) {
      setConfigVault(configVaultDefault);
    }
  }, [configLp]);

  const getEstWithdraw = useCallback(() => {
    try {
      if (!Number(amountLp) || Number(amountLp) <= 0) {
        return setAmountEst(amountEstDefault);
      }
      const rawAmount = getDecimalAmount(amountLp, configLp.lp_decimals);
      const amount = rawAmount
        .times(configVault.rate)
        .dividedBy(RATE_DENOMINATOR);

      const fee = amount.times(configVault.withdraw.fee_bps).dividedBy(10000);
      const receiveAmount = amount.minus(fee);

      // convert amount to show
      const _receiveAmount =
        getBalanceAmount(receiveAmount, configLp.token_decimals)?.toNumber() ||
        0;
      const _fee =
        getBalanceAmount(fee, configLp.token_decimals)?.toNumber() || 0;

      setAmountEst({
        amount: amountLp,
        receive: _receiveAmount,
        fee: _fee,
        rateFee: Number(configVault.withdraw.fee_bps || 0),
      });
    } catch (error) {
      setAmountEst(amountEstDefault);
    }
  }, [configVault, amountLp]);

  useEffect(() => {
    if (count.current !== configLp.vault_id && configLp.vault_id) {
      getConfigVault();
    }
    count.current = configLp?.vault_id;
  }, [configLp]);

  useEffect(() => {
    getEstWithdraw();
  }, [configVault, amountLp]);

  return {
    configVault,
    amountEst,
  };
};
