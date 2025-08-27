import { useEffect } from "react";
import "@/styles/design-tokens.css";

import { PageContainer } from "@/components/layout/page-container";
import { VaultList } from "@/components/vault/list";
import { useWallet } from "@/hooks/use-wallet";
import { useNavigate, useSearchParams } from "react-router-dom";
import useBreakpoint from "@/hooks/use-breakpoint";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import HeroBanner from "@/components/dashboard/hero-banner-simple";

export default function Leaderboards() {
  const { isMd } = useBreakpoint();

  return (
    <>
      <PageContainer className={`${isMd ? "py-8" : "py-6"}`}>
        sssss
      </PageContainer>
    </>
  );
}
