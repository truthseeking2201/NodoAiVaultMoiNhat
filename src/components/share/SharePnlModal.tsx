import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import * as htmlToImage from "html-to-image";
import { Loader2, Sparkles, Twitter } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PnlShareCard } from "@/components/share/PnlShareCard";
import type { PnlCardPayload, ShareToXRequest } from "@/types/share";
import { cn } from "@/lib/utils";

type ShareState =
  | "idle"
  | "rendering_card"
  | "needs_connect"
  | "posting_to_x"
  | "posted"
  | "error";

type SharePnlModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  payload: PnlCardPayload | null;
  defaultCaption?: string;
  isXConnected: boolean;
  onConnectX?: () => void;
  onShareToX?: (request: ShareToXRequest) => Promise<{ tweetUrl?: string } | void>;
  onDownload?: (dataUrl: string) => void;
  shareUrl?: string;
};

const SHARE_MODAL_CLASS =
  "glass-card overflow-hidden rounded-2xl border border-white/15 bg-[#10131a] text-white";

export function SharePnlModal({
  open,
  onOpenChange,
  payload,
  defaultCaption,
  isXConnected,
  onConnectX,
  onShareToX,
  onDownload,
  shareUrl,
}: SharePnlModalProps) {
  const cardRef = useRef<HTMLDivElement | null>(null);
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null);
  const [status, setStatus] = useState<ShareState>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [caption, setCaption] = useState(
    defaultCaption ??
      (payload
        ? `My PnL on NODO: ${payload.pnlPercent >= 0 ? "+" : ""}${payload.pnlPercent.toFixed(1)}% ${payload.period} 🚀  #NODO #DeFi`
        : "")
  );
  const [hideWallet, setHideWallet] = useState(false);
  const [hideAmounts, setHideAmounts] = useState(false);
  const [tweetUrl, setTweetUrl] = useState<string | null>(null);

  const preparedPayload = useMemo(() => {
    if (!payload) return null;
    return {
      ...payload,
      hideAmounts,
      walletMasked: hideWallet ? "Hidden on share" : payload.walletMasked,
    };
  }, [payload, hideAmounts, hideWallet]);

  const resetState = useCallback(() => {
    setStatus("idle");
    setImageDataUrl(null);
    setErrorMessage(null);
    setTweetUrl(null);
    setHideWallet(false);
    setHideAmounts(false);
    if (payload) {
      setCaption(
        defaultCaption ??
          `My PnL on NODO: ${payload.pnlPercent >= 0 ? "+" : ""}${payload.pnlPercent.toFixed(
            1
          )}% ${payload.period} 🚀  #NODO #DeFi`
      );
    }
  }, [defaultCaption, payload]);

  const renderCard = useCallback(async () => {
    if (!open || !cardRef.current || !preparedPayload) {
      return;
    }
    setStatus("rendering_card");
    setErrorMessage(null);
    try {
      const node = cardRef.current;
      const dataUrl = await htmlToImage.toPng(node, {
        cacheBust: true,
        backgroundColor: "#0e1014",
        pixelRatio: 2,
      });
      setImageDataUrl(dataUrl);
      setStatus(isXConnected ? "idle" : "needs_connect");
    } catch (error) {
      console.error("Error rendering share card", error);
      setErrorMessage("We couldn't render the share card. Please try again.");
      setStatus("error");
    }
  }, [open, preparedPayload, isXConnected]);

  useEffect(() => {
    if (!open) {
      resetState();
      return;
    }
    if (!preparedPayload) return;

    const timeout = window.setTimeout(() => {
      renderCard();
    }, 120);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [open, preparedPayload, renderCard, resetState]);

  useEffect(() => {
    if (!open) return;
    if (!preparedPayload) return;
    const timeout = window.setTimeout(() => {
      renderCard();
    }, 200);
    return () => {
      window.clearTimeout(timeout);
    };
  }, [hideAmounts, hideWallet, renderCard, preparedPayload, open]);

  const handleDownload = useCallback(() => {
    if (!imageDataUrl) return;
    const anchor = document.createElement("a");
    anchor.href = imageDataUrl;
    anchor.download = `nodo-pnl-${Date.now()}.png`;
    anchor.click();
    onDownload?.(imageDataUrl);
  }, [imageDataUrl, onDownload]);

  const handleShareToX = useCallback(async () => {
    if (!imageDataUrl || !preparedPayload) return;
    if (!onShareToX) {
      const url = new URL("https://x.com/intent/tweet");
      url.searchParams.set("text", caption);
      if (shareUrl) {
        url.searchParams.set("url", shareUrl);
      }
      window.open(url.toString(), "_blank", "noopener");
      return;
    }
    try {
      setStatus("posting_to_x");
      const response = await onShareToX({
        caption,
        payload: preparedPayload,
        imageDataUrl,
      });
      if (response && "tweetUrl" in response && response.tweetUrl) {
        setTweetUrl(response.tweetUrl);
      }
      setStatus("posted");
    } catch (error) {
      console.error("Share to X failed", error);
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "We could not post to X. Download the card and share manually instead."
      );
      setStatus("error");
    }
  }, [caption, imageDataUrl, onShareToX, preparedPayload, shareUrl]);

  const showConnectCTA = !isXConnected;

  const shareButtonDisabled =
    status === "rendering_card" ||
    !imageDataUrl ||
    (isXConnected && status === "posting_to_x");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cn("sm:max-w-[800px] text-white", SHARE_MODAL_CLASS)}>
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-white">
            Share your PnL to X
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
            <div className="relative overflow-hidden rounded-xl border border-white/10 bg-[#0d1016]">
              <div className="flex items-center justify-between px-4 py-2 text-xs text-white/50">
                <span>Preview</span>
                {status === "rendering_card" && (
                  <span className="inline-flex items-center gap-2">
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    Rendering…
                  </span>
                )}
                {status === "posted" && tweetUrl && (
                  <a
                    href={tweetUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-emerald-300 hover:text-emerald-200"
                  >
                    <Sparkles className="h-3.5 w-3.5" />
                    View on X
                  </a>
                )}
              </div>
              <div className="flex h-[360px] items-center justify-center bg-[#080b12]">
                <div className="scale-[0.4] transform-gpu origin-top-left">
                  <PnlShareCard ref={cardRef} data={preparedPayload ?? payload!} />
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="share-caption" className="text-sm text-white/70">
                Caption
              </Label>
              <Textarea
                id="share-caption"
                value={caption}
                onChange={(event) => setCaption(event.target.value)}
                maxLength={260}
                className="min-h-[90px] resize-none border-white/15 bg-white/5 text-sm text-white"
                placeholder="Add a caption for X…"
              />
              <div className="text-right text-xs text-white/40">
                {caption.length}/260
              </div>
            </div>

            <div className="flex flex-col gap-4 rounded-xl border border-white/10 bg-white/[0.04] p-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="space-y-2">
                <div className="text-sm font-semibold text-white">Privacy controls</div>
                <p className="text-xs text-white/55">
                  Toggle what’s visible before you share. Wallets are masked by default.
                </p>
              </div>
              <div className="flex flex-col gap-3 text-sm text-white/80 sm:flex-row sm:items-center sm:gap-6">
                <label className="flex items-center gap-2">
                  <Checkbox
                    checked={hideWallet}
                    onCheckedChange={(checked) =>
                      setHideWallet(Boolean(checked))
                    }
                    className="border-white/40 data-[state=checked]:border-white data-[state=checked]:bg-white data-[state=checked]:text-black"
                  />
                  <span>Hide wallet</span>
                </label>
                <label className="flex items-center gap-2">
                  <Checkbox
                    checked={hideAmounts}
                    onCheckedChange={(checked) =>
                      setHideAmounts(Boolean(checked))
                    }
                    className="border-white/40 data-[state=checked]:border-white data-[state=checked]:bg-white data-[state=checked]:text-black"
                  />
                  <span>Hide USD amounts</span>
                </label>
              </div>
            </div>
          </div>

          {errorMessage && (
            <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-200">
              {errorMessage}
            </div>
          )}

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3 text-xs text-white/60">
              <Sparkles className="h-4 w-4 text-emerald-300" />
              <span>One-click share when your X account is connected.</span>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <Button
                variant="outline"
                onClick={handleDownload}
                disabled={!imageDataUrl}
                className="border-white/20 bg-white/5 text-white hover:bg-white/10"
              >
                Download Image
              </Button>
              {showConnectCTA ? (
                <Button
                  onClick={() => {
                    setStatus("needs_connect");
                    onConnectX?.();
                  }}
                  className="bg-[#1d9bf0] text-white hover:bg-[#1a8cd8]"
                >
                  <Twitter className="mr-2 h-4 w-4" />
                  Connect X
                </Button>
              ) : (
                <Button
                  onClick={handleShareToX}
                  disabled={shareButtonDisabled}
                  className="bg-[#1d9bf0] text-white hover:bg-[#1a8cd8]"
                >
                  {status === "posting_to_x" ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Posting…
                    </>
                  ) : (
                    <>
                      <Twitter className="mr-2 h-4 w-4" />
                      Share to X
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
