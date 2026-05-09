import { describe, expect, it } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useChess } from './useChess';

describe('useChess', () => {
  it('should have initial state with 32 pieces, white to move, no selection, no game over', () => {
    const { result } = renderHook(() => useChess());

    const pieceCount = result.current.game.board.filter((sq) => sq.piece !== null).length;
    expect(pieceCount).toBe(32);
    expect(result.current.currentTurn).toBe('white');
    expect(result.current.selectedSquare).toBeNull();
    expect(result.current.isGameOver).toBe(false);
    expect(result.current.history).toEqual([]);
  });

  it('should select a square with own piece and deselect if empty or enemy piece', () => {
    const { result } = renderHook(() => useChess());

    act(() => {
      result.current.selectSquare('e2');
    });
    expect(result.current.selectedSquare).toBe('e2');

    act(() => {
      result.current.selectSquare('e7');
    });
    expect(result.current.selectedSquare).toBeNull();

    act(() => {
      result.current.selectSquare('e4');
    });
    expect(result.current.selectedSquare).toBeNull();
  });

  it('should make a move when selecting a piece then a valid destination', () => {
    const { result } = renderHook(() => useChess());

    act(() => {
      result.current.selectSquare('e2');
    });
    expect(result.current.selectedSquare).toBe('e2');

    act(() => {
      result.current.selectSquare('e4');
    });

    expect(result.current.selectedSquare).toBeNull();
    expect(result.current.game.board.find((sq) => sq.algebraic === 'e4')?.piece?.type).toBe('pawn');
    expect(result.current.game.board.find((sq) => sq.algebraic === 'e2')?.piece).toBeNull();
    expect(result.current.currentTurn).toBe('black');
    expect(result.current.history).toHaveLength(1);
  });

  it('should reselect when clicking another own piece', () => {
    const { result } = renderHook(() => useChess());

    act(() => {
      result.current.selectSquare('e2');
    });
    expect(result.current.selectedSquare).toBe('e2');

    act(() => {
      result.current.selectSquare('d2');
    });
    expect(result.current.selectedSquare).toBe('d2');
  });

  it('should return legal moves for the selected piece', () => {
    const { result } = renderHook(() => useChess());

    act(() => {
      result.current.selectSquare('e2');
    });

    expect(result.current.legalMoves).toContain('e3');
    expect(result.current.legalMoves).toContain('e4');
  });

  it('should detect game over after checkmate', () => {
    const { result } = renderHook(() => useChess());

    const moves: [string, string][] = [
      ['f2', 'f3'],
      ['e7', 'e6'],
      ['g2', 'g4'],
      ['d8', 'h4'],
    ];

    for (const [from, to] of moves) {
      act(() => {
        result.current.selectSquare(from);
      });
      act(() => {
        result.current.selectSquare(to);
      });
    }

    expect(result.current.isGameOver).toBe(true);
    expect(result.current.game.result).toBe('checkmate');
  });

  it('should undo the last move and revert state', () => {
    const { result } = renderHook(() => useChess());

    act(() => {
      result.current.selectSquare('e2');
    });
    act(() => {
      result.current.selectSquare('e4');
    });

    expect(result.current.currentTurn).toBe('black');
    expect(result.current.history).toHaveLength(1);

    act(() => {
      result.current.undo();
    });

    expect(result.current.currentTurn).toBe('white');
    expect(result.current.history).toHaveLength(0);
    expect(result.current.game.board.find((sq) => sq.algebraic === 'e2')?.piece?.type).toBe('pawn');
    expect(result.current.game.board.find((sq) => sq.algebraic === 'e4')?.piece).toBeNull();
  });

  it('should reset the game to initial state', () => {
    const { result } = renderHook(() => useChess());

    act(() => {
      result.current.selectSquare('e2');
    });
    act(() => {
      result.current.selectSquare('e4');
    });

    expect(result.current.history).toHaveLength(1);

    act(() => {
      result.current.reset();
    });

    expect(result.current.history).toHaveLength(0);
    expect(result.current.currentTurn).toBe('white');
    expect(result.current.selectedSquare).toBeNull();
    expect(result.current.isGameOver).toBe(false);
  });

  it('should populate move history after moves', () => {
    const { result } = renderHook(() => useChess());

    act(() => {
      result.current.selectSquare('e2');
    });
    act(() => {
      result.current.selectSquare('e4');
    });

    expect(result.current.history).toHaveLength(1);
    expect(result.current.history[0].from).toBe('e2');
    expect(result.current.history[0].to).toBe('e4');
    expect(result.current.history[0].piece).toBe('P');
  });

  it('should handle promotion when a pawn reaches the last rank', () => {
    const { result } = renderHook(() => useChess());

    const moves: [string, string][] = [
      ['h2', 'h4'],
      ['a7', 'a5'],
      ['h4', 'h5'],
      ['a5', 'a4'],
      ['h5', 'h6'],
      ['a4', 'a3'],
      ['h6', 'g7'],
      ['a3', 'b2'],
      ['g7', 'f8'],
    ];

    for (const [from, to] of moves) {
      act(() => {
        result.current.selectSquare(from);
      });
      act(() => {
        result.current.selectSquare(to);
      });
    }

    expect(result.current.game.board.find((sq) => sq.algebraic === 'f8')?.piece?.type).toBe('queen');
    expect(result.current.history).toHaveLength(9);
    expect(result.current.history[8].notation).toContain('=');
  });
});
