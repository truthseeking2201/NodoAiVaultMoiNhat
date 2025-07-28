import { useEffect } from "react";

import HeroBanner from "@/components/dashboard/hero-banner";
import "@/styles/design-tokens.css";

import { PageContainer } from "@/components/layout/page-container";
import { VaultList } from "@/components/vault/list";
import { useWallet } from "@/hooks/use-wallet";
import { useNavigate, useSearchParams } from "react-router-dom";

export default function NodoAIVaults() {
  const { openConnectWalletDialog } = useWallet();

  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const referralCode = searchParams.get("invite-ref");

  useEffect(() => {
    if (referralCode) {
      window.sessionStorage.setItem("ref-code", referralCode);
      navigate("/");
      openConnectWalletDialog();
    }
  }, [referralCode]);

  return (
    <PageContainer className="pb-6">
      <HeroBanner />
      <VaultList />
    </PageContainer>
  );
}
