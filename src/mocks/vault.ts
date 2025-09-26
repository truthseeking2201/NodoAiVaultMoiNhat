import { TransactionHistory } from "@/types/vault";
import {
  BasicVaultDetailsType,
  DepositVaultConfig,
  SCVaultConfig,
  VaultApr,
  VaultEstimateDeposit,
  VaultEstimateWithdraw,
  VaultEstimateWithdrawDual,
  VaultHoldingType,
  VaultSwapDepositInfo,
  WithdrawalRequests,
} from "@/types/vault-config.types";
import { NdlpPriceChartData } from "@/types/vault";
import { NdlpTokenPrice } from "@/hooks/use-token-price";
import { VaultDepositToken } from "@/types/payment-token.types";
import { TokenUsdPrice } from "@/hooks/use-token-price";

const baseApr: VaultApr = {
  rolling_7day_apr: "18.25",
  nodo_incentive_apr: "5.75",
  campaign_aprs: [
    {
      label: "OKX",
      apr: 12.5,
    },
    {
      label: "Binance",
      apr: 8.4,
    },
  ],
  total_apr_precompounding: "36.40",
  daily_compounding_apy: "42.10",
  nodo_incentives: [
    {
      token_address:
        "0xdba34672e30cb065b1f93e3ab55318768fd6fef66c15942c9f7cb846e2f900e7::usdc::USDC",
      token_symbol: "USDC",
      daily_amount: 15000,
      daily_amount_tokens: 15000,
      daily_amount_usd: 15000,
      decimals: 6,
      price_usd: 1,
    },
  ],
};

const secondApr: VaultApr = {
  rolling_7day_apr: "22.13",
  nodo_incentive_apr: "4.20",
  campaign_aprs: [
    {
      label: "Cetus",
      apr: 15.1,
    },
  ],
  total_apr_precompounding: "41.43",
  daily_compounding_apy: "48.32",
  nodo_incentives: [
    {
      token_address:
        "0x0000000000000000000000000000000000000000000000000000000000000002::sui::SUI",
      token_symbol: "SUI",
      daily_amount: 3200,
      daily_amount_tokens: 3200,
      daily_amount_usd: 5200,
      decimals: 9,
      price_usd: 1.62,
    },
  ],
};

export const mockVaultDepositTokens: VaultDepositToken[] = [
  {
    token_id: 1,
    token_symbol: "USDC",
    token_name: "USDC",
    token_address:
      "0xdba34672e30cb065b1f93e3ab55318768fd6fef66c15942c9f7cb846e2f900e7::usdc::USDC",
    decimal: 6,
  },
  {
    token_id: 2,
    token_symbol: "SUI",
    token_name: "SUI",
    token_address:
      "0x0000000000000000000000000000000000000000000000000000000000000002::sui::SUI",
    decimal: 9,
  },
  {
    token_id: 3,
    token_symbol: "BTC",
    token_name: "Wrapped BTC",
    token_address:
      "0xaafb102dd0902f5055cadecd687fb5b71ca82ef0e0285d90afde828ec58ca96b::btc::BTC",
    decimal: 8,
  },
  {
    token_id: 4,
    token_symbol: "ETH",
    token_name: "Wrapped ETH",
    token_address:
      "0x42af1235b5c3373ad98b4366345792bd3d8b31abc4ed29156c7cc8e9ae4f7c1d::eth::ETH",
    decimal: 8,
  },
];

