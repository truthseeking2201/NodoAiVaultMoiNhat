import { useEffect, useState } from "react";
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
import { useToast } from "@/components/ui/use-toast";
import { useJoinByInvite } from "../hooks/use-community";

const parseInviteToken = (value: string) => {
  const trimmed = value.trim();
  if (!trimmed) return "";
  try {
    if (trimmed.startsWith("http")) {
      const url = new URL(trimmed, window?.location?.origin);
      const inviteQuery = url.searchParams.get("invite") || url.searchParams.get("token");
      if (inviteQuery) return inviteQuery;
    }
  } catch (err) {
    // ignore parse errors, treat raw value as token
  }
  const tokenMatch = trimmed.match(/invite=([^&]+)/);
  if (tokenMatch?.[1]) return tokenMatch[1];
  return trimmed;
};

type JoinPoolModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onJoined?: (poolId: string) => void;
};

const JoinPoolModal = ({ open, onOpenChange, onJoined }: JoinPoolModalProps) => {
  const [input, setInput] = useState("");
  const [tokenError, setTokenError] = useState<string | null>(null);
  const joinMutation = useJoinByInvite();
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      setInput("");
      setTokenError(null);
    }
  }, [open]);

  const handleSubmit = async () => {
    const token = parseInviteToken(input);
    if (!token) {
      setTokenError("Invite token required");
      return;
    }
    setTokenError(null);
    try {
      const { poolId } = await joinMutation.mutateAsync({ inviteToken: token });
      toast({ title: "Joined pool", description: "Welcome aboard." });
      onOpenChange(false);
      onJoined?.(poolId);
    } catch (error: any) {
      setTokenError(error?.message || "Unable to join with this token");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[420px] border border-white/10 bg-[#101214] text-white">
        <DialogHeader>
          <DialogTitle>Join Pool</DialogTitle>
          <DialogDescription className="text-white/60 text-sm">
            Paste an invite link or token to join a community pool. If the pool is full or the invite expired, you will see an error message below.
          </DialogDescription>
        </DialogHeader>
        <div className="py-2 space-y-4">
          <div>
            <Label htmlFor="invite-token" className="text-xs text-white/70">
              Invite link or token
            </Label>
            <Input
              id="invite-token"
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="https://...invite=token"
              className="mt-1 bg-black/40 border-white/15 text-sm"
            />
            {tokenError && (
              <p className="text-[11px] text-red-400 mt-1">{tokenError}</p>
            )}
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
            disabled={joinMutation.isPending}
            onClick={handleSubmit}
          >
            {joinMutation.isPending ? "Joining..." : "Join pool"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default JoinPoolModal;
