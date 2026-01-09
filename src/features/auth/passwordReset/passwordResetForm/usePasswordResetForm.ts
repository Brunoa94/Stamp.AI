import { useState } from "react";
import { usePasswordResetRequest } from "@/hooks/useAuth";

interface UsePasswordResetFormProps {
  onClose: () => void;
}

export function usePasswordResetForm({ onClose }: UsePasswordResetFormProps) {
  const [resetEmail, setResetEmail] = useState("");
  const passwordResetMutation = usePasswordResetRequest();

  const handlePasswordReset = async (
    e?: React.FormEvent | React.MouseEvent
  ) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (!resetEmail.trim()) return;

    passwordResetMutation.mutate({ email: resetEmail });
    onClose();
    setResetEmail("");
  };

  const handleClose = () => {
    onClose();
    setResetEmail("");
  };

  return {
    resetEmail,
    setResetEmail,
    handlePasswordReset,
    handleClose,
    isLoading: passwordResetMutation.isPending,
  };
}