# ChessWebsite — Agent Guide

## Project Overview

**What**: A single-player chess web application built with React + Vite + TypeScript.  
**Why**: Portfolio piece — showcases professional architecture, TDD, and clean code.  
**Stack**: React 18, Vite, TypeScript, plain CSS (no Tailwind), Vitest + Testing Library.

---

## Agent Role

You are an autonomous AI software engineer. You **own** the implementation from spec to working code.  
Your job is to:

1. Read and update specs before writing code.
2. Write tests **before or alongside** the code (TDD).
3. Follow SDD phases: explore → propose → spec → design → tasks → apply → verify → archive.
4. Keep documentation alive — never let spec/docs become stale.
5. Commit in logical, reviewable units.
6. Update TODO.md and CHANGELOG.md as you go.

---

## SDD Workflow (Spec-Driven Development)

Every substantial change follows this chain:

```
explore → propose → spec → design → tasks → apply → verify → archive
         ↑
         └─── If change is small: skip to tasks + apply
```

### Phase Outputs (Artfacts)

| Phase   | Output artifact         | Location              |
|---------|-------------------------|-----------------------|
| explore | `sdd/{name}/explore`    | engram (or openspec/) |
| propose | `sdd/{name}/proposal`    | engram / openspec     |
| spec    | `sdd/{name}/spec`        | SPEC.md section or file |
| design  | `sdd/{name}/design`      | SPEC.md section       |
| tasks   | `sdd/{name}/tasks`       | TODO.md checkbox item |
| apply   | Code + tests            | src/                  |
| verify  | Verify report           | engram / openspec     |
| archive | Final spec integration   | SPEC.md               |

### Trigger Commands

| Command | What it does |
|---------|-------------|
| `/sdd-init` | Bootstrap SDD context, detect stack, configure persistence |
| `/sdd-new <name>` | Full cycle: explore → propose → spec → design → tasks |
| `/sdd-ff <name>` | Fast-forward: proposal → specs → design → tasks (skip explore) |
| `/sdd-continue <name>` | Run next dependency-ready phase |
| `/sdd-explore <topic>` | Investigate an idea; no artifacts written |
| `/sdd-apply <name>` | Implement tasks; update `apply-progress` in engram |
| `/sdd-verify <name>` | Run tests and validate implementation |
| `/sdd-archive <name>` | Close change, persist final state |

### Execution Modes

- **Interactive** (default): After each phase, show summary and ask before continuing.
- **Automatic**: Run all phases back-to-back; show final result only.

### Artifact Stores

- **`engram`**: Fast, no files. Good for personal projects.
- **`openspec`**: File-based. Creates `openspec/` trail for team sharing.
- **`hybrid`**: Both — files + engram recovery.

---

## TDD Workflow

### Core Loop

```
RED  → Write a failing test (describe WHAT, not HOW)
GREEN → Write minimum code to make it pass
REFACTOR → Improve code, keep tests green
```

### Test File Location

- Unit/domain logic: `src/logic/**/*.test.ts`
- Component logic: `src/components/**/*.test.tsx`
- Hooks: `src/hooks/**/*.test.ts`

### Test Naming Convention

```
describe("UnitName")
  it("should [behavior] when [condition]")
  it("should return [result] when [input]")
```

### Coverage Rules

- **Domain logic** (board, pieces, moves, validation): 90%+ coverage.
- **UI components**: behavior tests, not implementation tests.
- **Integration**: minimum one happy-path test per feature.

### Strict TDD Mode

When `strict_tdd: true` is set in SDD init:
- You MUST write tests before touching implementation.
- You MUST run tests after every change.
- No fallback to "just write code and test later."

---

## Project Structure

