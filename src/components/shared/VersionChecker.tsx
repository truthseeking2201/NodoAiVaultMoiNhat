import { useToast } from "@/hooks/use-toast";
import { initVersionChecker } from "@/utils/versionChecker";
import { useEffect } from "react";

const DEFAULT_DURATION = 30000;

const VersionChecker = () => {
  const { toast } = useToast();
  const showInfo = () => {
    setTimeout(() => {
      window.location.reload();
    }, DEFAULT_DURATION);

    toast({
      title: "A new version is available. Click here to refresh.",
      variant: "success",
      duration: DEFAULT_DURATION,
      onClick: () => {
        window.location.reload();
      },
      className: "cursor-pointer",
      hideClose: true,
    });
  };
  useEffect(() => {
    initVersionChecker(showInfo).catch((error) => {
      console.error("Failed to initialize version checker:", error);
    });
  }, []);

  return null;
};

export default VersionChecker;
