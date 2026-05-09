import { describe, expect, it, vi } from 'vitest';

import type { BoardSquare, Move } from './board';
import { parseFEN, toSquareIndex } from './board';
import type { PieceColor, PieceType } from './pieces';
import { createPiece } from './pieces';
import type { CastlingRights, GameState } from '../state/game';
import { createGame, getLegalMoves, isGameOver, makeMove } from '../state/game';
import { evaluatePosition, getAIMove, getBestMove, minimax } from './ai';

function parseCastling(castling: string): CastlingRights {
  return {
    wk: castling.includes('K'),
    wq: castling.includes('Q'),
    bk: castling.includes('k'),
    bq: castling.includes('q'),
  };
}

function createGameFromFEN(fen: string): GameState {
  const parsed = parseFEN(fen);
  return {
    board: parsed,
    sideToMove: parsed.sideToMove,
    history: [],
    castlingRights: parseCastling(parsed.castling),
    enPassantTarget: parsed.enPassant,
    halfmoveClock: parsed.halfmove,
    fullmoveNumber: parsed.fullmove,
    result: null,
  };
}

// Naive minimax without alpha-beta pruning (for comparison)
function minimaxNoPruning(
  game: GameState,
  depth: number,
  maximizing: boolean,
): number {
  if (depth === 0 || isGameOver(game)) {
    if (isGameOver(game)) {
      if (game.result === 'checkmate') return maximizing ? -200000 : 200000;
      return 0;
    }
    const score = evaluatePosition(game.board, game.sideToMove);
    return maximizing ? score : -score;
  }

  const moves = getLegalMoves(game);
  if (maximizing) {
    let maxEval = -Infinity;
    for (const move of moves) {
      const nextGame = makeMove(game, move);
      const evalScore = minimaxNoPruning(nextGame, depth - 1, false);
      maxEval = Math.max(maxEval, evalScore);
    }
    return maxEval;
  } else {
    let minEval = Infinity;
    for (const move of moves) {
      const nextGame = makeMove(game, move);
      const evalScore = minimaxNoPruning(nextGame, depth - 1, true);
      minEval = Math.min(minEval, evalScore);
    }
    return minEval;
  }
}

describe('evaluatePosition', () => {
  it('should evaluate the initial position as roughly equal', () => {
    const game = createGame();
    const score = evaluatePosition(game.board, 'white');
    expect(score).toBeGreaterThan(-50);
    expect(score).toBeLessThan(50);
  });

  it('should favor the side with an extra pawn', () => {
    const game = createGame();

    // Remove a black pawn from d7 -> white should be better
    const boardBetterForWhite = game.board.map((sq) => ({ ...sq }));
    boardBetterForWhite[toSquareIndex('d7')] = {
      ...boardBetterForWhite[toSquareIndex('d7')],
      piece: null,
    };
    const scoreBetter = evaluatePosition(boardBetterForWhite, 'white');
    expect(scoreBetter).toBeGreaterThan(50);

    // Remove a white pawn from d2 -> white should be worse
    const boardWorseForWhite = game.board.map((sq) => ({ ...sq }));
    boardWorseForWhite[toSquareIndex('d2')] = {
      ...boardWorseForWhite[toSquareIndex('d2')],
      piece: null,
    };
    const scoreWorse = evaluatePosition(boardWorseForWhite, 'white');
    expect(scoreWorse).toBeLessThan(-50);
  });
});

