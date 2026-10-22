# Multi-Developer Collaboration Guide

This repository uses a **Vertical Slice / Feature-Based Monorepo Architecture** designed specifically for multiple developers working simultaneously without merge conflicts.

---

## 🏗️ Architectural Principle: Feature Isolation

Instead of grouping code by technical type (`controllers/`, `services/`, `components/`), all code related to a single domain/business feature lives together in that feature's directory:

```
frontend/src/features/<feature-name>/
backend/src/features/<feature-name>/
shared/src/types/<feature-name>.types.ts
```

### Why this prevents merge conflicts:
1. **Developer A** working on `auth` only modifies files in `features/auth/`.
2. **Developer B** working on `tasks` only modifies files in `features/tasks/`.
3. They never touch each other's routes, controllers, hooks, or components!

---

## 🚀 How to Add a New Feature (Step-by-Step)

When assigned a new task (e.g., `projects`):

### 1. Define Shared Contracts first (`shared/`)
- Create `shared/src/types/project.types.ts`:
  ```ts
  export interface Project { id: string; name: string; }
  export interface CreateProjectDto { name: string; }
  ```
- Export it in `shared/src/index.ts`.
- Run `npm run build --workspace=shared` if using compiled outputs.

### 2. Implement the Backend Feature (`backend/`)
Create `backend/src/features/projects/` containing:
- `projects.repository.ts`: Data access layer (database queries/ORM)
- `projects.service.ts`: Business logic & rules
- `projects.validator.ts`: Request validation
- `projects.controller.ts`: HTTP request/response handler
- `projects.routes.ts`: Express router definitions
- `index.ts`: Barrel export (`export * from './projects.routes'`)

Register your route in `backend/src/features/index.ts`:
```ts
app.use('/api/v1/projects', projectsRouter);
```

### 3. Implement the Frontend Feature (`frontend/`)
Create `frontend/src/features/projects/` containing:
- `api/projects.api.ts`: API calls using `@/lib/api-client`
- `hooks/useProjects.ts`: React state/data-fetching hook
- `components/ProjectList.tsx`: Feature UI components
- `index.ts`: Public feature exports

Create or attach your page in `frontend/src/app/projects/page.tsx`:
```tsx
import { ProjectList } from '@/features/projects';

export default function ProjectsPage() {
  return <ProjectList />;
}
```

---

## 🌿 Git & Branching Strategy

1. **Branch Naming**:
   - `feature/<ticket-or-task-id>-<short-description>` (e.g. `feature/DEV-102-project-crud`)
   - `fix/<ticket-or-task-id>-<short-description>`
2. **Commit Hygiene**:
   - Keep commits scoped strictly to your feature folder.
   - Avoid formatting global/shared files unnecessarily.
3. **Barrel Exports**:
   - Always import from `@/features/<feature-name>` rather than deep relative paths, preserving internal encapsulation.
