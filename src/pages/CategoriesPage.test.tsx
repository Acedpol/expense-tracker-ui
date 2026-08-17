import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { describe, expect, it } from "vitest";
import { server } from "../test/mswServer";
import { renderWithProviders } from "../test/renderWithProviders";
import { CategoriesPage } from "./CategoriesPage";

const API_BASE = "http://localhost:8000";

describe("CategoriesPage", () => {
  it("renders categories fetched from the API", async () => {
    server.use(
      http.get(`${API_BASE}/categories`, () => HttpResponse.json([{ id: 1, name: "Comida" }])),
    );

    renderWithProviders(<CategoriesPage />);

    expect(await screen.findByText("Comida")).toBeInTheDocument();
  });

  it("shows an empty state when there are no categories", async () => {
    server.use(http.get(`${API_BASE}/categories`, () => HttpResponse.json([])));

    renderWithProviders(<CategoriesPage />);

    expect(await screen.findByText(/sin categorías todavía/i)).toBeInTheDocument();
  });

  it("creates a category and shows it in the list", async () => {
    let created = false;
    server.use(
      http.get(`${API_BASE}/categories`, () =>
        HttpResponse.json(created ? [{ id: 1, name: "Ocio" }] : []),
      ),
      http.post(`${API_BASE}/categories`, async ({ request }) => {
        const body = (await request.json()) as { name: string };
        created = true;
        return HttpResponse.json({ id: 1, name: body.name }, { status: 201 });
      }),
    );

    const user = userEvent.setup();
    renderWithProviders(<CategoriesPage />);

    expect(await screen.findByText(/sin categorías todavía/i)).toBeInTheDocument();

    await user.type(screen.getByPlaceholderText(/nueva categoría/i), "Ocio");
    await user.click(screen.getByRole("button", { name: /añadir/i }));

    expect(await screen.findByText("Ocio")).toBeInTheDocument();
  });

  it("shows an error message when creation fails", async () => {
    server.use(
      http.get(`${API_BASE}/categories`, () => HttpResponse.json([])),
      http.post(
        `${API_BASE}/categories`,
        () => HttpResponse.json({ error: "boom" }, { status: 500 }),
      ),
    );

    const user = userEvent.setup();
    renderWithProviders(<CategoriesPage />);

    await screen.findByText(/sin categorías todavía/i);
    await user.type(screen.getByPlaceholderText(/nueva categoría/i), "Ocio");
    await user.click(screen.getByRole("button", { name: /añadir/i }));

    expect(await screen.findByText(/no se pudo crear la categoría/i)).toBeInTheDocument();
  });
});
