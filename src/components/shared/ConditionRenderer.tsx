import React from "react";

type Props = {
  when: boolean;
  fallback?: React.ReactNode;
  children: React.ReactNode;
};

const ConditionRenderer = ({ when, fallback, children }: Props) => {
  if (!when) return fallback;
  return children;
};

export default ConditionRenderer;
