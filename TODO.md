# ChessWebsite — TODO

## Status: ✅ MVP + AI + SETTINGS COMPLETE

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
- [x] **AI opponent** — minimax + alpha-beta pruning, 5 difficulty levels, plays as Black
- [x] PNG chess piece assets with realistic piece images
- [x] Settings modal for player color, animations, and sounds
- [x] Capture flash animation
- [x] Board flip (play as Black)
- [x] Sound effects on move/capture/check via Web Audio API
- [x] Export game to PGN
- [x] Move history review controls (Back / Forward / Current)
- [x] Correct castling legality: blocked while in check, through check, or into check

### Architecture
- [x] `src/logic/` — Pure chess rules + AI engine (57 tests)
- [x] `src/state/` — Game state management (53 tests)
- [x] `src/hooks/` — React hook orchestration with AI/settings/sounds
- [x] `src/components/` — UI components with AI panel, settings modal, PNG pieces
- [x] `src/App.tsx` — Root wiring (1 integration test)

### Testing
- [x] **228 tests across 17 test files — ALL PASSING**
- [x] Coverage: 96.22% statements, 95.23% branches, 98.3% functions
- [x] Playwright E2E smoke test configured

## Backlog (Nice-to-Have)

- [ ] Move validation error feedback
- [ ] Time control
- [ ] Import game from FEN
- [ ] Responsive improvements for very small screens
