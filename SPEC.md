# ChessWebsite — Portfolio Chess Application

## Overview

**Project**: ChessWebsite — single-player chess web application.
**Type**: Portfolio piece showcasing professional architecture, TDD, and clean code.
**Stack**: React 18, Vite, TypeScript, plain CSS, Vitest + Testing Library.

---

## 1. Concept & Vision

A single-player chess game for the web that demonstrates senior-level engineering craft. The focus is not on AI opponent complexity, but on **correct chess logic**, **clean architecture**, and **test-driven development**. The aesthetic is clean and professional — the kind of project that signals "I know what I'm doing" to a technical reviewer.

**Key principle**: The chess logic (`src/logic/`) is completely separated from the UI. It is a pure TypeScript library that could be extracted and reused for any chess application.

---

## 2. Design Language

- **Aesthetic**: Classic wooden board feel, minimal chrome, functional elegance.
- **Colors**: Warm cream/ivory squares, rich walnut dark squares, subtle shadows.
- **Typography**: System fonts (no web fonts dependency), clean hierarchy.
- **Motion**: Piece movement via CSS transitions (150ms ease-out). No animation library.
- **No Tailwind**. Plain CSS with CSS custom properties.

---

## 3. Architecture

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

**Layer rule**: `logic/` and `state/` have zero React imports. UI components are thin wrappers only.

---

## 4. Features & Interactions

### MVP (Phase 1)

- [ ] Standard 8x8 chess board with correct initial piece placement
- [ ] All piece movement rules implemented (pawn, rook, knight, bishop, queen, king)
- [ ] Legal move validation (pieces cannot move into check, must escape check)
- [ ] Check and checkmate detection
- [ ] Stalemate detection
- [ ] Castling (kingside and queenside)
- [ ] En passant capture
- [ ] Pawn promotion (user selects piece via UI)
- [ ] Move history (list of moves in algebraic notation)
- [ ] Game state: whose turn, in check, game over (checkmate/stalemate)
- [ ] Click-to-select piece, click-to-move interaction
- [ ] Visual highlight of selected piece and valid destination squares

### Post-MVP (Phase 2)

- [ ] Undo last move
- [ ] Reset game to starting position
- [ ] AI opponent (minimax with alpha-beta pruning, configurable depth)
- [ ] Piece capture animation
- [ ] Checkmate/stalemate overlay

### Nice-to-Have (Phase 3)

- [ ] Move validation error messages (illegal move feedback)
- [ ] Board flip (for playing as Black)
- [ ] Time control (optional)

---

## 5. Component Inventory

### Board
- 8x8 grid of squares
- Coordinate labels (a-h, 1-8) on edges
- Responsive sizing (fills container, maintains square aspect ratio)
- States: normal, piece selected (origin highlighted), valid destination squares highlighted

### Square
- Background: light or dark based on position
- States: normal, selected, valid-move-target, last-move-from, last-move-to, in-check
- Contains a Piece component or is empty

### Piece
- SVG representation of each piece type (white and black)
- Drag-and-drop enabled (or click-to-move)
- States: normal, selected, captured

### Panel
- Move history list (scrollable)
- Current turn indicator
- Game status (normal / in check / checkmate / stalemate)
- Action buttons: New Game, Undo

---

## 6. Technical Constraints

- **No Tailwind CSS** — plain CSS only
- **No component libraries** — all UI is custom
- **No external chess libraries** — all logic implemented from scratch
- **No AI libraries** — AI implemented from scratch if needed
- TypeScript strict mode
- `src/logic/` must be testable without React DOM
- All domain logic: 90%+ test coverage
- All tests must pass before commit

---

## 7. SDD Phases

Every substantial feature follows: **explore → propose → spec → design → tasks → apply → verify → archive**.

Small changes skip to **tasks + apply**.

Artifacts are stored in `engram` (preferred) or `openspec/` (for team sharing).

---

## 8. Quality Standards

- TypeScript strict mode
- No `any` without explicit justification comment
- No commented-out code in final state
- Spec updated **before** implementation
- No dependency additions without SPEC.md update
- All tests pass before commit
- Zero tolerance for broken tests in main

---

## 9. Decision Log

| Date | Decision | Rationale |
|------|----------|-----------|
| 2026-05-09 | Separate `logic/` from UI components | Enables unit testing of chess rules without DOM. Supports future extraction. |
| 2026-05-09 | Store en passant as flag on move, not as special move type | Simplifies move generation. En passant is the only move requiring history. |
| 2026-05-09 | Plain CSS with CSS custom properties (no Tailwind) | Explicit portfolio constraint. CSS variables provide adequate flexibility. |