# ChessWebsite — TODO

## MVP Status: ✅ COMPLETE

### Core Features Implemented
- [x] Standard 8x8 chess board with correct initial piece placement
- [x] All piece movement rules (pawn, rook, knight, bishop, queen, king)
- [x] Legal move validation (pieces cannot move into check)
- [x] Check and checkmate detection
- [x] Stalemate detection
- [x] Castling (kingside and queenside)
- [x] En passant capture
- [x] Pawn promotion with piece selector modal
- [x] Move history in algebraic notation (SAN)
- [x] Game state: turn, check, game over
- [x] Click-to-select piece, click-to-move interaction
- [x] Visual highlight: selected piece, valid destinations, last move, check
- [x] Undo last move
- [x] Reset game to starting position
- [x] Checkmate/stalemate overlay

### Architecture
- [x] `src/logic/` — Pure chess rules (framework-agnostic, 45 tests)
- [x] `src/state/` — Game state management (53 tests)
- [x] `src/hooks/` — React hook orchestration (13 tests)
- [x] `src/components/` — UI components (51 tests)
- [x] `src/App.tsx` — Root wiring (1 integration test)

### Testing
- [x] 162 tests across 14 test files — ALL PASSING
- [x] Coverage: 96.22% statements, 95.23% branches, 98.3% functions
- [x] Playwright E2E smoke test configured

## Backlog (Post-MVP)

### Features
- [ ] AI opponent (minimax + alpha-beta pruning, configurable depth)
- [ ] Piece capture animation
- [ ] Board flip (play as Black)
- [ ] Move validation error feedback
- [ ] Time control

### Polish
- [ ] Sound effects on move/capture/check
- [ ] Export game to PGN
- [ ] Import game from FEN
- [ ] Responsive improvements for very small screens
