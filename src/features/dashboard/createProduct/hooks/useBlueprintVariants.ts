import { useQuery } from "@tanstack/react-query";
import { PrintifyService, BlueprintVariantsResponse } from "@/services/printifyService";

export function useBlueprintVariants(
  blueprintId: number | undefined,
  printProviderId: number | undefined
) {
  return useQuery({
    queryKey: ["blueprint-variants", blueprintId, printProviderId],
    queryFn: () => {
      if (!blueprintId) {
        throw new Error("Blueprint ID is required");
      }
      return PrintifyService.getBlueprintVariants(blueprintId, printProviderId);
    },
    enabled: !!blueprintId,
    staleTime: 1000 * 60 * 10, // 10 minutes
    retry: 2,
  });
}
