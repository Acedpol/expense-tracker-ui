import { apiClient } from "../../api/client";

export interface ExpenseInput {
  amount: number;
  description: string;
  date: string;
  category_id: number;
}

export async function fetchExpenses(skip: number, limit: number) {
  const { data, error } = await apiClient.GET("/expenses", {
    params: { query: { skip, limit } },
  });
  if (error) throw new Error("No se pudieron cargar los gastos");
  return data;
}

export async function createExpense(input: ExpenseInput) {
  const { data, error } = await apiClient.POST("/expenses", { body: input });
  if (error) throw new Error("No se pudo crear el gasto");
  return data;
}

export async function updateExpense(expenseId: number, input: Partial<ExpenseInput>) {
  const { data, error } = await apiClient.PATCH("/expenses/{expense_id}", {
    params: { path: { expense_id: expenseId } },
    body: input,
  });
  if (error) throw new Error("No se pudo actualizar el gasto");
  return data;
}

export async function deleteExpense(expenseId: number) {
  const { error } = await apiClient.DELETE("/expenses/{expense_id}", {
    params: { path: { expense_id: expenseId } },
  });
  if (error) throw new Error("No se pudo eliminar el gasto");
}
