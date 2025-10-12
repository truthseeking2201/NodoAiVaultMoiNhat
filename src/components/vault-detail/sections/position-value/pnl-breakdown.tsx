import { useCallback, useMemo, useState } from "react";
import { ChevronRight, Share2 } from "lucide-react";
import { useVaultMetricUnitStore, useWallet } from "@/hooks";
import { Button } from "@/components/ui/button";
import { SharePnlModal } from "@/components/share/SharePnlModal";
import { buildPnlSharePayload } from "@/utils/share";
import { WrapCard } from "./wrap-card";
import { FormatNumberByMetrics } from "./format-number-by-metrics";
import type { VaultHoldingType, BasicVaultDetailsType } from "@/types/vault-config.types";
import type { ShareToXRequest } from "@/types/share";

type Props = {
  data: VaultHoldingType;
  vault: BasicVaultDetailsType;
};

export const PnlBreakdown = ({ data, vault }: Props) => {
  const { unit, key } = useVaultMetricUnitStore(data?.vault_id);
  const { address } = useWallet();
  const [shareOpen, setShareOpen] = useState(false);
  const [xConnected, setXConnected] = useState(false);

  const compoundedRewards = useMemo(
    () => Number(data?.[`user_total_rewards_${key}`] ?? 0),
    [data, key]
  );

  const impermanentLoss = useMemo(
    () => Number(data?.[`impermanent_loss_${key}`] ?? 0),
    [data, key]
  );

  const netPnl = useMemo(
    () => Number(data?.[`net_pnl_${key}`] ?? 0),
    [data, key]
  );

  const netPnlUsd = Number(data?.net_pnl_usd ?? data?.[`net_pnl_usd`] ?? 0);
  const netPnlPercent =
    Number(data?.net_pnl_usd_percent ?? data?.[`net_pnl_usd_percent`] ?? 0) ||
    (typeof netPnlUsd === "number" && Number.isFinite(netPnlUsd)
      ? (() => {
          const deposits = Number(data?.user_total_deposit_usd ?? 0);
          if (!deposits) return 0;
          return (netPnlUsd / deposits) * 100;
        })()
      : 0);

  const sharePayload = useMemo(
    () =>
      buildPnlSharePayload({
        vaultId: data?.vault_id ?? vault?.vault_id ?? "vault",
        vaultName: vault?.vault_name ?? "NODO Vault",
        pnlPercent: netPnlPercent,
        pnlUsd: netPnlUsd,
        walletAddress: address ?? data?.user_wallet,
        period: "7d",
        timestampISO: data?.timestamp,
        vaultSymbols: vault?.tokens?.map((token) => token?.token_symbol).filter(Boolean),
      }),
    [address, data, netPnlPercent, netPnlUsd, vault]
  );

  const defaultCaption = useMemo(() => {
    const percent = netPnlPercent.toFixed(1);
    return `My PnL on NODO: ${netPnlPercent >= 0 ? "+" : ""}${percent}% last 7d 🚀  #NODO #DeFi`;
  }, [netPnlPercent]);

  const shareUrl = useMemo(() => {
    const base =
      typeof window !== "undefined"
        ? `${window.location.origin}/vaults/${data?.vault_id ?? vault?.vault_id ?? ""}`
        : `https://app.nodo.ai/vaults/${data?.vault_id ?? vault?.vault_id ?? ""}`;
    return base;
  }, [data?.vault_id, vault?.vault_id]);

  const shareToX = useCallback(
    async ({ caption, payload, imageDataUrl }: ShareToXRequest) => {
      const response = await fetch("/api/share/x", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ caption, payload, imageDataUrl }),
      });
      if (!response.ok) {
        const text = await response.text();
        throw new Error(
          text || "We could not post to X right now. Please download and share manually."
        );
      }
      try {
        const result = await response.json();
        return { tweetUrl: result?.tweetUrl ?? result?.tweet_url ?? result?.url };
      } catch {
        return {};
      }
    },
    []
  );

  return (
    <>
      <WrapCard className="space-y-4 rounded-2xl bg-[#111] px-6 py-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="font-sans text-lg font-semibold text-white/90">
            All Time P&L Breakdown
          </div>
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="border-white/20 bg-white/5 text-white hover:bg-white/10"
            onClick={() => setShareOpen(true)}
          >
            <Share2 className="mr-2 h-4 w-4" />
            Share PnL
          </Button>
        </div>

        <div className="flex items-center justify-between">
          <button
            type="button"
            className="flex items-center gap-2 text-sm text-white/70 transition hover:text-white"
          >
            <span>Compounded Rewards</span>
            <ChevronRight className="h-4 w-4" />
          </button>
          <FormatNumberByMetrics
            unit={unit}
            number={compoundedRewards}
            className="font-mono text-sm font-semibold text-green-increase"
            collateralClassName="w-4 h-4"
            indicator
          />
        </div>

        <div className="flex items-center justify-between text-sm">
          <span className="text-white/70">Impermanent Loss</span>
          <FormatNumberByMetrics
            unit={unit}
            number={impermanentLoss}
            className="font-mono font-semibold text-red-error"
            collateralClassName="w-4 h-4"
            indicator
          />
        </div>

        <hr className="border-white/10" />

        <div className="flex items-center justify-between">
          <span className="text-base font-semibold text-white">Net P&L</span>
          <FormatNumberByMetrics
            unit={unit}
            number={netPnl}
            className={`font-mono text-base font-semibold ${
              netPnl >= 0 ? "text-green-increase" : "text-red-error"
            }`}
            collateralClassName="w-4 h-4"
            indicator
          />
        </div>
      </WrapCard>

      <SharePnlModal
        open={shareOpen}
        onOpenChange={setShareOpen}
        payload={sharePayload}
        defaultCaption={defaultCaption}
        isXConnected={xConnected}
        onConnectX={() => {
          setXConnected(true);
          const url = "/settings/social";
          window.open(url, "_blank", "noopener");
        }}
        shareUrl={shareUrl}
        onShareToX={xConnected ? shareToX : undefined}
      />
    </>
  );
};
