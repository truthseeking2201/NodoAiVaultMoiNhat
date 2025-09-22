const env = import.meta.env.VITE_APP_ENV;

export const LP_TOKEN_CONFIG = {
  image_url: "/coins/nodo-lp.png",
  display_name: "NDLP",
  symbol: "NDLP",
  decimals: 6,
};

export const USDC_CONFIG = {
  coinType:
    "0xdba34672e30cb065b1f93e3ab55318768fd6fef66c15942c9f7cb846e2f900e7::usdc::USDC",
  image_url: "/coins/usdc.png",
  display_name: "USDC",
  symbol: "USDC",
  decimals: 6,
};

export const XP_CONFIG = {
  coinType: "",
  image_url: "/coins/xp.png",
  display_name: "XP Shares",
  symbol: "XP Shares",
  decimals: 0,
};

export const GEMS_CONFIG = {
  coinType: "",
  image_url: "/coins/gem.png",
  display_name: "GEM",
  symbol: "GEM",
  decimals: 9,
};

export const SUI_CONFIG = {
  coinType:
    "0x0000000000000000000000000000000000000000000000000000000000000002::sui::SUI",
  image_url: "/coins/sui.png",
  display_name: "SUI",
  symbol: "SUI",
  decimals: 9,
  shortType: "0x2::sui::SUI",
  gas_fee: 0.006,
};

const TOKEN_REWARDS_BUY_ENV = {
  dev: [
    {
      id: "0x931739984670bc9d1af4f1f1a9f5a4445066f591f8776ca148a55fe406d82929::xp_share::XP_SHARE",
      display_name: "T XP Shares",
      symbol: "XP Shares",
      image_url: XP_CONFIG.image_url,
      decimals: 0,
    },
    {
      id: "0xfa983b7a87369b32944467a17bb97aac99e3b82851287b2b15a549fdfb7a54a7::usdc::USDC",
      display_name: "T USDC",
      symbol: "USDC",
      image_url: USDC_CONFIG.image_url,
      decimals: 6,
    },
  ],
  staging: [
    {
      id: "0x041ec6f987cfe1d546c03538248b448d0525878a542474e277f4289b58012857::xp_share::XP_SHARE",
      display_name: "T XP Shares",
      symbol: "XP Shares",
      image_url: XP_CONFIG.image_url,
      decimals: 0,
    },
    {
      id: "0x339c978af8106a7048dfb89584f395c7a2193e03cad7dfe64cd1e07f058e0d01::usdc::USDC",
      display_name: "T USDC",
      symbol: "USDC",
      image_url: USDC_CONFIG.image_url,
      decimals: 6,
    },
  ],
};

export const TOKEN_REWARDS = TOKEN_REWARDS_BUY_ENV[env] || [];

export const COIN_TYPES_CONFIG = {
  collateral_tokens: [
    {
      id: "0x876a4b7bce8aeaef60464c11f4026903e9afacab79b9b142686158aa86560b50::xbtc::XBTC",
      image_url: "/coins/xbtc.png",
      display_name: "xBTC",
    },
    {
      id: "0x3e8e9423d80e1774a7ca128fccd8bf5f1f7753be658c5e645929037f7c819040::lbtc::LBTC",
      image_url: "/coins/lbtc.png",
      display_name: "LBTC",
    },
    {
      id: "0xaafb102dd0902f5055cadecd687fb5b71ca82ef0e0285d90afde828ec58ca96b::btc::BTC",
      image_url: "/coins/wbtc.png",
      display_name: "wBTC",
    },
    {
      id: "0xdba34672e30cb065b1f93e3ab55318768fd6fef66c15942c9f7cb846e2f900e7::usdc::USDC",
      image_url: "/coins/usdc.png",
      display_name: "USDC",
    },
    {
      id: "0xdeeb7a4662eec9f2f3def03fb937a663dddaa2e215b8078a284d026b7946c270::deep::DEEP",
      image_url: "/coins/deep.png",
      display_name: "DEEP",
    },
    {
      id: "0x0000000000000000000000000000000000000000000000000000000000000002::sui::SUI",
      image_url: "/coins/sui.png",
      display_name: "SUI",
    },
    {
      id: "0x356a26eb9e012a68958082340d4c4116e7f55615cf27affcff209cf0ae544f59::wal::WAL",
      image_url: "/coins/wal.png",
      display_name: "WAL",
    },
    {
      id: "0x375f70cf2ae4c00bf37117d0c85a2c71545e6ee05c4a5c7d282cd66a4504b068::usdt::USDT",
      image_url: "/coins/usdt.png",
      display_name: "USDT",
    },
    {
      id: "0x2b6602099970374cf58a2a1b9d96f005fccceb81e92eb059873baf420eb6c717::x_sui::X_SUI",
      display_name: "xSUI",
      image_url: "/coins/x_sui.png",
    },
    {
      id: "0x9d297676e7a4b771ab023291377b2adfaa4938fb9080b8d12430e4b108b836a9::xaum::XAUM",
      display_name: "XAUM",
      image_url: "/coins/xaum.png",
    },
    {
      id: "0xf16e6b723f242ec745dfd7634ad072c42d5c1d9ac9d62a39c381303eaa57693a::fdusd::FDUSD",
      display_name: "FDUSD",
      image_url: "/coins/fdusd.png",
    },
    ...TOKEN_REWARDS,
    // TODO: add more collateral tokens here
  ],
};