export const mockDepositVaults: DepositVaultConfig[] = [
  {
    id: 1,
    vault_id: "0xvault-usdc-sui",
    vault_module: "vault_module",
    apr: 36.4,
    apy: 42.1,
    reward_24h: 12500,
    is_active: true,
    vault_lp_token:
      "0xvaultusdc::ndlp::NDLP_USDC_SUI",
    vault_lp_token_decimals: 6,
    collateral_token:
      "0xdba34672e30cb065b1f93e3ab55318768fd6fef66c15942c9f7cb846e2f900e7::usdc::USDC",
    collateral_token_decimals: 6,
    vault_name: "NODO AI - USDC/SUI",
    vault_address: "0xvaultaddressusdc",
    exchange_id: 1,
    total_value_usd: "54234012.32",
    rewards_24h_usd: "15892.12",
    vault_apy: "118.62",
    user_balance_usd: 1250000,
    metadata: {
      package_id: "0xpackageusdc",
      vault_module: "vault_module",
      vault_config_id: "0xconfigusdc",
      exchange_id: 1,
      pool: "USDC-SUI",
    },
    pool: {
      pool_name: "USDC-SUI",
      pool_address: "0xpoolusdc",
      token_a_address:
        "0xdba34672e30cb065b1f93e3ab55318768fd6fef66c15942c9f7cb846e2f900e7::usdc::USDC",
      token_b_address:
        "0x0000000000000000000000000000000000000000000000000000000000000002::sui::SUI",
    },
    tokens: [
      {
        token_id: 1,
        token_symbol: "USDC",
        token_name: "USDC",
        token_address:
          "0xdba34672e30cb065b1f93e3ab55318768fd6fef66c15942c9f7cb846e2f900e7::usdc::USDC",
        decimal: 6,
        url: "",
        exchange_id: 1,
        min_deposit_amount: "10",
        min_deposit_amount_usd: "10",
        max_deposit_amount: "5000000",
      },
      {
        token_id: 2,
        token_symbol: "SUI",
        token_name: "SUI",
        token_address:
          "0x0000000000000000000000000000000000000000000000000000000000000002::sui::SUI",
        decimal: 9,
        url: "",
        exchange_id: 1,
        min_deposit_amount: "1",
        min_deposit_amount_usd: "1.5",
        max_deposit_amount: "2500000",
      },
    ],
    ready: true,
    user_pending_withdraw_ndlp: "150000000",
    ndlp_price_usd: "1.52",
    ndlp_price: "1.02",
    change_24h: [
      {
        amount: "125000",
        amount_in_usd: "125000",
        token_name: "USDC",
        token_symbol: "USDC",
        percent_change: 3.2,
      },
    ],
    ...baseApr,
  } as DepositVaultConfig & VaultApr,
  {
    id: 2,
    vault_id: "0xvault-btc-eth",
    vault_module: "vault_module",
    apr: 41.43,
    apy: 48.32,
    reward_24h: 18200,
    is_active: true,
    vault_lp_token: "0xvaultbtc::ndlp::NDLP_BTC_ETH",
    vault_lp_token_decimals: 6,
    collateral_token:
      "0xaafb102dd0902f5055cadecd687fb5b71ca82ef0e0285d90afde828ec58ca96b::btc::BTC",
    collateral_token_decimals: 8,
    vault_name: "NODO AI - BTC/ETH",
    vault_address: "0xvaultaddressbtc",
    exchange_id: 2,
    total_value_usd: "78234045.88",
    rewards_24h_usd: "24650.67",
    vault_apy: "132.11",
    user_balance_usd: 2200000,
    metadata: {
      package_id: "0xpackagebtc",
      vault_module: "vault_module",
      vault_config_id: "0xconfigbtc",
      exchange_id: 2,
      pool: "BTC-ETH",
    },
    pool: {
      pool_name: "BTC-ETH",
      pool_address: "0xpoolbtc",
      token_a_address:
        "0xaafb102dd0902f5055cadecd687fb5b71ca82ef0e0285d90afde828ec58ca96b::btc::BTC",
      token_b_address:
        "0x42af1235b5c3373ad98b4366345792bd3d8b31abc4ed29156c7cc8e9ae4f7c1d::eth::ETH",
    },
    tokens: [
      {
        token_id: 3,
        token_symbol: "BTC",
        token_name: "Wrapped BTC",
        token_address:
          "0xaafb102dd0902f5055cadecd687fb5b71ca82ef0e0285d90afde828ec58ca96b::btc::BTC",
        decimal: 8,
        url: "",
        exchange_id: 2,
        min_deposit_amount: "0.01",
        min_deposit_amount_usd: "600",
        max_deposit_amount: "2000",
      },
      {
        token_id: 4,
        token_symbol: "ETH",
        token_name: "Wrapped ETH",
        token_address:
          "0x42af1235b5c3373ad98b4366345792bd3d8b31abc4ed29156c7cc8e9ae4f7c1d::eth::ETH",
        decimal: 8,
        url: "",
        exchange_id: 2,
        min_deposit_amount: "0.01",
        min_deposit_amount_usd: "35",
        max_deposit_amount: "5000",
      },
    ],
    ready: true,
    user_pending_withdraw_ndlp: "25000000",
    ndlp_price_usd: "32654.11",
    ndlp_price: "0.98",
    change_24h: [
      {
        amount: "450000",
        amount_in_usd: "450000",
        token_name: "BTC",
        token_symbol: "BTC",
        percent_change: 4.8,
      },
    ],
    ...secondApr,
  } as DepositVaultConfig & VaultApr,
];

