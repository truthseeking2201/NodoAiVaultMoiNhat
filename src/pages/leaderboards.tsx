import "@/styles/design-tokens.css";

import ImageBackground from "@/assets/images/bg-leaderboards.png";
import { PageContainer } from "@/components/layout/page-container";
import UserRank from "@/components/leaderboards/user-rank";
import DataLeaderboards from "@/components/leaderboards/data-leaderboards";
import Banner from "@/components/leaderboards/banner";

export default function Leaderboards() {
  return (
    <PageContainer
      backgroundImage={ImageBackground}
      className="max-md:py-4 py-8"
    >
      <UserRank
        tvl={123456.23423}
        tvlRank={12}
        referredTvl={654321.12345}
        referredTvlRank={123}
      />
      <Banner />
      <DataLeaderboards />
    </PageContainer>
  );
}
