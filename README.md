# Full-Stack Monorepo (Next.js + Express.js)

A feature-based / vertical-slice monorepo structure designed for **teams of multiple developers** collaborating simultaneously without merge conflicts.

---

## 📁 Repository Structure

```text
hackethon/
├── backend/                        # Express.js REST API
│   ├── src/
│   │   ├── common/                 # Shared cross-cutting concerns
│   │   │   ├── config/             # Environment & global configs
│   │   │   ├── errors/             # Standard AppError classes
│   │   │   ├── middlewares/        # Auth, Validation, Error Handler
│   │   │   └── utils/              # Response formatters, logger
│   │   ├── features/               # Vertical Slice feature modules
│   │   │   ├── auth/               # routes, controller, service, validator
│   │   │   ├── tasks/              # routes, controller, service, repo, validator
│   │   │   └── index.ts            # Central Feature Registry (single-line mounting)
│   │   ├── app.ts                  # Express application setup
│   │   └── server.ts               # Server entry point
│   ├── .env.example
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/                       # Next.js App Router
│   ├── src/
│   │   ├── app/                    # Thin page orchestrators
│   │   │   ├── layout.tsx
│   │   │   └── page.tsx
│   │   ├── components/
│   │   │   ├── layout/             # Navbar, Sidebar, Footer
│   │   │   └── ui/                 # Reusable UI primitives (Button, Card, Badge)
│   │   ├── features/               # Isolated feature modules
│   │   │   ├── auth/               # Auth UI components & hooks
│   │   │   └── tasks/              # TaskCard, TaskList, useTasks hook, api
│   │   ├── hooks/                  # Global utility hooks
│   │   ├── lib/                    # apiClient, constants, helpers
│   │   └── types/                  # Global UI types
│   ├── public/
│   ├── package.json
│   └── tsconfig.json
│
├── shared/                         # Shared Types & Contracts
│   ├── src/
│   │   ├── constants/              # Route constants & status codes
│   │   ├── types/                  # API responses, Auth & Task DTOs
│   │   └── index.ts                # Single source of truth export
│   ├── package.json
│   └── tsconfig.json
│
├── CONTRIBUTING.md                 # Multi-developer workflow & guidelines
└── package.json                    # Monorepo workspaces coordinator
```

---

## 🛠️ Quick Start

### 1. Install Dependencies
Run from the root directory:
```bash
npm install
```

### 2. Run in Development Mode
You can run both or individual workspaces:

```bash
# Run both frontend and backend concurrently
npm run dev

# Or run separately:
npm run dev:frontend   # Next.js on http://localhost:3000
npm run dev:backend    # Express on http://localhost:5000
```

---

## 👥 Multi-Developer Workflow
Check [CONTRIBUTING.md](file:///c:/Users/Themiya%20madushanka/Documents/hackethon/hackethon/CONTRIBUTING.md) for conventions on adding new features, folder organization, and minimizing merge conflicts.
