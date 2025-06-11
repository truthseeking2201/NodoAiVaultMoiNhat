import { useWhiteListModalStore } from "@/hooks/useStore";
import WhiteListModal from "../white-list-modal/WhiteListModal";

const RegisterForWhiteListLayout = () => {
  const { isOpen, setIsOpen } = useWhiteListModalStore();

  const handleClose = () => {
    setIsOpen(false);
  };
  return <WhiteListModal open={isOpen} onClose={handleClose} />;
};

export default RegisterForWhiteListLayout;
