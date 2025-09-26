import {
  DepositVaultConfig,
  WithdrawalRequests,
} from "@/types/vault-config.types";
import http from "@/utils/http";
import { isMockMode } from "@/config/mock";
import {
  mockDepositVaults,
  mockExecutionProfitData,
  mockNdlpPriceChart,
  mockVaultActivities,
  mockVaultAnalytics,
  mockVaultBasicDetails,
  mockVaultDepositTokens,
  mockVaultEstimateWithdraw,
  mockVaultEstimateWithdrawDual,
  mockVaultEstimatesDeposit,
  mockVaultHoldings,
  mockVaultNdlpPriceChart,
  mockVaultSwapDepositInfo,
  mockWithdrawalRequests,
} from "@/mocks";

const NODO_URL = import.meta.env.VITE_NODO_APP_URL;

const URLS = {
  latestWithdrawal: `/data-management/external/withdrawals/latest`,
  executionWithdrawals: "/data-management/external/withdrawals",
  executionProfitData: (vault_id: string) =>
    `/data-management/external/vaults/${vault_id}/profit-data?lock_data=true`,
  withdrawalRequestsByUser:
    "/data-management/external/withdrawal-requests/by-user",
  withdrawalRequestsMultiTokens:
    "/data-management/external/withdrawal-requests/multi-tokens",
  positionRequests: (
    page: number,
    limit: number,
    action_type?: string,
    vault_id?: string
  ) => {
    const baseUrl = `/data-management/external/position-requests?page=${page}&limit=${limit}&vault_id=${vault_id}`;
    return action_type && action_type !== ""
      ? `${baseUrl}&action_type=${action_type}`
      : baseUrl;
  },
  depositVaults: (accountAddress?: string) => {
    let url = `/data-management/external/vaults/list`;
    if (accountAddress && accountAddress !== "default") {
      url += `?wallet_address=${accountAddress}`;
    }
    return url;
  },
  vaultsWithdrawal: (accountAddress?: string) => {
    let url = `/data-management/external/vaults/withdrawals`;
    if (accountAddress && accountAddress !== "default") {
      url += `?wallet_address=${accountAddress}`;
    }
    return url;
  },
  vaultAnalytics: (vaultId: string, type: string, range: string) =>
    `${NODO_URL}/data-management/external/vaults/${vaultId}/histogram?histogram_type=${type}&histogram_range=${range}`,
  vaultBasicDetails: (vaultId: string, walletAddress: string) => {
    let url = `${NODO_URL}/data-management/external/vaults/${vaultId}/basic`;
    if (walletAddress && walletAddress !== "default") {
      url += `?wallet_address=${walletAddress}`;
    }
    return url;
  },
  estimateWithdraw: (
    vaultId: string,
    ndlp_amount: string,
    payout_token: string
  ) =>
    `/data-management/external/vaults/${vaultId}/estimate-withdraw?ndlp_amount=${ndlp_amount}&payout_token=${payout_token}`,
  getEstimateWithdrawDual: (vaultId: string, ndlp_amount: string) =>
    `/data-management/external/vaults/${vaultId}/estimate-withdraw-dual?ndlp_amount=${ndlp_amount}`,
  estimateDeposit: (vaultId: string, amount: string, deposit_token: string) =>
    `/data-management/external/vaults/${vaultId}/estimate-deposit?amount=${amount}&deposit_token=${deposit_token}`,
  swapDepositInfo: (vaultId: string, token_address: string) =>
    `/data-management/external/vaults/${vaultId}/swap-and-deposit-info?token_address=${token_address}`,
  checkCanDeposit: (vaultId: string, token_address: string, amount: string) =>
    `/data-management/external/vaults/${vaultId}/check-deposit?deposit_token=${token_address}&deposit_amount=${amount}`,
  userHolding: (vaultId: string, ndlp_balance: string) =>
    `/data-management/external/user/vault-stats?vault_id=${vaultId}&ndlp_balance=${ndlp_balance}`,
  estimateDualDeposit: (vaultId: string) =>
    `/data-management/external/vaults/${vaultId}/estimate-deposit-dual`,
  depositTokens: `data-management/external/vaults/list-deposit-tokens`,
  ndlpPriceChart: (vaultId: string, range: string) =>
    `/data-management/external/user/ndlp-price-chart?vault_id=${vaultId}&range=${range}`,
  vaultNdlpPriceChart: (vaultId: string, range: string) =>
    `/data-management/external/vaults/${vaultId}/ndlp-price-chart?range=${range}`,
};

export const getLatestWithdrawal = (sender_address: string) => {
  if (isMockMode) {
    return Promise.resolve(mockWithdrawalRequests[0]);
  }
  return http.get(URLS.latestWithdrawal);
};

export const executionWithdrawal = (payload: any) => {
  if (isMockMode) {
    return Promise.resolve({ success: true, payload });
  }
  return http.post(URLS.executionWithdrawals, payload);
};

export const executionProfitData = (vault_id: string) => {
  if (isMockMode) {
    return Promise.resolve(mockExecutionProfitData);
  }
  return http.get(URLS.executionProfitData(vault_id));
};

export const getSignatureRedeem = (params: any) => {
  return http.get(URLS.withdrawalRequestsByUser, {
    params,
  });
};

export const getWithdrawalRequestsMultiTokens = (params: any) => {
  return http.get(URLS.withdrawalRequestsMultiTokens, {
    params,
  });
};

