# Expense Tracker UI

[![CI](https://github.com/Acedpol/expense-tracker-ui/actions/workflows/ci.yml/badge.svg)](https://github.com/Acedpol/expense-tracker-ui/actions/workflows/ci.yml)

SPA de React que consume [`expense-api`](https://github.com/Acedpol/expense-api) por HTTP. Proyecto de portfolio con foco en **frontend**: auth real, CRUD, tipado end-to-end contra el backend, tests, CI.

Son dos repos completamente independientes — historial propio, CI propio — que solo se relacionan porque este consume la API del otro por red, no porque compartan código.

## Stack

- React 19 + TypeScript + Vite
- Tailwind CSS 4
- React Router (rutas protegidas, layout anidado con `<Outlet/>`)
- TanStack Query (estado de servidor: cache, loading, invalidación tras mutaciones)
- React Hook Form + Zod (validación de formularios en cliente)
- **Tipos generados desde el backend**: `openapi-typescript` genera `src/api/schema.ts` a partir del `/openapi.json` real de `expense-api`, y `openapi-fetch` lo usa para tener un cliente HTTP donde cada request/response está tipado contra el backend de verdad — si cambia un schema en el backend, aquí rompe en tiempo de compilación, no en producción
- Vitest + React Testing Library + MSW (mock de la API en tests)

## Arrancar en local

Necesitas [`expense-api`](https://github.com/Acedpol/expense-api) corriendo en paralelo (por defecto en `http://localhost:8000`, con `CORS_ORIGINS` ya configurado para aceptar `http://localhost:5173`).

```bash
npm install
cp .env.example .env.local
npm run dev
```

Abre `http://localhost:5173`. Regístrate desde la propia UI — no hay seed de datos.

## Regenerar los tipos de la API

Cuando cambie algo en el backend:

```bash
# con expense-api corriendo en localhost:8000
npm run gen:api
```

## Tests

```bash
npm test
```

10 tests: validación de schema (zod), flujo de login (validación en cliente, éxito, error del backend) y CRUD de categorías — todo contra un backend simulado con MSW, sin depender de que `expense-api` esté levantado.

## Estructura

```
src/
├── api/           # cliente tipado (client.ts) + tipos generados (schema.ts)
├── auth/          # AuthProvider, useAuth, validación de credenciales
├── features/      # lógica de datos por dominio (categories/, expenses/) — API calls + hooks de TanStack Query
├── layout/         # AppLayout: header + nav + <Outlet/>
├── lib/             # helpers (token en localStorage, decodificar JWT, mensajes de error)
├── pages/            # páginas: Login, Register, Categories, Expenses
├── routes/            # ProtectedRoute
└── test/               # setup de Vitest, MSW server, helper de render con providers
```

## Estado del proyecto / hitos

- [x] Scaffold Vite + React + TypeScript
- [x] Tailwind CSS
- [x] Cliente API tipado generado desde el OpenAPI del backend
- [x] Auth real (registro, login, logout) contra `expense-api`
- [x] Rutas protegidas + layout anidado
- [x] CRUD completo de Categorías (crear, listar, editar, eliminar)
- [x] CRUD completo de Gastos (crear, listar, editar, eliminar, paginación, selector de categoría)
- [x] Manejador global de 401 (token caducado → logout automático → redirect a login)
- [x] Tests (Vitest + RTL + MSW)
- [x] CI en GitHub Actions

Pendiente:
- [ ] Deploy real (Vercel/Netlify) — aplazado, igual que el deploy de `expense-api`, por necesitar cuenta propia
- [ ] Filtros/búsqueda en la lista de gastos
- [ ] Gráficos de gasto por categoría

## Bugs reales encontrados construyendo esto

Vale la pena dejar constancia porque son el tipo de cosas que no salen haciendo solo `curl` contra el backend:

1. **Backend:** `ExpenseUpdate.date` solo aceptaba `null` — nunca se pudo actualizar la fecha de un gasto vía API. Causa: mismo bug de *shadowing* de nombres en Python que ya había aparecido antes en un modelo SQLAlchemy, esta vez en un schema Pydantic (`date: Optional[date] = None` sombrea el propio tipo `date` importado). Lo detectó el generador de tipos del frontend (`openapi-typescript` generó `date?: null` en vez de `date?: string | null`), no ningún test existente. Arreglado en `expense-api` con test de regresión.
2. **Frontend:** un JWT caducado a mitad de sesión rompía la UI con un error genérico en vez de mandar al usuario a login. Solucionado con un manejador global de 401 en el cliente API.
3. **Tooling:** Node 22+ trae un `localStorage` global experimental que rompe silenciosamente los tests con jsdom si no se pasa `--localstorage-file`. Y `openapi-fetch` captura `fetch` una sola vez al crear el cliente, así que los mocks de MSW nunca interceptaban nada hasta envolverlo en una función que resuelve `globalThis.fetch` en cada llamada.
