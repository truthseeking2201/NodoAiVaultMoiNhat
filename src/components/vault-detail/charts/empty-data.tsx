import ChartNoDataImg from "@/assets/images/details/chart-no-data.png";
import VaultEmptyImg from "@/assets/images/vault-empty.png";
import useBreakpoint from "@/hooks/use-breakpoint";
import { motion } from "framer-motion";

type ChartType = "ndlp-price" | "position-price" | "apy";

const ChartNoData = ({
  children,
  type = "position-price",
}: {
  children?: React.ReactNode;
  type: ChartType;
}) => {
  const { isMobile } = useBreakpoint();

  if (type === "ndlp-price") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.5, ease: "easeOut" }}
      >
        <div className="flex gap-1 items-center justify-center">
          <img
            src={VaultEmptyImg}
            alt="No data available"
            className={`${isMobile ? "w-20" : "w-40"}`}
          />
          <div className="text-white md:text-sm text-xs text-left">
            You haven’t deposited or Connect Wallet yet. {!isMobile && <br />}
            Once you open a position, we’ll show your real-time position status
            here.
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center h-full">
      <img
        src={ChartNoDataImg}
        alt="No data available"
        className="md:w-1/2 mt-[-48px] mb-6"
      />
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.5, ease: "easeOut" }}
      >
        {children}
      </motion.div>
    </div>
  );
};

export default ChartNoData;
