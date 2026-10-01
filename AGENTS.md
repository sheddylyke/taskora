# AGENTS.md — Instructions for AI Coding Agents

Read this file fully before modifying the Taskora codebase. Follow every rule below.

---

## 1. Project purpose and requirements

**Taskora** is a responsive to-do list and notes application built for the HNG Internship 15 – Stage 1 assignment. It runs entirely in the browser (no backend, no accounts).

Required features — **all of these must keep working after any change**:

- Create, view, edit, and delete tasks.
- Mark tasks as completed / incomplete.
- Display task creation dates.
- Add, edit, and delete notes attached to individual tasks.
- Persist tasks and notes in `localStorage` so nothing is lost on refresh.
- Task priority levels: `low`, `medium`, `high`.
- Task filtering: `all`, `active`, `completed`.
- Search by task title or description.
- Summary statistics: total, active, completed.
- Polished, responsive (mobile / tablet / desktop), accessible UI with empty states.

The application name **Taskora** must appear in the UI, browser title, README, and any documentation.

## 2. Technology stack

| Concern | Choice (do not substitute) |
| --- | --- |
| UI library | React 19 (function components + hooks only) |
| Language | TypeScript 5.9, `strict` mode |
| Build tool | Vite 8 (`@vitejs/plugin-react`) |
| Styling | Tailwind CSS 4 via `@tailwindcss/vite` (utility classes in JSX; `src/index.css` holds `@import "tailwindcss"` + `@theme` + base styles) |
| Icons | `lucide-react` |
| Persistence | Browser `localStorage` (no network calls) |
| Tests | Node.js built-in test runner (`node --test`) with native TypeScript type stripping — **no test framework dependency** |

## 3. Project structure and coding conventions

```
Taskora/
├── index.html                 # Browser title: "Taskora - To-Do List & Notes"
├── package.json               # scripts: dev, build, preview, test
├── vite.config.ts             # React + Tailwind plugins (do not remove)
├── tsconfig*.json             # strict, noUnusedLocals, noUnusedParameters, verbatimModuleSyntax
├── src/
│   ├── main.tsx               # Entry point
│   ├── App.tsx                # Layout + UI state wiring only
│   ├── index.css              # Tailwind import, theme, base styles
│   ├── types/index.ts         # ALL shared TypeScript types
│   ├── hooks/                 # React hooks (state wiring only)
│   │   ├── useLocalStorage.ts
│   │   └── useTasks.ts
│   ├── utils/                 # Pure, framework-free logic (unit-tested)
│   │   ├── helpers.ts         # filtering, search, stats, validation, formatting
│   │   ├── storage.ts         # safe localStorage read/write + sanitization
│   │   └── taskOps.ts         # immutable task/note state transitions
│   └── components/            # Reusable presentational components
└── tests/                     # *.test.ts run by `npm test`
```

Conventions:

- One component per file; file name matches the exported component (PascalCase). Components use a **default export**; hooks/utilities use named exports.
- Props are declared as an `interface XxxProps` at the top of the component file.
- Use relative imports (no path aliases). Inside `src/`, imports are extensionless (e.g. `../utils/helpers`) **except** `src/utils/taskOps.ts`, which imports `./helpers.ts` with an explicit extension because Node executes it during tests.
- Keep class names readable: template literals with conditional Tailwind strings; no `clsx`/`classnames` dependency.
- 2-space indentation; semicolons required; double quotes for strings (JSX attributes as written in existing files).
- Inline comments explain *why*, not *what*. Keep JSDoc on exported functions.

## 4. Component organization

- **`src/components/`** — presentational UI only (Sidebar, AppHeader, TaskCard, TaskFormModal, TaskDetailsPanel, Modal, ConfirmDialog, SearchBar, FilterTabs, StatsSummary, TaskList, EmptyState). Components receive data via props and report events via callbacks. **Do not put business logic, validation rules, or storage access inside components.**
- **`src/hooks/`** — wire pure logic to React state (`useTasks`, `useLocalStorage`). Hooks must call into `src/utils/*`; they must not duplicate its logic.
- **`src/utils/`** — all reusable logic lives here as pure functions so it can be unit-tested without React or a DOM.
- **`src/App.tsx`** — composes layout and holds UI state (filter, search, dialogs, selection). Keep it thin; extract new UI into components.
- New shared types go in `src/types/index.ts`, never duplicated across files.
- `Modal.tsx` is the shared dialog shell (focus trap, Escape, scroll lock). Any dialog must use it instead of hand-rolling overlays.

## 5. TypeScript requirements

- `strict` is enabled together with `noUnusedLocals`, `noUnusedParameters`, `noFallthroughCasesInSwitch`, `verbatimModuleSyntax`. **Never weaken or delete these flags.**
- Because of `verbatimModuleSyntax`, type-only imports **must** use `import type { ... }`.
- No `any` in `src/`. Use precise types or narrow with type guards (`unknown` + runtime checks when parsing stored data).
- No non-null assertions (`!`) except the justified `document.getElementById('root')!` in `main.tsx`.
- Every new/changed public function must have explicit parameter and return types.
- All code added under `src/` must pass `npm run build` (which runs `tsc -b`) with zero errors.

## 6. Accessibility requirements

