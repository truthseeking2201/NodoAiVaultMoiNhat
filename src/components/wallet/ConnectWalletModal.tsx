import phantomWallet from "@/assets/images/phantom-wallet.png";
import suiWallet from "@/assets/images/sui-wallet.png";
import slushWallet from "@/assets/images/slush-wallet.png";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useConnectWallet, useWallets } from "@mysten/dapp-kit";
import { AlertCircle, Loader2, X } from "lucide-react";
import { useState } from "react";

interface ConnectWalletModalProps {
  open: boolean;
  onClose: () => void;
  onConnected?: () => void;
}

const WALLETS = [
  {
    displayName: "Slush",
    name: "Slush",
    icon: slushWallet,
    description: "Connect to your Slush Wallet",
    extensionUrl:
      "https://chromewebstore.google.com/detail/slush-%E2%80%94-a-sui-wallet/opcgpfmipidbgpenhmajoajpbobppdil",
  },
  {
    displayName: "Phantom",
    name: "Phantom",
    icon: phantomWallet,
    description: "Connect to your Phantom Wallet",
    extensionUrl: "https://phantom.app/download",
  },
];

type Wallet = {
  name: string;
  icon: string;
  displayName: string;
  extensionUrl: string;
};

export function ConnectWalletModal({
  open,
  onClose,
  onConnected,
}: ConnectWalletModalProps) {
  const [error, setError] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectedWallet, setConnectedWallet] = useState<string | null>(null);
  const wallets = useWallets();
  const { mutate: connect } = useConnectWallet();

  const allowWallets = WALLETS.map((wallet) => {
    const foundWallet = wallets.find((w) => w.name === wallet.name);
    return {
      ...wallet,
      name: foundWallet?.name || wallet.name,
    };
  }) as Wallet[];

  const handleConnect = async (selectedWallet: Wallet) => {
    try {
      setIsConnecting(true);
      setError(null);

      const foundWallet = wallets.find(
        (wallet) => wallet.name === selectedWallet.name
      );
      if (foundWallet) {
        setConnectedWallet(selectedWallet.name);
        connect(
          { wallet: foundWallet },
          {
            onSuccess: () => {
              setConnectedWallet(null);
              onClose();
            },
            onError: (error) => {
              console.error("Failed to connect wallet:", error);
              setError(
                `Failed to connect to ${selectedWallet.displayName} wallet. Please try again.`
              );
              setConnectedWallet(null);
            },
          }
        );
      } else {
        window.open(selectedWallet.extensionUrl, "_blank");
      }
    } catch (error) {
      console.error("Failed to connect wallet:", error);
      setError(
        `Failed to connect to ${selectedWallet.displayName} wallet. Please try again.`
      );
      setConnectedWallet(null);
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent
        className="sm:max-w-[425px] bg-[#101112] border border-white/10 p-0 rounded-2xl"
        hideIconClose
        style={{
          boxShadow:
            "0px 10px 15px -3px rgba(255, 255, 255, 0.10), 0px 4px 6px -4px rgba(255, 255, 255, 0.10)",
        }}
      >
        <DialogHeader className="px-6 pt-6 pb-0 relative">
          <button
            className="absolute right-6 top-6 rounded-full h-8 w-8 flex items-center justify-center bg-white/5 hover:bg-white/10 transition-colors"
            onClick={onClose}
            type="button"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
          <DialogTitle className="text-xl font-bold">
            Connect Wallet
          </DialogTitle>
          <DialogDescription className="text-white/60">
            Choose a wallet to connect to Nodo AI Yield Vault
          </DialogDescription>
        </DialogHeader>
        <div className="p-6 space-y-4 font-sans">
          {error && (
            <Alert
              variant="destructive"
              className="mb-4 bg-red-500/10 border-red-500/20 text-red-400"
            >
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {allowWallets.map((wallet) => (
            <Button
              key={wallet.name}
              variant="outline"
              className={`w-full h-[56px] py-6 px-2 justify-start space-x-4 border-white/10 hover:bg-white/5 transition-all ${
                connectedWallet === wallet.name
                  ? "bg-[#4DA1F9]/10 border-[#4DA1F9]/30"
                  : ""
              }`}
              onClick={() => handleConnect(wallet)}
              disabled={isConnecting}
            >
              <div className="h-10 w-10 rounded-full flex items-center justify-center">
                {wallet.icon && <img src={wallet.icon} alt={wallet.name} />}
              </div>
              <div className="text-left flex-1">
                <div className="font-medium text-md">{wallet.displayName}</div>
                <div className="text-xs text-white/60">
                  Connect to your {wallet.displayName} Wallet
                </div>
              </div>
              {connectedWallet === wallet.name && isConnecting && (
                <Loader2 className="h-5 w-5 text-[#4DA1F9] animate-spin" />
              )}
            </Button>
          ))}
        </div>
        <div className="px-6 pb-6 pt-2 text-center">
          {isConnecting && !connectedWallet && (
            <div className="flex items-center justify-center mb-3 text-amber-500">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              <span className="text-sm">Connecting...</span>
            </div>
          )}
          <p className="text-xs text-white/60">
            By connecting your wallet, you agree to our{" "}
            <a href="#" className="text-amber-500 hover:underline">
              Terms of Service
            </a>{" "}
            and{" "}
            <a href="#" className="text-amber-500 hover:underline">
              Privacy Policy
            </a>
            .
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
