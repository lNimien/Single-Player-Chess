import { describe, expect, it } from 'vitest';

import * as Logic from './index';
import type {
  Algebraic,
  BoardSquare,
  CastlingType,
  GameResult,
  Move,
  Piece,
  PieceColor,
  PieceType,
  SquareIndex,
} from './index';

type PublicTypeExports = [
  Algebraic,
  BoardSquare,
  CastlingType,
  GameResult,
  Move,
  Piece,
  PieceColor,
  PieceType,
  SquareIndex,
];

describe('logic public API', () => {
  it('should expose all expected runtime exports from the barrel', () => {
    expect(Logic).toEqual(
      expect.objectContaining({
        createPiece: expect.any(Function),
        pieceFromSymbol: expect.any(Function),
        isWhite: expect.any(Function),
        isBlack: expect.any(Function),
        createInitialBoard: expect.any(Function),
        parseFEN: expect.any(Function),
        toSquareIndex: expect.any(Function),
        fromSquareIndex: expect.any(Function),
        generatePseudoLegalMoves: expect.any(Function),
        generateCastlingMoves: expect.any(Function),
        isInCheck: expect.any(Function),
        isCheckmate: expect.any(Function),
        isStalemate: expect.any(Function),
        filterLegalMoves: expect.any(Function),
        isLegalMove: expect.any(Function),
        hasLegalMoves: expect.any(Function),
        getGameResult: expect.any(Function),
        isSquareAttacked: expect.any(Function),
        findKing: expect.any(Function),
      }),
    );
  });

  it('should compile type-only public exports from the barrel', () => {
    const compiles: PublicTypeExports | null = null;

    expect(compiles).toBeNull();
  });
});
