import { useEffect, useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/components/ui/use-toast";
import { useCreatePool } from "../hooks/use-community";
import { Visibility, ScoreMetric } from "../types";
import { cn } from "@/lib/utils";

const scoringOptions: Array<{ value: ScoreMetric; label: string; description: string }> = [
  {
    value: "pnl_pct_weekly",
    label: "Weekly PnL %",
    description: "Ranks by percentage return in the last 7 days.",
  },
  {
    value: "pnl_usd_weekly",
    label: "Weekly PnL USD",
    description: "Ranks by absolute profit in USD for the past week.",
  },
];

type CreatePoolModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  vaultId: string;
  onCreated?: (poolId: string, inviteUrl: string) => void;
};

type FormState = {
  name: string;
  visibility: Visibility;
  maxMembers: number;
  eligibilityThreshold: string;
  scoring: ScoreMetric;
};

const defaultState: FormState = {
  name: "",
  visibility: "private",
  maxMembers: 10,
  eligibilityThreshold: "",
  scoring: "pnl_pct_weekly",
};

const CreatePoolModal = ({ open, onOpenChange, vaultId, onCreated }: CreatePoolModalProps) => {
  const [form, setForm] = useState<FormState>(defaultState);
  const { toast } = useToast();
  const createPool = useCreatePool();

  useEffect(() => {
    if (open) {
      setForm(defaultState);
    }
  }, [open]);

  const parsedThreshold = useMemo(() => {
    const value = parseFloat(form.eligibilityThreshold);
    return Number.isFinite(value) && value > 0 ? value : undefined;
  }, [form.eligibilityThreshold]);

  const isValid = useMemo(() => {
    return form.name.trim().length > 0 && form.maxMembers >= 2;
  }, [form.name, form.maxMembers]);

  const handleSubmit = async () => {
    if (!isValid || createPool.isPending) return;
    try {
      const result = await createPool.mutateAsync({
        vaultId,
        name: form.name.trim(),
        visibility: form.visibility,
        maxMembers: form.maxMembers,
        eligibilityThresholdUSD: parsedThreshold,
        scoring: form.scoring,
      });
      toast({
        title: "Pool created",
        description: "Invite your friends or share the link to get started.",
      });
      onOpenChange(false);
      onCreated?.(result.poolId, result.inviteUrl);
    } catch (error: any) {
      toast({
        title: "Unable to create pool",
        description: error?.message || "Something went wrong",
        variant: "error",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[520px] border border-white/10 bg-[#101214] text-white">
        <DialogHeader>
          <DialogTitle>Create Community Pool</DialogTitle>
          <DialogDescription className="text-white/60 text-sm">
            Configure a private or public group to track performance with your squad. Assets remain in individual wallets.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div>
            <Label htmlFor="pool-name" className="text-xs text-white/70">
              Pool name
            </Label>
            <Input
              id="pool-name"
              value={form.name}
              onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
              placeholder="e.g. Alpha Squad"
              className="mt-1 bg-black/40 border-white/15 text-sm"
            />
          </div>

          <div>
            <Label className="text-xs text-white/70">Visibility</Label>
            <div className="mt-2 flex gap-2">
              {["private", "public"].map((option) => (
                <button
                  key={option}
                  type="button"
                  className={cn(
                    "flex-1 rounded-md border px-3 py-2 text-sm transition-colors",
                    form.visibility === option
                      ? "border-white/40 bg-white/10 text-white"
                      : "border-white/10 text-white/70 hover:border-white/20"
                  )}
                  onClick={() =>
                    setForm((prev) => ({
                      ...prev,
                      visibility: option as Visibility,
                    }))
                  }
                >
                  {option === "private" ? "Private" : "Public"}
                </button>
              ))}
            </div>
            <p className="text-[11px] text-white/40 mt-1">
              Private pools require an invite link; public pools appear in the directory.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="max-members" className="text-xs text-white/70">
                Max members
              </Label>
              <Input
                id="max-members"
                type="number"
                min={2}
                value={form.maxMembers}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    maxMembers: Number(event.target.value),
                  }))
                }
                className="mt-1 bg-black/40 border-white/15 text-sm"
              />
            </div>
            <div>
              <Label htmlFor="threshold" className="text-xs text-white/70">
                Eligibility threshold (USD)
              </Label>
              <Input
                id="threshold"
                type="number"
                min={0}
                placeholder="Optional"
                value={form.eligibilityThreshold}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    eligibilityThreshold: event.target.value,
                  }))
                }
                className="mt-1 bg-black/40 border-white/15 text-sm"
              />
              <p className="text-[11px] text-white/40 mt-1">
                Members below this deposit stay in observer mode until they qualify.
              </p>
            </div>
          </div>

          <div>
            <Label className="text-xs text-white/70">Scoring metric</Label>
            <RadioGroup
              className="mt-2 space-y-2"
              value={form.scoring}
              onValueChange={(value) =>
                setForm((prev) => ({
                  ...prev,
                  scoring: value as ScoreMetric,
                }))
              }
            >
              {scoringOptions.map((option) => (
                <label
                  key={option.value}
                  className={cn(
                    "flex items-start gap-3 rounded-lg border px-3 py-2",
                    form.scoring === option.value
                      ? "border-white/40 bg-white/10"
                      : "border-white/15"
                  )}
                >
                  <RadioGroupItem value={option.value} className="mt-1" />
                  <div>
                    <div className="text-sm text-white">{option.label}</div>
                    <p className="text-[11px] text-white/50">{option.description}</p>
                  </div>
                </label>
              ))}
            </RadioGroup>
          </div>
        </div>

        <DialogFooter className="flex items-center justify-between gap-3">
          <Button
            type="button"
            variant="ghost"
            className="text-white/70 hover:text-white"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            type="button"
            className="bg-white text-black hover:bg-white/90"
            disabled={!isValid || createPool.isPending}
            onClick={handleSubmit}
          >
            {createPool.isPending ? "Creating..." : "Create pool"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CreatePoolModal;
