import { useReducer } from "react";
import { useTranslations } from "next-intl";
import { useUpdatePassword } from "@/queries/authQueries";
import { UpdatePasswordSchema } from "@/schemas/auth";
import { useErrorHandler } from "@/hooks/useErrorHandler";

interface PasswordResetState {
  isEditing: boolean;
  newPassword: string;
  confirmPassword: string;
}

type PasswordResetAction =
  | { type: "START_EDITING" }
  | { type: "CANCEL" }
  | { type: "RESET" }
  | { type: "SET_NEW_PASSWORD"; payload: string }
  | { type: "SET_CONFIRM_PASSWORD"; payload: string };

const initialState: PasswordResetState = {
  isEditing: false,
  newPassword: "",
  confirmPassword: "",
};

function passwordResetReducer(
  state: PasswordResetState,
  action: PasswordResetAction
): PasswordResetState {
  switch (action.type) {
    case "START_EDITING":
      return { ...state, isEditing: true };
    case "CANCEL":
      return {
        ...state,
        isEditing: false,
        newPassword: "",
        confirmPassword: "",
      };
    case "RESET":
      return initialState;
    case "SET_NEW_PASSWORD":
      return { ...state, newPassword: action.payload };
    case "SET_CONFIRM_PASSWORD":
      return { ...state, confirmPassword: action.payload };
    default:
      return state;
  }
}

export function usePasswordReset() {
  const t = useTranslations("profile.toasts");
  const tv = useTranslations("validation");
  const [state, dispatch] = useReducer(passwordResetReducer, initialState);
  const updatePasswordMutation = useUpdatePassword();
  const { handleError, handleSuccess } = useErrorHandler();

  const validatePasswords = () => {
    const result = UpdatePasswordSchema.safeParse({
      password: state.newPassword,
      confirmPassword: state.confirmPassword,
    });

    if (!result.success) {
      const firstError = result.error.issues[0];

      if (firstError) {
        handleError({ message: tv(firstError.message) });
      }

      return false;
    }

    return true;
  };

  const handleSave = async () => {
    if (!validatePasswords()) {
      return;
    }

    try {
      await updatePasswordMutation.mutateAsync(state.newPassword);
      dispatch({ type: "RESET" });

      handleSuccess(t("passwordUpdated"));
    } catch (error) {
      handleError(error);
    }
  };

  const handleCancel = () => {
    dispatch({ type: "CANCEL" });
  };

  const handleStartEditing = () => {
    dispatch({ type: "START_EDITING" });
  };

  const setNewPassword = (password: string) => {
    dispatch({ type: "SET_NEW_PASSWORD", payload: password });
  };

  const setConfirmPassword = (password: string) => {
    dispatch({ type: "SET_CONFIRM_PASSWORD", payload: password });
  };

  const canSubmit = state.newPassword.trim() !== "" && state.confirmPassword.trim() !== "";

  return {
    // State
    isEditing: state.isEditing,
    newPassword: state.newPassword,
    confirmPassword: state.confirmPassword,
    isLoading: updatePasswordMutation.isPending,
    canSubmit,

    // Handlers
    handleSave,
    handleCancel,
    handleStartEditing,
    setNewPassword,
    setConfirmPassword,
  };
}
