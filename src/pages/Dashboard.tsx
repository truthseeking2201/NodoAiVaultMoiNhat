import { PageContainer } from "@/components/layout/PageContainer";
import { useRef } from "react";

import LeftContent from "@/components/dashboard/LeftContent";
import RightContent from "@/components/dashboard/RightContent";
import "@/styles/design-tokens.css";

import { TxTable } from "@/components/dashboard/TxTable";
import NodoAIVaultsMainCard from "@/components/vault/NodoAIVaultsMainCard";
import TelegramIcon from "@/assets/icons/telegram.svg";
import XIcon from "@/assets/icons/x.svg";
import VaultPools from "@/components/vault/pools";

export default function NodoAIVaults() {
  const containerRef = useRef<HTMLDivElement>(null);
  const currentYear = new Date().getFullYear();

  const pools = [
    {
      tokens: ["DEEP", "SUI"],
      ARP: 5.0,
      holding: 100000,
      isLive: true,
      isComingSoon: false,
    },
    {
      tokens: ["CETUS", "SUI"],
      ARP: 5.0,
      holding: 0.5,
      isLive: false,
      isComingSoon: true,
    },
    {
      tokens: ["USDC", "SUI"],
      ARP: 5.0,
      holding: 0,
      isLive: false,
      isComingSoon: true,
    },
  ];

  return (
    <div className="min-h-screen main-bg" ref={containerRef}>
      <PageContainer>
        <div style={{ maxWidth: "1400px" }}>
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
            <p className="text-[18px]">
              Maximizing DeFi Yields With Autonomous Risk Management
            </p>
          </header>

          {/* 3-Column Layout */}
          <div className="flex gap-[64px] justify-between w-full flex-col md:flex-row">
            {/* Left Rail */}
            <LeftContent />

            {/* Main Content (Center) */}
            <div className="w-full">
              {/* Main Vault Card */}
              <div className="mb-8">
                <VaultPools pools={pools} />
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
