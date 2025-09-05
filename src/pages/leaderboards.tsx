import "@/styles/design-tokens.css";

import ImageBackground from "@/assets/images/bg-leaderboards.png";
import { PageContainer } from "@/components/layout/page-container";
import UserRank from "@/components/leaderboards/user-rank";
import DataLeaderboards from "@/components/leaderboards/data-leaderboards";
import Banner from "@/components/leaderboards/banner";

import useBreakpoint from "@/hooks/use-breakpoint";

export default function Leaderboards() {
  const { isMd } = useBreakpoint();
  return (
    <PageContainer
      backgroundImage={ImageBackground}
      className="max-md:py-4 py-8"
    >
      <div className="flex flex-col gap-6">
        <UserRank />
        <Banner />
        <DataLeaderboards />
      </div>
    </PageContainer>
  );
}
