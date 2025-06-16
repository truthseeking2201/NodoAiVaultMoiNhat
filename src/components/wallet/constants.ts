import phantomWallet from "@/assets/images/phantom-wallet.png";
import slushWallet from "@/assets/images/slush-wallet.png";

const STEPS = {
  CONNECT_WALLET: "connect_wallet",
  INPUT_REFERRAL: "input_referral",
  REFERRAL_SUCCESS: "referral_success",
  EXISTING_USER_CONFIRM: "existing_user_confirm",
  REFERRAL_CONFIRM: "referral_confirm",
};

const CASES = {
  NEW_USER_WITHOUT_REFERRAL: "new_user_without_referral",
  NEW_USER_WITH_REFERRAL: "new_user_with_referral",
  EXISTING_USER: "existing_user",
};

const WALLETS = [
  {
    displayName: "Slush",
    name: "Slush",
    icon: slushWallet,
    description: "Connect to your Slush Wallet",
    extensionUrl:
      "https://chromewebstore.google.com/detail/slush-%E2%80%94-a-sui-wallet/opcgpfmipidbgpenhmajoajpbobppdil",
  },
  {
    displayName: "Phantom",
    name: "Phantom",
    icon: phantomWallet,
    description: "Connect to your Phantom Wallet",
    extensionUrl: "https://phantom.app/download",
  },
];

const WALLET_STATUS = {
  NEW: "NEW",
  PROCESSING: "PROCESSING",
  APPROVED: "APPROVED",
  REJECTED: "REJECTED",
  SIGNED_UP: "SIGNED_UP",
};

export { STEPS, CASES, WALLETS,WALLET_STATUS };
