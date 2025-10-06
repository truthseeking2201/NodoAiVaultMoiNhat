import { AnalyticsEvent } from "../types";

export const logCommunityEvent = (event: AnalyticsEvent) => {
  if (process.env.NODE_ENV !== "production") {
    console.info("[community-analytics]", event);
  }
};
