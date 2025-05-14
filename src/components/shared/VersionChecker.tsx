import { useToast } from "@/hooks/use-toast";
import { initVersionChecker } from "@/utils/versionChecker";
import { useEffect } from "react";
import { Button } from "../ui/button";

const VersionChecker = () => {
  const { toast } = useToast();
  const showInfo = () => {
    toast({
      title: "A new version is available. Click here to refresh.",
      variant: "default",
      duration: 30000,
      action: (
        <div className="pr-3">
          <Button variant="primary" onClick={() => window.location.reload()}>
            Refresh
          </Button>
        </div>
      ),
      className: "cursor-pointer",
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
