export const PIECE_TYPES = ['pawn', 'knight', 'bishop', 'rook', 'queen', 'king'] as const;
export const PIECE_COLORS = ['white', 'black'] as const;

export const PieceType = {
  Pawn: 'pawn',
  Knight: 'knight',
  Bishop: 'bishop',
  Rook: 'rook',
  Queen: 'queen',
  King: 'king',
} as const;

export const PieceColor = {
  White: 'white',
  Black: 'black',
} as const;

export type PieceType = (typeof PIECE_TYPES)[number];
export type PieceColor = (typeof PIECE_COLORS)[number];

export interface Piece {
  type: PieceType;
  color: PieceColor;
  value: number;
  symbol: string;
}

export const PIECE_VALUES: Record<PieceType, number> = {
  pawn: 1,
  knight: 3,
  bishop: 3,
  rook: 5,
  queen: 9,
  king: 0,
};

export const FEN_SYMBOLS: Record<PieceColor, Record<PieceType, string>> = {
  white: {
    pawn: 'P',
    knight: 'N',
    bishop: 'B',
    rook: 'R',
    queen: 'Q',
    king: 'K',
  },
  black: {
    pawn: 'p',
    knight: 'n',
    bishop: 'b',
    rook: 'r',
    queen: 'q',
    king: 'k',
  },
};

export function createPiece(type: PieceType, color: PieceColor): Piece {
  return {
    type,
    color,
    value: PIECE_VALUES[type],
    symbol: FEN_SYMBOLS[color][type],
  };
}

export function isWhite(piece: Piece): boolean {
  return piece.color === 'white';
}

export function isBlack(piece: Piece): boolean {
  return piece.color === 'black';
}

export function pieceFromSymbol(symbol: string): Piece | null {
  for (const color of PIECE_COLORS) {
    for (const type of PIECE_TYPES) {
      if (FEN_SYMBOLS[color][type] === symbol) {
        return createPiece(type, color);
      }
    }
  }

  return null;
}

export function symbolFromPiece(piece: Pick<Piece, 'type' | 'color'>): string {
  return FEN_SYMBOLS[piece.color][piece.type];
}
