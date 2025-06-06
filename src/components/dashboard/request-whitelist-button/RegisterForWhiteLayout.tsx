import { Info } from "lucide-react";
import styles from "./RegisterForWhiteListButton.module.css";
import WhiteListModal from "../white-list-modal.tsx/WhiteListModal";
import { useState } from "react";
import RegisterForWhiteListButton from "./RegisterForWhiteListButton";

const RegisterForWhiteLayout = () => {
  const [isOpen, setIsOpen] = useState(false);
  const handleRegisterForWhiteList = () => {
    // TODO: Handle register for white list
    // const earlyAccessFormUrl = import.meta.env.VITE_WHITELIST_FORM_URL;
    // window.open(earlyAccessFormUrl, "_blank");
    setIsOpen(true);
    console.log("Register for whitelist clicked");
    console.log(isOpen, "isOpen");
  };
  const handleClose = () => {
    setIsOpen(false);
  };
  return (
    <div>
      <RegisterForWhiteListButton onClick={handleRegisterForWhiteList} />
      <WhiteListModal open={isOpen} onClose={handleClose} />
    </div>
  );
};

export default RegisterForWhiteLayout;