- Every input needs a `<label>` (visible or `sr-only` linked via `htmlFor`).
- Icon-only buttons need an `aria-label` that names the action and target (e.g. `Delete task: ${title}`).
- Decorative icons get `aria-hidden="true"`.
- Form errors: `role="alert"`, `aria-invalid`, `aria-describedby` linking to the error element.
- Dialogs: `role="dialog"`, `aria-modal="true"`, `aria-labelledby`, Escape-to-close, Tab focus trap, focus restored on close (handled by `Modal.tsx` — extend it rather than bypassing it).
- Toggles use `role="switch"` + `aria-checked`; toggle buttons use `aria-pressed`.
- **Contrast**: body/meta text must be ≥ 4.5:1 against its background (e.g. `slate-500` or darker on white — `slate-400` text on white fails); icons/UI chrome ≥ 3:1. On the dark sidebar use `slate-400`+ text, never `slate-600`.
- All functionality must be operable by keyboard; keep the global `:focus-visible` ring in `index.css` intact and ensure custom controls (e.g. visually hidden radio inputs) surface focus on their visible labels via `has-[:focus-visible]:` styles.
- Overlay components must not break each other's Escape handling (`Modal` stops propagation; the details drawer defers to any open `[role="dialog"]`).

## 7. Data persistence rules

- The single storage key is `STORAGE_KEYS.tasks = 'taskora.tasks.v1'` in `src/utils/storage.ts`. **Never hardcode keys elsewhere.**
- All reads/writes must go through `loadFromStorage` / `saveToStorage` (called via `useLocalStorage`). Never call `window.localStorage` directly.
- Every read must pass the `sanitizeTasks` validator: unknown/corrupted data must be repaired or dropped, never crash the app.
- If the persisted data shape changes, add migration logic inside the sanitizer and bump the key version (`v1` → `v2`) so old data cannot corrupt the new format.
- **Do not seed mock/placeholder tasks as permanent data.** The app must start empty for new users; localStorage is the only source of truth.
- Save failures (private mode, quota) must surface as the existing warning banner — never throw to the UI.

## 8. Error handling requirements

- Storage layer: never throws; returns fallback values or an error message string.
- Form input: validate before submit with `validateTaskForm` / `validateNote` (extend these functions, don't duplicate checks in components) and render inline errors.
- Unknown ids in task/note operations must be silent no-ops (already guaranteed by `taskOps` — preserve this).
- Empty states: every list view must render `EmptyState` (no tasks, no matches, no notes).
- Never leave a button non-functional: if a control is rendered, it must have a working handler.

## 9. Dependency policy

- **Do not add dependencies** unless strictly necessary; justify any addition in your summary.
- Do not add UI frameworks (MUI, Chakra…), state managers (Redux, Zustand…), CSS frameworks beyond Tailwind, request libraries (axios…), date libraries, or test frameworks (Jest, Vitest…). Use platform built-ins (`Intl.DateTimeFormat`, `localStorage`, `node --test`) and existing utilities.
- Prefer editing existing files over adding new packages or parallel implementations.

## 10. Preserve existing functionality when modifying code

- Treat every feature in section 1 as a regression checklist: after editing, reason through each feature and confirm it still works.
- Never remove features, buttons, ARIA attributes, or validation "to simplify".
- Do not rename `STORAGE_KEYS`, exported hooks, or component files without updating **all** callers.
- Keep `useTasks`' public API (`tasks`, `storageError`, `addTask`, `updateTask`, `deleteTask`, `toggleTask`, `addNote`, `updateNote`, `deleteNote`) stable; callers in `App.tsx` depend on it.
- Prefer additive refactors; avoid rewriting files wholesale.
- Run the full validation set (section 11) before reporting completion. **Never claim a test passed unless you actually ran it and saw the output.**

## 11. Testing and validation requirements

### API endpoints

**Taskora does not use any API endpoints.** It is a fully client-side application: there are no server routes, no fetch/axios calls, and no backend. Therefore:

> **Rule:** *If* any API endpoint is introduced in the future, that endpoint **must** ship with an automated test proving it works (happy path + error path), and you must **validate it live** (issue a real request and inspect the response) before reporting it done. While the app remains endpoint-free, testing the relevant **application logic** instead is required.

### Tests (currently required)

- All exported logic in `src/utils/` must be covered by tests in `tests/*.test.ts` using `node:test` (`describe`/`test`) + `node:assert/strict`.
- Required coverage areas: **task creation, editing, deletion, completion toggle, notes management (add/edit/delete), filtering, searching, input validation, data persistence (save → reload round trip), and stored-data sanitization.**
- Test files import source modules with explicit `.ts` extensions (e.g. `../src/utils/taskOps.ts`) — required for Node's type stripping.
- Tests must not require network access or third-party packages.

### Validation commands (run all before finishing)

```bash
npm test          # automated tests — must report pass with 0 failures
npm run build     # tsc -b type check + production build — must exit 0
npm run dev       # verify the app starts and renders (smoke check the page)
```

- Linting is **not configured** in this project; do not add a linter without explicit instruction.
- If a command fails, fix the errors — never suppress them, and never lower tsconfig strictness to make a build pass.
- When touching UI, additionally verify the app still starts (`npm run dev`) and that the affected screen renders without console errors at mobile and desktop widths.
