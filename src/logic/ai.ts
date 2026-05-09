import type { BoardSquare } from './board';
import type { Piece, PieceColor, PieceType } from './pieces';
import type { Move } from './moves';
import { getGameResult } from './validation';
import type { GameState } from '../state/game';
import { getLegalMoves, isGameOver, makeMove } from '../state/game';

const MATERIAL_VALUES: Record<PieceType, number> = {
  pawn: 100,
  knight: 320,
  bishop: 330,
  rook: 500,
  queen: 900,
  king: 20000,
};

// Piece-square tables from white's perspective (index 0 = a1)
const PAWN_PST: readonly number[] = [
   0,   0,   0,   0,   0,   0,   0,   0,
  50,  50,  50,  50,  50,  50,  50,  50,
  10,  10,  20,  30,  30,  20,  10,  10,
   5,   5,  10,  25,  25,  10,   5,   5,
   0,   0,   0,  20,  20,   0,   0,   0,
   5,  -5, -10,   0,   0, -10,  -5,   5,
   5,  10,  10, -20, -20,  10,  10,   5,
   0,   0,   0,   0,   0,   0,   0,   0,
];

const KNIGHT_PST: readonly number[] = [
  -50, -40, -30, -30, -30, -30, -40, -50,
  -40, -20,   0,   0,   0,   0, -20, -40,
  -30,   0,  10,  15,  15,  10,   0, -30,
  -30,   5,  15,  20,  20,  15,   5, -30,
  -30,   0,  15,  20,  20,  15,   0, -30,
  -30,   5,  10,  15,  15,  10,   5, -30,
  -40, -20,   0,   5,   5,   0, -20, -40,
  -50, -40, -30, -30, -30, -30, -40, -50,
];

const BISHOP_PST: readonly number[] = [
  -20, -10, -10, -10, -10, -10, -10, -20,
  -10,   0,   0,   0,   0,   0,   0, -10,
  -10,   0,   5,  10,  10,   5,   0, -10,
  -10,   5,   5,  10,  10,   5,   5, -10,
  -10,   0,  10,  10,  10,  10,   0, -10,
  -10,  10,  10,  10,  10,  10,  10, -10,
  -10,   5,   0,   0,   0,   0,   5, -10,
  -20, -10, -10, -10, -10, -10, -10, -20,
];

const ROOK_PST: readonly number[] = [
   0,   0,   0,   0,   0,   0,   0,   0,
   5,  10,  10,  10,  10,  10,  10,   5,
  -5,   0,   0,   0,   0,   0,   0,  -5,
  -5,   0,   0,   0,   0,   0,   0,  -5,
  -5,   0,   0,   0,   0,   0,   0,  -5,
  -5,   0,   0,   0,   0,   0,   0,  -5,
  -5,   0,   0,   0,   0,   0,   0,  -5,
   0,   0,   0,   5,   5,   0,   0,   0,
];

const QUEEN_PST: readonly number[] = [
  -20, -10, -10,  -5,  -5, -10, -10, -20,
  -10,   0,   0,   0,   0,   0,   0, -10,
  -10,   0,   5,   5,   5,   5,   0, -10,
   -5,   0,   5,   5,   5,   5,   0,  -5,
    0,   0,   5,   5,   5,   5,   0,  -5,
  -10,   5,   5,   5,   5,   5,   0, -10,
  -10,   0,   5,   0,   0,   0,   0, -10,
  -20, -10, -10,  -5,  -5, -10, -10, -20,
];

const KING_PST: readonly number[] = [
  -30, -40, -40, -50, -50, -40, -40, -30,
  -30, -40, -40, -50, -50, -40, -40, -30,
  -30, -40, -40, -50, -50, -40, -40, -30,
  -30, -40, -40, -50, -50, -40, -40, -30,
  -20, -30, -30, -40, -40, -30, -30, -20,
  -10, -20, -20, -20, -20, -20, -20, -10,
   20,  20,   0,   0,   0,   0,  20,  20,
   20,  30,  10,   0,   0,  10,  30,  20,
];

const PST_MAP: Record<PieceType, readonly number[]> = {
  pawn: PAWN_PST,
  knight: KNIGHT_PST,
  bishop: BISHOP_PST,
  rook: ROOK_PST,
  queen: QUEEN_PST,
  king: KING_PST,
};

