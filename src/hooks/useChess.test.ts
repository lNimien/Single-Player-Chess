import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useChess } from './useChess';
import type { Move } from '../logic/moves';
import { createPiece } from '../logic/pieces';

vi.mock('../logic/ai', () => ({
  getAIMove: vi.fn(),
}));

import { getAIMove } from '../logic/ai';

function createMockAudioContext() {
  const oscillator = {
    connect: vi.fn().mockReturnThis(),
    start: vi.fn(),
    stop: vi.fn(),
    type: 'sine',
    frequency: { setValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn() },
  };
  const gainNode = {
    connect: vi.fn().mockReturnThis(),
    gain: { setValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn() },
  };
  return {
    createOscillator: vi.fn(function () { return oscillator; }),
    createGain: vi.fn(function () { return gainNode; }),
    currentTime: 0,
    destination: {},
  };
}

let mockAudioContextInstance: ReturnType<typeof createMockAudioContext>;

beforeEach(() => {
  mockAudioContextInstance = createMockAudioContext();
  global.AudioContext = vi.fn(function () { return mockAudioContextInstance; }) as unknown as typeof AudioContext;
});

afterEach(() => {
  vi.restoreAllMocks();
});

function createMockAIMove(): Move {
  return {
    from: 52,
    fromAlgebraic: 'e7',
    to: 36,
    toAlgebraic: 'e5',
    piece: createPiece('pawn', 'black'),
    captured: null,
    isEnPassant: false,
    isPromotion: false,
    promotionPiece: null,
    castling: null,
    enPassantTarget: null,
  };
}

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
    ];

    for (const [from, to] of moves) {
      act(() => result.current.selectSquare(from));
      act(() => result.current.selectSquare(to));
    }

    act(() => result.current.selectSquare('g7'));
    act(() => result.current.selectSquare('f8'));

    expect(result.current.promotionPending).toEqual({ from: 'g7', to: 'f8' });

    act(() => result.current.selectPromotionPiece('queen'));

    expect(result.current.game.board.find((sq) => sq.algebraic === 'f8')?.piece?.type).toBe('queen');
    expect(result.current.history).toHaveLength(9);
    expect(result.current.history[8].notation).toContain('=');
  });

  it('should set promotionPending when a pawn reaches the last rank', () => {
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
    ];

    for (const [from, to] of moves) {
      act(() => result.current.selectSquare(from));
      act(() => result.current.selectSquare(to));
    }

    act(() => result.current.selectSquare('g7'));
    act(() => result.current.selectSquare('f8'));

    expect(result.current.promotionPending).toEqual({ from: 'g7', to: 'f8' });
    expect(result.current.game.board.find((sq) => sq.algebraic === 'g7')?.piece?.type).toBe('pawn');
    expect(result.current.game.board.find((sq) => sq.algebraic === 'f8')?.piece?.type).toBe('bishop');
    expect(result.current.history).toHaveLength(8);
  });

  it('should complete promotion with selected piece', () => {
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
    ];

    for (const [from, to] of moves) {
      act(() => result.current.selectSquare(from));
      act(() => result.current.selectSquare(to));
    }

    act(() => result.current.selectSquare('g7'));
    act(() => result.current.selectSquare('f8'));

    expect(result.current.promotionPending).not.toBeNull();

    act(() => result.current.selectPromotionPiece('knight'));

    expect(result.current.promotionPending).toBeNull();
    expect(result.current.game.board.find((sq) => sq.algebraic === 'f8')?.piece?.type).toBe('knight');
    expect(result.current.game.board.find((sq) => sq.algebraic === 'f8')?.piece?.color).toBe('white');
    expect(result.current.history).toHaveLength(9);
    expect(result.current.history[8].notation).toContain('=N');
  });

  it('should cancel promotion and clear pending state', () => {
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
    ];

    for (const [from, to] of moves) {
      act(() => result.current.selectSquare(from));
      act(() => result.current.selectSquare(to));
    }

    act(() => result.current.selectSquare('g7'));
    act(() => result.current.selectSquare('f8'));

    expect(result.current.promotionPending).not.toBeNull();

    act(() => result.current.cancelPromotion());

    expect(result.current.promotionPending).toBeNull();
    expect(result.current.selectedSquare).toBeNull();
    expect(result.current.game.board.find((sq) => sq.algebraic === 'g7')?.piece?.type).toBe('pawn');
    expect(result.current.history).toHaveLength(8);
  });

  it('should have initial AI state disabled, level 3, not thinking', () => {
    const { result } = renderHook(() => useChess());
    expect(result.current.aiEnabled).toBe(false);
    expect(result.current.aiLevel).toBe(3);
    expect(result.current.isAIThinking).toBe(false);
  });

  it('should toggle AI enabled state', () => {
    const { result } = renderHook(() => useChess());
    expect(result.current.aiEnabled).toBe(false);

    act(() => result.current.toggleAI());
    expect(result.current.aiEnabled).toBe(true);

    act(() => result.current.toggleAI());
    expect(result.current.aiEnabled).toBe(false);
  });

  it('should set AI level', () => {
    const { result } = renderHook(() => useChess());
    expect(result.current.aiLevel).toBe(3);

    act(() => result.current.setAILevel(5));
    expect(result.current.aiLevel).toBe(5);
  });

  it('should trigger AI move when enabled and turn switches to black', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    (getAIMove as ReturnType<typeof vi.fn>).mockReturnValue(createMockAIMove());

    const { result } = renderHook(() => useChess());

    act(() => result.current.toggleAI());
    expect(result.current.aiEnabled).toBe(true);

    act(() => result.current.selectSquare('e2'));
    act(() => result.current.selectSquare('e4'));

    expect(result.current.currentTurn).toBe('black');
    expect(result.current.isAIThinking).toBe(true);

    await act(async () => {
      vi.advanceTimersByTime(400);
    });

    await waitFor(() => expect(result.current.isAIThinking).toBe(false));
    expect(result.current.currentTurn).toBe('white');
    expect(result.current.history).toHaveLength(2);

    vi.useRealTimers();
  });

  it('should not trigger AI move when AI is disabled', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    (getAIMove as ReturnType<typeof vi.fn>).mockReturnValue(createMockAIMove());

    const { result } = renderHook(() => useChess());

    act(() => result.current.selectSquare('e2'));
    act(() => result.current.selectSquare('e4'));

    expect(result.current.currentTurn).toBe('black');
    expect(result.current.isAIThinking).toBe(false);

    await act(async () => {
      vi.advanceTimersByTime(400);
    });

    expect(result.current.currentTurn).toBe('black');
    expect(result.current.history).toHaveLength(1);

    vi.useRealTimers();
  });

  it('should not trigger AI move when game is over', async () => {
    vi.useFakeTimers();
    (getAIMove as ReturnType<typeof vi.fn>).mockReturnValue(createMockAIMove());

    const { result } = renderHook(() => useChess());

    const moves: [string, string][] = [
      ['f2', 'f3'],
      ['e7', 'e6'],
      ['g2', 'g4'],
      ['d8', 'h4'],
    ];

    for (const [from, to] of moves) {
      act(() => result.current.selectSquare(from));
      act(() => result.current.selectSquare(to));
    }

    expect(result.current.isGameOver).toBe(true);

    act(() => result.current.toggleAI());

    await act(async () => {
      vi.advanceTimersByTime(400);
    });

    expect(result.current.isAIThinking).toBe(false);
    expect(result.current.history).toHaveLength(4);

    vi.useRealTimers();
  });

  it('should have initial playerColor as white', () => {
    const { result } = renderHook(() => useChess());
    expect(result.current.playerColor).toBe('white');
  });

  it('should toggle playerColor between white and black', () => {
    const { result } = renderHook(() => useChess());
    expect(result.current.playerColor).toBe('white');

    act(() => result.current.togglePlayerColor());
    expect(result.current.playerColor).toBe('black');

    act(() => result.current.togglePlayerColor());
    expect(result.current.playerColor).toBe('white');
  });

  it('should have initial animationsEnabled as true', () => {
    const { result } = renderHook(() => useChess());
    expect(result.current.animationsEnabled).toBe(true);
  });

  it('should toggle animationsEnabled', () => {
    const { result } = renderHook(() => useChess());
    expect(result.current.animationsEnabled).toBe(true);

    act(() => result.current.toggleAnimations());
    expect(result.current.animationsEnabled).toBe(false);

    act(() => result.current.toggleAnimations());
    expect(result.current.animationsEnabled).toBe(true);
  });

  it('should have initial soundsEnabled as true', () => {
    const { result } = renderHook(() => useChess());
    expect(result.current.soundsEnabled).toBe(true);
  });

  it('should toggle soundsEnabled', () => {
    const { result } = renderHook(() => useChess());
    expect(result.current.soundsEnabled).toBe(true);

    act(() => result.current.toggleSounds());
    expect(result.current.soundsEnabled).toBe(false);

    act(() => result.current.toggleSounds());
    expect(result.current.soundsEnabled).toBe(true);
  });

  it('should trigger AI as white when playerColor is black', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    (getAIMove as ReturnType<typeof vi.fn>).mockReturnValue(createMockAIMove());

    const { result } = renderHook(() => useChess());

    act(() => result.current.toggleAI());
    act(() => result.current.togglePlayerColor());

    expect(result.current.playerColor).toBe('black');
    expect(result.current.aiEnabled).toBe(true);
    expect(result.current.currentTurn).toBe('white');
    expect(result.current.isAIThinking).toBe(true);

    await act(async () => {
      vi.advanceTimersByTime(400);
    });

    await waitFor(() => expect(result.current.isAIThinking).toBe(false));
    expect(result.current.history).toHaveLength(1);

    vi.useRealTimers();
  });

  it('should play move sound when sounds are enabled and a move is made', () => {
    const { result } = renderHook(() => useChess());

    act(() => result.current.selectSquare('e2'));
    act(() => result.current.selectSquare('e4'));

    expect(global.AudioContext).toHaveBeenCalled();
    expect(mockAudioContextInstance.createOscillator).toHaveBeenCalled();
  });

  it('should not play sound when sounds are disabled', () => {
    const { result } = renderHook(() => useChess());

    act(() => result.current.toggleSounds());
    expect(result.current.soundsEnabled).toBe(false);

    act(() => result.current.selectSquare('e2'));
    act(() => result.current.selectSquare('e4'));

    expect(global.AudioContext).not.toHaveBeenCalled();
  });

  it('should play capture sound on a capture move', () => {
    const { result } = renderHook(() => useChess());

    // Scholar's mate sequence that includes captures
    // e2-e4, e7-e5, d2-d4, d7-d5, e4-d5 (capture)
    act(() => result.current.selectSquare('e2'));
    act(() => result.current.selectSquare('e4'));

    act(() => result.current.selectSquare('e7'));
    act(() => result.current.selectSquare('e5'));

    act(() => result.current.selectSquare('d2'));
    act(() => result.current.selectSquare('d4'));

    act(() => result.current.selectSquare('d7'));
    act(() => result.current.selectSquare('d5'));

    const callCountBefore = (global.AudioContext as ReturnType<typeof vi.fn>).mock.calls.length;

    act(() => result.current.selectSquare('e4'));
    act(() => result.current.selectSquare('d5'));

    expect(result.current.history[result.current.history.length - 1].captured).not.toBeNull();
    expect(global.AudioContext).toHaveBeenCalledTimes(callCountBefore + 1);
  });
});
