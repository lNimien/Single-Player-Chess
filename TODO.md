# ChessWebsite — TODO

## In Progress

### UI Components
- [ ] `src/hooks/useChess.ts` — React hook orchestrating game state
- [ ] `src/components/Piece/` — SVG piece rendering
- [ ] `src/components/Square/` — Individual square with state handling
- [ ] `src/components/Board/` — 8x8 grid component with coordinate labels
- [ ] `src/components/Panel/` — Move history, turn indicator, game status, action buttons
- [ ] `src/App.tsx` — Root component wiring everything together
- [ ] `src/styles/board.css` — Board and piece styles

### Interactions
- [ ] Click-to-select piece on own turn
- [ ] Click-to-move to valid destination
- [ ] Visual highlight: selected piece, valid moves, last move, check indicator
- [ ] Pawn promotion piece selector modal

### Testing
- [ ] 90%+ coverage on `src/logic/` modules ✅ (96.22% statements)
- [ ] UI component behavior tests with Testing Library
- [ ] E2E smoke tests with Playwright

## Done ✅

### Game State
- ✅ `src/state/game.ts` implemented with immutable updates, castling rights, en passant, halfmove clock, fullmove number, move history with SAN notation, undo, and result detection
- ✅ `src/state/game.test.ts` — 53 tests, all passing

### Chess Logic
- ✅ `src/logic/pieces.ts` — piece types, colors, material values, FEN symbols
- ✅ `src/logic/board.ts` — square indexing, initial setup, FEN parsing/serialization
- ✅ `src/logic/moves.ts` — pseudo-legal move generation for all pieces + special moves
- ✅ `src/logic/validation.ts` — attacked squares, legal moves, check/checkmate/stalemate
- ✅ `src/logic/index.ts` — public API barrel export
- ✅ 45 logic tests, all passing

### Foundation
- ✅ Project initialized with Vite + React + TypeScript
- ✅ AGENTS.md, SPEC.md, TODO.md, CHANGELOG.md created
- ✅ vitest.config.ts with jsdom + playwright.config.ts with Chromium
- ✅ .gitignore configured
- ✅ package.json scripts: test, test:watch, test:coverage, test:e2e, test:e2e:ui
- ✅ CSS variables in src/styles/variables.css
- ✅ src/ directory structure: logic/, state/, components/, hooks/, styles/

## Backlog

### Post-MVP Features
- [ ] Undo last move (hook-level, UI button)
- [ ] Reset game to starting position
- [ ] AI opponent (minimax + alpha-beta pruning)
- [ ] Piece capture animation
- [ ] Checkmate/stalemate overlay

### Nice-to-Have
- [ ] Move validation error feedback
- [ ] Board flip (play as Black)
- [ ] Time control
