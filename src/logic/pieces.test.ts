import { describe, expect, it } from 'vitest';

import {
  FEN_SYMBOLS,
  PIECE_COLORS,
  PIECE_TYPES,
  PIECE_VALUES,
  createPiece,
  isBlack,
  isWhite,
  pieceFromSymbol,
} from './pieces';

describe('pieces', () => {
  it('should expose all six chess piece types', () => {
    expect(PIECE_TYPES).toEqual(['pawn', 'knight', 'bishop', 'rook', 'queen', 'king']);
  });

  it('should expose both chess piece colors', () => {
    expect(PIECE_COLORS).toEqual(['white', 'black']);
  });

  it('should assign standard numeric material values to each piece type', () => {
    expect(PIECE_VALUES).toEqual({
      pawn: 1,
      knight: 3,
      bishop: 3,
      rook: 5,
      queen: 9,
      king: 0,
    });
  });

  it('should expose uppercase FEN symbols for white pieces', () => {
    expect(FEN_SYMBOLS.white).toEqual({
      pawn: 'P',
      knight: 'N',
      bishop: 'B',
      rook: 'R',
      queen: 'Q',
      king: 'K',
    });
  });

  it('should expose lowercase FEN symbols for black pieces', () => {
    expect(FEN_SYMBOLS.black).toEqual({
      pawn: 'p',
      knight: 'n',
      bishop: 'b',
      rook: 'r',
      queen: 'q',
      king: 'k',
    });
  });

  it('should classify white and black pieces by color', () => {
    const whiteQueen = createPiece('queen', 'white');
    const blackKnight = createPiece('knight', 'black');

    expect(isWhite(whiteQueen)).toBe(true);
    expect(isBlack(whiteQueen)).toBe(false);
    expect(isWhite(blackKnight)).toBe(false);
    expect(isBlack(blackKnight)).toBe(true);
  });

  it('should create a piece with type, color, value, and FEN symbol', () => {
    expect(createPiece('rook', 'white')).toEqual({
      type: 'rook',
      color: 'white',
      value: 5,
      symbol: 'R',
    });

    expect(createPiece('pawn', 'black')).toEqual({
      type: 'pawn',
      color: 'black',
      value: 1,
      symbol: 'p',
    });
  });

  it('should convert valid white and black FEN symbols to pieces', () => {
    expect(pieceFromSymbol('K')).toEqual({
      type: 'king',
      color: 'white',
      value: 0,
      symbol: 'K',
    });

    expect(pieceFromSymbol('p')).toEqual({
      type: 'pawn',
      color: 'black',
      value: 1,
      symbol: 'p',
    });
  });

  it('should return null when the FEN symbol does not represent a chess piece', () => {
    expect(pieceFromSymbol('x')).toBeNull();
    expect(pieceFromSymbol('')).toBeNull();
  });
});
