import "@/styles/design-tokens.css";

import { PageContainer } from "@/components/layout/page-container";
import UserRank from "@/components/leaderboards/user-rank";
import DataLeaderboards from "@/components/leaderboards/data-leaderboards";

import useBreakpoint from "@/hooks/use-breakpoint";

export default function Leaderboards() {
  const { isMd } = useBreakpoint();

  return (
    <PageContainer className={`${isMd ? "py-8" : "py-6"}`}>
      <UserRank />
      <DataLeaderboards />
    </PageContainer>
  );
}
