import {
  LeaderboardItem,
  RankCompo,
  RewardCompo,
  getTitleTvlCol,
} from "./helper";
import { RowItem } from "@/components/ui/row-item";
import { TabLeaderboard } from "@/types/leaderboards.types";

interface ItemMobileLeaderboardsProps {
  tabLeaderboard: TabLeaderboard;
  item: LeaderboardItem;
}
export default function ItemMobileLeaderboards({
  item,
  tabLeaderboard,
}: ItemMobileLeaderboardsProps) {
  const classLabel = "text-white/70 font-sans text-[11px]";
  const classValue = "font-mono text-white text-sm";
  // RENDER
  return (
    <div className="border border-white/10 px-2 py-3 rounded-lg mt-4 first:mt-0">
      <RowItem
        classNameLabel={classLabel}
        classNameValue={classValue}
        label="RANK"
      >
        <div className="flex items-center gap-2">
          {item.isYou && (
            <span className="bg-gradient-to-r from-[#00CCFF] to-[#00FF5E] inline-flex rounded-full text-black text-xs leading-[17px] font-bold px-2.5 ">
              YOU
            </span>
          )}
          <RankCompo
            rank={item.rank}
            rankNode={
              <div className="flex items-center justify-center text-[15px] w-[26px] h-[26px]">
                {item.rank}
              </div>
            }
          />
        </div>
      </RowItem>
      <hr className="my-2" />
      <RowItem
        classNameLabel={classLabel}
        classNameValue={classValue}
        label="WALLET ADDRESS"
      >
        {item.wallet_address}
      </RowItem>
      <hr className="my-2" />
      <RowItem
        classNameLabel={classLabel}
        classNameValue={classValue}
        label={getTitleTvlCol(tabLeaderboard)}
      >
        {item.tvl}
      </RowItem>
      <div className="rounded-md bg-white/4 px-3 py-3 mt-3 flex justify-between	items-start">
        <div className="text-[#9C9C9C] text-xs">Rewards</div>
        <div className="flex flex-col gap-2">
          {item.rewards?.map((el, idx) => (
            <RewardCompo token={el} key={idx} />
          ))}
        </div>
      </div>
    </div>
  );
}
