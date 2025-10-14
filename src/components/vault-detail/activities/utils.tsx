import { formatDate12Hours } from "@/utils/date";

export const renamingType = (type: string) => {
  switch (type) {
    case "ADD_LIQUIDITY":
      return "Add Liquidity";
    case "REMOVE_LIQUIDITY":
      return "Remove Liquidity";
    case "CLAIM_REWARDS":
      return "Add Reward";
    case "SWAP":
      return "Swap";
    case "ADD_PROFIT_UPDATE_RATE":
      return "Add Profit";
    case "OPEN":
      return "Open Position";
    case "HOLD":
      return "Hold Position";
    case "ADD":
      return "Add to Position";
    case "CLOSE_REOPEN":
      return "Close & Reopen";
    case "COMPOUND":
      return "Compound";
    case "WITHDRAW":
      return "Withdraw";
    case "PAUSE":
      return "Pause";
    case "CLOSE":
      return "Close Position";
    default:
      return type;
  }
};

export const formatTime = (timestamp: string) => {
  const time_tmp = formatDate12Hours(timestamp).split(" ");
  if (time_tmp.length === 0) {
    return <div className="text-xs text-white/70 font-mono">--:--</div>;
  }

  return (
    <div>
      <div className="text-xs text-white/70 font-mono">{time_tmp[0]}</div>
      <div className="text-xs text-white/70 font-mono">
        {time_tmp[1]} {time_tmp[2]}
      </div>
    </div>
  );
};