export const mockVaultBasicDetails: Record<string, BasicVaultDetailsType> = {
  "0xvault-usdc-sui": {
    id: "1",
    vault_id: "0xvault-usdc-sui",
    vault_name: "NODO AI - USDC/SUI",
    vault_address: "0xvaultaddressusdc",
    vault_module: "vault_module",
    collateral_token:
      "0xdba34672e30cb065b1f93e3ab55318768fd6fef66c15942c9f7cb846e2f900e7::usdc::USDC",
    collateral_token_decimals: 6,
    vault_lp_token:
      "0xvaultusdc::ndlp::NDLP_USDC_SUI",
    vault_lp_token_decimals: 6,
    total_value_usd: "54234012.32",
    pool_total_value_usd: 54234012.32,
    total_value_collateral: 54234012.32,
    pool_apr: "38.11",
    vault_apr: "36.40",
    vault_apy: "42.10",
    ndlp_price: "1.02",
    ndlp_price_usd: "1.52",
    ndlp_price_7d: "1.48",
    ndlp_price_change_7d: 6.2,
    user_break_even_price: 1.14,
    ndlp_price_change_24h: 2.8,
    ndlp_total_supply: "54321123.53321",
    rewards_24h_usd: "15892.12",
    rewards_24h_collateral: 10467.12,
    rewards_24h_daily_rate: 0.012,
    nodo_share: 0.2,
    management_fee: 2,
    performance_fee: 15,
    user_balance: 1250000,
    pool: {
      pool_id: 1,
      pool_name: "USDC-SUI",
      exchange_id: 1,
      fee_tier: "0.3%",
      pool_address: "0xpoolusdc",
      pool_type: "CLAMM",
      token_a_address:
        "0xdba34672e30cb065b1f93e3ab55318768fd6fef66c15942c9f7cb846e2f900e7::usdc::USDC",
      token_b_address:
        "0x0000000000000000000000000000000000000000000000000000000000000002::sui::SUI",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      token_a: {
        token_id: 1,
        token_symbol: "USDC",
        token_name: "USDC",
        token_address:
          "0xdba34672e30cb065b1f93e3ab55318768fd6fef66c15942c9f7cb846e2f900e7::usdc::USDC",
        decimal: 6,
        price_feed_id: "price-feed-usdc",
      },
      token_b: {
        token_id: 2,
        token_symbol: "SUI",
        token_name: "SUI",
        token_address:
          "0x0000000000000000000000000000000000000000000000000000000000000002::sui::SUI",
        decimal: 9,
        price_feed_id: "price-feed-sui",
      },
    },
    exchange: "Cetus",
    exchange_id: 1,
    tokens: mockDepositVaults[0].tokens,
    reward_tokens: [
      {
        token_name: "NODO",
        token_symbol: "NODO",
        token_address: "0xnodoreward",
        decimal: 9,
      },
    ],
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    metadata: {
      package_id: "0xpackageusdc",
      vault_module: "vault_module",
      vault_config_id: "0xconfigusdc",
      vault_id: "0xvault-usdc-sui",
      exchange_id: 1,
      withdraw_interval: 3600,
      pool: "USDC-SUI",
      executor: {
        default: {
          config: "0xexecutorconfig",
          module: "executor",
          address: "0xexecutoraddress",
        },
      },
      is_enable_dual_token: true,
    },
    user_pending_withdraw_ndlp: "150000000",
    max_drawdown: "-4.5",
    user_investment_usd: 950000,
    collateral_price_feed_id: "price-feed-usdc",
    change_24h: [
      {
        amount: "125000",
        amount_in_usd: "125000",
        token_name: "USDC",
        token_symbol: "USDC",
        percent_change: 3.2,
      },
      {
        amount: "82000",
        amount_in_usd: "120000",
        token_name: "SUI",
        token_symbol: "SUI",
        percent_change: 4.2,
      },
    ],
    ...baseApr,
  },
  "0xvault-btc-eth": {
    id: "2",
    vault_id: "0xvault-btc-eth",
    vault_name: "NODO AI - BTC/ETH",
    vault_address: "0xvaultaddressbtc",
    vault_module: "vault_module",
    collateral_token:
      "0xaafb102dd0902f5055cadecd687fb5b71ca82ef0e0285d90afde828ec58ca96b::btc::BTC",
    collateral_token_decimals: 8,
    vault_lp_token: "0xvaultbtc::ndlp::NDLP_BTC_ETH",
    vault_lp_token_decimals: 6,
    total_value_usd: "78234045.88",
    pool_total_value_usd: 78234045.88,
    total_value_collateral: 78234045.88,
    pool_apr: "40.21",
    vault_apr: "41.43",
    vault_apy: "48.32",
    ndlp_price: "0.98",
    ndlp_price_usd: "32654.11",
    ndlp_price_7d: "32012.45",
    ndlp_price_change_7d: 8.4,
    user_break_even_price: 28100,
    ndlp_price_change_24h: 3.7,
    ndlp_total_supply: "23877222.1122",
    rewards_24h_usd: "24650.67",
    rewards_24h_collateral: 0.75,
    rewards_24h_daily_rate: 0.016,
    nodo_share: 0.18,
    management_fee: 1.5,
    performance_fee: 12,
    user_balance: 2200000,
    pool: {
      pool_id: 2,
      pool_name: "BTC-ETH",
      exchange_id: 2,
      fee_tier: "0.05%",
      pool_address: "0xpoolbtc",
      pool_type: "CLAMM",
      token_a_address:
        "0xaafb102dd0902f5055cadecd687fb5b71ca82ef0e0285d90afde828ec58ca96b::btc::BTC",
      token_b_address:
        "0x42af1235b5c3373ad98b4366345792bd3d8b31abc4ed29156c7cc8e9ae4f7c1d::eth::ETH",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      token_a: {
        token_id: 3,
        token_symbol: "BTC",
        token_name: "Wrapped BTC",
        token_address:
          "0xaafb102dd0902f5055cadecd687fb5b71ca82ef0e0285d90afde828ec58ca96b::btc::BTC",
        decimal: 8,
        price_feed_id: "price-feed-btc",
      },
      token_b: {
        token_id: 4,
        token_symbol: "ETH",
        token_name: "Wrapped ETH",
        token_address:
          "0x42af1235b5c3373ad98b4366345792bd3d8b31abc4ed29156c7cc8e9ae4f7c1d::eth::ETH",
        decimal: 8,
        price_feed_id: "price-feed-eth",
      },
    },
    exchange: "Bluefin",
    exchange_id: 2,
    tokens: mockDepositVaults[1].tokens,
    reward_tokens: [
      {
        token_name: "BTC",
        token_symbol: "BTC",
        token_address:
          "0xaafb102dd0902f5055cadecd687fb5b71ca82ef0e0285d90afde828ec58ca96b::btc::BTC",
        decimal: 8,
      },
      {
        token_name: "ETH",
        token_symbol: "ETH",
        token_address:
          "0x42af1235b5c3373ad98b4366345792bd3d8b31abc4ed29156c7cc8e9ae4f7c1d::eth::ETH",
        decimal: 8,
      },
    ],
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    metadata: {
      package_id: "0xpackagebtc",
      vault_module: "vault_module",
      vault_config_id: "0xconfigbtc",
      vault_id: "0xvault-btc-eth",
      exchange_id: 2,
      withdraw_interval: 7200,
      pool: "BTC-ETH",
      executor: {
        default: {
          config: "0xexecutorb",
          module: "executor",
          address: "0xexecutorbtc",
        },
      },
      is_enable_dual_token: true,
    },
    user_pending_withdraw_ndlp: "25000000",
    max_drawdown: "-3.1",
    user_investment_usd: 1800000,
    collateral_price_feed_id: "price-feed-btc",
    change_24h: [
      {
        amount: "0.55",
        amount_in_usd: "22500",
        token_name: "BTC",
        token_symbol: "BTC",
        percent_change: 4.8,
      },
      {
        amount: "1.8",
        amount_in_usd: "6200",
        token_name: "ETH",
        token_symbol: "ETH",
        percent_change: 3.9,
      },
    ],
    ...secondApr,
  },
};

