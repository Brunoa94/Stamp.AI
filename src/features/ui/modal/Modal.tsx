import { ReactNode } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/features/ui/dialog";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
}

export const Modal = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  className = "max-w-3xl max-h-[85vh] overflow-y-auto",
}: ModalProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={className}>
        <DialogHeader className="mb-6">
          <DialogTitle className="text-3xl bg-linear-to-r from-slate-600 via-gray-600 to-slate-700 dark:from-slate-400 dark:via-gray-400 dark:to-slate-400 bg-clip-text text-transparent">
            {title}
          </DialogTitle>
          {description && (
            <DialogDescription className="sr-only">
              {description}
            </DialogDescription>
          )}
        </DialogHeader>

        {children}
      </DialogContent>
    </Dialog>
  );
};
