import { initVersionChecker } from "@/utils/versionChecker";
import { useEffect } from "react";

const VersionChecker = () => {
  useEffect(() => {
    initVersionChecker().catch((error) => {
      console.error("Failed to initialize version checker:", error);
    });
  }, []);
  return null;
};

export default VersionChecker;
