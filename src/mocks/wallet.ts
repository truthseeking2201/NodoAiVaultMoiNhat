import { WalletDetails } from "@/types/wallet-detail";

export const mockWalletDetails: WalletDetails = {
  email: "mock.user@nodo.ai",
  status: "APPROVED",
  wallet_provider: "Mock Wallet",
  wallet_address:
    "0xmockedcafedeadbeef00112233445566778899aabbccddeeff001122334455",
  timestamp: new Date().toISOString(),
  metadata: null,
  invite_code: {
    code: "MOCK123",
    total_referrals: 42,
  },
  total_referrals: 42,
};

export const mockWhitelistResponse = {
  ...mockWalletDetails,
  status: "APPROVED",
};

export const mockReferralDashboard = {
  total: 3,
  data: [
    {
      wallet_address: "0x1111cafedeadbeef001122334455667788990000111122223333444455556666",
      timestamp: new Date(Date.now() - 86400000 * 5).toISOString(),
      total_deposit: 25340.45,
    },
    {
      wallet_address: "0x2222cafedeadbeef001122334455667788990000111122223333444455556666",
      timestamp: new Date(Date.now() - 86400000 * 15).toISOString(),
      total_deposit: 124500.0,
    },
    {
      wallet_address: "0x3333cafedeadbeef001122334455667788990000111122223333444455556666",
      timestamp: new Date(Date.now() - 86400000 * 32).toISOString(),
      total_deposit: 98765.43,
    },
  ],
};

export const mockReferralCheck = {
  invite_code: "MOCK123",
  inviter_wallet: mockWalletDetails.wallet_address,
  inviter_name: "Mock Influencer",
  reward_percentage: 12.5,
};

export const mockReferralLinkResponse = {
  success: true,
  invite_code: "MOCK123",
};

export const mockReferralSkipResponse = {
  success: true,
};

export const mockUserExistsResponse = {
  success: true,
};
