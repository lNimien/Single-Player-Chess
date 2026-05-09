# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

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
- UI components: `Piece` (SVG), `Square` (states), `Board` (8×8 grid), `Panel` (history, status, actions), `App` (wiring)
- Playwright E2E testing with Chromium browser and smoke test
- `@testing-library/jest-dom` for better DOM assertions
- Pawn promotion modal with piece selector (queen, rook, bishop, knight)
- Game over overlay for checkmate and stalemate with fade + scale animation
- 162 tests across 14 test files

### Stack

- React 18
- Vite
- TypeScript (strict mode)
- Vitest + Testing Library + Playwright
- Plain CSS (no Tailwind)
