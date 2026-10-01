# Taskora

**Taskora** is a modern, responsive to-do list and notes application built for the **HNG Internship 15 - Stage 1** assignment. It helps you capture tasks, organize them by priority, track what is done, and keep detailed notes on every task - with everything persisted in your browser.

## Features

### Task management
- Create, view, edit, and delete tasks
- Mark tasks as completed or incomplete with a single click
- Every task shows its creation date
- Task priority levels: **Low**, **Medium**, and **High** with color-coded indicators

### Notes
- Add notes to individual tasks
- Edit and delete notes inline from the task details panel
- Notes are preserved after refreshing the page

### Productivity tools
- **Filter** tasks: All, Active, Completed
- **Search** tasks by title or description
- **Summary cards** showing total, active, and completed task counts
- Completion progress bar in the sidebar

### Design
- Clean productivity dashboard with a sidebar navigation and main task grid
- Responsive layouts for mobile, tablet, and desktop (off-canvas sidebar on small screens)
- Empty states for first run, filtered views, and search results
- Accessible: labeled form controls, `aria-*` attributes, focus trapping in dialogs, Escape to close, visible keyboard focus
- Confirmation dialogs before destructive actions
- Warning banner if browser storage is unavailable (private mode, quota exceeded)

## Tech stack

| Tool | Purpose |
| --- | --- |
| [React 19](https://react.dev/) | UI library |
| [TypeScript](https://www.typescriptlang.org/) | Type safety |
| [Vite 8](https://vite.dev/) | Dev server and build tool |
| [Tailwind CSS 4](https://tailwindcss.com/) | Utility-first styling (`@tailwindcss/vite` plugin) |
| [Lucide React](https://lucide.dev/) | Icons |
| `localStorage` | Persistent storage (no backend required) |

## Getting started locally

### Prerequisites
- [Node.js](https://nodejs.org/) 20.19+ or 22.12+ (Node 24 recommended)
- npm 10+

### Steps

```bash
# 1. Install dependencies
npm install

# 2. Start the development server
npm run dev
```

Then open the URL printed in the terminal (usually **http://localhost:5173**) in your browser.

### Local development commands

```bash
npm install     # install dependencies (first time only)
npm run dev     # start dev server (hot reload) → http://localhost:5173
npm test        # run the automated test suite (Node's built-in test runner)
npm run preview # preview the production build locally
```

### Production build

```bash
npm run build
```

This runs two steps:

1. `tsc -b` — full TypeScript type check (fails the build on any type error)
2. `vite build` — bundles the optimized production site into `dist/`

The `dist/` folder is fully static and can be hosted on any static host.

### Testing

Tests live in `tests/*.test.ts` and run with **zero extra dependencies** — Node's
native TypeScript support executes `node --test` directly. They cover task
creation, editing, deletion, completion, notes management, filtering, search,
input validation, data persistence (save → reload), and stored-data sanitization.

See [AGENTS.md](./AGENTS.md) for contributor and AI-agent guidelines.

## Deployment

Taskora is a fully static SPA with **no backend and no environment variables**,
so any static host works. It is configured for **Vercel**:

| Setting | Value |
| --- | --- |
| Build command | `npm run build` |
| Output directory | `dist` |
| Install command | `npm install` |
| Environment variables | none required |
| Framework preset | Vite (explicitly set in `vercel.json`) |

These values are committed in [`vercel.json`](./vercel.json), so deploying is
one of the following:

**Option A — Vercel dashboard (easiest):** push this repo to GitHub, then in
Vercel → *Add New* → *Project* → import the repo. Vercel reads `vercel.json`
automatically → *Deploy*.

**Option B — Vercel CLI:**

```bash
npm i -g vercel   # if not already installed
vercel login      # sign in with your GitHub/email account
vercel deploy --prod
```

**Netlify alternative:** build command `npm run build`, publish directory `dist`.

## Project structure

```
Taskora/
├── index.html                 # Browser title: "Taskora - To-Do List & Notes"
├── package.json               # scripts: dev, test, build, preview
├── vercel.json                # Vercel build configuration
├── vite.config.ts             # React + Tailwind CSS plugins
├── tsconfig*.json
├── AGENTS.md                  # Contributor / AI-agent guidelines
├── public/
│   └── taskora.svg            # App icon
├── tests/                     # Automated tests (node --test)
│   ├── taskOps.test.ts        # creation, editing, deletion, completion, notes
│   ├── helpers.test.ts        # filtering, search, stats, validation
│   └── storage.test.ts        # persistence round trip + sanitization
└── src/
    ├── main.tsx               # Entry point
    ├── App.tsx                # Layout + application state wiring
    ├── index.css              # Tailwind import + base styles
    ├── types/index.ts         # Shared TypeScript types (Task, Note, Priority...)
    ├── hooks/
    │   ├── useLocalStorage.ts # Generic persisted state hook
    │   └── useTasks.ts        # All task/note logic (separated from UI)
    ├── utils/
    │   ├── helpers.ts         # Filtering, search, stats, validation, formatting
    │   ├── storage.ts         # Safe localStorage read/write + data sanitizing
    │   └── taskOps.ts         # Immutable task/note state transitions
    └── components/
        ├── Sidebar.tsx            # Navigation, counts, progress
        ├── AppHeader.tsx          # Title + Add Task button
        ├── StatsSummary.tsx       # Total / active / completed cards
        ├── SearchBar.tsx
        ├── FilterTabs.tsx
        ├── TaskList.tsx
        ├── TaskCard.tsx           # Priority badge, date, actions
        ├── TaskFormModal.tsx      # Create/edit form with validation
        ├── TaskDetailsPanel.tsx   # Task details + notes area
        ├── ConfirmDialog.tsx
        ├── Modal.tsx              # Accessible dialog shell (focus trap, Escape)
        └── EmptyState.tsx
```

## Data & privacy

Taskora stores tasks and notes in your browser's `localStorage` under the key `taskora.tasks.v1`. Nothing leaves your device - there is no server or account. Stored data is validated on load, so corrupted entries are repaired or dropped instead of crashing the app.

## License

Free to use for the HNG Internship assignment.
