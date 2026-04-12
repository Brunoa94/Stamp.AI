import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { PaymentRecoveryService } from "@/services/paymentRecoveryService";
import type { PaymentRecoveryRecordI } from "@/services/paymentRecoveryService";
import { useUser } from "@/queries/authQueries";
import { useErrorHandler } from "@/hooks/useErrorHandler";

/**
 * Hook to manage payment recovery
 *
 * Automatically checks for pending payment recoveries when user logs in
 * Provides methods to process or dismiss recoveries
 */
export function usePaymentRecovery() {
  const { data: user } = useUser();
  const queryClient = useQueryClient();
  const { handleError } = useErrorHandler();
  const [hasChecked, setHasChecked] = useState(false);

  // Query for pending recoveries
  const {
    data: pendingRecoveries = [],
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["payment-recoveries", user?.id],
    queryFn: () => PaymentRecoveryService.getPendingRecoveries(),
    enabled: !!user && !hasChecked, // Only check once when user loads
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Mark as checked after first load
  useEffect(() => {
    if (!isLoading && pendingRecoveries !== undefined) {
      setHasChecked(true);
    }
  }, [isLoading, pendingRecoveries]);

  // Mutation to process a recovery
  const processRecovery = useMutation({
    mutationFn: (recovery: PaymentRecoveryRecordI) =>
      PaymentRecoveryService.processRecovery(recovery),
    onSuccess: (result) => {
      if (result.success) {
        console.log("✅ Recovery processed, order created:", result.orderId);

        // Invalidate queries
        queryClient.invalidateQueries({ queryKey: ["payment-recoveries"] });
        queryClient.invalidateQueries({ queryKey: ["orders"] });
        queryClient.invalidateQueries({ queryKey: ["cart"] });
      } else {
        console.error("❌ Recovery failed:", result.error);
      }
    },
    onError: (error: Error) => {
      handleError(error);
    },
  });

  // Mutation to dismiss a recovery
  const dismissRecovery = useMutation({
    mutationFn: (recoveryId: string) =>
      PaymentRecoveryService.dismissRecovery(recoveryId),
    onSuccess: () => {
      console.log("✅ Recovery dismissed");
      queryClient.invalidateQueries({ queryKey: ["payment-recoveries"] });
    },
    onError: (error: Error) => {
      handleError(error);
    },
  });

  // Manual recheck function (useful after login)
  const recheckRecoveries = () => {
    setHasChecked(false);
    refetch();
  };

  // UI state for processing/dismissed recoveries (moved here from component)
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());

  // High-level recover function that manages UI state and calls the mutation
  const recover = async (recovery: PaymentRecoveryRecordI) => {
    setProcessingId(recovery.id);
    try {
      const result = await processRecovery.mutateAsync(recovery);

      if (result.success) {
        // mark as dismissed/processed locally
        setDismissedIds((prev) => new Set([...prev, recovery.id]));
      }

      return result;
    } finally {
      setProcessingId(null);
    }
  };

  // High-level dismiss that manages UI state and calls the mutation
  const dismiss = async (recoveryId: string) => {
    try {
      await dismissRecovery.mutateAsync(recoveryId);
      setDismissedIds((prev) => new Set([...prev, recoveryId]));
    } catch (error) {
      throw error;
    }
  };

  return {
    pendingRecoveries,
    isLoading,
    hasPendingRecoveries: pendingRecoveries.length > 0,
    processRecovery: processRecovery.mutateAsync,
    dismissRecovery: dismissRecovery.mutateAsync,
    isProcessing: processRecovery.isPending,
    isDismissing: dismissRecovery.isPending,
    // UI helpers
    processingId,
    dismissedIds,
    recover,
    dismiss,
    recheckRecoveries,
  };
}
