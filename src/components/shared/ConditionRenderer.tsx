import React from "react";
import { motion, AnimatePresence } from "framer-motion";

type Props = {
  when: boolean;
  fallback?: React.ReactNode;
  children: React.ReactNode;
  animate?: boolean;
};

const ConditionRenderer = ({
  when,
  fallback,
  children,
  animate = true,
}: Props) => {
  if (!animate) return when ? children : fallback;
  return (
    <AnimatePresence mode="wait">
      {when ? (
        <motion.div
          key="content"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{
            duration: 0.3,
            ease: "easeInOut",
          }}
        >
          {children}
        </motion.div>
      ) : (
        <motion.div
          key="fallback"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{
            duration: 0.3,
            ease: "easeInOut",
          }}
        >
          {fallback}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ConditionRenderer;
