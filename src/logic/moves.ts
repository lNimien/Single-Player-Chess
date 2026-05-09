import type { Algebraic, BoardSquare, SquareIndex } from './board';
import { fromSquareIndex, getBoardPiece, toSquareIndex } from './board';
import type { Piece, PieceColor, PieceType } from './pieces';

export type CastlingType = 'kingside' | 'queenside';

export interface CastlingRights {
  wk: boolean;
  wq: boolean;
  bk: boolean;
  bq: boolean;
}

export interface Move {
  from: SquareIndex;
  fromAlgebraic: Algebraic;
  to: SquareIndex;
  toAlgebraic: Algebraic;
  piece: Piece;
  captured: Piece | null;
  isEnPassant: boolean;
  isPromotion: boolean;
  promotionPiece: PieceType | null;
  castling: CastlingType | null;
  enPassantTarget: Algebraic | null;
}

type Direction = readonly [rowDelta: number, colDelta: number];

const BOARD_SIZE = 8;
const DEFAULT_CASTLING_RIGHTS: CastlingRights = { wk: true, wq: true, bk: true, bq: true };
const ROOK_DIRECTIONS: readonly Direction[] = [[-1, 0], [1, 0], [0, -1], [0, 1]];
const BISHOP_DIRECTIONS: readonly Direction[] = [[-1, -1], [-1, 1], [1, -1], [1, 1]];
const QUEEN_DIRECTIONS: readonly Direction[] = [...ROOK_DIRECTIONS, ...BISHOP_DIRECTIONS];
const KNIGHT_DIRECTIONS: readonly Direction[] = [[-2, -1], [-2, 1], [-1, -2], [-1, 2], [1, -2], [1, 2], [2, -1], [2, 1]];
const KING_DIRECTIONS: readonly Direction[] = [[-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, -1], [1, 0], [1, 1]];

function rowOf(index: SquareIndex): number {
  return Math.floor(index / BOARD_SIZE);
}

function colOf(index: SquareIndex): number {
  return index % BOARD_SIZE;
}

function toIndex(row: number, col: number): SquareIndex | null {
  if (row < 0 || row >= BOARD_SIZE || col < 0 || col >= BOARD_SIZE) {
    return null;
  }

  return row * BOARD_SIZE + col;
}

function pieceAt(board: BoardSquare[], index: SquareIndex): Piece | null {
  return getBoardPiece(board, index);
}

function createMove(
  board: BoardSquare[],
  from: SquareIndex,
  to: SquareIndex,
  piece: Piece,
  options: Partial<Pick<Move, 'isEnPassant' | 'isPromotion' | 'promotionPiece' | 'castling' | 'enPassantTarget'>> = {},
): Move {
  const captured = pieceAt(board, to);

  return {
    from,
    fromAlgebraic: fromSquareIndex(from),
    to,
    toAlgebraic: fromSquareIndex(to),
    piece,
    captured,
    isEnPassant: options.isEnPassant ?? false,
    isPromotion: options.isPromotion ?? false,
    promotionPiece: options.promotionPiece ?? null,
    castling: options.castling ?? null,
    enPassantTarget: options.enPassantTarget ?? null,
  };
}

function addStepMoves(board: BoardSquare[], moves: Move[], from: SquareIndex, piece: Piece, directions: readonly Direction[]): void {
  for (const [rowDelta, colDelta] of directions) {
    const target = toIndex(rowOf(from) + rowDelta, colOf(from) + colDelta);
    if (target === null) continue;

    const targetPiece = pieceAt(board, target);
    if (targetPiece?.color !== piece.color) {
      moves.push(createMove(board, from, target, piece));
    }
  }
}

function addRayMoves(board: BoardSquare[], moves: Move[], from: SquareIndex, piece: Piece, directions: readonly Direction[]): void {
  for (const [rowDelta, colDelta] of directions) {
    let row = rowOf(from) + rowDelta;
    let col = colOf(from) + colDelta;
    let target = toIndex(row, col);

    while (target !== null) {
      const targetPiece = pieceAt(board, target);
      if (targetPiece === null) {
        moves.push(createMove(board, from, target, piece));
      } else {
        if (targetPiece.color !== piece.color) moves.push(createMove(board, from, target, piece));
        break;
      }

      row += rowDelta;
      col += colDelta;
      target = toIndex(row, col);
    }
  }
}

export function generatePawnMoves(board: BoardSquare[], index: SquareIndex, color: PieceColor): Move[] {
  const piece = pieceAt(board, index);
  if (piece === null || piece.type !== 'pawn' || piece.color !== color) return [];

  const moves: Move[] = [];
  const direction = color === 'white' ? 1 : -1;
  const startRow = color === 'white' ? 1 : 6;
  const promotionRow = color === 'white' ? 7 : 0;
  const oneStepRow = rowOf(index) + direction;
  const oneStep = toIndex(oneStepRow, colOf(index));

  if (oneStep !== null && pieceAt(board, oneStep) === null) {
    const isPromotion = oneStepRow === promotionRow;
    moves.push(createMove(board, index, oneStep, piece, { isPromotion, promotionPiece: isPromotion ? 'queen' : null }));

    const twoStep = toIndex(rowOf(index) + direction * 2, colOf(index));
    if (rowOf(index) === startRow && twoStep !== null && pieceAt(board, twoStep) === null) {
      moves.push(createMove(board, index, twoStep, piece, { enPassantTarget: fromSquareIndex(oneStep) }));
    }
  }

  for (const colDelta of [-1, 1]) {
    const target = toIndex(oneStepRow, colOf(index) + colDelta);
    if (target === null) continue;

    const targetPiece = pieceAt(board, target);
    if (targetPiece !== null && targetPiece.color !== color) {
      const isPromotion = oneStepRow === promotionRow;
      moves.push(createMove(board, index, target, piece, { isPromotion, promotionPiece: isPromotion ? 'queen' : null }));
    }
  }

  return moves;
}

