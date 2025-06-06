import { Info } from "lucide-react";
import styles from "./RegisterForWhiteListButton.module.css";
import WhiteListModal from "../white-list-modal/WhiteListModal";
import { useState } from "react";
import RegisterForWhiteListButton from "./RegisterForWhiteListButton";

const RegisterForWhiteLayout = () => {
  const [isOpen, setIsOpen] = useState(false);
  const handleRegisterForWhiteList = () => {
    setIsOpen(true);
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
