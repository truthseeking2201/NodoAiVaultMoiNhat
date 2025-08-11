export type DepositToken = {
  symbol: string;
  decimals: number;
  balance: string;
  min_deposit_amount: string;
  min_deposit_amount_usd: string;
  token_address: string;
  balance_usd?: string;
  usd_price?: string;
};
