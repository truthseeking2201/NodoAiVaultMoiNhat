export const DEPOSIT_PORTAL_EVENT = "deposit:open";

export type DepositPortalPayload = {
  vaultId?: string;
  amountUsd: number;
  source?: "quest" | string;
  questId?: string;
};

let pendingRequest: DepositPortalPayload | null = null;

export function openDepositModal(payload: DepositPortalPayload) {
  pendingRequest = payload;
  window.dispatchEvent(
    new CustomEvent<DepositPortalPayload>(DEPOSIT_PORTAL_EVENT, {
      detail: payload,
    })
  );
}

export function consumeDepositPortalRequest() {
  const request = pendingRequest;
  pendingRequest = null;
  return request;
}

export type DepositPortalListener = (
  event: CustomEvent<DepositPortalPayload>
) => void;

export function addDepositPortalListener(listener: DepositPortalListener) {
  const handler = listener as EventListener;
  window.addEventListener(DEPOSIT_PORTAL_EVENT, handler);
  return () => window.removeEventListener(DEPOSIT_PORTAL_EVENT, handler);
}