export const mockSCVaultConfigs: Record<string, SCVaultConfig> = {
  "0xvault-usdc-sui": {
    available_liquidity: "1500000000000",
    coin_base: { type: "0x1::mock::BASE", fields: { name: "Mock" } },
    coin_store: {
      type: "0x1::coin::CoinStore",
      fields: {
        coin: {
          type: "0x1::coin::Coin",
          fields: {
            balance: "1500000000000",
            id: { id: "0xcoinid" },
          },
        },
      },
    },
    deny_cap: {
      type: "0x1::deny::Cap",
      fields: { allow_global_pause: false, id: { id: "0xdenied" } },
    },
    deposit: {
      type: "0x1::deposit::Config",
      fields: {
        fee_bps: "30",
        min: "1000000",
        total_fee: "0",
      },
    },
    enable: true,
    fee_receiver: "0xfee",
    harvest_asset_keys: [],
    harvest_assets: { type: "0x1::bag::Bag", fields: { id: { id: "0xbag" }, size: "0" } },
    id: { id: "0xvault-usdc-sui" },
    last_update: Date.now().toString(),
    liquidity: "1250000000000",
    lock_duration_ms: "60000",
    lp_storage: { type: "0x1::vec_map::VecMap", fields: { contents: [] } },
    management_fee: {
      type: "0x1::fee::ManagementFee",
      fields: {
        fee_bps: "200",
        id: { id: "0xmanagement" },
        latest_withdraw_time: Date.now().toString(),
        period_duration: "86400000",
        total_claimed_fee: "0",
        total_fee: "0",
        total_pending_redeem_fee: "0",
      },
    },
    owner: "0xowner",
    pending_redeems: { type: "0x1::table::Table", fields: { id: { id: "0xredeem" }, size: "0" } },
    pending_redemptions: "0",
    performance_fee: {
      type: "0x1::fee::PerformanceFee",
      fields: {
        fee_bps: "1500",
        id: { id: "0xperformance" },
        total_available_fee: "0",
        total_claimed_fee: "0",
        total_fee: "0",
        total_pending_redeem_fee: "0",
      },
    },
    profit: "0",
    rate: "1000000",
    token_type: { type: "0x1::mock::TOKEN", fields: { name: "Mock" } },
    total_liquidity: "1500000000000",
    treasury_cap: {
      type: "0x1::treasury::Cap",
      fields: {
        id: { id: "0xtreasury" },
        total_supply: {
          type: "0x1::supply::Supply",
          fields: { value: "5432112353321" },
        },
      },
    },
    withdraw: {
      type: "0x1::withdraw::Config",
      fields: {
        fee_bps: "40",
        min: "1000000",
        total_fee: "0",
      },
    },
    vault_id: "0xvault-usdc-sui",
  } as unknown as SCVaultConfig,
  "0xvault-btc-eth": {
    available_liquidity: "950000000000",
    coin_base: { type: "0x1::mock::BASE", fields: { name: "Mock" } },
    coin_store: {
      type: "0x1::coin::CoinStore",
      fields: {
        coin: {
          type: "0x1::coin::Coin",
          fields: {
            balance: "950000000000",
            id: { id: "0xcoinid2" },
          },
        },
      },
    },
    deny_cap: {
      type: "0x1::deny::Cap",
      fields: { allow_global_pause: false, id: { id: "0xdenied2" } },
    },
    deposit: {
      type: "0x1::deposit::Config",
      fields: {
        fee_bps: "45",
        min: "10000",
        total_fee: "0",
      },
    },
    enable: true,
    fee_receiver: "0xfee2",
    harvest_asset_keys: [],
    harvest_assets: { type: "0x1::bag::Bag", fields: { id: { id: "0xbag2" }, size: "0" } },
    id: { id: "0xvault-btc-eth" },
    last_update: Date.now().toString(),
    liquidity: "880000000000",
    lock_duration_ms: "7200000",
    lp_storage: { type: "0x1::vec_map::VecMap", fields: { contents: [] } },
    management_fee: {
      type: "0x1::fee::ManagementFee",
      fields: {
        fee_bps: "150",
        id: { id: "0xmanagement2" },
        latest_withdraw_time: Date.now().toString(),
        period_duration: "86400000",
        total_claimed_fee: "0",
        total_fee: "0",
        total_pending_redeem_fee: "0",
      },
    },
    owner: "0xowner2",
    pending_redeems: { type: "0x1::table::Table", fields: { id: { id: "0xredeem2" }, size: "0" } },
    pending_redemptions: "0",
    performance_fee: {
      type: "0x1::fee::PerformanceFee",
      fields: {
        fee_bps: "1200",
        id: { id: "0xperformance2" },
        total_available_fee: "0",
        total_claimed_fee: "0",
        total_fee: "0",
        total_pending_redeem_fee: "0",
      },
    },
    profit: "0",
    rate: "1000000",
    token_type: { type: "0x1::mock::TOKEN", fields: { name: "Mock" } },
    total_liquidity: "950000000000",
    treasury_cap: {
      type: "0x1::treasury::Cap",
      fields: {
        id: { id: "0xtreasury2" },
        total_supply: {
          type: "0x1::supply::Supply",
          fields: { value: "238772221122" },
        },
      },
    },
    withdraw: {
      type: "0x1::withdraw::Config",
      fields: {
        fee_bps: "60",
        min: "20000",
        total_fee: "0",
      },
    },
    vault_id: "0xvault-btc-eth",
  } as unknown as SCVaultConfig,
};

