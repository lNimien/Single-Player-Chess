import { describe, expect, it } from 'vitest';

import { createInitialBoard, parseFEN, toSquareIndex, type Algebraic, type BoardSquare } from './board';
import { createPiece, type Piece, type PieceColor } from './pieces';
import {
  type CastlingRights,
  type Move,
  generateBishopMoves,
  generateCastlingMoves,
  generateKingMoves,
  generateKnightMoves,
  generatePawnMoves,
  generatePseudoLegalMoves,
  generateQueenMoves,
  generateRookMoves,
} from './moves';

const emptyBoard = (): BoardSquare[] => parseFEN('8/8/8/8/8/8/8/8 w - - 0 1').board;

const place = (board: BoardSquare[], square: Algebraic, piece: Piece): BoardSquare[] => {
  board[toSquareIndex(square)] = {
    ...board[toSquareIndex(square)],
    piece,
  };
  return board;
};

const algebraicMoves = (moves: Move[]): Algebraic[] =>
  moves.map((move) => move.toAlgebraic).sort();

const moveTo = (moves: Move[], to: Algebraic): Move => {
  const move = moves.find((candidate) => candidate.toAlgebraic === to);

  if (!move) {
    throw new Error(`Expected move to ${to}`);
  }

  return move;
};

const pieceAt = (type: Piece['type'], color: PieceColor): Piece => createPiece(type, color);

