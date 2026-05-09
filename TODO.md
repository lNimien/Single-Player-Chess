# ChessWebsite — TODO

## In Progress

### Foundation Setup
- [ ] Initialize Vite + React + TypeScript project
- [ ] Configure Vitest with jsdom environment
- [ ] Define project structure (`logic/`, `state/`, `components/`, `hooks/`, `styles/`)
- [ ] Create base CSS variables and global styles

### Chess Logic (Domain Layer — TDD)
- [ ] `src/logic/pieces.ts` — Piece types, colors, values
- [ ] `src/logic/board.ts` — Board representation, square mapping, FEN position parsing
- [ ] `src/logic/moves.ts` — Move generation (pseudo-legal) for all piece types
- [ ] `src/logic/validation.ts` — Legal move detection, check/checkmate/stalemate
- [ ] `src/logic/index.ts` — Public API exports

### Game State
- [ ] `src/state/game.ts` — Game state: board, turn, history, result detection
- [ ] `src/state/index.ts` — Public API exports

### UI Components
- [ ] `Board/` — 8x8 grid component with coordinate labels
- [ ] `Square/` — Individual square with state handling
- [ ] `Piece/` — SVG piece rendering with drag-and-drop
- [ ] `Panel/` — Move history, turn indicator, game status, action buttons
- [ ] `App.tsx` — Root component wiring everything together

### Interactions
- [ ] Click-to-select piece on own turn
- [ ] Click-to-move to valid destination
- [ ] Visual highlight: selected piece, valid moves, last move, check indicator
- [ ] Pawn promotion piece selector modal

### Testing (TDD)
- [ ] 90%+ coverage on `src/logic/` modules
- [ ] Integration tests for full move sequences
- [ ] UI component behavior tests

## Backlog

### Post-MVP Features
- [ ] Undo last move
- [ ] Reset game to starting position
- [ ] AI opponent (minimax + alpha-beta pruning)
- [ ] Piece capture animation
- [ ] Checkmate/stalemate overlay

### Nice-to-Have
- [ ] Move validation error feedback
- [ ] Board flip (play as Black)
- [ ] Time control

## Done ✅

### Foundation
- ✅ Project initialized with Vite + React + TypeScript
- ✅ AGENTS.md created with agent workflow guide
- ✅ SPEC.md created with full project specification
- ✅ vitest.config.ts configured with jsdom test environment
- ✅ TODO.md and CHANGELOG.md created
- ✅ .gitignore configured
- ✅ package.json scripts configured (test, test:watch, test:coverage)
- ✅ Initial git commit: "chore: initial project foundation"

## Next: Chess Logic (TDD)

Start TDD on `src/logic/` modules following RED → GREEN → REFACTOR:
1. `src/logic/pieces.ts` — Piece types, colors, values
2. `src/logic/board.ts` — Board representation, square mapping
3. `src/logic/moves.ts` — Move generation (pseudo-legal)
4. `src/logic/validation.ts` — Legal move detection, check/checkmate/stalemate
5. `src/logic/index.ts` — Public API exports