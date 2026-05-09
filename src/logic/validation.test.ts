import { describe, expect, it } from 'vitest';

import { createPiece } from './pieces';
import { createInitialBoard, parseFEN, toSquareIndex } from './board';
import { generatePseudoLegalMoves } from './moves';
import {
  filterLegalMoves,
  findKing,
  getGameResult,
  hasLegalMoves,
  isCheckmate,
  isInCheck,
  isLegalMove,
  isSquareAttacked,
  isStalemate,
} from './validation';

const EMPTY_BOARD_FEN = '8/8/8/8/8/8/8/8 w - - 0 1';

describe('validation', () => {
  describe('isSquareAttacked', () => {
    it('should detect white pawn attacks from e3 to d4 and f4', () => {
      const board = parseFEN('8/8/8/8/8/4P3/8/8 w - - 0 1');

      expect(isSquareAttacked(board, 'white', toSquareIndex('d4'))).toBe(true);
      expect(isSquareAttacked(board, 'white', toSquareIndex('f4'))).toBe(true);
      expect(isSquareAttacked(board, 'white', toSquareIndex('e4'))).toBe(false);
    });

    it('should detect black pawn attacks from e6 to d5 and f5', () => {
      const board = parseFEN('8/8/4p3/8/8/8/8/8 b - - 0 1');

      expect(isSquareAttacked(board, 'black', toSquareIndex('d5'))).toBe(true);
      expect(isSquareAttacked(board, 'black', toSquareIndex('f5'))).toBe(true);
      expect(isSquareAttacked(board, 'black', toSquareIndex('e5'))).toBe(false);
    });
  });

  describe('findKing', () => {
    it('should find both king squares on the initial board', () => {
      const board = createInitialBoard();

      expect(findKing(board, 'black')).toBe(toSquareIndex('e8'));
      expect(findKing(board, 'white')).toBe(toSquareIndex('e1'));
    });
  });

  describe('isInCheck', () => {
    it('should report white in check when a black rook attacks the e1 king from e8', () => {
      const board = parseFEN('4r2k/8/8/8/8/8/8/4K3 w - - 0 1');

      expect(isInCheck(board, 'white')).toBe(true);
      expect(isInCheck(board, 'black')).toBe(false);
    });
  });

  describe('isCheckmate', () => {
    it('should detect a forced checkmate position', () => {
      const board = parseFEN('k7/8/8/8/8/8/5PPP/4r1K1 w - - 0 1');

      expect(isCheckmate(board, 'white')).toBe(true);
      expect(getGameResult(board, 'white')).toBe('checkmate');
    });
  });

  describe('isStalemate', () => {
    it('should detect a classic stalemate position', () => {
      const board = parseFEN('7k/5Q2/6K1/8/8/8/8/8 b - - 0 1');

      expect(isStalemate(board, 'black')).toBe(true);
      expect(getGameResult(board, 'black')).toBe('stalemate');
    });
  });

  describe('filterLegalMoves', () => {
    it('should remove pseudo-legal moves that leave the moving king in check', () => {
      const board = parseFEN('4r3/8/8/8/8/8/4R3/4K3 w - - 0 1');
      const pseudoLegalMoves = generatePseudoLegalMoves(board, 'white');
      const legalMoves = filterLegalMoves(board, pseudoLegalMoves, 'white');

      expect(pseudoLegalMoves.some((move) => move.from === toSquareIndex('e2') && move.to === toSquareIndex('d2'))).toBe(true);
      expect(legalMoves.some((move) => move.from === toSquareIndex('e2') && move.to === toSquareIndex('d2'))).toBe(false);
      expect(legalMoves.some((move) => move.from === toSquareIndex('e2') && move.to === toSquareIndex('e8'))).toBe(true);
    });
  });

  describe('isLegalMove', () => {
    it('should identify a specific move that does not leave the own king in check', () => {
      const board = parseFEN('4r3/8/8/8/8/8/4R3/4K3 w - - 0 1');
      const legalCapture = generatePseudoLegalMoves(board, 'white').find(
        (move) => move.from === toSquareIndex('e2') && move.to === toSquareIndex('e8'),
      );
      const illegalSideMove = generatePseudoLegalMoves(board, 'white').find(
        (move) => move.from === toSquareIndex('e2') && move.to === toSquareIndex('d2'),
      );

      expect(legalCapture).toBeDefined();
      expect(illegalSideMove).toBeDefined();
      expect(isLegalMove(board, legalCapture!, 'white')).toBe(true);
      expect(isLegalMove(board, illegalSideMove!, 'white')).toBe(false);
    });
  });

  describe('hasLegalMoves', () => {
    it('should report that a normal initial board player has legal moves available', () => {
      expect(hasLegalMoves(createInitialBoard(), 'white')).toBe(true);
      expect(getGameResult(createInitialBoard(), 'white')).toBeNull();
    });
  });

  describe('getGameResult', () => {
    it('should return null when the position is neither checkmate nor stalemate', () => {
      const board = parseFEN(EMPTY_BOARD_FEN);
      const whiteKingIndex = toSquareIndex('e1');
      const blackKingIndex = toSquareIndex('e8');

      board[whiteKingIndex] = {
        ...board[whiteKingIndex],
        piece: createPiece('king', 'white'),
      };
      board[blackKingIndex] = {
        ...board[blackKingIndex],
        piece: createPiece('king', 'black'),
      };

      expect(getGameResult(board, 'white')).toBeNull();
    });
  });
});
