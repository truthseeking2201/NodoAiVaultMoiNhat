import { Info } from "lucide-react";
import styles from "./RegisterForWhiteListButton.module.css";

const RegisterForWhiteListButton = () => {
  const handleRegisterForWhiteList = () => {
    // TODO: Handle register for white list
    const earlyAccessFormUrl = import.meta.env.VITE_WHITELIST_FORM_URL
    window.open(earlyAccessFormUrl, "_blank");
  };
  return (
    <div>
      <div className="flex items-center justify-center gap-1 mb-4">
        <Info className="h-4 w-4" />
        <span className="font-sans text-sm">
          Your wallet isn’t registered yet — please register your Sui address to
          get whitelisted.
        </span>
      </div>
      <div className={styles.buttonWrapper}>
        {/* Blur gradient layer */}
        <div className={styles.blurEffect} />
        {/* Button */}
        <button
          className={styles.whitelistButton}
          onClick={handleRegisterForWhiteList}
        >
          Register for Whitelist
          <svg
            className={styles.arrowIcon}
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M14 16L18 12L14 8"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M6 12H18"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default RegisterForWhiteListButton;
