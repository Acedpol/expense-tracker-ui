import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { describe, expect, it } from "vitest";
import { server } from "../test/mswServer";
import { renderWithProviders } from "../test/renderWithProviders";
import { LoginPage } from "./LoginPage";

const API_BASE = "http://localhost:8000";

describe("LoginPage", () => {
  it("shows validation errors without calling the API", async () => {
    const user = userEvent.setup();
    renderWithProviders(<LoginPage />);

    await user.click(screen.getByRole("button", { name: /entrar/i }));

    expect(await screen.findByText(/email inválido/i)).toBeInTheDocument();
  });

  it("logs in successfully and stores the token", async () => {
    server.use(
      http.post(`${API_BASE}/auth/login`, () =>
        HttpResponse.json({ access_token: "fake.jwt.token", token_type: "bearer" }),
      ),
    );

    const user = userEvent.setup();
    renderWithProviders(<LoginPage />);

    await user.type(screen.getByLabelText(/email/i), "demo@example.com");
    await user.type(screen.getByLabelText(/contraseña/i), "secret123");
    await user.click(screen.getByRole("button", { name: /entrar/i }));

    await waitFor(() => {
      expect(window.localStorage.getItem("expense_tracker_token")).toBe("fake.jwt.token");
    });
  });

  it("shows the backend's error message on invalid credentials", async () => {
    server.use(
      http.post(
        `${API_BASE}/auth/login`,
        () => HttpResponse.json({ error: "Incorrect email or password" }, { status: 401 }),
      ),
    );

    const user = userEvent.setup();
    renderWithProviders(<LoginPage />);

    await user.type(screen.getByLabelText(/email/i), "demo@example.com");
    await user.type(screen.getByLabelText(/contraseña/i), "wrongpass");
    await user.click(screen.getByRole("button", { name: /entrar/i }));

    expect(await screen.findByText(/incorrect email or password/i)).toBeInTheDocument();
  });
});
