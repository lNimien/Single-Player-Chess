import { PieceColor, pieceFromSymbol, symbolFromPiece } from './pieces';
import type { Piece } from './pieces';

const FILES = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'] as const;
const RANKS = ['1', '2', '3', '4', '5', '6', '7', '8'] as const;
const STARTING_FEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';

export type SquareIndex = number;
export type File = (typeof FILES)[number];
export type Rank = (typeof RANKS)[number];
export type Algebraic = `${File}${Rank}`;

export interface BoardSquare {
  index: SquareIndex;
  algebraic: Algebraic;
  piece: Piece | null;
  isLight: boolean;
}

export type ParsedFEN = BoardSquare[] & {
  board: BoardSquare[];
  sideToMove: PieceColor;
  castling: string;
  enPassant: Algebraic | null;
  halfmove: number;
  fullmove: number;
};

export function toSquareIndex(algebraic: Algebraic): SquareIndex {
  const fileIndex = FILES.indexOf(algebraic[0] as File);
  const rankIndex = RANKS.indexOf(algebraic[1] as Rank);

  return rankIndex * 8 + fileIndex;
}

export function fromSquareIndex(index: SquareIndex): Algebraic {
  const file = FILES[index % 8];
  const rank = RANKS[Math.floor(index / 8)];

  return `${file}${rank}`;
}

export function indexToAlgebraic(index: SquareIndex): Algebraic {
  return fromSquareIndex(index);
}

export function isLightSquare(algebraic: Algebraic): boolean {
  const fileIndex = FILES.indexOf(algebraic[0] as File);
  const rankIndex = RANKS.indexOf(algebraic[1] as Rank);

  return (fileIndex + rankIndex) % 2 === 1;
}

export function createEmptyBoard(): BoardSquare[] {
  return Array.from({ length: 64 }, (_, index) => {
    const algebraic = fromSquareIndex(index);

    return {
      index,
      algebraic,
      piece: null,
      isLight: isLightSquare(algebraic),
    };
  });
}

export function getBoardPiece(board: BoardSquare[], index: SquareIndex): Piece | null {
  return board[index]?.piece ?? null;
}

export function setBoardPiece(board: BoardSquare[], index: SquareIndex, piece: Piece | null): void {
  board[index] = {
    ...board[index],
    piece,
  };
}

export function parseFEN(fen: string): ParsedFEN {
  const [placement, sideToMoveToken = 'w', castling = '-', enPassantToken = '-', halfmoveToken = '0', fullmoveToken = '1'] = fen
    .trim()
    .split(/\s+/);
  const board = createEmptyBoard();

  placement.split('/').forEach((rankPlacement, fenRankIndex) => {
    const rank = RANKS[(RANKS.length - 1) - fenRankIndex];
    let fileIndex = 0;

    for (const symbol of rankPlacement) {
      const emptySquares = Number(symbol);
      if (Number.isInteger(emptySquares) && emptySquares > 0) {
        fileIndex += emptySquares;
        continue;
      }

      const piece = pieceFromSymbol(symbol);
      setBoardPiece(
        board,
        toSquareIndex(`${FILES[fileIndex]}${rank}`),
        piece,
      );
      fileIndex += 1;
    }
  });

  const parsed = board as ParsedFEN;
  parsed.board = parsed;
  parsed.sideToMove = sideToMoveToken === 'b' ? PieceColor.Black : PieceColor.White;
  parsed.castling = castling;
  parsed.enPassant = enPassantToken === '-' ? null : (enPassantToken as Algebraic);
  parsed.halfmove = Number(halfmoveToken);
  parsed.fullmove = Number(fullmoveToken);

  return parsed;
}

export function createInitialBoard(): BoardSquare[] {
  return parseFEN(STARTING_FEN).board;
}

export function boardToFEN(board: BoardSquare[]): string {
  return [...RANKS].reverse().map((rank) => {
    let emptySquares = 0;
    let placement = '';

    for (const file of FILES) {
      const piece = board[toSquareIndex(`${file}${rank}`)].piece;
      if (piece === null) {
        emptySquares += 1;
        continue;
      }

      if (emptySquares > 0) {
        placement += String(emptySquares);
        emptySquares = 0;
      }

      placement += symbolFromPiece(piece);
    }

    return placement + (emptySquares > 0 ? String(emptySquares) : '');
  }).join('/');
}
