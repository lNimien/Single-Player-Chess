import type { Piece, PieceColor } from './pieces';
import type { BoardSquare, SquareIndex } from './board';
import type { Move } from './moves';
import { generatePseudoLegalMoves } from './moves';

export type GameResult = 'checkmate' | 'stalemate' | 'draw' | null;

type Direction = readonly [rankDelta: number, fileDelta: number];

const KNIGHT_DIRECTIONS: readonly Direction[] = [[-2, -1], [-2, 1], [-1, -2], [-1, 2], [1, -2], [1, 2], [2, -1], [2, 1]];
const KING_DIRECTIONS: readonly Direction[] = [[-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, -1], [1, 0], [1, 1]];
const BISHOP_DIRECTIONS: readonly Direction[] = [[-1, -1], [-1, 1], [1, -1], [1, 1]];
const ROOK_DIRECTIONS: readonly Direction[] = [[-1, 0], [0, 1], [1, 0], [0, -1]];
const QUEEN_DIRECTIONS: readonly Direction[] = [...BISHOP_DIRECTIONS, ...ROOK_DIRECTIONS];

const opponentOf = (color: PieceColor): PieceColor => (color === 'white' ? 'black' : 'white');
const rankOf = (index: SquareIndex): number => Math.floor(index / 8);
const fileOf = (index: SquareIndex): number => index % 8;

function toIndex(rank: number, file: number): SquareIndex | null {
  if (rank < 0 || rank > 7 || file < 0 || file > 7) return null;
  return rank * 8 + file;
}

function isStepAttack(from: SquareIndex, target: SquareIndex, directions: readonly Direction[]): boolean {
  return directions.some(([rankDelta, fileDelta]) => toIndex(rankOf(from) + rankDelta, fileOf(from) + fileDelta) === target);
}

function isRayAttack(board: BoardSquare[], from: SquareIndex, target: SquareIndex, directions: readonly Direction[]): boolean {
  for (const [rankDelta, fileDelta] of directions) {
    let rank = rankOf(from) + rankDelta;
    let file = fileOf(from) + fileDelta;
    let index = toIndex(rank, file);

    while (index !== null) {
      if (index === target) return true;
      if (board[index].piece !== null) break;

      rank += rankDelta;
      file += fileDelta;
      index = toIndex(rank, file);
    }
  }

  return false;
}

function doesPieceAttack(board: BoardSquare[], from: SquareIndex, piece: Piece, target: SquareIndex): boolean {
  if (piece.type === 'pawn') {
    const direction = piece.color === 'white' ? 1 : -1;
    return [-1, 1].some((fileDelta) => toIndex(rankOf(from) + direction, fileOf(from) + fileDelta) === target);
  }

  if (piece.type === 'knight') return isStepAttack(from, target, KNIGHT_DIRECTIONS);
  if (piece.type === 'bishop') return isRayAttack(board, from, target, BISHOP_DIRECTIONS);
  if (piece.type === 'rook') return isRayAttack(board, from, target, ROOK_DIRECTIONS);
  if (piece.type === 'queen') return isRayAttack(board, from, target, QUEEN_DIRECTIONS);
  return isStepAttack(from, target, KING_DIRECTIONS);
}

function applyMove(board: BoardSquare[], move: Move): BoardSquare[] {
  const nextBoard = board.map((square) => ({ ...square }));
  nextBoard[move.from] = { ...nextBoard[move.from], piece: null };
  nextBoard[move.to] = { ...nextBoard[move.to], piece: move.piece };
  return nextBoard;
}

export function isSquareAttacked(board: BoardSquare[], byColor: PieceColor, targetIndex: SquareIndex): boolean {
  return board.some((square, index) => square.piece?.color === byColor && doesPieceAttack(board, index, square.piece, targetIndex));
}

export function findKing(board: BoardSquare[], color: PieceColor): SquareIndex {
  const kingSquare = board.find((square) => square.piece?.type === 'king' && square.piece.color === color);
  if (kingSquare === undefined) throw new Error(`Could not find ${color} king on the board.`);
  return kingSquare.index;
}

export function isInCheck(board: BoardSquare[], color: PieceColor): boolean {
  return isSquareAttacked(board, opponentOf(color), findKing(board, color));
}

export function isLegalMove(board: BoardSquare[], move: Move, color: PieceColor): boolean {
  return move.piece.color === color && !isInCheck(applyMove(board, move), color);
}

export function filterLegalMoves(board: BoardSquare[], moves: Move[], color: PieceColor): Move[] {
  return moves.filter((move) => isLegalMove(board, move, color));
}

export function hasLegalMoves(board: BoardSquare[], color: PieceColor): boolean {
  return filterLegalMoves(board, generatePseudoLegalMoves(board, color), color).length > 0;
}

export function isCheckmate(board: BoardSquare[], color: PieceColor): boolean {
  return isInCheck(board, color) && !hasLegalMoves(board, color);
}

export function isStalemate(board: BoardSquare[], color: PieceColor): boolean {
  return !isInCheck(board, color) && !hasLegalMoves(board, color);
}

export function getGameResult(board: BoardSquare[], color: PieceColor): GameResult {
  if (isCheckmate(board, color)) return 'checkmate';
  if (isStalemate(board, color)) return 'stalemate';
  return null;
}
