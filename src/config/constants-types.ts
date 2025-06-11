import { OptionsSelectType } from "@/types/options-select.types.ts";

export const TIME_FILTER = {
  all: "all",
  today: "today",
  thisWeek: "this-week",
  last7days: "last-7-days",
  thisMonth: "this-month",
  last30days: "last-30-days",
  thisYear: "this-year",
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
