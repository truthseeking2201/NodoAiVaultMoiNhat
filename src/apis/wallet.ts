import httpNodo from "@/utils/http-nodo";
import { link } from "fs";

const URLS = {
  walletDetails: "/data-management/user/wallet-detail",
  subscribe: "/data-management/user/subscribe",
  updateWalletProvider: "/data-management/user/update-wallet-provider",
  confirmUserExists: "/data-management/user/apply-referral",
  checkReferralCode: (referralCode: string) =>
    `/data-management/user/check-referral/${referralCode}`,
  linkReferralCode: (user_wallet: string) =>
    `/data-management/user/${user_wallet}/invite-code`,
  skipReferralCode: (user_wallet: string) =>
    `/data-management/user/${user_wallet}/skip-invite-code`,
};

export const subscribeWhitelistRequest = async (
  walletAddress: string,
  walletProvider: string
) => {
  const res = (await httpNodo.get(
    `${URLS.walletDetails}?wallet_address=${walletAddress}`
  )) as any;

  if (res?.data === null) {
    httpNodo.post(URLS.subscribe, {
      wallet_address: walletAddress,
      wallet_provider: walletProvider,
    });
  }
  if (!res?.wallet_provider && walletProvider) {
    httpNodo.post(URLS.updateWalletProvider, {
      wallet_address: walletAddress,
      wallet_provider: walletProvider,
    });
  }
  return res;
};

export const getMyReferral = (address: string, params: any) => {
  return httpNodo.get(
    `/data-management/user/my-affiliate-dashboard/${address}`,
    {
      params: params,
    }
  );
};

export const getWalletDetail = async (walletAddress: string) => {
  const res = (await httpNodo.get(
    `${URLS.walletDetails}?wallet_address=${walletAddress}`
  )) as any;

  return res;
};

export const confirmUserExists = async ({ wallet_address }) => {
  const res = (await httpNodo.post(`${URLS.confirmUserExists}`, {
    wallet_address,
  })) as any;

  return res;
};

export const checkReferralCode = async (referralCode: string) => {
  const res = (await httpNodo.get(URLS.checkReferralCode(referralCode))) as any;

  return res;
};

export const linkReferralCode = async ({
  user_wallet,
  invite_code,
}: {
  user_wallet: string;
  invite_code: string;
}) => {
  const res = (await httpNodo.post(URLS.linkReferralCode(user_wallet), {
    invite_code,
  })) as any;

  return res;
};

export const skipReferralCode = async (user_wallet: string) => {
  const res = (await httpNodo.post(
    `${URLS.skipReferralCode(user_wallet)}`
  )) as any;

  return res;
};
