import http from "@/utils/http";
import { isMockMode } from "@/config/mock";
import { mockTokenUsdPrices, mockNdlpPrices } from "@/mocks";

const URLS = {
  tokenPrices: `/data-management/external/vaults/token-prices`,
  ndlpPrices: `/data-management/external/vaults/ndlp-prices`,
};

export const getTokenPrices = (payload: number[]) => {
  if (isMockMode) {
    return Promise.resolve(
      mockTokenUsdPrices.filter((price) =>
        payload.length ? payload.includes(price.token_id) : true
      )
    );
  }
  return http.post(URLS.tokenPrices, {
    token_ids: payload,
  });
};

export const getNdlpPrices = (payload: string[]) => {
  if (isMockMode) {
    return Promise.resolve(
      mockNdlpPrices.filter((price) =>
        payload.length ? payload.includes(price.vault_id) : true
      )
    );
  }
  return http.post(URLS.ndlpPrices, {
    vault_addresses: payload,
  });
};
