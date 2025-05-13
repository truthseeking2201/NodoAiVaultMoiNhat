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
import LpType from "@/types/lp.type";
import DataClaimType from "@/types/data-claim.types.d";
import BigNumber from "bignumber.js";

const network = import.meta.env.VITE_SUI_NETWORK;

const _getEstWithdraw = (
  amountLp: number,
  configLp: LpType,
  configVault: any
) => {
  try {
    if (
      !Number(amountLp) ||
      Number(amountLp) <= 0 ||
      !configLp ||
      !configVault
    ) {
      return null;
    }
    const rawAmount = getDecimalAmount(amountLp, configLp.lp_decimals);
    const amount = rawAmount
      .times(configVault.rate)
      .dividedBy(RATE_DENOMINATOR);

    const fee = amount.times(configVault.withdraw.fee_bps).dividedBy(10000);
    const receiveAmount = amount.minus(fee);

    // convert amount to show
    const _receiveAmount =
      getBalanceAmount(receiveAmount, configLp.token_decimals)?.toNumber() || 0;
    const _fee =
      getBalanceAmount(fee, configLp.token_decimals)?.toNumber() || 0;

    return {
      amount: amountLp,
      receive: _receiveAmount,
      fee: _fee,
      rateFee: Number(configVault.withdraw.fee_bps || 0),
    };
  } catch (error) {
    return null;
  }
};

export const useWithdrawVault = () => {
  const { mutateAsync: signAndExecuteTransaction } =
    useSignAndExecuteTransaction();
  const account = useCurrentAccount();
  const suiClient = useSuiClient();

  const { mergeCoins } = useMergeCoins();

  /**
   *
   * @param senderAddress
   * @param configLp
   * @param configVault
   * @returns
   */
  const getRequestClaim = async (
    senderAddress: string,
    configLp: LpType,
    configVault: any
  ): Promise<DataClaimType[]> => {
    try {
      if (!configVault?.id_pending_redeems || !senderAddress) return null;

      const data = await suiClient.getDynamicFieldObject({
        parentId: configVault?.id_pending_redeems,
        name: {
          type: "address",
          value: senderAddress,
        },
      });
      console.log("--------data", data);
      const values = data?.data?.content?.fields?.value || [];
      console.log("--------values", values);
      const available_liquidity = getBalanceAmount(
        configVault.available_liquidity,
        configLp.token_decimals
      );
      console.log(
        "--------available_liquidity",
        available_liquidity.toNumber()
      );

      return values?.map((val) => {
        const fields = val.fields;
        const amount = getBalanceAmount(
          fields.amount,
          configLp.lp_decimals
        )?.toNumber();
        const est = _getEstWithdraw(amount, configLp, configVault);
        const timeUnlock =
          Number(fields?.withdraw_time) + Number(configVault.lock_duration_ms);
        const now = Date.now().valueOf();
        const isClaim =
          timeUnlock < now && available_liquidity.gte(est.receive);
        return {
          id: 1,
          timeUnlock: timeUnlock,
          isClaim: isClaim,
          withdrawAmount: amount,
          withdrawSymbol: configLp.lp_symbol,
          receiveAmount: est.receive,
          receiveSymbol: configLp.token_symbol,
          feeAmount: est.fee,
          feeSymbol: configLp.token_symbol,
          configLp: configLp,
        };
      });
    } catch (error) {
      return [];
    }
  };

  /**
   *
   * @param senderAddress
   * @param configLp
   * @param configVault
   * @returns
   */
  const getLatestRequestClaim = async (
    senderAddress: string,
    configLp: LpType,
    configVault: any
  ): Promise<DataClaimType> => {
    const res = await getRequestClaim(senderAddress, configLp, configVault);
    if (!res || !res?.length) {
      return null;
    }
    const req_availabe = res?.filter((el) => el.isClaim);
    if (!req_availabe?.length) return res[0];

    // only claim all request
    const default_req = {
      withdrawAmount: 0,
      receiveAmount: 0,
      feeAmount: 0,
    };
    const grouped = req_availabe.reduce((acc, item) => {
      const _acc = { ...item, ...acc };
      _acc.withdrawAmount = BigNumber(_acc.withdrawAmount)
        .plus(item.withdrawAmount)
        .toNumber();
      _acc.receiveAmount = BigNumber(_acc.receiveAmount)
        .plus(item.receiveAmount)
        .toNumber();
      _acc.feeAmount = BigNumber(_acc.feeAmount)
        .plus(item.feeAmount)
        .toNumber();

      return _acc;
    }, default_req) as DataClaimType;
    return grouped;
  };

  /**
   *
   * @param amountLp
   * @param fee
   * @param configLp
   * @returns
   */
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

  /**
   *
   * @param configLp
   * @returns
   */
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

  return { getRequestClaim, getLatestRequestClaim, withdraw, redeem };
};

/**
 *
 * @param amountLp
 * @param configLp
 * @returns
 */
export const useEstWithdrawVault = (amountLp: number, configLp: LpType) => {
  const configVaultDefault = {
    withdraw: { fee_bps: "0", min: "0", total_fee: "0" },
    rate: "0",
    lock_duration_ms: 0,
    id_pending_redeems: "",
    available_liquidity: "",
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
      console.log("-----getConfigVault", fields);
      setConfigVault({
        withdraw: fields?.withdraw?.fields,
        rate: fields?.rate || "0",
        lock_duration_ms: fields?.lock_duration_ms || "0",
        available_liquidity: fields?.available_liquidity || "0",
        id_pending_redeems: fields?.pending_redeems?.fields?.id?.id || "0",
      });
    } catch (error) {
      setConfigVault(configVaultDefault);
    }
  }, [configLp]);

  const getEstWithdraw = useCallback(() => {
    try {
      const est = _getEstWithdraw(Number(amountLp), configLp, configVault);
      setAmountEst(est);
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