export const mockVaultHoldings: Record<string, VaultHoldingType> = {
  "0xvault-usdc-sui": {
    vault_id: "0xvault-usdc-sui",
    user_wallet: "0xmockwallet",
    code: "OKX",
    timestamp: new Date().toISOString(),
    user_ndlp_balance: 950000,
    vault_total_supply: "54321123.53321",
    ndlp_price: "1.02",
    ndlp_price_usd: "1.52",
    user_total_liquidity_usd: 1450000,
    user_total_rewards_usd: 55210.22,
    user_total_rewards_collateral: 52000,
    user_total_deposit: 925000,
    user_total_deposit_usd: 925000,
    user_total_deposit_collateral: 925000,
    user_rewards_24h_usd: 820,
    user_rewards_24h_collateral: 790,
    user_shares_percent: 3.4,
    user_break_event_price: 1.01,
    user_break_event_price_usd: 1.45,
    user_break_event_price_collateral: 1.02,
    user_total_withdraw_usd: 12000,
    user_total_withdraw_collateral: 12000,
    user_vault_tokens: [
      {
        token_name: "USDC",
        token_symbol: "USDC",
        amount: "550000",
        amount_in_usd: "550000",
        percent_change: 4.1,
      },
    ],
    user_vault_rewards: [
      {
        token_name: "NODO",
        token_symbol: "NODO",
        amount: "1200",
        amount_in_usd: "4200",
        percent_change: 5.4,
      },
    ],
  },
  "0xvault-btc-eth": {
    vault_id: "0xvault-btc-eth",
    user_wallet: "0xmockwallet",
    code: "Bluefin",
    timestamp: new Date().toISOString(),
    user_ndlp_balance: 65000,
    vault_total_supply: "23877222.1122",
    ndlp_price: "0.98",
    ndlp_price_usd: "32654.11",
    user_total_liquidity_usd: 2110000,
    user_total_rewards_usd: 82110.45,
    user_total_rewards_collateral: 4.2,
    user_total_deposit: 1780000,
    user_total_deposit_usd: 1780000,
    user_total_deposit_collateral: 4.8,
    user_rewards_24h_usd: 1520,
    user_rewards_24h_collateral: 0.03,
    user_shares_percent: 2.1,
    user_break_event_price: 25000,
    user_break_event_price_usd: 25000,
    user_break_event_price_collateral: 0.76,
    user_total_withdraw_usd: 65000,
    user_total_withdraw_collateral: 0.5,
    user_vault_tokens: [
      {
        token_name: "BTC",
        token_symbol: "BTC",
        amount: "1.25",
        amount_in_usd: "82000",
        percent_change: 3.8,
      },
      {
        token_name: "ETH",
        token_symbol: "ETH",
        amount: "18.2",
        amount_in_usd: "62000",
        percent_change: 4.6,
      },
    ],
    user_vault_rewards: [
      {
        token_name: "BTC",
        token_symbol: "BTC",
        amount: "0.012",
        amount_in_usd: "420",
        percent_change: 5.2,
      },
    ],
  },
};

