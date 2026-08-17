import { useState, type FormEvent } from "react";
import {
  useCategories,
  useCreateCategory,
  useDeleteCategory,
  useUpdateCategory,
} from "../features/categories/useCategories";

export function CategoriesPage() {
  const { data: categories, isPending, isError } = useCategories();
  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();
  const deleteCategory = useDeleteCategory();
  const [name, setName] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingName, setEditingName] = useState("");

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!name.trim()) return;
    createCategory.mutate(name.trim(), { onSuccess: () => setName("") });
  };

  const startEditing = (id: number, currentName: string) => {
    setEditingId(id);
    setEditingName(currentName);
  };

  const saveEditing = (id: number) => {
    if (!editingName.trim()) return;
    updateCategory.mutate(
      { id, name: editingName.trim() },
      { onSuccess: () => setEditingId(null) },
    );
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h2 className="text-lg font-semibold text-slate-800">Categorías</h2>

      <form onSubmit={onSubmit} className="flex gap-2">
        <input
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Nueva categoría"
          className="flex-1 rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
        />
        <button
          type="submit"
          disabled={createCategory.isPending}
          className="rounded-md bg-slate-800 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 disabled:opacity-50"
        >
          Añadir
        </button>
      </form>
      {createCategory.isError && (
        <p className="text-sm text-red-600">{createCategory.error.message}</p>
      )}

      {isPending && <p className="text-sm text-slate-500">Cargando...</p>}
      {isError && <p className="text-sm text-red-600">Error al cargar categorías</p>}

      <ul className="divide-y divide-slate-200 rounded-lg border border-slate-200 bg-white">
        {categories?.map((category) => (
          <li key={category.id} className="flex items-center justify-between gap-2 px-4 py-3">
            {editingId === category.id ? (
              <>
                <input
                  value={editingName}
                  onChange={(event) => setEditingName(event.target.value)}
                  className="flex-1 rounded-md border border-slate-300 px-2 py-1 text-sm focus:border-slate-500 focus:outline-none"
                  autoFocus
                />
                <div className="flex gap-3 text-sm">
                  <button
                    type="button"
                    onClick={() => saveEditing(category.id)}
                    disabled={updateCategory.isPending}
                    className="text-slate-700 hover:underline disabled:opacity-50"
                  >
                    Guardar
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingId(null)}
                    className="text-slate-400 hover:underline"
                  >
                    Cancelar
                  </button>
                </div>
              </>
            ) : (
              <>
                <span className="text-sm text-slate-700">{category.name}</span>
                <div className="flex gap-3 text-sm">
                  <button
                    type="button"
                    onClick={() => startEditing(category.id, category.name)}
                    className="text-slate-500 hover:underline"
                  >
                    Editar
                  </button>
                  <button
                    type="button"
                    onClick={() => deleteCategory.mutate(category.id)}
                    className="text-red-600 hover:underline"
                  >
                    Eliminar
                  </button>
                </div>
              </>
            )}
          </li>
        ))}
        {categories?.length === 0 && (
          <li className="px-4 py-3 text-sm text-slate-400">Sin categorías todavía</li>
        )}
      </ul>
    </div>
  );
}
