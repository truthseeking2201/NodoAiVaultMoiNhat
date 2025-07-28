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

export const COIN_TYPES_CONFIG = {
  collateral_tokens: [
    {
      id: "0x876a4b7bce8aeaef60464c11f4026903e9afacab79b9b142686158aa86560b50::xbtc::XBTC",
      image_url: "/coins/xbtc.png",
      display_name: "xBTC",
    },
    {
      id: "0xdba34672e30cb065b1f93e3ab55318768fd6fef66c15942c9f7cb846e2f900e7::usdc::USDC",
      image_url: "/coins/usdc.png",
      display_name: "USDC",
    },
    {
      id: "0xaafb102dd0902f5055cadecd687fb5b71ca82ef0e0285d90afde828ec58ca96b::btc::BTC",
      image_url: "/coins/wbtc.png",
      display_name: "wBTC",
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
      id: "0x3e8e9423d80e1774a7ca128fccd8bf5f1f7753be658c5e645929037f7c819040::lbtc::LBTC",
      image_url: "/coins/lbtc.png",
      display_name: "LBTC",
    },
    // TODO: add more collateral tokens here
  ],
};