export const mockWithdrawalRequests: WithdrawalRequests[] = [
  {
    id: "req-1",
    vault_id: "0xvault-usdc-sui",
    user_reward_earned_usd: "1520.44",
    withdrawals: [
      {
        withdraw_time_requests: [Date.now() + 3600 * 1000],
        token: {
          token_id: 1,
          token_symbol: "USDC",
          token_name: "USDC",
          token_address:
            "0xdba34672e30cb065b1f93e3ab55318768fd6fef66c15942c9f7cb846e2f900e7::usdc::USDC",
          decimal: 6,
          url: "",
          exchange_id: 1,
          min_deposit_amount: "10",
          min_deposit_amount_usd: "10",
        },
        requests: [
          {
            id: "req-item-1",
            status: "PENDING",
            sender: "0xmockwallet",
            ndlp_amount: "5000000",
            withdraw_amount: "5000",
            ndlp_rate: 1.02,
            max_receive_amount: "5200",
            receive_amount: "5100",
            receive_amount_usd: "5100",
            receive_amount_token_price: "1",
            user_receive_amount: "5100",
            receive_amount_collateral: "5100",
            update_status: null,
            timestamp: Date.now(),
            withdraw_at: new Date(Date.now() + 3600 * 1000).toISOString(),
            expired_at: new Date(Date.now() + 7200 * 1000).toISOString(),
          },
        ],
        withdrawal_ndlp_amount: "5000000",
        is_ready: true,
        receive_amount: "5100",
        receive_amount_usd: "5100",
        receive_amount_token_price: "1",
        withdraw_amount_requests: ["5000"],
        withdraw_amount_collateral_requests: ["5000"],
        expire_time: Date.now() + 7200 * 1000,
        sig_token: "signature-token",
        countdown: Date.now() + 3600 * 1000,
        pks: ["0xpk1"],
        signatures: ["0xsig1"],
      },
    ],
  },
];

