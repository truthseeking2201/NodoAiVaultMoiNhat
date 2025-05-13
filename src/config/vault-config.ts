type VaultConfig = {
  PACKAGE_ID: string;
  VAULT_CONFIG_ID: string;
  VAULT_ID: string;
};

export const RATE_DENOMINATOR = 1000000;
export const PROD_VAULT_ID =
  "0x64296a09c8babdfc9e82bbc5223211334b67ac82119393c34345ba5c336a9b05";

const VAULT_CONFIG_BY_ENV = {
  dev: {
    PACKAGE_ID:
      "0xd80a7e7f6f738bf28a4b9765256769933d309b61e228e8396f87fe37ac516cb0",
    VAULT_CONFIG_ID:
      "0xa6fc893afa760b7e319b15a6e1dae3f803d808a0f27d354af932afe3c461608c",
    VAULT_ID:
      "0xacd4204485b5855ec38e700126f94124115e793ff34743f128eac28622ae869d",
  },
  uat: {
    PACKAGE_ID:
      "0x8404e665609111801ec4231c748faf586da4e740d809c0c43ba80a5bd61f6d0a",
    VAULT_CONFIG_ID:
      "0x67cfe4a6623bd60a0908b17125cbc967975fdbfde64d81b4391bcd58680cc093",
    VAULT_ID: PROD_VAULT_ID,
  },
};

export const VAULT_CONFIG = VAULT_CONFIG_BY_ENV[
  import.meta.env.VITE_APP_ENV || "dev"
] as VaultConfig;
