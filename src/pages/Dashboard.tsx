import { PageContainer } from "@/components/layout/PageContainer";
import { useWallet } from "@/hooks/useWallet";
import { useRef, useState, useEffect } from "react";

import LeftContent from "@/components/dashboard/LeftContent";
import RightContent from "@/components/dashboard/RightContent";
import "@/styles/design-tokens.css";
import { UserInvestment } from "@/types/vault";

import { TxTable } from "@/components/dashboard/TxTable";
import NodoAIVaultsMainCard from "@/components/vault/NodoAIVaultsMainCard";
import TelegramIcon from "@/assets/icons/telegram.svg";
import XIcon from "@/assets/icons/x.svg";
import { TransactionHistory } from "@/types/vault";
import { getVaultsActivities } from "@/apis/vault";
import { transactions } from "./mockdata";

export default function NodoAIVaults() {
  // Use the wallet hook for connection status
  const { isConnectWalletDialogOpen, openConnectWalletDialog, isConnected } =
    useWallet();

  const [activeTab, setActiveTab] = useState("all");
  const [depositAmount, setDepositAmount] = useState("");
  const [isDepositDrawerOpen, setIsDepositDrawerOpen] = useState(false);
  const [isWithdrawDrawerOpen, setIsWithdrawDrawerOpen] = useState(false);
  const [isConnectWalletModalOpen, setIsConnectWalletModalOpen] =
    useState(false);
  const [selectedInvestment, setSelectedInvestment] =
    useState<UserInvestment | null>(null);
  const [depositWithdrawTab, setDepositWithdrawTab] = useState("deposit");
  const [vaultActivities, setVaultActivities] =
    useState<TransactionHistory | null>(null);
  const [filteredVaultActivities, setFilteredVaultActivities] = useState<
    string | null
  >(null);

  const containerRef = useRef<HTMLDivElement>(null);

  const handleConnectWallet = () => {
    // Open the connect wallet modal
    setIsConnectWalletModalOpen(true);
  };

  const handleDeposit = () => {
    if (isConnected) {
      setIsDepositDrawerOpen(true);
    } else {
      handleConnectWallet();
    }
  };

  const handleWithdraw = () => {
    if (isConnected) {
      const defaultInvestment: UserInvestment = {
        vaultId: "nodo-ai-vault",
        principal: 1250,
        shares: 48.25,
        depositDate: new Date(
          Date.now() - 25 * 24 * 60 * 60 * 1000
        ).toISOString(),
        lockupPeriod: 60,
        unlockDate: new Date(
          Date.now() + 35 * 24 * 60 * 60 * 1000
        ).toISOString(),
        currentValue: 1250.45,
        profit: 12.5,
        isWithdrawable: true,
        currentApr: 24.8,
      };

      setSelectedInvestment(defaultInvestment);
      setIsWithdrawDrawerOpen(true);
    } else {
      handleConnectWallet();
    }
  };

  // Format currency for display
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  // Capitalize first letter
  const capitalize = (str: string) => {
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  const handleSelectTransaction = (tx: any) => {
    console.log("Selected transaction:", tx);
  };

  const currentYear = new Date().getFullYear();

  const fetchVaultActivities = async ({
    page = 1,
    limit = 10,
    action_type = "",
  }: {
    page?: number;
    limit?: number;
    action_type?: string;
  }): Promise<void> => {
    try {
      const response = await getVaultsActivities({
        page,
        limit,
        action_type,
      });
      if (response && response.data) {
        setVaultActivities(response.data);
      }
    } catch (error) {
      console.error("Error fetching vault activities:", error);
    }
  };

  useEffect(() => {
    fetchVaultActivities({});
    const intervalId = setInterval(() => fetchVaultActivities({}), 30000);

    return () => {
      clearInterval(intervalId);
    };
  }, []);

  const handleChangeActiveTab = (tab: any) => {
    if (tab.includes("ALL")) {
      fetchVaultActivities({
        page: 1,
        limit: 10,
        action_type: "",
      });
      setFilteredVaultActivities("");
    } else if (tab.includes("ADD_LIQUIDITY")) {
      fetchVaultActivities({
        page: 1,
        limit: 10,
        action_type: "ADD_LIQUIDITY",
      });
      setFilteredVaultActivities("ADD_LIQUIDITY");
    } else if (tab.includes("REMOVE_LIQUIDITY")) {
      fetchVaultActivities({
        page: 1,
        limit: 10,
        action_type: "REMOVE_LIQUIDITY",
      });
      setFilteredVaultActivities("REMOVE_LIQUIDITY");
    } else if (tab.includes("SWAP")) {
      fetchVaultActivities({
        page: 1,
        limit: 10,
        action_type: "SWAP",
      });
      setFilteredVaultActivities("SWAP");
    }
  };

  const handleChangeActivityPage = (page: number) => {
    fetchVaultActivities({
      page,
      limit: 10,
      action_type: filteredVaultActivities || "",
    });
  };

  return (
    <div className="min-h-screen main-bg" ref={containerRef}>
      <PageContainer>
        <div style={{ maxWidth: "1400px" }}>
          {/* Main Header */}
          <header className="text-center mb-16">
            <h1 className="text-[60px] font-bold">
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
            <p className="font-body text-">
              Maximizing DeFi Yields With Autonomous Risk Management
            </p>
          </header>

          {/* 3-Column Layout */}
          <div className="flex gap-[64px] justify-between w-full">
            {/* Left Rail */}
            <LeftContent />

            {/* Main Content (Center) */}
            <div className="w-full">
              {/* Main Vault Card */}
              <div className="w-full mb-8">
                <NodoAIVaultsMainCard />
              </div>

              {/* Vault Activities Section */}
              <div className="mb-8">
                <TxTable
                  transactions={
                    vaultActivities as unknown as TransactionHistory
                  }
                  onSelect={handleSelectTransaction}
                  onChangePage={handleChangeActivityPage}
                  onChangeFilter={handleChangeActiveTab}
                />
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
