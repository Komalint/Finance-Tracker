import { useQueryClient } from "@tanstack/react-query";
import {
  useCreateTransaction as useApiCreateTransaction,
  useUpdateTransaction as useApiUpdateTransaction,
  useDeleteTransaction as useApiDeleteTransaction,
  getListTransactionsQueryKey,
  getGetDashboardSummaryQueryKey,
  getGetMonthlyTrendQueryKey,
  getGetCategoryBreakdownQueryKey,
  getGetInsightsQueryKey,
  getGetTransactionQueryKey
} from "@workspace/api-client-react";

export function useTransactionsMutations() {
  const queryClient = useQueryClient();

  const invalidateAll = () => {
    queryClient.invalidateQueries({ queryKey: getListTransactionsQueryKey() });
    queryClient.invalidateQueries({ queryKey: getGetDashboardSummaryQueryKey() });
    queryClient.invalidateQueries({ queryKey: getGetMonthlyTrendQueryKey() });
    queryClient.invalidateQueries({ queryKey: getGetCategoryBreakdownQueryKey() });
    queryClient.invalidateQueries({ queryKey: getGetInsightsQueryKey() });
  };

  const createMutation = useApiCreateTransaction({
    mutation: {
      onSuccess: () => {
        invalidateAll();
      }
    }
  });

  const updateMutation = useApiUpdateTransaction({
    mutation: {
      onSuccess: (_, variables) => {
        queryClient.invalidateQueries({ queryKey: getGetTransactionQueryKey(variables.id) });
        invalidateAll();
      }
    }
  });

  const deleteMutation = useApiDeleteTransaction({
    mutation: {
      onSuccess: (_, variables) => {
        queryClient.invalidateQueries({ queryKey: getGetTransactionQueryKey(variables.id) });
        invalidateAll();
      }
    }
  });

  return {
    createTransaction: createMutation,
    updateTransaction: updateMutation,
    deleteTransaction: deleteMutation
  };
}
