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

// Vault config on Sui
export type VaultConfig = {
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
};

// Deposit vault config on Backend
export type DepositVaultConfig = {
  vault_id: string;
  vault_module: string;
  apr: number;
  total_users: number;
  is_active: boolean;
  vault_lp_token: string;
  vault_lp_token_decimals: number;
  collateral_token: string;
  collateral_token_decimals: number;
  vault_name: string;
  metadata: {
    package_id: string;
    vault_config_id: string;
    exchange_id: number;
  };
  pool: {
    pool_name: string;
  };
  ready?: boolean;
};
