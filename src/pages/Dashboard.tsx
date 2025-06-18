import { PageContainer } from "@/components/layout/PageContainer";
import { useEffect, useRef } from "react";

import LeftContent from "@/components/dashboard/LeftContent";
import RightContent from "@/components/dashboard/RightContent";
import "@/styles/design-tokens.css";

import TelegramIcon from "@/assets/icons/telegram.svg";
import XIcon from "@/assets/icons/x.svg";
import { TxTable } from "@/components/dashboard/TxTable";
import { Button } from "@/components/ui/button";
import NodoAIVaultsMainCard from "@/components/vault/NodoAIVaultsMainCard";
import VaultPools from "@/components/vault/pools";
import { useWhiteListModalStore } from "@/hooks/useStore";
import { useWallet } from "@/hooks/useWallet";
import { useWhitelistWallet } from "@/hooks/useWhitelistWallet";
import { truncateBetween } from "@/utils/truncate";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useCurrentAccount } from "@mysten/dapp-kit";
import { ArrowUpRight } from "lucide-react";

export default function NodoAIVaults() {
  const containerRef = useRef<HTMLDivElement>(null);
  const currentYear = new Date().getFullYear();
  const { isWhitelisted, isLoading: isCheckingWhitelist } =
    useWhitelistWallet();
  const account = useCurrentAccount();
  const { isConnectWalletDialogOpen, openConnectWalletDialog } = useWallet();

  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const referralCode = searchParams.get("invite-ref");
  const { setIsOpen } = useWhiteListModalStore();

  useEffect(() => {
    if (referralCode) {
      window.sessionStorage.setItem("ref-code", referralCode);
      navigate("/");
      openConnectWalletDialog();
    }
  }, [referralCode]);

  useEffect(() => {
    if (window.localStorage.getItem("is-whitelist-address") === null) {
      window.localStorage.setItem("is-whitelist-address", "false");
    }

    if (account && isWhitelisted) {
      window.localStorage.setItem("is-whitelist-address", "true");
    }

    if (isCheckingWhitelist) {
      return;
    }

    const isWhitelistModalShown = window.localStorage.getItem(
      "is-whitelist-address"
    );

    if (account && !isWhitelisted) {
      const currentAddress = truncateBetween(account.address, 5, 5);
      const storedAddress = window.localStorage.getItem("current-address");
      if (currentAddress !== storedAddress) {
        window.localStorage.setItem("is-whitelist-address", "false");
        window.localStorage.setItem("current-address", currentAddress);
      }
    }

    const timer = setTimeout(() => {
      if (isWhitelistModalShown === "false" && !isConnectWalletDialogOpen) {
        setIsOpen(true);
        window.localStorage.setItem("is-whitelist-address", "true");
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [isWhitelisted, account, isConnectWalletDialogOpen, isCheckingWhitelist]);

  return (
    <div className="min-h-screen main-bg" ref={containerRef}>
      <PageContainer>
        <div style={{ maxWidth: "1440px" }}>
          {/* Main Header */}
          <header className="text-center font-sans mb-16">
            <h1 className="text-[60px] leading-[48px] font-bold">
              <span>NODO </span>
              <span
                style={{
                  background:
                    "linear-gradient(90deg, #0090FF -29.91%, #FF6D9C 44.08%, #FB7E16 100%)",
                  backgroundClip: "text",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  fontFamily: "DM Sans",
                }}
              >
                AI Vaults
              </span>
            </h1>
            {isWhitelisted ? (
              <p className="text-[18px]">
                Maximizing DeFi Yields With Autonomous Risk Management
              </p>
            ) : (
              <p className="text-[18px]">
                Maximizing DeFi Yields With Autonomous Risk Management. <br />
                Available via{" "}
                <span className="font-bold">whitelist access</span> only.
              </p>
            )}
            {!isWhitelisted && (
              <Button
                variant="link-orange"
                size="lg"
                className="font-semibold text-lg p-0 h-fit"
                onClick={() => {
                  window.open(
                    import.meta.env.VITE_WHITELIST_FORM_URL,
                    "_blank"
                  );
                }}
              >
                Get whitelisted now
                <ArrowUpRight
                  size={40}
                  strokeWidth={2}
                  className="text-[#F5C8A4]"
                />
              </Button>
            )}
          </header>

          {/* 3-Column Layout */}
          <div className="flex gap-[64px] justify-between w-full flex-col md:flex-row">
            {/* Left Rail */}
            <LeftContent />

            {/* Main Content (Center) */}
            <div className="w-full">
              {/* Main Vault Card */}
              <div className="mb-8">
                <VaultPools />
              </div>
              <div className="w-full mb-8">
                <NodoAIVaultsMainCard />
              </div>

              {/* Vault Activities Section */}
              <div className="mb-8">
                <TxTable />
              </div>
            </div>

            {/* Right Rail */}
            <RightContent />
          </div>
        </div>
      </PageContainer>
      {/* Footer */}
      <footer className="py-6 text-center text-100 font-caption border-t border-white/10 bg-transparent">
        <div
          style={{
            maxWidth: "var(--layout-desktop-breakpoint-xl)",
            margin: "0 auto",
            padding: "0 36px",
          }}
          className="flex flex-col md:flex-row justify-between items-center"
        >
          <div className="flex items-center gap-2">
            <div>©{currentYear} NODO. All rights reserved</div>
            <div>
              <a
                href="https://t.me/Official_NODO_Community"
                target="_blank"
                rel="noopener noreferrer"
              >
                <img
                  src={TelegramIcon}
                  alt="Telegram"
                  className="w-5 h-5 mr-2"
                />
              </a>
            </div>
            <div>
              <a
                href="https://x.com/Official_NODO"
                target="_blank"
                rel="noopener noreferrer"
              >
                <img src={XIcon} alt="X" className="w-5 h-5" />
              </a>
            </div>
          </div>
          <div>
            NODO Global Limited 10 Anson Road #22-06 International Plaza,
            Singapore 079903
          </div>
        </div>
      </footer>
    </div>
  );
}
