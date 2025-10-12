import type { Quest } from "@/lib/quest-types";

export type QuestTab =
  | "claim"
  | "active"
  | "available"
  | "upcoming"
  | "completed"
  | "failed";

export const questTabs: { value: QuestTab; label: string }[] = [
  { value: "claim", label: "Claim Rewards" },
  { value: "active", label: "In Progress" },
  { value: "available", label: "Available Now" },
  { value: "upcoming", label: "Upcoming & Locked" },
  { value: "completed", label: "Completed" },
  { value: "failed", label: "Needs Another Attempt" },
];

export function mapQuestToTab(state: Quest["state"]): QuestTab {
  if (state === "claimable") return "claim";
  if (state === "active") return "active";
  if (state === "available") return "available";
  if (state === "completed") return "completed";
  if (state === "failed") return "failed";
  return "upcoming";
}
