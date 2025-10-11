import { useEffect, useRef, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

type QuestDepositModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultAmountUsd: number;
  onDepositConfirmed: (amountUsd: number) => void;
};

const MIN_AMOUNT = 1;

function ManageLiquidityMini({
  defaultAmount,
  onChangeAmount,
}: {
  defaultAmount: number;
  onChangeAmount: (value: number) => void;
}) {
  const [amount, setAmount] = useState<number>(defaultAmount);

  return (
    <div className="space-y-3 text-white">
      <label className="text-sm text-white/80" htmlFor="quest-deposit-amount">
        Amount (USD)
      </label>
      <input
        id="quest-deposit-amount"
        type="number"
        min={MIN_AMOUNT}
        step={1}
        value={amount}
        onChange={(event) => {
          const value = Number(event.target.value || 0);
          setAmount(value);
          onChangeAmount(value);
        }}
        className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white outline-none transition focus:border-white/30"
      />
      <p className="text-xs text-white/60">
        Deposit-only mode for quests. Withdraw and dual-token controls are
        hidden here.
      </p>
    </div>
  );
}

export function QuestDepositModal({
  open,
  onOpenChange,
  defaultAmountUsd,
  onDepositConfirmed,
}: QuestDepositModalProps) {
  const [step, setStep] = useState<"deposit" | "confirm" | "success">(
    "deposit"
  );
  const [amountUsd, setAmountUsd] = useState<number>(defaultAmountUsd);
  const confirmedAmountRef = useRef<number | null>(null);

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      if (step === "success" && confirmedAmountRef.current != null) {
        onDepositConfirmed(confirmedAmountRef.current);
      }
      confirmedAmountRef.current = null;
      setStep("deposit");
      setAmountUsd(defaultAmountUsd);
    }
    onOpenChange(nextOpen);
  };

  useEffect(() => {
    if (open) {
      setStep("deposit");
      setAmountUsd(defaultAmountUsd);
      confirmedAmountRef.current = null;
    }
  }, [open, defaultAmountUsd]);

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md border border-white/10 bg-[#111217] text-white">
        {step === "deposit" && (
          <>
            <DialogHeader>
              <DialogTitle>Deposit</DialogTitle>
            </DialogHeader>
            <ManageLiquidityMini
              defaultAmount={defaultAmountUsd}
              onChangeAmount={setAmountUsd}
            />
            <DialogFooter>
              <Button
                className="border border-white/20 bg-white/10 text-white hover:bg-white/20"
                onClick={() => setStep("confirm")}
                disabled={!Number.isFinite(amountUsd) || amountUsd < MIN_AMOUNT}
              >
                Continue
              </Button>
            </DialogFooter>
          </>
        )}

        {step === "confirm" && (
          <>
            <DialogHeader>
              <DialogTitle>Confirm Deposit</DialogTitle>
            </DialogHeader>
            <div className="space-y-3 text-sm text-white/80">
              <p>
                You are about to deposit{" "}
                <span className="font-semibold">
                  ${amountUsd.toLocaleString()}
                </span>
                .
              </p>
              <p className="text-xs text-white/60">
                Network: SUI • Vault: Quest Flow Demo
              </p>
            </div>
            <DialogFooter className="gap-2">
              <Button
                variant="outline"
                className="border-white/20 bg-white/5 text-white hover:bg-white/10"
                onClick={() => setStep("deposit")}
              >
                Back
              </Button>
              <Button
                className="border border-white/20 bg-white/10 text-white hover:bg-white/20"
                onClick={() => {
                  confirmedAmountRef.current = amountUsd;
                  setStep("success");
                }}
              >
                Confirm
              </Button>
            </DialogFooter>
          </>
        )}

        {step === "success" && (
          <>
            <DialogHeader>
              <DialogTitle>Deposit Successful</DialogTitle>
            </DialogHeader>
            <div className="space-y-3 text-sm text-white/80">
              <p>
                Your deposit of{" "}
                <span className="font-semibold">
                  ${amountUsd.toLocaleString()}
                </span>{" "}
                is confirmed.
              </p>
              <p className="text-xs text-white/60">
                Hold your balance above the requirement until the timer finishes to complete this quest.
              </p>
            </div>
            <DialogFooter>
              <Button
                className="border border-white/20 bg-white/10 text-white hover:bg-white/20"
                onClick={() => handleOpenChange(false)}
              >
                Close
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
