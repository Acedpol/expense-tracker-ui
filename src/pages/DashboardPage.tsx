import { useAuth } from "../auth/useAuth";

export function DashboardPage() {
  const { email, logout } = useAuth();

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <header className="mb-8 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-slate-800">Expense Tracker</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm text-slate-500">{email}</span>
          <button
            type="button"
            onClick={logout}
            className="rounded-md border border-slate-300 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-100"
          >
            Cerrar sesión
          </button>
        </div>
      </header>
      <p className="text-slate-500">Categorías y gastos llegan en el siguiente paso.</p>
    </div>
  );
}
