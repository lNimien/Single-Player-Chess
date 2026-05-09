import { describe, expect, it } from 'vitest';
import { exportToPGN, downloadPGN } from './pgn';
import { createGame, makeMove } from './game';
import type { Move } from '../logic';

describe('exportToPGN', () => {
  it('should export initial game with no moves', () => {
    const game = createGame();
    const pgn = exportToPGN(game);
    expect(pgn).toContain('[Event "Casual Game"]');
    expect(pgn).toContain('[Site "ChessWebsite"]');
    expect(pgn).toContain('[White "Player"]');
    expect(pgn).toContain('[Result "*"]');
    expect(pgn).toContain('[Date "');
  });

  it('should include move notation in PGN', () => {
    const game = createGame();
    // e4
    const move1: Move = {
      from: 12,
      fromAlgebraic: 'e2',
      to: 28,
      toAlgebraic: 'e4',
      piece: { type: 'pawn', color: 'white', value: 1, symbol: 'P' },
      captured: null,
      isEnPassant: false,
      isPromotion: false,
      promotionPiece: null,
      castling: null,
      enPassantTarget: null,
    };
    const afterMove1 = makeMove(game, move1);
    const pgn = exportToPGN(afterMove1);
    expect(pgn).toContain('1. e4');
  });

  it('should format checkmate result', () => {
    const game = createGame();
    const pgn = exportToPGN({ ...game, result: 'checkmate', sideToMove: 'black' });
    expect(pgn).toContain('[Result "1-0"]');
  });

  it('should format stalemate result', () => {
    const game = createGame();
    const pgn = exportToPGN({ ...game, result: 'stalemate' });
    expect(pgn).toContain('[Result "1/2-1/2"]');
  });
});

describe('downloadPGN', () => {
  it('should create a download link', () => {
    const game = createGame();
    const createElementSpy = vi.spyOn(document, 'createElement');

    downloadPGN(game);

    expect(createElementSpy).toHaveBeenCalledWith('a');

    createElementSpy.mockRestore();
  });
});
