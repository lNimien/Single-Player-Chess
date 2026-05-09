# ChessWebsite — TODO

## In Progress

### Foundation Setup
- [ ] Initialize Vite + React + TypeScript project
- [ ] Configure Vitest with jsdom environment
- [ ] Define project structure (`logic/`, `state/`, `components/`, `hooks/`, `styles/`)
- [ ] Create base CSS variables and global styles

### Chess Logic (Domain Layer — TDD)
- [x] `src/logic/pieces.ts` — Piece types, colors, values
- [x] `src/logic/board.ts` — Board representation, square mapping, FEN position parsing
- [x] `src/logic/moves.ts` — Move generation (pseudo-legal) for all piece types
- [x] `src/logic/validation.ts` — Legal move detection, check/checkmate/stalemate
- [x] `src/logic/index.ts` — Public API exports

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

### Chess Logic
- ✅ `src/logic/pieces.ts` implemented with piece types, colors, material values, FEN symbols, and symbol parsing
- ✅ `src/logic/board.ts` implemented with square indexing, initial board setup, and FEN parsing/serialization tests
- ✅ `src/logic/moves.ts` implemented with pseudo-legal move generation for pawns, sliding pieces, knights, kings, castling, promotion, and en passant targets
- ✅ `src/logic/validation.ts` implemented with attacked-square detection, legal move filtering, check, checkmate, stalemate, and game result detection
- ✅ `src/logic/index.ts` added as public API barrel export

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
