import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../auth/useAuth";

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  isActive ? "font-semibold text-slate-900" : "text-slate-500 hover:text-slate-700";

export function AppLayout() {
  const { email, logout } = useAuth();

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white px-8 py-4">
        <div className="flex items-center justify-between">
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
        </div>
        <nav className="mt-4 flex gap-4 text-sm">
          <NavLink to="/" end className={navLinkClass}>
            Gastos
          </NavLink>
          <NavLink to="/categories" className={navLinkClass}>
            Categorías
          </NavLink>
        </nav>
      </header>
      <main className="p-8">
        <Outlet />
      </main>
    </div>
  );
}
