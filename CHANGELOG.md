# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

## [Unreleased]

### Changed

- Redesigned the chess UI with a premium chess-club visual system: walnut/parchment/gold tokens, stronger app hierarchy, board stage, richer panel cards, responsive mobile spacing, accessible focus states, and polished modals.
- Improved publication-readiness on mobile with tighter 375px layout constraints, stacked side panel spacing, board viewport fitting, and horizontal-scroll prevention.
- Updated the Vite React plugin to the Vite 8-compatible major version so clean deploy installs resolve without peer dependency conflicts.

### Added

- Added a visible accessible GitHub repository link with an inline SVG icon in the app header.

## [0.1.0] — 2026-05-09

### Added

- Chess piece domain model with piece types, colors, material values, FEN symbols, and symbol parsing.
- Board logic foundation with square indexing, algebraic mapping, initial setup, FEN parsing, and FEN placement serialization
- Board unit tests covering coordinates, indexing, square color metadata, initial pieces, FEN metadata, and empty squares
- Pseudo-legal move generation for all chess pieces, including castling metadata, promotion flags, and en passant targets.
- Domain validation for attacked squares, king lookup, check, legal move filtering, checkmate, stalemate, and game result detection.
- Vitest V8 coverage provider so `npm run test:coverage` works.
- Project initialization with Vite + React + TypeScript
- AGENTS.md with full agent workflow guide
- SPEC.md with complete project specification
- vitest.config.ts with jsdom test environment
- TODO.md and CHANGELOG.md for progress tracking
- Foundation structure: `src/logic/`, `src/state/`, `src/components/`, `src/hooks/`, `src/styles/`
- Game state management with immutable updates, castling rights, en passant, halfmove clock, SAN notation, undo, and result detection
- `useChess` React hook with selection, legal moves, move execution, undo, and reset
- UI components: `Piece` (PNG assets), `Square` (states/capture animation), `Board` (8×8 grid + flip), `Panel` (history, status, AI/settings/export actions), `App` (wiring)
- Playwright E2E testing with Chromium browser and smoke test
- `@testing-library/jest-dom` for better DOM assertions
- Pawn promotion modal with piece selector (queen, rook, bishop, knight)
- Game over overlay for checkmate and stalemate with fade + scale animation
- **AI opponent** — minimax + alpha-beta pruning with piece-square tables (PSTs), king safety evaluation, 5 difficulty levels (Beginner to Expert), plays as Black
- Panel AI controls: toggle, difficulty selector, thinking indicator
- Settings modal for player color, animation toggle, and sound toggle
- Board flip support for playing as Black
- Web Audio API move/capture/check sounds
- PGN export and download support
- Stronger capture feedback animation
- Move history review controls (Back / Forward / Current) for reviewing previous positions
- Correct castling legality: cannot castle while in check, through an attacked square, or into check
- AI move sound feedback
- 228 tests across 17 test files

### Stack

- React 18
- Vite
- TypeScript (strict mode)
- Vitest + Testing Library + Playwright
- Plain CSS (no Tailwind)
