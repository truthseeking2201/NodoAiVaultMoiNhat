import { Alert, AlertDescription } from "@/components/ui/alert";
import { useConnectWallet, useWallets } from "@mysten/dapp-kit";
import { useMemo, useState } from "react";
import { AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { WALLETS } from "@/components/wallet/constants";
import { useLoginWallet } from "@/hooks";
import { useToast } from "@/hooks/use-toast";
import { detectIsSlushApp, isMobileDevice } from "@/utils/helpers";
import { IconErrorToast } from "../ui/icon-error-toast";
import arrowBack from "@/assets/icons/arrow-back.svg";
import ConditionRenderer from "../shared/condition-renderer";
import ConnectWalletVideoModal from "./connect-wallet-video-modal";

type Wallet = {
  name: string;
  icon: string;
  displayName: string;
  extensionUrl: string;
};

type WalletListProps = {
  onConnectSuccess: (address: string, resetConnection?: () => void) => void;
};

const WalletList = ({ onConnectSuccess }: WalletListProps) => {
  const [error, setError] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectedWallet, setConnectedWallet] = useState<string | null>(null);
  const wallets = useWallets();
  const { mutate: connect } = useConnectWallet();
  const loginWallet = useLoginWallet();
  const { toast } = useToast();
  const [tutorialVideoOpen, setTutorialVideoOpen] = useState(false);

  const allowWallets = useMemo(() => {
    const isSlushApp = detectIsSlushApp();

    if (isSlushApp) {
      return [WALLETS.find((wallet) => wallet.name === "Slush")];
    }
    return WALLETS.map((wallet) => {
      const foundWallet = wallets.find((w) => w.name === wallet.name);
      return {
        ...wallet,
        name: foundWallet?.name || wallet.name,
        icon: wallet.icon || foundWallet?.icon,
      };
    }) as Wallet[];
  }, [wallets]);

  const handleReject = () => {
    setError(null);
    setIsConnecting(false);
  };

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
            onSuccess: async (data) => {
              const address = data.accounts[0].address;
              const isLoginSuccess = await loginWallet(address);
              if (!isLoginSuccess) {
                toast({
                  title: "Login failed",
                  description:
                    "Failed to verify your wallet signature. Please try again.",
                  variant: "error",
                  duration: 5000,
                  icon: <IconErrorToast />,
                });
                handleReject();
                return;
              }
              onConnectSuccess(address, () => {
                setConnectedWallet(null);
                setIsConnecting(false);
              });
            },
            onError: (error) => {
              console.error("Failed to connect wallet:", error);
              setError(
                `Failed to connect to ${selectedWallet.displayName} wallet. Please try again.`
              );
              handleReject();
            },
          }
        );
      } else {
        setIsConnecting(false);
        window.open(selectedWallet.extensionUrl, "_blank");
      }
    } catch (error) {
      console.error("Failed to connect wallet:", error);
      setError(
        `Failed to connect to ${selectedWallet.displayName} wallet. Please try again.`
      );
      handleReject();
    }
  };

  return (
    <>
      <div className="p-6 pb-1 space-y-4 font-sans">
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

        <ConditionRenderer when={isMobileDevice()}>
          <div className="font-sans leading-5 text-xs p-3 rounded-lg border border-white/10 bg-[rgba(0,125,167,0.15)]">
            To connect your wallet on mobile, open the{" "}
            <span className="underline">ai.nodo.xyz</span> using the Slush or
            Phantom app's DApp Browser.{" "}
            <span className="text-white/60">
              Mobile browsers such as Safari and Chrome do not support wallet
              connections.
            </span>
            <hr className="bg-white/10 h-[1px] my-2" />
            <div className="text-xs flex items-center justify-between">
              Need help connecting?
              <div
                className="flex text-xs items-center gap-2 rounded-md font-sans bg-white/10 p-1 px-2 cursor-pointer"
                onClick={() => setTutorialVideoOpen(true)}
              >
                <img src={arrowBack} alt="Arrow Back" className="w-6 h-6" />
                Watch How
              </div>
            </div>
          </div>
          <ConnectWalletVideoModal
            open={tutorialVideoOpen}
            onOpenChange={() => setTutorialVideoOpen(false)}
          />
        </ConditionRenderer>
      </div>

      <div className="px-6 pt-2 text-center">
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
    </>
  );
};

export default WalletList;
