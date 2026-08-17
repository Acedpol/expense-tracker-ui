import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createExpense, deleteExpense, fetchExpenses, updateExpense, type ExpenseInput } from "./api";

export const expensesQueryKey = (skip: number, limit: number) => ["expenses", skip, limit] as const;

export function useExpenses(skip: number, limit: number) {
  return useQuery({
    queryKey: expensesQueryKey(skip, limit),
    queryFn: () => fetchExpenses(skip, limit),
  });
}

function useInvalidateExpenses() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: ["expenses"] });
}

export function useCreateExpense() {
  const invalidate = useInvalidateExpenses();
  return useMutation({ mutationFn: createExpense, onSuccess: invalidate });
}

export function useUpdateExpense() {
  const invalidate = useInvalidateExpenses();
  return useMutation({
    mutationFn: ({ id, input }: { id: number; input: Partial<ExpenseInput> }) => updateExpense(id, input),
    onSuccess: invalidate,
  });
}

export function useDeleteExpense() {
  const invalidate = useInvalidateExpenses();
  return useMutation({ mutationFn: deleteExpense, onSuccess: invalidate });
}
