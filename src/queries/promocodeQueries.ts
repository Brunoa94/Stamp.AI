import { useMutation } from "@tanstack/react-query";
import { PromoCodeService } from "@/services/promocodeService";
import { ValidatePromoCodePayload } from "@/types/promocode";

export function useValidatePromoCode() {
  return useMutation({
    mutationFn: (payload: ValidatePromoCodePayload) =>
      PromoCodeService.validatePromoCode(payload),
  });
}