export const mockVaultEstimatesDeposit: Record<string, VaultEstimateDeposit> = {
  "0xvault-usdc-sui": {
    estimated_ndlp: "98500",
    collateral_amount: "100000",
    ndlp_per_deposit_rate: 0.985,
    ndlp_rate: 1.52,
  },
  "0xvault-btc-eth": {
    estimated_ndlp: "2.5",
    collateral_amount: "3",
    ndlp_per_deposit_rate: 0.833,
    ndlp_rate: 32654.11,
  },
};

export const mockVaultEstimateWithdraw: Record<string, VaultEstimateWithdraw> = {
  "0xvault-usdc-sui": {
    estimated_payout_amount: "50500",
    collateral_amount: "50000",
    ndlp_per_payout_rate: 1.01,
    ndlp_rate: 1.52,
  },
  "0xvault-btc-eth": {
    estimated_payout_amount: "85000",
    collateral_amount: "2.4",
    ndlp_per_payout_rate: 0.96,
    ndlp_rate: 32654.11,
  },
};

export const mockVaultEstimateWithdrawDual: Record<
  string,
  VaultEstimateWithdrawDual
> = {
  "0xvault-usdc-sui": {
    amount_a: "30000",
    amount_b: "25000",
    ndlp_rate: 1.52,
    collateral_amount: "55000",
    collateral_in_usd: "55000",
    price_a: "1",
    price_b: "1.12",
  },
  "0xvault-btc-eth": {
    amount_a: "0.75",
    amount_b: "12",
    ndlp_rate: 32654.11,
    collateral_amount: "85000",
    collateral_in_usd: "85000",
    price_a: "56000",
    price_b: "3500",
  },
};

export const mockVaultSwapDepositInfo: Record<string, VaultSwapDepositInfo> = {
  "0xvault-usdc-sui": {
    vault_package_id: "0xpackageusdc",
    vault_config: "0xconfigusdc",
    vault_id: "0xvault-usdc-sui",
    vault_collateral_token:
      "0xdba34672e30cb065b1f93e3ab55318768fd6fef66c15942c9f7cb846e2f900e7::usdc::USDC",
    vault_lp_token:
      "0xvaultusdc::ndlp::NDLP_USDC_SUI",
    pool_address: "0xpoolusdc",
    pool_token_a_type:
      "0xdba34672e30cb065b1f93e3ab55318768fd6fef66c15942c9f7cb846e2f900e7::usdc::USDC",
    pool_token_b_type:
      "0x0000000000000000000000000000000000000000000000000000000000000002::sui::SUI",
    vault_package_module: "swap_module",
    vault_package_function: "swap_and_deposit",
    global_config: "0xglobalconfig",
    version: "1",
  },
  "0xvault-btc-eth": {
    vault_package_id: "0xpackagebtc",
    vault_config: "0xconfigbtc",
    vault_id: "0xvault-btc-eth",
    vault_collateral_token:
      "0xaafb102dd0902f5055cadecd687fb5b71ca82ef0e0285d90afde828ec58ca96b::btc::BTC",
    vault_lp_token: "0xvaultbtc::ndlp::NDLP_BTC_ETH",
    pool_address: "0xpoolbtc",
    pool_token_a_type:
      "0xaafb102dd0902f5055cadecd687fb5b71ca82ef0e0285d90afde828ec58ca96b::btc::BTC",
    pool_token_b_type:
      "0x42af1235b5c3373ad98b4366345792bd3d8b31abc4ed29156c7cc8e9ae4f7c1d::eth::ETH",
    vault_package_module: "swap_module",
    vault_package_function: "swap_and_deposit",
    global_config: "0xglobalconfigbtc",
    version: "1",
  },
};

