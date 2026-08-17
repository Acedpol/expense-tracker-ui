import { apiClient } from "../../api/client";

export async function fetchCategories() {
  const { data, error } = await apiClient.GET("/categories", {
    params: { query: { skip: 0, limit: 200 } },
  });
  if (error) throw new Error("No se pudieron cargar las categorías");
  return data;
}

export async function createCategory(name: string) {
  const { data, error } = await apiClient.POST("/categories", {
    body: { name },
  });
  if (error) throw new Error("No se pudo crear la categoría");
  return data;
}

export async function updateCategory(categoryId: number, name: string) {
  const { data, error } = await apiClient.PATCH("/categories/{category_id}", {
    params: { path: { category_id: categoryId } },
    body: { name },
  });
  if (error) throw new Error("No se pudo actualizar la categoría");
  return data;
}

export async function deleteCategory(categoryId: number) {
  const { error } = await apiClient.DELETE("/categories/{category_id}", {
    params: { path: { category_id: categoryId } },
  });
  if (error) throw new Error("No se pudo eliminar la categoría");
}