export const getVaultsActivities = (payload: any) => {
  const { page, limit, action_type, vault_id } = payload;
  if (isMockMode) {
    return Promise.resolve({
      ...mockVaultActivities,
      list: mockVaultActivities.list?.map((item) => ({
        ...item,
        vault_address:
          vault_id && vault_id !== "default" ? vault_id : item.vault_address,
        type:
          action_type && action_type !== ""
            ? (action_type as typeof item.type)
            : item.type,
      })),
      page,
      limit,
    });
  }
  return http.get(URLS.positionRequests(page, limit, action_type, vault_id));
};

export const getDepositVaults = (accountAddress?: string) => {
  if (isMockMode) {
    const enriched = mockDepositVaults.map((vault) => ({
      ...vault,
      ready: true,
      user_pending_withdraw_ndlp: vault.user_pending_withdraw_ndlp || "0",
    }));
    return Promise.resolve(enriched) as Promise<DepositVaultConfig[]>;
  }
  return http.get(URLS.depositVaults(accountAddress)) as Promise<
    DepositVaultConfig[]
  >;
};

export const getVaultsWithdrawal = (accountAddress?: string) => {
  if (isMockMode) {
    return Promise.resolve(mockWithdrawalRequests) as Promise<
      WithdrawalRequests[]
    >;
  }
  return http.get(URLS.vaultsWithdrawal(accountAddress)) as Promise<
    WithdrawalRequests[]
  >;
};

export const getVaultAnalytics = (
  vaultId: string,
  type: string,
  range: string
) => {
  if (isMockMode) {
    return Promise.resolve(mockVaultAnalytics(vaultId, type, range));
  }
  return http.get(URLS.vaultAnalytics(vaultId, type, range));
};

export const getVaultBasicDetails = (
  vaultId: string,
  walletAddress: string
) => {
  if (isMockMode) {
    const data =
      mockVaultBasicDetails[vaultId] ||
      mockVaultBasicDetails["0xvault-usdc-sui"];
    return Promise.resolve(data);
  }
  return http.get(URLS.vaultBasicDetails(vaultId, walletAddress));
};

export const getEstimateWithdraw = (
  vaultId: string,
  params: { ndlp_amount: string; payout_token: string }
) => {
  if (isMockMode) {
    return Promise.resolve(
      mockVaultEstimateWithdraw[vaultId] || mockVaultEstimateWithdraw["0xvault-usdc-sui"]
    );
  }
  return http.get(
    URLS.estimateWithdraw(vaultId, params.ndlp_amount, params.payout_token)
  );
};

export const getEstimateWithdrawDual = (
  vaultId: string,
  ndlp_amount: string
) => {
  if (isMockMode) {
    return Promise.resolve(
      mockVaultEstimateWithdrawDual[vaultId] ||
        mockVaultEstimateWithdrawDual["0xvault-usdc-sui"]
    );
  }
  return http.get(URLS.getEstimateWithdrawDual(vaultId, ndlp_amount));
};

export const getEstimateDeposit = (
  vaultId: string,
  params: { amount: string; deposit_token: string }
) => {
  if (isMockMode) {
    return Promise.resolve(
      mockVaultEstimatesDeposit[vaultId] ||
        mockVaultEstimatesDeposit["0xvault-usdc-sui"]
    );
  }
  return http.get(
    URLS.estimateDeposit(
      vaultId,
      params.amount,
      encodeURIComponent(params.deposit_token)
    )
  );
};

export const getSwapDepositInfo = (vaultId: string, token_address: string) => {
  if (isMockMode) {
    return Promise.resolve(
      mockVaultSwapDepositInfo[vaultId] ||
        mockVaultSwapDepositInfo["0xvault-usdc-sui"]
    );
  }
  return http.get(
    URLS.swapDepositInfo(vaultId, encodeURIComponent(token_address))
  );
};

export const checkCanDeposit = (
  vaultId: string,
  token_address: string,
  amount: string
) => {
  if (isMockMode) {
    return Promise.resolve({ can_deposit: true });
  }
  return http.get(
    URLS.checkCanDeposit(vaultId, token_address, amount)
  ) as Promise<{
    can_deposit: boolean;
  }>;
};

export const getUserHolding = (vaultId: string, ndlp_balance: string) => {
  if (isMockMode) {
    const data =
      mockVaultHoldings[vaultId] || mockVaultHoldings["0xvault-usdc-sui"];
    return Promise.resolve(data);
  }
  return http.get(URLS.userHolding(vaultId, ndlp_balance));
};

export const getEstimateDualDeposit = (vaultId: string) => {
  if (isMockMode) {
    return Promise.resolve(
      mockVaultEstimateWithdrawDual[vaultId] ||
        mockVaultEstimateWithdrawDual["0xvault-usdc-sui"]
    );
  }
  return http.get(URLS.estimateDualDeposit(vaultId));
};

export const getDepositTokens = () => {
  if (isMockMode) {
    return Promise.resolve(mockVaultDepositTokens);
  }
  return http.get(URLS.depositTokens);
};

export const getNdlpPriceChart = (vaultId: string, range: string) => {
  if (isMockMode) {
    return Promise.resolve(mockNdlpPriceChart);
  }
  return http.get(URLS.ndlpPriceChart(vaultId, range));
};

export const getVaultNdlpPriceChart = (vaultId: string, range: string) => {
  if (isMockMode) {
    return Promise.resolve(mockVaultNdlpPriceChart);
  }
  return http.get(URLS.vaultNdlpPriceChart(vaultId, range));
};