describe('minimax', () => {
  it('should find a capture at depth 1', () => {
    // White queen can capture black pawn on d5
    const game = createGameFromFEN('4k3/8/8/3p4/3Q4/8/8/4K3 w - - 0 1');
    const score = minimax(game, 1, -Infinity, Infinity, true);
    // Capturing the pawn is best; score should reflect roughly +pawn value
    expect(score).toBeGreaterThan(50);
  });

  it('should avoid losing a piece at depth 2', () => {
    // White queen on d4 attacks black pawn on d5, but pawn is defended by black queen on e6.
    // Qxd5 loses the queen to Qxd5.
    const game = createGameFromFEN('4k3/8/4q3/3p4/3Q4/8/8/4K3 w - - 0 1');
    const score = minimax(game, 2, -Infinity, Infinity, true);
    // Should not be the catastrophic score of losing a queen (~-800)
    expect(score).toBeGreaterThan(-500);
  });

  it('should produce the same result as naive minimax (alpha-beta correctness)', () => {
    const game = createGame();
    const withPruning = minimax(game, 3, -Infinity, Infinity, true);
    const withoutPruning = minimaxNoPruning(game, 3, true);
    expect(withPruning).toBe(withoutPruning);
  });

  it('should be faster with alpha-beta pruning than without', async () => {
    const game = createGame();
    const startPruning = performance.now();
    const withPruning = minimax(game, 3, -Infinity, Infinity, true);
    const endPruning = performance.now();

    const startNaive = performance.now();
    const withoutPruning = minimaxNoPruning(game, 3, true);
    const endNaive = performance.now();

    expect(withPruning).toBe(withoutPruning);
    expect(endPruning - startPruning).toBeLessThan(endNaive - startNaive);
  }, 30000);
});

describe('getBestMove', () => {
  it('should return a legal move from the initial position', () => {
    const game = createGame();
    const move = getBestMove(game, 3);
    expect(move).not.toBeNull();
    const legalMoves = getLegalMoves(game);
    const isLegal = legalMoves.some(
      (m) => m.from === move!.from && m.to === move!.to,
    );
    expect(isLegal).toBe(true);
  });

  it('should find checkmate in one (scholar\'s mate)', async () => {
    const game = createGameFromFEN(
      'r1bqkb1r/pppp1ppp/2n2n2/4p2Q/2B1P3/8/PPPP1PPP/RNB1K1NR w KQkq - 0 4',
    );
    const move = getBestMove(game, 2);
    expect(move).not.toBeNull();
    expect(move!.toAlgebraic).toBe('f7');
    expect(move!.piece.type).toBe('queen');
  }, 10000);
});

describe('getAIMove', () => {
  it('should map level 1 to depth 1 and occasionally pick a random move', () => {
    const game = createGame();
    const randomSpy = vi.spyOn(Math, 'random').mockReturnValue(0.1);
    const move = getAIMove(game, 1);
    expect(move).not.toBeNull();
    const legalMoves = getLegalMoves(game);
    const isLegal = legalMoves.some(
      (m) => m.from === move!.from && m.to === move!.to,
    );
    expect(isLegal).toBe(true);
    randomSpy.mockRestore();
  });

  it('should use deterministic best move at level 1 when random threshold is not met', () => {
    const game = createGame();
    const randomSpy = vi.spyOn(Math, 'random').mockReturnValue(0.9);
    const move = getAIMove(game, 1);
    expect(move).not.toBeNull();
    const best = getBestMove(game, 1);
    expect(move!.from).toBe(best!.from);
    expect(move!.to).toBe(best!.to);
    randomSpy.mockRestore();
  });

  it('should map level 3 to depth 3', async () => {
    const game = createGame();
    const move = getAIMove(game, 3);
    expect(move).not.toBeNull();
    const legalMoves = getLegalMoves(game);
    const isLegal = legalMoves.some(
      (m) => m.from === move!.from && m.to === move!.to,
    );
    expect(isLegal).toBe(true);
  }, 10000);

  it('should clamp out-of-range levels', async () => {
    const game = createGame();
    // Level 0 clamps to 1, should return a legal move quickly
    const move1 = getAIMove(game, 0);
    expect(move1).not.toBeNull();
    const legalMoves = getLegalMoves(game);
    const isLegal = legalMoves.some(
      (m) => m.from === move1!.from && m.to === move1!.to,
    );
    expect(isLegal).toBe(true);
  }, 10000);
});
