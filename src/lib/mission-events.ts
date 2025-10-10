export const MISSION_DEPOSIT_PREFILL_EVENT = "mission:deposit-prefill";

export type MissionDepositPrefillDetail = {
  amountUsd: number;
};

export function dispatchMissionDepositPrefill(amountUsd: number) {
  window.dispatchEvent(
    new CustomEvent<MissionDepositPrefillDetail>(
      MISSION_DEPOSIT_PREFILL_EVENT,
      {
        detail: { amountUsd },
      }
    )
  );
}

export type MissionDepositPrefillListener = (
  event: CustomEvent<MissionDepositPrefillDetail>
) => void;

export function addMissionDepositPrefillListener(
  listener: MissionDepositPrefillListener
) {
  window.addEventListener(
    MISSION_DEPOSIT_PREFILL_EVENT,
    listener as EventListener
  );
  return () => {
    window.removeEventListener(
      MISSION_DEPOSIT_PREFILL_EVENT,
      listener as EventListener
    );
  };
}