```
src/
├── logic/              # Pure chess rules — no React, no UI
│   ├── board.ts        # Board representation, square mapping
│   ├── pieces.ts       # Piece types, colors, values
│   ├── moves.ts        # Move generation (pseudo-legal)
│   ├── validation.ts   # Legal move detection, check/checkmate
│   └── index.ts        # Public API
├── state/              # Game state management (no UI framework)
│   ├── game.ts         # Game state, history, result detection
│   └── index.ts
├── components/         # React UI components (thin, presentational)
│   ├── Board/
│   ├── Square/
│   ├── Piece/
│   └── Panel/
├── hooks/              # React hooks (useChess, useGameHistory, etc.)
├── styles/             # Plain CSS files (variables, board, pieces)
└── App.tsx
```

**Principle**: `logic/` and `state/` are framework-agnostic. They can be tested without React, and eventually reused.

---

## Commit Strategy

### Format

```
<type>(<scope>): <short summary>

[optional body]

[optional footer]
```

### Types

| Type | When to use |
|------|-------------|
| `feat` | New feature |
| `fix` | Bug fix |
| `refactor` | Code change (no behavior change) |
| `test` | Adding or updating tests |
| `docs` | Documentation only |
| `chore` | Maintenance, dependencies, config |
| `sdd` | SDD phase completion (explore, spec, design, etc.) |

### Scope

Use the module name: `board`, `pieces`, `moves`, `validation`, `ui`, `state`, etc.

### Examples

```
feat(board): add coordinate labels to ranks and files
fix(validation): correctly detect checkmate on crowded board
test(moves): add coverage for castling move generation
refactor(pieces): extract piece value constants
sdd(spec): document player vs AI interaction model
```

### Rules

- **One logical change per commit.**
- **Tests live with the code** — don't separate commits for test+impl unless they belong to different phases.
- **Commit early, commit often** — but each commit must be meaningful.
- **Never commit broken tests.**

---

## Decision Documentation

When you make a technical decision:

1. Write it in the relevant spec/design section.
2. Add it to `engram` with type `decision` and `topic_key`.
3. Include: `What`, `Why`, `Where`, `Learned`.

Example:
```
title: "En passant stored as flag, not as move"
type: "decision"
topic_key: "chess/en-passant"
content: """
  **What**: En passant capture stored as a boolean flag on the move, not as a special move type.
  **Why**: Simplifies move generation — no need to track "ghost pawns". The flag is set when the double pawn push occurs and cleared when any move occurs.
  **Where**: src/logic/moves.ts, src/logic/validation.ts
  **Learned**: En passant is the only move that depends on move history, not just current position.
  """
```

---

## Quality Standards

### Must

- TypeScript strict mode on.
- No `any` without explicit justification comment.
- Tests for all domain logic.
- All tests pass before commit.
- No commented-out code in final state.
- Spec updated BEFORE implementation changes.

### Must Not

- Mix business logic with UI components.
- Write implementation before spec.
- Add dependencies without justification.
- Leave failing tests.
- Use Tailwind (explicit constraint).

---

## File Maintenance

### SPEC.md

Lives at project root. Contains:
- High-level spec (this document)
- Delta specs for each change (append as sections)
- Design decisions (with dates)

Update SPEC.md **before** implementing, not after.

### TODO.md

Tracks work in progress and planned. Format:

```
## In Progress
- [ ] Feature or change
  - [ ] Task 1
  - [x] Task 2 (done)

## Backlog
- [ ] Feature or change
```

### CHANGELOG.md

Using [Keep a Changelog](https://keepachangelog.com/) format.

Sections: Added, Changed, Deprecated, Removed, Fixed, Security.

Add entry **when you complete a change**, not at the end.

---

## Testing Scripts

```bash
npm test              # Run all tests once
npm run test:watch    # Run in watch mode
npm run test:coverage # Run with coverage report
```

---

## Prohibited Actions

- ❌ Write code before reading the relevant spec section.
- ❌ Merge code with failing tests.
- ❌ Add dependencies without updating SPEC.md.
- ❌ Use Tailwind CSS.
- ❌ Leave `any` types without justification.
- ❌ Commit with `--no-verify` or skip hooks.
- ❌ Create giant commits that mix unrelated changes.
- ❌ Write documentation after implementation — spec first.