import http from "@/utils/http";
import { isMockMode } from "@/config/mock";
import {
  mockReferralCheck,
  mockReferralDashboard,
  mockReferralLinkResponse,
  mockReferralSkipResponse,
  mockUserExistsResponse,
  mockWalletDetails,
  mockWhitelistResponse,
} from "@/mocks";

const URLS = {
  walletDetails: "/data-management/external/user/wallet-detail",
  subscribe: "/data-management/external/user/subscribe",
  updateWalletProvider: "/data-management/external/user/update-wallet-provider",
  confirmUserExists: "/data-management/external/user/apply-referral",
  checkReferralCode: (referralCode: string) =>
    `/data-management/external/user/check-referral/${referralCode}`,
  linkReferralCode: `/data-management/external/user/invite-code`,
  skipReferralCode: `/data-management/external/user/skip-invite-code`,
  myAffiliateDashboard: `/data-management/external/user/my-affiliate-dashboard`,
};

export const subscribeWhitelistRequest = async (
  walletAddress: string,
  walletProvider: string
) => {
  if (isMockMode) {
    return Promise.resolve({
      ...mockWhitelistResponse,
      wallet_address: walletAddress,
      wallet_provider: walletProvider || mockWhitelistResponse.wallet_provider,
    });
  }
  const res = (await http.get(URLS.walletDetails)) as any;

  if (!res?.invite_code?.code) {
    await http.post(URLS.subscribe, {
      wallet_address: walletAddress,
      wallet_provider: walletProvider,
    });
    return await http.get(URLS.walletDetails);
  }
  if (walletProvider) {
    http.post(URLS.updateWalletProvider, {
      wallet_address: walletAddress,
      wallet_provider: walletProvider,
    });
  }
  return res;
};

export const getMyReferral = (params: any) => {
  if (isMockMode) {
    return Promise.resolve(mockReferralDashboard);
  }
  return http.get(URLS.myAffiliateDashboard, {
    params: params,
  });
};

export const getWalletDetail = async (walletAddress: string) => {
  if (isMockMode) {
    return Promise.resolve({
      ...mockWalletDetails,
      wallet_address: walletAddress || mockWalletDetails.wallet_address,
    });
  }
  const res = (await http.get(`${URLS.walletDetails}`)) as any;

  return res;
};

export const confirmUserExists = async ({ wallet_address }) => {
  if (isMockMode) {
    return Promise.resolve({ ...mockUserExistsResponse, wallet_address });
  }
  const res = (await http.post(`${URLS.confirmUserExists}`, {
    wallet_address,
  })) as any;

  return res;
};

export const checkReferralCode = async (referralCode: string) => {
  if (isMockMode) {
    return Promise.resolve(mockReferralCheck);
  }
  const res = (await http.get(URLS.checkReferralCode(referralCode))) as any;

  return res;
};

export const linkReferralCode = async ({
  invite_code,
}: {
  invite_code: string;
}) => {
  if (isMockMode) {
    return Promise.resolve({ ...mockReferralLinkResponse, invite_code });
  }
  const res = (await http.post(URLS.linkReferralCode, {
    invite_code,
  })) as any;

  return res;
};

export const skipReferralCode = async () => {
  if (isMockMode) {
    return Promise.resolve(mockReferralSkipResponse);
  }
  const res = (await http.post(URLS.skipReferralCode)) as any;

  return res;
};
