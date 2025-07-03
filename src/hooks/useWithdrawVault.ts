import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import {
  useCurrentAccount,
  useSignAndExecuteTransaction,
  useSuiClient,
} from "@mysten/dapp-kit";
import { useGetVaultConfig } from "./useVault";
import { Transaction } from "@mysten/sui/transactions";
import { useMergeCoins } from "./useMergeCoins";
import { RATE_DENOMINATOR } from "@/config/vault-config";
import { getDecimalAmount, getBalanceAmount } from "@/lib/number";
import LpType from "@/types/lp.type";
import DataClaimType from "@/types/data-claim.types.d";
import BigNumber from "bignumber.js";

const _calcRateFee = (fee_bps) => {
  return BigNumber(fee_bps || 0)
    .dividedBy(100)
    .toNumber();
};
const _calcPercent = (amount, fee_bps) => {
  return BigNumber(amount).times(fee_bps).div(10000).toNumber();
};

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
      rateFee: _calcRateFee(configVault.withdraw.fee_bps),
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

      const data: any = await suiClient.getDynamicFieldObject({
        parentId: configVault?.id_pending_redeems,
        name: {
          type: "address",
          value: senderAddress,
        },
      });
      const values = data?.data?.content?.fields?.value || [];
      console.log("-----getRequestClaim-values", values);

      return values?.map((val) => {
        const fields = val.fields;

        let withdrawAmount =
          getBalanceAmount(fields?.lp || 0, configLp.lp_decimals)?.toNumber() ||
          0;

        const is_available_liquidity = new BigNumber(
          configVault.available_liquidity
        ).gte(fields.amount);

        const receiveAmount =
          getBalanceAmount(fields.amount, configLp.token_decimals) ||
          new BigNumber(0);
        const rateFee = configVault?.withdraw?.fee_bps || 0;
        const fee = _calcPercent(receiveAmount, rateFee);

        const timeUnlock =
          Number(fields?.withdraw_time) + Number(configVault.lock_duration_ms);
        const now = Date.now().valueOf();
        const isClaim = timeUnlock < now && is_available_liquidity;

        if (withdrawAmount == 0) {
          withdrawAmount = Number(
            receiveAmount.dividedBy(configVault.lpToTokenRate).toFixed(2)
          );
        }
        return {
          id: 1,
          timeUnlock: timeUnlock,
          isClaim: isClaim,
          withdrawAmount: withdrawAmount,
          withdrawSymbol: configLp.lp_symbol,
          receiveAmountRaw: receiveAmount.toNumber(),
          receiveAmount: receiveAmount.minus(fee).toNumber(),
          receiveSymbol: configLp.token_symbol,
          feeAmount: fee,
          feeSymbol: configLp.token_symbol,
          feeRate: _calcRateFee(rateFee),
          configLp: configLp,
        };
      });
    } catch (error) {
      console.log("-----getRequestClaim-error", error);
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
const amountEstDefault = {
  amount: 0,
  receive: 0,
  fee: 0,
  rateFee: 0,
};
export const useEstWithdrawVault = (amountLp: number, configLp: LpType) => {
  const [amountEst, setAmountEst] = useState(amountEstDefault);

  const { vaultConfig } = useGetVaultConfig(configLp?.vault_id);

  const configVault = useMemo(() => {
    const fields = vaultConfig;
    const rate = fields?.rate || "0";
    const lpToTokenRateRaw = getDecimalAmount(1, configLp.lp_decimals)
      .times(rate)
      .dividedBy(RATE_DENOMINATOR);
    const lpToTokenRate =
      getBalanceAmount(lpToTokenRateRaw, configLp.token_decimals)?.toNumber() ||
      0;

    return {
      withdraw: fields?.withdraw?.fields || {
        fee_bps: "0",
        min: "0",
        total_fee: "0",
      },
      lock_duration_ms: fields?.lock_duration_ms || "0",
      available_liquidity: fields?.available_liquidity || "0",
      id_pending_redeems: fields?.pending_redeems?.fields?.id?.id || "",
      rate,
      lpToTokenRate,
    };
  }, [vaultConfig]);

  const getEstWithdraw = useCallback(() => {
    try {
      const est = _getEstWithdraw(Number(amountLp), configLp, configVault);
      setAmountEst(est);
    } catch (error) {
      setAmountEst(amountEstDefault);
    }
  }, [configVault, amountLp, configLp]);

  useEffect(() => {
    getEstWithdraw();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [configVault, amountLp]);

  return {
    configVault,
    amountEst,
  };
};