describe('move generation', () => {
  it('should create move objects with explicit special-move metadata', () => {
    const board = place(emptyBoard(), 'e7', pieceAt('pawn', 'white'));

    const [move] = generatePawnMoves(board, toSquareIndex('e7'), 'white');

    expect(move).toEqual({
      from: toSquareIndex('e7'),
      fromAlgebraic: 'e7',
      to: toSquareIndex('e8'),
      toAlgebraic: 'e8',
      piece: pieceAt('pawn', 'white'),
      captured: null,
      isEnPassant: false,
      isPromotion: true,
      promotionPiece: 'queen',
      castling: null,
      enPassantTarget: null,
    });
  });

  it('should generate white and black pawn single pushes into empty squares', () => {
    const board = place(place(emptyBoard(), 'e2', pieceAt('pawn', 'white')), 'e7', pieceAt('pawn', 'black'));

    expect(algebraicMoves(generatePawnMoves(board, toSquareIndex('e2'), 'white'))).toContain('e3');
    expect(algebraicMoves(generatePawnMoves(board, toSquareIndex('e7'), 'black'))).toContain('e6');
  });

  it('should generate pawn double pushes from starting ranks with en passant targets', () => {
    const board = place(place(emptyBoard(), 'a2', pieceAt('pawn', 'white')), 'a7', pieceAt('pawn', 'black'));

    const whiteMove = moveTo(generatePawnMoves(board, toSquareIndex('a2'), 'white'), 'a4');
    const blackMove = moveTo(generatePawnMoves(board, toSquareIndex('a7'), 'black'), 'a5');

    expect(whiteMove.enPassantTarget).toBe('a3');
    expect(blackMove.enPassantTarget).toBe('a6');
  });

  it('should block pawn pushes when the file ahead is occupied', () => {
    const board = place(place(emptyBoard(), 'a2', pieceAt('pawn', 'white')), 'a3', pieceAt('knight', 'black'));

    expect(algebraicMoves(generatePawnMoves(board, toSquareIndex('a2'), 'white'))).toEqual([]);
  });

  it('should generate pawn diagonal captures against enemy pieces', () => {
    const board = emptyBoard();
    place(board, 'e3', pieceAt('pawn', 'white'));
    place(board, 'd4', pieceAt('knight', 'black'));
    place(board, 'f4', pieceAt('bishop', 'black'));
    place(board, 'e6', pieceAt('pawn', 'black'));
    place(board, 'd5', pieceAt('knight', 'white'));
    place(board, 'f5', pieceAt('bishop', 'white'));

    expect(algebraicMoves(generatePawnMoves(board, toSquareIndex('e3'), 'white'))).toEqual(['d4', 'e4', 'f4']);
    expect(algebraicMoves(generatePawnMoves(board, toSquareIndex('e6'), 'black'))).toEqual(['d5', 'e5', 'f5']);
  });

  it('should not allow pawns to capture friendly pieces diagonally', () => {
    const board = emptyBoard();
    place(board, 'e3', pieceAt('pawn', 'white'));
    place(board, 'd4', pieceAt('knight', 'white'));
    place(board, 'f4', pieceAt('bishop', 'white'));

    expect(algebraicMoves(generatePawnMoves(board, toSquareIndex('e3'), 'white'))).toEqual(['e4']);
  });

  it('should mark pawn moves to the final rank as promotions', () => {
    const board = place(emptyBoard(), 'e7', pieceAt('pawn', 'white'));

    const promotion = moveTo(generatePawnMoves(board, toSquareIndex('e7'), 'white'), 'e8');

    expect(promotion.isPromotion).toBe(true);
    expect(promotion.promotionPiece).toBe('queen');
  });

  it('should generate rook rank and file moves until blocked by pieces', () => {
    const board = emptyBoard();
    place(board, 'd4', pieceAt('rook', 'white'));
    place(board, 'd6', pieceAt('pawn', 'white'));
    place(board, 'd2', pieceAt('pawn', 'black'));
    place(board, 'b4', pieceAt('pawn', 'black'));
    place(board, 'f4', pieceAt('pawn', 'white'));

    expect(algebraicMoves(generateRookMoves(board, toSquareIndex('d4'), 'white'))).toEqual([
      'b4',
      'c4',
      'd2',
      'd3',
      'd5',
      'e4',
    ]);
  });

  it('should generate bishop diagonal moves until blocked by pieces', () => {
    const board = emptyBoard();
    place(board, 'd4', pieceAt('bishop', 'white'));
    place(board, 'f6', pieceAt('pawn', 'black'));
    place(board, 'b6', pieceAt('pawn', 'white'));
    place(board, 'b2', pieceAt('pawn', 'black'));
    place(board, 'f2', pieceAt('pawn', 'white'));

    expect(algebraicMoves(generateBishopMoves(board, toSquareIndex('d4'), 'white'))).toEqual([
      'b2',
      'c3',
      'c5',
      'e3',
      'e5',
      'f6',
    ]);
  });

  it('should generate queen moves as rook and bishop movement combined', () => {
    const board = emptyBoard();
    place(board, 'd4', pieceAt('queen', 'white'));
    place(board, 'd6', pieceAt('pawn', 'white'));
    place(board, 'f6', pieceAt('pawn', 'black'));
    place(board, 'b4', pieceAt('pawn', 'black'));
    place(board, 'f2', pieceAt('pawn', 'white'));

    expect(algebraicMoves(generateQueenMoves(board, toSquareIndex('d4'), 'white'))).toEqual([
      'a1',
      'a7',
      'b2',
      'b4',
      'b6',
      'c3',
      'c4',
      'c5',
      'd1',
      'd2',
      'd3',
      'd5',
      'e3',
      'e4',
      'e5',
      'f4',
      'f6',
      'g4',
      'h4',
    ]);
  });

  it('should generate knight L-shape moves and jump over blockers', () => {
    const board = emptyBoard();
    place(board, 'd4', pieceAt('knight', 'white'));
    place(board, 'd5', pieceAt('pawn', 'white'));
    place(board, 'c6', pieceAt('pawn', 'black'));
    place(board, 'f5', pieceAt('pawn', 'white'));

    expect(algebraicMoves(generateKnightMoves(board, toSquareIndex('d4'), 'white'))).toEqual([
      'b3',
      'b5',
      'c2',
      'c6',
      'e2',
      'e6',
      'f3',
    ]);
  });

  it('should generate king one-square moves in all directions except friendly-occupied squares', () => {
    const board = emptyBoard();
    place(board, 'd4', pieceAt('king', 'white'));
    place(board, 'c5', pieceAt('pawn', 'white'));
    place(board, 'e5', pieceAt('pawn', 'black'));

    expect(algebraicMoves(generateKingMoves(board, toSquareIndex('d4'), 'white', noCastlingRights))).toEqual([
      'c3',
      'c4',
      'd3',
      'd5',
      'e3',
      'e4',
      'e5',
    ]);
  });

  it('should generate kingside and queenside castling from initial king and rook squares when paths are clear', () => {
    const board = emptyBoard();
    place(board, 'e1', pieceAt('king', 'white'));
    place(board, 'a1', pieceAt('rook', 'white'));
    place(board, 'h1', pieceAt('rook', 'white'));
    place(board, 'e8', pieceAt('king', 'black'));
    place(board, 'a8', pieceAt('rook', 'black'));
    place(board, 'h8', pieceAt('rook', 'black'));

    expect(algebraicMoves(generateCastlingMoves(board, 'white', allCastlingRights))).toEqual(['c1', 'g1']);
    expect(algebraicMoves(generateCastlingMoves(board, 'black', allCastlingRights))).toEqual(['c8', 'g8']);
  });

  it('should not generate castling when initial-position pieces block the king and rook path', () => {
    const board = createInitialBoard();

    expect(generateCastlingMoves(board, 'white', allCastlingRights)).toEqual([]);
    expect(generateCastlingMoves(board, 'black', allCastlingRights)).toEqual([]);
  });

  it('should dispatch pseudo-legal moves by the piece on the requested square', () => {
    const board = place(emptyBoard(), 'd4', pieceAt('knight', 'white'));

    expect(algebraicMoves(generatePseudoLegalMoves(board, toSquareIndex('d4')))).toEqual([
      'b3',
      'b5',
      'c2',
      'c6',
      'e2',
      'e6',
      'f3',
      'f5',
    ]);
    expect(generatePseudoLegalMoves(board, toSquareIndex('a1'))).toEqual([]);
  });
});

const noCastlingRights: CastlingRights = { wk: false, wq: false, bk: false, bq: false };
const allCastlingRights: CastlingRights = { wk: true, wq: true, bk: true, bq: true };
