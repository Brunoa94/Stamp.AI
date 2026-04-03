import { useMutation } from "@tanstack/react-query";
import { useQuery } from "@tanstack/react-query";
import { PromoCodeService } from "@/services/promocodeService";
import { ValidatePromoCodePayload } from "@/types/promocode";

export function useAvailablePromoCodes() {
  return useQuery({
    queryKey: ["promocodes", "available"],
    queryFn: () => PromoCodeService.getAvailablePromoCodes(),
    staleTime: 5 * 60 * 1000,
  });
}

export function useValidatePromoCode() {
  return useMutation({
    mutationFn: (payload: ValidatePromoCodePayload) =>
      PromoCodeService.validatePromoCode(payload),
  });
}
