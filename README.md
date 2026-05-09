# ChessWebsite

Single-player chess web application. Portfolio piece showcasing professional architecture, TDD, and clean code.

**Stack**: React 18, Vite, TypeScript, plain CSS, Vitest + Testing Library.

## Quick Start

```bash
npm install
npm run dev
```

## Testing

```bash
npm test              # Run all tests
npm run test:watch    # Watch mode
npm run test:coverage # Coverage report
```

## Architecture

Chess logic (`src/logic/`) is completely separated from the UI. It is a pure TypeScript library with no React dependencies, enabling full unit testing without DOM.

```
src/
├── logic/   # Pure chess rules
├── state/   # Game state management
├── components/ # React UI
├── hooks/   # React hooks
└── styles/  # Plain CSS
```

## Workflow

This project uses **SDD** (Spec-Driven Development) and **TDD** (Test-Driven Development). See [AGENTS.md](./AGENTS.md) for the full agent workflow guide.
