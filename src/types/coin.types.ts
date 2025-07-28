export interface UserCoinAsset {
  coin_type: string;
  balance: string;
  balance_string: string;
  raw_balance: string;
  image_url: string;
  decimals: number;
  display_name: string;
  name: string;
  symbol: string;
  domain_type?: "collateral" | "lp";
}
