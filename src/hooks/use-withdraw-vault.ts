import { Buffer } from "buffer";
import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import {
  useCurrentAccount,
  useSignAndExecuteTransaction,
  useSuiClient,
} from "@mysten/dapp-kit";
import { useGetVaultConfig, useEstimateWithdraw } from "./use-vault";
import { Transaction } from "@mysten/sui/transactions";
import { useMergeCoins } from "./use-merge-coins";
import { RATE_DENOMINATOR, CLOCK } from "@/config/vault-config";
import { getDecimalAmount, getBalanceAmount } from "@/lib/number";
import { sleep } from "@/lib/utils";
import LpType from "@/types/lp.type";
import DataClaimType from "@/types/data-claim.types.d";
import BigNumber from "bignumber.js";
import {
  executionProfitData,
  getWithdrawalRequestsMultiTokens,
  getVaultBasicDetails,
} from "@/apis/vault";
import { BasicVaultDetailsType } from "@/types/vault-config.types";

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
      getBalanceAmount(
        receiveAmount,
        configLp.collateral_decimals
      )?.toNumber() || 0;
    const _fee =
      getBalanceAmount(fee, configLp.collateral_decimals)?.toNumber() || 0;

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
      if (!values?.length) return [];
      let dataRequest: any = null;

      for (let index = 0; index < 10; index++) {
        dataRequest = await getWithdrawalRequestsMultiTokens({
          wallet_address: senderAddress,
          vault_id: configLp.vault_id,
        });
        if (dataRequest.length) {
          break;
        }
        await sleep(2000);
      }

      return dataRequest?.map((val) => {
        const withdrawAmount = getBalanceAmount(
          val?.withdrawal_ndlp_amount || 0,
          configLp.lp_decimals
        )?.toNumber();
        const receiveAmount = getBalanceAmount(
          val?.receive_amount || 0,
          val?.token?.decimal
        );
        const receiveSymbol = val?.token?.token_symbol;
        const conversionRate = receiveAmount
          .dividedBy(withdrawAmount)
          .toNumber();
        const timeUnlock = Number(val?.countdown || 0);
        const isClaim = val.is_ready;
        const fee = 0;

        return {
          id: 1,
          timeUnlock: timeUnlock,
          isClaim: isClaim,
          withdrawAmount: withdrawAmount,
          withdrawSymbol: configLp.lp_symbol,
          withdrawSymbolImage: configLp.lp_image,
          receiveAmountRaw: receiveAmount.toNumber(),
          receiveAmount: receiveAmount.minus(fee).toNumber(),
          receiveSymbol: receiveSymbol,
          receiveSymbolImage: `/coins/${receiveSymbol?.toLowerCase()}.png`,
          receiveDecimal: val?.token?.decimal || 9,
          feeAmount: fee,
          feeSymbol: configLp.collateral_symbol,
          feeRate: 0,
          conversionRate: conversionRate,
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
    if (req_availabe?.length) return req_availabe[0];

    return res[0];
  };

  /**
   *
   * @param amountLp
   * @param fee
   * @param configLp
   * @returns
   */
  const withdraw = async (
    amountLp: number,
    configLp: LpType,
    token_receive: string
  ) => {
    try {
      if (!account?.address) {
        throw new Error("No account connected");
      }
      if (!token_receive) {
        throw new Error("No payout token selected");
      }

      const profitData: any = await executionProfitData(configLp.vault_id);
      if (!profitData || !profitData?.signature) {
        throw new Error("Failed to get signature");
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

      const _arguments: any = [
        tx.object(configLp.vault_config_id),
        tx.object(configLp.vault_id),
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
        tx.object(configLp.clock),
      ];
      const typeArguments = [
        configLp.collateral_coin_type,
        configLp.lp_coin_type,
        token_receive,
      ];

      tx.moveCall({
        target: `${configLp.package_id}::vault::withdraw_with_sigs_credit_time`,
        arguments: _arguments,
        typeArguments: typeArguments,
      });
      // console.log("🧱 Inputs:", tx.blockData.inputs);
      // console.log("📄 Raw tx:", JSON.stringify(tx.serialize(), null, 2));

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
      const dataSignatures: any = await getWithdrawalRequestsMultiTokens({
        wallet_address: account.address,
        vault_id: configLp.vault_id,
      });
      if (!dataSignatures || !dataSignatures?.length) {
        throw new Error("Failed to get signature");
      }

      const tx = new Transaction();

      for (let index = 0; index < dataSignatures.length; index++) {
        const dataSignature = dataSignatures[index];
        if (!dataSignature?.signatures?.length) {
          continue;
        }

        const _arguments: any = [
          tx.object(configLp.vault_config_id),
          tx.object(configLp.vault_id),
          tx.pure.address(account.address),
          tx.pure.address(dataSignature.sig_token),
          tx.pure("vector<u64>", dataSignature.withdraw_time_requests),
          tx.pure("vector<u64>", dataSignature.withdraw_amount_requests),
          tx.pure(
            "vector<u64>",
            dataSignature.withdraw_amount_collateral_requests
          ),
          tx.pure.u64(dataSignature.expire_time),
          tx.pure(
            "vector<vector<u8>>",
            dataSignature.pks.map((key) => Array.from(Buffer.from(key, "hex")))
          ),
          tx.pure(
            "vector<vector<u8>>",
            dataSignature.signatures.map((key) =>
              Array.from(Buffer.from(key, "hex"))
            )
          ),
          tx.object(configLp.clock),
        ];
        const typeArguments = [
          configLp.collateral_coin_type,
          configLp.lp_coin_type,
          dataSignature.token.token_address,
        ];

        tx.moveCall({
          target: `${configLp.package_id}::vault::redeem_with_sigs_verify_token`,
          arguments: _arguments,
          typeArguments: typeArguments,
        });
      }

      const result = await signAndExecuteTransaction({
        transaction: tx,
      });

      return { resultTx: result, dataSignatures };
    } catch (error) {
      console.error("Error in redeem:", error);
      throw error;
    }
  };

  const redeemWithVaultId = async (vault_id: string) => {
    const response = await getVaultBasicDetails(vault_id, "");
    const vault = response as unknown as BasicVaultDetailsType;

    const lpData = {
      package_id: vault.metadata.package_id,
      vault_config_id: vault.metadata.vault_config_id,
      vault_id: vault.vault_id,
      lp_coin_type: vault.vault_lp_token,
      lp_decimals: vault.vault_lp_token_decimals,
      collateral_coin_type: vault.collateral_token,
      clock: CLOCK,
    };
    const { dataSignatures }: any = await redeem(lpData);
    const val = dataSignatures[0];
    const receiveAmount = getBalanceAmount(
      val?.receive_amount || 0,
      val?.token?.decimal
    );
    return {
      receiveAmount: receiveAmount.toNumber(),
      receiveSymbol: val?.token?.token_symbol,
    };
  };

  return {
    getRequestClaim,
    getLatestRequestClaim,
    withdraw,
    redeem,
    redeemWithVaultId,
  };
};

export const useWithdrawVaultConfig = (configLp: LpType) => {
  const { vaultConfig, refetch } = useGetVaultConfig(configLp?.vault_id);
  const configVault = useMemo(() => {
    const fields = vaultConfig;
    const rate = fields?.rate || "0";
    const lpToTokenRateRaw = getDecimalAmount(1, configLp.lp_decimals)
      .times(rate)
      .dividedBy(RATE_DENOMINATOR);
    const lpToTokenRate =
      getBalanceAmount(
        lpToTokenRateRaw,
        configLp.collateral_decimals
      )?.toNumber() || 0;

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
  }, [vaultConfig, configLp]);

  return {
    configVault,
    refetch,
  };
};

export const useWithdrawEtsAmountReceive = (
  lpData: LpType,
  tokenReceive: any,
  amountLp: number
) => {
  const min_amount_receive = 0.000001;

  const {
    data: dataEst,
    refetch: refetchEstimateWithdraw,
    error: errorEstimateWithdraw,
    isLoading: isLoadingEstimateWithdraw,
  } = useEstimateWithdraw(lpData?.vault_id, {
    ndlp_amount: getDecimalAmount(1, lpData.lp_decimals).toString(),
    payout_token: tokenReceive?.token_address
      ? encodeURIComponent(tokenReceive?.token_address)
      : null,
  });
  const rate_lp_per_token_receive = useMemo(() => {
    return dataEst?.ndlp_per_payout_rate || 0;
  }, [dataEst]);

  const amount_receive = useMemo(() => {
    return BigNumber(amountLp).times(rate_lp_per_token_receive).toNumber();
  }, [amountLp, rate_lp_per_token_receive]);

  const errorEstimate = useMemo(() => {
    if (errorEstimateWithdraw) {
      return typeof errorEstimateWithdraw === "string"
        ? errorEstimateWithdraw
        : errorEstimateWithdraw?.message;
    }
    if (isLoadingEstimateWithdraw) return "";

    if (Number(amountLp) && BigNumber(amount_receive).lt(min_amount_receive)) {
      return "Amount received is too small.";
    }
    return "";
  }, [
    amountLp,
    amount_receive,
    errorEstimateWithdraw,
    isLoadingEstimateWithdraw,
  ]);

  const conversion_rate = useMemo(() => {
    return {
      from_symbol: lpData?.lp_symbol,
      to_symbol: tokenReceive?.token_symbol,
      amount: rate_lp_per_token_receive,
    };
  }, [lpData, tokenReceive, rate_lp_per_token_receive]);

  return {
    receive: amount_receive,
    amount: amountLp,
    rate_lp_per_token_receive,
    conversion_rate: conversion_rate,
    tokenReceive,
    errorEstimateWithdraw: errorEstimate,
    isLoadingEstimateWithdraw,
    refreshRate: refetchEstimateWithdraw,
  };
};
