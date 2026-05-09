import { describe, expect, it } from 'vitest';

import {
  boardToFEN,
  createInitialBoard,
  fromSquareIndex,
  isLightSquare,
  parseFEN,
  toSquareIndex,
  type BoardSquare,
} from './board';
import { PieceColor, PieceType } from './pieces';

const initialFen = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';

function pieceAt(board: BoardSquare[], algebraic: Parameters<typeof toSquareIndex>[0]) {
  return board[toSquareIndex(algebraic)].piece;
}

describe('board squares', () => {
  it('should create an 8x8 board with 64 indexed squares', () => {
    const board = createInitialBoard();

    expect(board).toHaveLength(64);
    expect(board[0]).toMatchObject({ index: 0, algebraic: 'a1' });
    expect(board[63]).toMatchObject({ index: 63, algebraic: 'h8' });
  });

  it('should assign algebraic coordinates to every square', () => {
    const coordinates = createInitialBoard().map((square) => square.algebraic);

    expect(coordinates).toEqual([
      'a1', 'b1', 'c1', 'd1', 'e1', 'f1', 'g1', 'h1',
      'a2', 'b2', 'c2', 'd2', 'e2', 'f2', 'g2', 'h2',
      'a3', 'b3', 'c3', 'd3', 'e3', 'f3', 'g3', 'h3',
      'a4', 'b4', 'c4', 'd4', 'e4', 'f4', 'g4', 'h4',
      'a5', 'b5', 'c5', 'd5', 'e5', 'f5', 'g5', 'h5',
      'a6', 'b6', 'c6', 'd6', 'e6', 'f6', 'g6', 'h6',
      'a7', 'b7', 'c7', 'd7', 'e7', 'f7', 'g7', 'h7',
      'a8', 'b8', 'c8', 'd8', 'e8', 'f8', 'g8', 'h8',
    ]);
  });
});

describe('square indexing', () => {
  it('should convert algebraic coordinates to square indexes', () => {
    expect(toSquareIndex('a1')).toBe(0);
    expect(toSquareIndex('h8')).toBe(63);
  });

  it('should convert square indexes to algebraic coordinates', () => {
    expect(fromSquareIndex(0)).toBe('a1');
    expect(fromSquareIndex(63)).toBe('h8');
  });

  it('should identify light and dark squares from algebraic coordinates', () => {
    expect(isLightSquare('a1')).toBe(false);
    expect(isLightSquare('b1')).toBe(true);
    expect(isLightSquare('h8')).toBe(false);
  });
});

describe('initial board setup', () => {
  it('should place starting pieces in their correct positions', () => {
    const board = createInitialBoard();

    expect(pieceAt(board, 'a1')).toMatchObject({ type: PieceType.Rook, color: PieceColor.White });
    expect(pieceAt(board, 'a2')).toMatchObject({ type: PieceType.Pawn, color: PieceColor.White });
    expect(pieceAt(board, 'a7')).toMatchObject({ type: PieceType.Pawn, color: PieceColor.Black });
    expect(pieceAt(board, 'a8')).toMatchObject({ type: PieceType.Rook, color: PieceColor.Black });
    expect(pieceAt(board, 'e4')).toBeNull();
  });
});

describe('FEN parsing', () => {
  it('should parse the standard starting position with metadata', () => {
    const parsed = parseFEN(initialFen);

    expect(parsed.board).toHaveLength(64);
    expect(parsed.sideToMove).toBe(PieceColor.White);
    expect(parsed.castling).toBe('KQkq');
    expect(parsed.enPassant).toBeNull();
    expect(parsed.halfmove).toBe(0);
    expect(parsed.fullmove).toBe(1);
    expect(pieceAt(parsed.board, 'a1')).toMatchObject({ type: PieceType.Rook, color: PieceColor.White });
    expect(pieceAt(parsed.board, 'a2')).toMatchObject({ type: PieceType.Pawn, color: PieceColor.White });
    expect(pieceAt(parsed.board, 'a7')).toMatchObject({ type: PieceType.Pawn, color: PieceColor.Black });
    expect(pieceAt(parsed.board, 'a8')).toMatchObject({ type: PieceType.Rook, color: PieceColor.Black });
    expect(pieceAt(parsed.board, 'e4')).toBeNull();
  });

  it('should parse empty ranks and an en passant target square', () => {
    const parsed = parseFEN('8/8/8/3pP3/8/8/8/8 b - e3 12 34');

    expect(parsed.sideToMove).toBe(PieceColor.Black);
    expect(parsed.castling).toBe('-');
    expect(parsed.enPassant).toBe('e3');
    expect(parsed.halfmove).toBe(12);
    expect(parsed.fullmove).toBe(34);
    expect(pieceAt(parsed.board, 'd5')).toMatchObject({ type: PieceType.Pawn, color: PieceColor.Black });
    expect(pieceAt(parsed.board, 'e5')).toMatchObject({ type: PieceType.Pawn, color: PieceColor.White });
    expect(pieceAt(parsed.board, 'a1')).toBeNull();
  });
});

describe('FEN serialization', () => {
  it('should serialize board piece placement to FEN placement notation', () => {
    expect(boardToFEN(createInitialBoard())).toBe('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR');
  });
});
