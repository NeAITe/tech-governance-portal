# AGENTS.md: Project Development & Style Guide

This document outlines the necessary commands and coding conventions for agents working within the Enterprise Tech Stack Governance & Portfolio Portal repository.

## 1. Command Reference

Agents should use these scripts and commands when operating on the development environment, which runs via **Podman Compose**.

### A. Frontend (React/Vite/TS) Commands
| Command | Action | Notes |
| :--- | :--- | :--- |
| `npm run build` | Builds the production application. | Triggers `tsc -b && vite build`. This step must succeed before container deployment. |
| `npm run dev` | Starts the local Vite development server. | Used for local component development. |
| `npm run lint` | Runs ESLint checks across the project. | Alias for `eslint .`. |
| `npm run preview` | Serves the production build locally via Vite. | Useful for pre-commit preview. |
| **Single Test** | **No specific single test runner identified.** | Assume integration testing is currently manual or rely on `npm run lint`. Add specific test scripts if implementing testing. |

### B. Backend (Node/Express/Prisma/TS) Commands
| Command | Action | Notes |
| :--- | :--- | :--- |
| `npm run build` | Compiles TypeScript to JavaScript in `./dist`. | Alias for `tsc`. |
| `npm run dev` | Starts the backend in development mode with hot-reloading. | Alias for `nodemon src/index.ts`. |
| `npm start` | Production startup command (Container). | Alias for `sleep 5 && node dist/index.js`. The 5-second sleep is to allow the database container to initialize. |
| **Migration** | `podman compose exec backend npx prisma migrate dev --name <name>` | **Crucial:** Must be executed inside the running backend container. |
| **Single Test** | **No specific test script found.** | Assume unit/integration tests are not yet implemented. |

## 2. Code Style Guidelines

### A. Frontend (React/TypeScript/Tailwind)
1.  **Component Structure:** Use Functional Components exclusively, leveraging React Hooks (`useState`, `useEffect`, etc.).
2.  **State Management:** Use built-in React Hooks/Context primarily. Avoid adding heavy external state libraries unless explicitly required.
3.  **Styling:** **Tailwind CSS is the standard.**
    *   **Modern Look:** Apply utility classes that favor depth, shadows, soft borders, and subtle animations (e.g., `shadow-lg`, `rounded-xl`, `transition-all`).
    *   **Glassmorphism:** Use the pre-defined utility classes like `.glass` and `.glass-card` for modals, sidebars, and cards to create a modern, floating aesthetic.
    *   **Colors:** Prefer using `slate-` or dynamic gradient utilities over hardcoded hex codes where possible.
    *   **Custom Imports:** The global CSS file (`src/index.css`) imports `tailwindcss` directly and defines the base theme variables (like `Inter` font).
4.  **Navigation:** Use `react-router-dom` (v7) for client-side routing, anchored by the main `Layout` component.
5.  **Icons:** Use **Lucide React** icons (`lucide-react`). Ensure icons are imported and used with appropriate transitions/styling for modern UX feedback.
6.  **API Calls:** Use `fetch` for API communication with the backend running at `http://localhost:3001/api`. Always handle loading and error states (though basic implementation is currently present).

### B. Backend (Node/Express/TypeScript/Prisma)
1.  **Framework:** Node.js 20 with Express. Use TypeScript throughout.
2.  **Database Access:** All database interaction must use **Prisma Client (v7)** configured with the **`@prisma/adapter-pg`** via a PostgreSQL connection pool (`pg`).
3.  **Configuration:** Environment variables MUST be loaded via **`dotenv`**. The `DATABASE_URL` must be referenced in `prisma.config.ts` via `env("DATABASE_URL")`.
4.  **Error Handling:** Implement clear HTTP status codes in JSON responses for all routes.
5.  **Routing:** Organize endpoints by resource in dedicated files (e.g., `routes.ts`) and mount them under an `/api` prefix in `index.ts`.
6.  **Development:** Use `nodemon` for automatic restarts during local development.
7.  **Build Process:** TypeScript compilation (`tsc`) must run successfully before the production `start` script, which is why `prisma generate` is run during the Docker build.

## 3. Configuration & Tooling Notes

*   **No Custom Rules Found:** No `.cursorrules` or `.github/copilot-instructions.md` files exist. Adhere to standard TypeScript/ESLint best practices.
*   **Containerization:** All artifacts are built inside Docker/Podman containers. Local `node_modules` are excluded from the build context via `.dockerignore` files.
