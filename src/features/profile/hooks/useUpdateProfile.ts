import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AuthService } from "@/services/authService";
import type { UpdateProfileI } from "@/schemas/auth";

export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateProfileI) => AuthService.updateProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user"] });
    },
  });
}
