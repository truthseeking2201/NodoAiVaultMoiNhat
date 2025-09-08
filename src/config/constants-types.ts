import { OptionsSelectType } from "@/types/options-select.types.ts";
import { isThisWeek } from "date-fns";

export const TIME_FILTER = {
  all: "ALL_TIME",
  today: "TODAY",
  thisWeek: "THIS_WEEK",
  last7days: "LAST_7_DAYS",
  thisMonth: "THIS_MONTH",
  last30days: "LAST_30_DAYS",
  thisYear: "THIS_YEAR",
};

export const TIME_FILTER_OPTIONS_REFERRAL: OptionsSelectType[] = [
  { value: TIME_FILTER.all, label: "All Time" },
  { value: TIME_FILTER.today, label: "Today" },
  { value: TIME_FILTER.thisWeek, label: "This Week" },
  { value: TIME_FILTER.last7days, label: "Last 7 Days" },
  { value: TIME_FILTER.thisMonth, label: "This Month" },
  { value: TIME_FILTER.last30days, label: "Last 30 Days" },
  { value: TIME_FILTER.thisYear, label: "This Year" },
];

export const SORT_TYPE = {
  asc: "ASC",
  desc: "DESC",
};

export const LEADERBOARD_TYPE = {
  tvl: "TVL",
  referred: "REFERRED",
};

export const LEADERBOARD_TYPE_OPTIONS: OptionsSelectType[] = [
  { value: LEADERBOARD_TYPE.tvl, label: "TVL Leaderboard" },
  { value: LEADERBOARD_TYPE.referred, label: "Referred TVL Leaderboard" },
];

export const LEADERBOARD_TIME_FILTER = {
  thisWeek: "this-week",
  lastWeek: "last-week",
};

export const LEADERBOARD_TIME_FILTER_OPTIONS: OptionsSelectType[] = [
  { value: LEADERBOARD_TIME_FILTER.thisWeek, label: "This week" },
  {
    value: LEADERBOARD_TIME_FILTER.lastWeek,
    label: "Last week",
  },
];
