import { useState, type FormEvent } from "react";
import type { components } from "../api/schema";
import { useCategories } from "../features/categories/useCategories";
import {
  useCreateExpense,
  useDeleteExpense,
  useExpenses,
  useUpdateExpense,
} from "../features/expenses/useExpenses";

type Expense = components["schemas"]["ExpenseRead"];

const PAGE_SIZE = 10;

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

export function ExpensesPage() {
  const [page, setPage] = useState(0);
  const skip = page * PAGE_SIZE;
  const { data: expenses, isPending, isError } = useExpenses(skip, PAGE_SIZE);
  const { data: categories } = useCategories();
  const createExpense = useCreateExpense();
  const updateExpense = useUpdateExpense();
  const deleteExpense = useDeleteExpense();

  const [editingId, setEditingId] = useState<number | null>(null);
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(todayIso());
  const [categoryId, setCategoryId] = useState("");

  const categoriesById = new Map((categories ?? []).map((category) => [category.id, category.name]));

  const resetForm = () => {
    setEditingId(null);
    setAmount("");
    setDescription("");
    setDate(todayIso());
    setCategoryId("");
  };

  const startEditing = (expense: Expense) => {
    setEditingId(expense.id);
    setAmount(String(expense.amount));
    setDescription(expense.description);
    setDate(expense.date);
    setCategoryId(String(expense.category_id));
  };

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!amount || !description || !date || !categoryId) return;

    const input = {
      amount: Number(amount),
      description,
      date,
      category_id: Number(categoryId),
    };

    if (editingId !== null) {
      updateExpense.mutate({ id: editingId, input }, { onSuccess: resetForm });
    } else {
      createExpense.mutate(input, { onSuccess: resetForm });
    }
  };

  const mutationError = createExpense.error ?? updateExpense.error;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <h2 className="text-lg font-semibold text-slate-800">Gastos</h2>

      <form
        onSubmit={onSubmit}
        className="grid grid-cols-2 gap-3 rounded-lg border border-slate-200 bg-white p-4 sm:grid-cols-5"
      >
        <input
          type="number"
          step="0.01"
          placeholder="Importe"
          value={amount}
          onChange={(event) => setAmount(event.target.value)}
          className="rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
        />
        <input
          type="text"
          placeholder="Descripción"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          className="rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none sm:col-span-2"
        />
        <input
          type="date"
          value={date}
          onChange={(event) => setDate(event.target.value)}
          className="rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
        />
        <select
          value={categoryId}
          onChange={(event) => setCategoryId(event.target.value)}
          className="rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
        >
          <option value="">Categoría...</option>
          {categories?.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
        <div className="col-span-2 flex gap-2 sm:col-span-5">
          <button
            type="submit"
            disabled={createExpense.isPending || updateExpense.isPending}
            className="rounded-md bg-slate-800 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 disabled:opacity-50"
          >
            {editingId !== null ? "Guardar cambios" : "Añadir gasto"}
          </button>
          {editingId !== null && (
            <button
              type="button"
              onClick={resetForm}
              className="rounded-md border border-slate-300 px-4 py-2 text-sm text-slate-600 hover:bg-slate-100"
            >
              Cancelar
            </button>
          )}
        </div>
      </form>
      {mutationError && <p className="text-sm text-red-600">{mutationError.message}</p>}

      {isPending && <p className="text-sm text-slate-500">Cargando...</p>}
      {isError && <p className="text-sm text-red-600">Error al cargar gastos</p>}

      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
            <tr>
              <th className="px-4 py-2">Fecha</th>
              <th className="px-4 py-2">Descripción</th>
              <th className="px-4 py-2">Categoría</th>
              <th className="px-4 py-2 text-right">Importe</th>
              <th className="px-4 py-2" />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {expenses?.map((expense) => (
              <tr key={expense.id}>
                <td className="px-4 py-2 text-slate-600">{expense.date}</td>
                <td className="px-4 py-2 text-slate-700">{expense.description}</td>
                <td className="px-4 py-2 text-slate-600">
                  {categoriesById.get(expense.category_id) ?? "—"}
                </td>
                <td className="px-4 py-2 text-right text-slate-700">{expense.amount.toFixed(2)} €</td>
                <td className="px-4 py-2 text-right whitespace-nowrap">
                  <button
                    type="button"
                    onClick={() => startEditing(expense)}
                    className="mr-3 text-slate-500 hover:underline"
                  >
                    Editar
                  </button>
                  <button
                    type="button"
                    onClick={() => deleteExpense.mutate(expense.id)}
                    className="text-red-600 hover:underline"
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
            {expenses?.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-slate-400">
                  Sin gastos todavía
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between text-sm">
        <button
          type="button"
          onClick={() => setPage((current) => Math.max(0, current - 1))}
          disabled={page === 0}
          className="rounded-md border border-slate-300 px-3 py-1.5 text-slate-600 disabled:opacity-40"
        >
          Anterior
        </button>
        <span className="text-slate-500">Página {page + 1}</span>
        <button
          type="button"
          onClick={() => setPage((current) => current + 1)}
          disabled={(expenses?.length ?? 0) < PAGE_SIZE}
          className="rounded-md border border-slate-300 px-3 py-1.5 text-slate-600 disabled:opacity-40"
        >
          Siguiente
        </button>
      </div>
    </div>
  );
}
