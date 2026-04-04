import { useReducer, useEffect } from "react";
import { toast } from "sonner";
import { useUser } from "@/hooks/useAuth";
import { useUpdateProfile } from "@/queries/authQueries";

interface UserInformationState {
  isEditing: boolean;
  firstName: string;
  lastName: string;
}

type UserInformationAction =
  | { type: "START_EDITING" }
  | { type: "CANCEL"; payload: { firstName: string; lastName: string } }
  | { type: "RESET"; payload: { firstName: string; lastName: string } }
  | { type: "SET_FIRST_NAME"; payload: string }
  | { type: "SET_LAST_NAME"; payload: string };

const initialState: UserInformationState = {
  isEditing: false,
  firstName: "",
  lastName: "",
};

function userInformationReducer(
  state: UserInformationState,
  action: UserInformationAction
): UserInformationState {
  switch (action.type) {
    case "START_EDITING":
      return { ...state, isEditing: true };
    case "CANCEL":
      return {
        ...state,
        isEditing: false,
        firstName: action.payload.firstName,
        lastName: action.payload.lastName,
      };
    case "RESET":
      return {
        isEditing: false,
        firstName: action.payload.firstName,
        lastName: action.payload.lastName,
      };
    case "SET_FIRST_NAME":
      return { ...state, firstName: action.payload };
    case "SET_LAST_NAME":
      return { ...state, lastName: action.payload };
    default:
      return state;
  }
}

export function useUserInformation() {
  const { data: user } = useUser();
  const [state, dispatch] = useReducer(userInformationReducer, initialState);
  const updateProfileMutation = useUpdateProfile();

  // Initialize state when user data loads
  useEffect(() => {
    if (user?.user_metadata) {
      dispatch({
        type: "RESET",
        payload: {
          firstName: user.user_metadata.first_name || "",
          lastName: user.user_metadata.last_name || "",
        },
      });
    }
  }, [user?.user_metadata?.first_name, user?.user_metadata?.last_name]);

  const handleSave = async () => {
    try {
      await updateProfileMutation.mutateAsync({
        firstName: state.firstName,
        lastName: state.lastName,
      });
      dispatch({
        type: "RESET",
        payload: {
          firstName: state.firstName,
          lastName: state.lastName,
        },
      });
      toast.success("Profile updated successfully!");
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to update profile";
      toast.error(errorMessage);
    }
  };

  const handleCancel = () => {
    dispatch({
      type: "CANCEL",
      payload: {
        firstName: user?.user_metadata?.first_name || "",
        lastName: user?.user_metadata?.last_name || "",
      },
    });
  };

  const handleStartEditing = () => {
    dispatch({ type: "START_EDITING" });
  };

  const setFirstName = (name: string) => {
    dispatch({ type: "SET_FIRST_NAME", payload: name });
  };

  const setLastName = (name: string) => {
    dispatch({ type: "SET_LAST_NAME", payload: name });
  };

  return {
    // State
    isEditing: state.isEditing,
    firstName: state.firstName,
    lastName: state.lastName,
    email: user?.email || "",
    isLoading: updateProfileMutation.isPending,

    // Handlers
    handleSave,
    handleCancel,
    handleStartEditing,
    setFirstName,
    setLastName,
  };
}