function getPSTValue(piece: Piece, squareIndex: number): number {
  const table = PST_MAP[piece.type];
  const idx = piece.color === 'white' ? squareIndex : 63 - squareIndex;
  return table[idx] ?? 0;
}

function kingSafetyBonus(board: BoardSquare[], color: PieceColor): number {
  const kingSquare = board.find(
    (sq) => sq.piece?.type === 'king' && sq.piece.color === color,
  );
  if (!kingSquare) return 0;
  const alg = kingSquare.algebraic;
  if (color === 'white') {
    if (alg === 'g1' || alg === 'c1') return 30;
    if (alg === 'e1') return -10;
  } else {
    if (alg === 'g8' || alg === 'c8') return 30;
    if (alg === 'e8') return -10;
  }
  return 0;
}

export function evaluatePosition(board: BoardSquare[], color: PieceColor): number {
  let score = 0;
  for (const sq of board) {
    if (!sq.piece) continue;
    const value = MATERIAL_VALUES[sq.piece.type] + getPSTValue(sq.piece, sq.index);
    if (sq.piece.color === color) {
      score += value;
    } else {
      score -= value;
    }
  }
  score += kingSafetyBonus(board, color);
  score -= kingSafetyBonus(board, color === 'white' ? 'black' : 'white');
  return score;
}

export function minimax(
  game: GameState,
  depth: number,
  alpha: number,
  beta: number,
  maximizing: boolean,
): number {
  if (depth === 0 || isGameOver(game)) {
    if (isGameOver(game)) {
      if (game.result === 'checkmate') {
        return maximizing ? -200000 : 200000;
      }
      return 0;
    }
    const score = evaluatePosition(game.board, game.sideToMove);
    return maximizing ? score : -score;
  }

  const moves = getLegalMoves(game);
  if (moves.length === 0) {
    const result = getGameResult(game.board, game.sideToMove);
    if (result === 'checkmate') {
      return maximizing ? -200000 : 200000;
    }
    return 0;
  }

  if (maximizing) {
    let maxEval = -Infinity;
    for (const move of moves) {
      const nextGame = makeMove(game, move);
      const evalScore = minimax(nextGame, depth - 1, alpha, beta, false);
      maxEval = Math.max(maxEval, evalScore);
      alpha = Math.max(alpha, evalScore);
      if (beta <= alpha) break;
    }
    return maxEval;
  } else {
    let minEval = Infinity;
    for (const move of moves) {
      const nextGame = makeMove(game, move);
      const evalScore = minimax(nextGame, depth - 1, alpha, beta, true);
      minEval = Math.min(minEval, evalScore);
      beta = Math.min(beta, evalScore);
      if (beta <= alpha) break;
    }
    return minEval;
  }
}

export function getBestMove(game: GameState, depth: number = 3): Move | null {
  const moves = getLegalMoves(game);
  if (moves.length === 0) return null;

  const orderedMoves = [...moves].sort((a, b) => {
    const scoreA = (a.captured ? MATERIAL_VALUES[a.captured.type] : 0) + (a.isPromotion ? 800 : 0);
    const scoreB = (b.captured ? MATERIAL_VALUES[b.captured.type] : 0) + (b.isPromotion ? 800 : 0);
    return scoreB - scoreA;
  });

  let bestMove = orderedMoves[0];
  let bestEval = -Infinity;

  for (const move of orderedMoves) {
    const nextGame = makeMove(game, move);
    const evalScore = minimax(nextGame, depth - 1, -Infinity, Infinity, false);
    if (evalScore > bestEval) {
      bestEval = evalScore;
      bestMove = move;
    }
  }

  return bestMove;
}

export function getAIMove(game: GameState, level: number = 3): Move | null {
  const clampedLevel = Math.max(1, Math.min(5, level));

  if (clampedLevel === 1 && Math.random() < 0.2) {
    const legalMoves = getLegalMoves(game);
    if (legalMoves.length === 0) return null;
    return legalMoves[Math.floor(Math.random() * legalMoves.length)];
  }

  return getBestMove(game, clampedLevel);
}