export const mockNdlpPrices: NdlpTokenPrice[] = [
  {
    vault_id: "0xvault-usdc-sui",
    ndlp_price: "1.52",
    ndlp_price_usd: "1.52",
  },
  {
    vault_id: "0xvault-btc-eth",
    ndlp_price: "32654.11",
    ndlp_price_usd: "32654.11",
  },
];

export const mockTokenUsdPrices: TokenUsdPrice[] = [
  {
    token_id: 1,
    price: 1,
  },
  {
    token_id: 2,
    price: 1.62,
  },
  {
    token_id: 3,
    price: 56000,
  },
  {
    token_id: 4,
    price: 3500,
  },
];

const analyticsPoints = Array.from({ length: 90 }).map((_, index) => {
  const baseTimestamp = Date.now() - (90 - index) * 3600 * 1000;
  const basePrice = 1.5 + Math.sin(index / 5) * 0.05;
  return {
    value: {
      real: basePrice,
      lower: basePrice - 0.08,
      upper: basePrice + 0.12,
      date: baseTimestamp,
    },
  };
});

export const mockVaultAnalytics = (
  _vaultId: string,
  _type: string,
  _range: string
) => ({
  list: analyticsPoints,
});

export const mockVaultActivities: TransactionHistory = {
  list: Array.from({ length: 12 }).map((_, index) => ({
    id: `activity-${index}`,
    type: index % 3 === 0 ? "ADD_LIQUIDITY" : index % 3 === 1 ? "SWAP" : "REMOVE_LIQUIDITY",
    time: new Date(Date.now() - index * 3600 * 1000).toISOString(),
    vault_address: index % 2 === 0 ? "0xvaultaddressusdc" : "0xvaultaddressbtc",
    tokens: [
      {
        token_id: 1,
        token_name: "USDC",
        token_symbol: "USDC",
        token_address:
          "0xdba34672e30cb065b1f93e3ab55318768fd6fef66c15942c9f7cb846e2f900e7::usdc::USDC",
        decimal: 6,
        amount: 15000 + index * 100,
        price: "1",
        url: "",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ],
    txhash: `0xmocktx${index}`,
    status: index % 2 === 0 ? "SUCCESS" : "PENDING",
    value_usd: (15000 + index * 100).toString(),
    value_collateral: 15000 + index * 100,
  })),
  total: 12,
  page: 1,
  limit: 5,
};

export const mockNdlpPriceChart: NdlpPriceChartData[] = Array.from({
  length: 30,
}).map((_, index) => {
  const timestamp = Date.now() - (30 - index) * 24 * 3600 * 1000;
  const price = 1.45 + Math.sin(index / 3) * 0.06;
  return {
    code: "USDC-SUI",
    timestamp: new Date(timestamp).toISOString(),
    ndlp_price: Number(price.toFixed(4)),
    ndlp_price_usd: Number(price.toFixed(4)),
    performance_percent: Number((Math.sin(index / 4) * 10).toFixed(2)),
    user_break_event_price: Number((price * 0.98).toFixed(4)),
    user_break_event_price_usd: Number((price * 0.98).toFixed(4)),
  };
});

export const mockVaultNdlpPriceChart: NdlpPriceChartData[] = Array.from({
  length: 60,
}).map((_, index) => {
  const timestamp = Date.now() - (60 - index) * 12 * 3600 * 1000;
  const price = 32500 + Math.sin(index / 4) * 1500;
  return {
    code: "BTC-ETH",
    timestamp: new Date(timestamp).toISOString(),
    ndlp_price: Number(price.toFixed(2)),
    ndlp_price_usd: Number(price.toFixed(2)),
    performance_percent: Number((Math.cos(index / 5) * 6).toFixed(2)),
    user_break_event_price: Number((price * 0.97).toFixed(2)),
    user_break_event_price_usd: Number((price * 0.97).toFixed(2)),
  };
});

export const mockExecutionProfitData = {
  vault_value: "100000000",
  profit_amount: "500000",
  negative: false,
  expire_time: Date.now() + 600000,
  last_credit_time: Date.now(),
  signer_public_keys: ["0xpk1", "0xpk2"],
  signatures: ["0xsig1", "0xsig2"],
};
