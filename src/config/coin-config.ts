type CoinConfig = {
  collateral_token: {
    id: string;
    image_url: string;
    display_name: string;
  };
};

type CoinConfigByEnv = {
  [key: string]: CoinConfig;
};

const CONFIG: CoinConfigByEnv = {
  dev: {
    collateral_token: {
      id: "0xdba34672e30cb065b1f93e3ab55318768fd6fef66c15942c9f7cb846e2f900e7::usdc::USDC",
      image_url: "/coins/usdc.png",
      display_name: "USDC",
    },
  },
  uat: {
    collateral_token: {
      id: "0xdba34672e30cb065b1f93e3ab55318768fd6fef66c15942c9f7cb846e2f900e7::usdc::USDC",
      image_url: "/coins/usdc.png",
      display_name: "USDC",
    },
  },
};

export const LP_TOKEN_CONFIG = {
  image_url: "/coins/nodo-lp.png",
  display_name: "NDLP",
  symbol: "NDLP",
};

export const COIN_TYPES_CONFIG = CONFIG[
  import.meta.env.VITE_APP_ENV || "dev"
] as CoinConfig;
