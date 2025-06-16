import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogDescription,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { X } from "lucide-react";
import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface DialogOutsideCloseProps {
  open: boolean;
  onOpenChange: (params?: any) => void;
  children: ReactNode;
  maxWidth?: number;
  className?: string;
  name?: string;
  hideIconClose?: boolean;
}

export function DialogOutsideClose({
  open = false,
  onOpenChange = () => {},
  children,
  maxWidth = 764,
  className = "",
  name = "dialog-outside-close",
  hideIconClose = false,
}: DialogOutsideCloseProps) {
  /**
   * RENDER
   */
  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
    >
      <DialogContent
        className={`md:max-w-[${maxWidth}px] !rounded-xl !p-0 bg-transparent border-none gap-0 max-h-[100vh] !pb-4 !pt-4`}
        hideIconClose
      >
        {hideIconClose !== true && (
          <div className="flex justify-end mb-3">
            <DialogClose className="rounded-full bg-white/20 w-10 h-10 flex items-center justify-center hover:opacity-70">
              <X className="h-6 w-6 text-white" />
              <span className="sr-only">Close</span>
            </DialogClose>
          </div>
        )}

        <DialogHeader className="p-0 relative flex flex-row items-start justify-between	flex-wrap">
          <DialogTitle className="sr-only">{name}</DialogTitle>
          <DialogDescription className="sr-only">{name}</DialogDescription>
        </DialogHeader>

        <div
          className={cn(
            "max-h-[calc(100vh-120px)] overflow-auto border bg-black p-6 rounded-xl shadow-lg",
            className
          )}
        >
          {children}
        </div>
      </DialogContent>
    </Dialog>
  );
}
