interface ObjectId {
  id: string;
}

interface TypeName {
  type: string;
  fields: {
    name: string;
  };
}

interface Coin<T> {
  type: string;
  fields: {
    balance: string;
    id: ObjectId;
  };
}

interface CoinStore<T> {
  type: string;
  fields: {
    coin: Coin<T>;
  };
}

interface DenyCap<T> {
  type: string;
  fields: {
    allow_global_pause: boolean;
    id: ObjectId;
  };
}

interface Deposit {
  type: string;
  fields: {
    fee_bps: string;
    min: string;
    total_fee: string;
  };
}

interface Bag {
  type: string;
  fields: {
    id: ObjectId;
    size: string;
  };
}

interface VecMap {
  type: string;
  fields: {
    contents: any[];
  };
}

interface ManagementFee {
  type: string;
  fields: {
    fee_bps: string;
    id: ObjectId;
    latest_withdraw_time: string;
    period_duration: string;
    total_claimed_fee: string;
    total_fee: string;
    total_pending_redeem_fee: string;
  };
}

interface Table<T> {
  type: string;
  fields: {
    id: ObjectId;
    size: string;
  };
}

interface PerformanceFee {
  type: string;
  fields: {
    fee_bps: string;
    id: ObjectId;
    total_available_fee: string;
    total_claimed_fee: string;
    total_fee: string;
    total_pending_redeem_fee: string;
  };
}

interface Withdraw {
  type: string;
  fields: {
    fee_bps: string;
    min: string;
    total_fee: string;
  };
}

interface Supply<T> {
  type: string;
  fields: {
    value: string;
  };
}

interface TreasuryCap<T> {
  type: string;
  fields: {
    id: ObjectId;
    total_supply: Supply<T>;
  };
}

// Vault config on Sui smart contract
export type SCVaultConfig = {
  available_liquidity: string;
  coin_base: TypeName;
  coin_store: CoinStore<string>;
  deny_cap: DenyCap<string>;
  deposit: Deposit;
  enable: boolean;
  fee_receiver: string;
  harvest_asset_keys: string[];
  harvest_assets: Bag;
  id: ObjectId;
  last_update: string;
  liquidity: string;
  lock_duration_ms: string;
  lp_storage: VecMap;
  management_fee: ManagementFee;
  owner: string;
  pending_redeems: Table<string>;
  pending_redemptions: string;
  performance_fee: PerformanceFee;
  profit: string;
  rate: string;
  token_type: TypeName;
  total_liquidity: string;
  treasury_cap: TreasuryCap<string>;
  withdraw: Withdraw;
  vault_id: string;
};

export type VaultPaymentToken = {
  token_id: number;
  token_symbol: string;
  token_name: string;
  token_address: string;
  decimal: number;
  url: string;
  exchange_id: number;
  min_deposit_amount: string;
  max_deposit_amount: string;
};

// Deposit vault config on Backend
export type DepositVaultConfig = {
  id: number;
  vault_id: string;
  vault_module: string;
  apr: number;
  apy: number;
  reward_24h: number;
  is_active: boolean;
  vault_lp_token: string;
  vault_lp_token_decimals: number;
  collateral_token: string;
  collateral_token_decimals: number;
  vault_name: string;
  vault_address: string;
  exchange_id: number;
  total_value_usd: string;
  rewards_24h_usd: string;
  vault_apy: string;
  user_balance_usd: number;
  metadata: {
    package_id: string;
    vault_module: string;
    vault_config_id: string;
    exchange_id: number;
    pool: string;
  };
  pool: {
    pool_name: string;
    pool_address: string;
    token_a_address?: string;
    token_b_address?: string;
  };
  tokens: VaultPaymentToken[];
  ready?: boolean;
  user_pending_withdraw_ndlp?: string;
};

export type VaultEstimateWithdraw = {
  estimated_payout_amount: string;
  collateral_amount: string;
  ndlp_per_payout_rate: number;
  ndlp_rate: number;
};

export type VaultEstimateDeposit = {
  estimated_ndlp: string;
  collateral_amount: string;
  ndlp_per_deposit_rate: number;
  ndlp_rate: number;
};

export type VaultSwapDepositInfo = {
  vault_package_id: string;
  vault_config: string;
  vault_id: string;
  vault_collateral_token: string;
  vault_lp_token: string;
  pool_address: string;
  pool_token_a_type: string;
  pool_token_b_type: string;
  vault_package_module: string;
  vault_package_function: string;
  global_config: string;
  version: string;
};

export type BasicVaultDetailsType = {
  id: string;
  vault_id: string;
  vault_name: string;
  vault_address: string;
  vault_module: string;
  collateral_token: string;
  collateral_token_decimals: number;
  vault_lp_token: string;
  vault_lp_token_decimals: number;
  total_value_usd: string;
  pool_total_value_usd: number;
  pool_apr: string;
  vault_apr: string;
  vault_apy: string;
  ndlp_price: string;
  ndlp_price_7d: string;
  ndlp_price_change_7d: number;
  user_break_even_price: number;
  ndlp_price_change_24h: number;
  ndlp_total_supply: string;
  rewards_24h_usd: string;
  rewards_24h_daily_rate: number;
  nodo_share: number;
  management_fee: number;
  performance_fee: number;
  user_balance: number;
  pool: {
    pool_id: number;
    pool_name: string;
    exchange_id: number;
    fee_tier: string;
    pool_address: string;
    pool_type: string;
    token_a_address: string;
    token_b_address: string;
    created_at: string;
    updated_at: string;
  };
  exchange: string;
  exchange_id: number;
  tokens: Array<{
    token_id: number;
    token_symbol: string;
    token_name: string;
    token_address: string;
    decimal: number;
    url: string;
    exchange_id: number;
    min_deposit_amount: string;
    min_deposit_amount_usd: string;
  }>;
  reward_tokens: Array<{
    token_name: string;
    token_symbol: string;
    token_address: string;
    decimal: number;
  }>;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  metadata: {
    package_id: string;
    vault_module: string;
    vault_config_id: string;
    exchange_id: number;
    pool: string;
  };
  user_pending_withdraw_ndlp?: string;
};
