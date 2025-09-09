import { ReactNode, Fragment } from "react";
import Rank1Icon from "@/assets/images/leaderboards/rank-1.png";
import Rank2Icon from "@/assets/images/leaderboards/rank-2.png";
import Rank3Icon from "@/assets/images/leaderboards/rank-3.png";
import { ButtonGradient } from "@/components/ui/button-gradient";
import { TabLeaderboard } from "@/types/leaderboards.types";

const RANK_ICON = {
  1: Rank1Icon,
  2: Rank2Icon,
  3: Rank3Icon,
};

type TokenReward = {
  symbol: string;
  image: string;
  value: string;
};

export type LeaderboardItem = {
  rank: number;
  wallet_address: string;
  tvl: string;
  rewards: TokenReward[];
  isYou: boolean;
};

interface RankCompoProps {
  rank: number;
  rankNode?: ReactNode;
  classNameImage?: string;
}
export function RankCompo({
  rank = 0,
  rankNode,
  classNameImage = "h-10 w-10 max-md:w-[26px] max-md:h-[26px]",
}: RankCompoProps) {
  return (
    <>
      {RANK_ICON[rank as 1 | 2 | 3] ? (
        <img
          src={RANK_ICON[rank]}
          alt={`Rank ${rank}`}
          className={classNameImage}
        />
      ) : (
        <>{rankNode ? rankNode : <span>{rank}</span>}</>
      )}
    </>
  );
}
interface RewardCompoProps {
  token: TokenReward;
}
export function RewardCompo({ token }: RewardCompoProps) {
  return (
    <div className="flex items-center gap-2 max-md:gap-1">
      <img
        src={token.image}
        alt={token.symbol || "token"}
        className="w-6 h-6 max-md:w-4 max-md:h-4"
      />
      <span className="text-base max-md:text-sm text-white font-mono font-medium">
        {token.value} <span className="max-md:hidden">{token.symbol}</span>
      </span>
    </div>
  );
}

const TITLES_TVL_COL: Record<TabLeaderboard, string> = {
  TVL: "TVL",
  REFERRED: "REFERRED TVL",
};

/* eslint-disable react-refresh/only-export-components */
export function getTitleTvlCol(tab: TabLeaderboard) {
  return TITLES_TVL_COL[tab] || "";
}
/**
 *
 * @param tab
 * @returns
 */
export function Columns(tab: TabLeaderboard) {
  return [
    {
      title: "RANK",
      dataIndex: "rank",
      classTitle: "text-white/70",
      render: (_, record: LeaderboardItem) => (
        <div className="flex items-center gap-2">
          <RankCompo
            rank={_}
            rankNode={
              <div className="flex items-center justify-center text-base w-10 h-10">
                {_}
              </div>
            }
          />
          {record.isYou && (
            <ButtonGradient
              onClick={() => {}}
              variant="outline2"
              className=""
              classButtonInner="bg-[#070707]"
            >
              YOU
            </ButtonGradient>
          )}
        </div>
      ),
    },
    {
      title: "WALLET ADDRESS",
      dataIndex: "wallet_address",
      classTitle: "text-white/70",
      classCell: "text-base",
    },
    {
      title: getTitleTvlCol(tab),
      dataIndex: "tvl",
      classTitle: "text-white/70",
      classCell: "text-base",
    },
    {
      title: "REWARD",
      dataIndex: "rewards",
      classTitle: "text-white/70 justify-end",
      render: (rewards) => (
        <div className="flex items-center justify-end flex-wrap gap-2">
          {rewards?.map((el, idx) => (
            <Fragment key={`row-${idx}`}>
              {idx > 0 && (
                <span className="text-base text-white font-mono">+</span>
              )}
              <RewardCompo token={el} />
            </Fragment>
          ))}
        </div>
      ),
    },
  ];
}