export const generateRookMoves = (board: BoardSquare[], index: SquareIndex, color: PieceColor): Move[] => {
  const piece = pieceAt(board, index);
  if (piece === null || piece.type !== 'rook' || piece.color !== color) return [];
  const moves: Move[] = [];
  addRayMoves(board, moves, index, piece, ROOK_DIRECTIONS);
  return moves;
};

export const generateBishopMoves = (board: BoardSquare[], index: SquareIndex, color: PieceColor): Move[] => {
  const piece = pieceAt(board, index);
  if (piece === null || piece.type !== 'bishop' || piece.color !== color) return [];
  const moves: Move[] = [];
  addRayMoves(board, moves, index, piece, BISHOP_DIRECTIONS);
  return moves;
};

export const generateQueenMoves = (board: BoardSquare[], index: SquareIndex, color: PieceColor): Move[] => {
  const piece = pieceAt(board, index);
  if (piece === null || piece.type !== 'queen' || piece.color !== color) return [];
  const moves: Move[] = [];
  addRayMoves(board, moves, index, piece, QUEEN_DIRECTIONS);
  return moves;
};

export const generateKnightMoves = (board: BoardSquare[], index: SquareIndex, color: PieceColor): Move[] => {
  const piece = pieceAt(board, index);
  if (piece === null || piece.type !== 'knight' || piece.color !== color) return [];
  const moves: Move[] = [];
  addStepMoves(board, moves, index, piece, KNIGHT_DIRECTIONS);
  return moves;
};

export const generateKingMoves = (board: BoardSquare[], index: SquareIndex, color: PieceColor): Move[] => {
  const piece = pieceAt(board, index);
  if (piece === null || piece.type !== 'king' || piece.color !== color) return [];
  const moves: Move[] = [];
  addStepMoves(board, moves, index, piece, KING_DIRECTIONS);
  moves.push(...generateCastlingMoves(board, color, DEFAULT_CASTLING_RIGHTS));
  return moves;
};

export function generateCastlingMoves(board: BoardSquare[], color: PieceColor, castlingRights: CastlingRights = DEFAULT_CASTLING_RIGHTS): Move[] {
  const rank = color === 'white' ? '1' : '8';
  const kingIndex = toSquareIndex(`e${rank}` as Algebraic);
  const king = pieceAt(board, kingIndex);
  if (king === null || king.type !== 'king' || king.color !== color) return [];

  const moves: Move[] = [];
  const canKingside = color === 'white' ? castlingRights.wk : castlingRights.bk;
  const canQueenside = color === 'white' ? castlingRights.wq : castlingRights.bq;

  if (canKingside && canCastle(board, color, rank, 'kingside')) {
    moves.push(createMove(board, kingIndex, toSquareIndex(`g${rank}` as Algebraic), king, { castling: 'kingside' }));
  }

  if (canQueenside && canCastle(board, color, rank, 'queenside')) {
    moves.push(createMove(board, kingIndex, toSquareIndex(`c${rank}` as Algebraic), king, { castling: 'queenside' }));
  }

  return moves;
}

function canCastle(board: BoardSquare[], color: PieceColor, rank: '1' | '8', side: CastlingType): boolean {
  const rookFile = side === 'kingside' ? 'h' : 'a';
  const path = side === 'kingside' ? ['f', 'g'] : ['b', 'c', 'd'];
  const rook = pieceAt(board, toSquareIndex(`${rookFile}${rank}` as Algebraic));

  return Boolean(
    rook &&
      rook.type === 'rook' &&
      rook.color === color &&
      path.every((file) => pieceAt(board, toSquareIndex(`${file}${rank}` as Algebraic)) === null),
  );
}

export function generatePseudoLegalMoves(board: BoardSquare[], index: SquareIndex): Move[];
export function generatePseudoLegalMoves(board: BoardSquare[], color: PieceColor): Move[];
export function generatePseudoLegalMoves(board: BoardSquare[], target: SquareIndex | PieceColor): Move[] {
  if (target === 'white' || target === 'black') {
    return board
      .flatMap((square) => (square.piece?.color === target ? generatePseudoLegalMoves(board, square.index) : []));
  }

  const piece = pieceAt(board, target);
  if (piece === null) return [];

  if (piece.type === 'pawn') return generatePawnMoves(board, target, piece.color);
  if (piece.type === 'rook') return generateRookMoves(board, target, piece.color);
  if (piece.type === 'bishop') return generateBishopMoves(board, target, piece.color);
  if (piece.type === 'queen') return generateQueenMoves(board, target, piece.color);
  if (piece.type === 'knight') return generateKnightMoves(board, target, piece.color);
  return generateKingMoves(board, target, piece.color);
}
