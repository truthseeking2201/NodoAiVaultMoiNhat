import { VaultPaymentToken } from "./vault-config.types";

export default interface PaymentTokenType extends VaultPaymentToken {
  image?: string;
}
