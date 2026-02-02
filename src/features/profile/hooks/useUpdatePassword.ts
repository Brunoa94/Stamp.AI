import { useMutation } from "@tanstack/react-query";
import { AuthService } from "@/services/authService";

export function useUpdatePassword() {
  return useMutation({
    mutationFn: (password: string) => AuthService.updatePassword(password),
  });
}
