// import newmoneyWallet from "@/assets/images/newmoney-wallet.png";

import { isMobileDevice } from "@/utils/helpers";

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
    icon: "/wallets/slush-wallet.png",
    description: "Connect to your Slush Wallet",
    extensionUrl: "https://slush.app/download",
  },
  {
    displayName: "Phantom",
    name: "Phantom",
    icon: "/wallets/phantom-wallet.png",
    description: "Connect to your Phantom Wallet",
    extensionUrl: "https://phantom.app/download",
  },
  // {
  //   displayName: "Newmoney.ai",
  //   name: "Newmoney",
  //   icon: newmoneyWallet,
  //   description: "Connect to your Newmoney Wallet",
  //   extensionUrl:
  //     "https://chromewebstore.google.com/detail/newmoneyai/coknkdplmddfgoggddpienehfhdgegna?pli=1",
  // },
];

const WALLET_STATUS = {
  NEW: "NEW",
  PROCESSING: "PROCESSING",
  APPROVED: "APPROVED",
  REJECTED: "REJECTED",
  SIGNED_UP: "SIGNED_UP",
};

export { STEPS, CASES, WALLETS, WALLET_STATUS };
