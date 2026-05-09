import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Panel from './Panel';
import type { GameMove, GameState } from '../../state/game';
import type { PieceColor } from '../../logic';

function createMockState(overrides: Partial<GameState> = {}): GameState {
  return {
    board: [],
    sideToMove: 'white' as PieceColor,
    history: [],
    castlingRights: { wk: true, wq: true, bk: true, bq: true },
    enPassantTarget: null,
    halfmoveClock: 0,
    fullmoveNumber: 1,
    result: null,
    ...overrides,
  };
}

function createMockMove(overrides: Partial<GameMove> = {}): GameMove {
  return {
    from: 'e2',
    to: 'e4',
    piece: 'P',
    captured: null,
    notation: 'e4',
    beforeState: createMockState(),
    ...overrides,
  };
}

const defaultProps = {
  sideToMove: 'white' as PieceColor,
  history: [] as GameMove[],
  result: null as 'checkmate' | 'stalemate' | 'draw' | null,
  isInCheck: false,
  onNewGame: vi.fn(),
  onUndo: vi.fn(),
};

describe('Panel', () => {
  it('should render white turn indicator', () => {
    const { container } = render(<Panel {...defaultProps} sideToMove="white" />);
    expect(screen.getByText(/white to move/i)).toBeTruthy();
    const turnIndicator = container.querySelector('.panel__turn');
    expect(turnIndicator).toBeTruthy();
    expect(turnIndicator!.classList.contains('panel__turn--white')).toBe(true);
  });

  it('should render black turn indicator', () => {
    const { container } = render(<Panel {...defaultProps} sideToMove="black" />);
    expect(screen.getByText(/black to move/i)).toBeTruthy();
    const turnIndicator = container.querySelector('.panel__turn');
    expect(turnIndicator).toBeTruthy();
    expect(turnIndicator!.classList.contains('panel__turn--black')).toBe(true);
  });

  it('should render move history list', () => {
    const history = [
      createMockMove({ notation: 'e4' }),
      createMockMove({ notation: 'e5' }),
      createMockMove({ notation: 'Nf3' }),
    ];
    render(<Panel {...defaultProps} history={history} />);
    expect(screen.getByText('e4')).toBeTruthy();
    expect(screen.getByText('e5')).toBeTruthy();
    expect(screen.getByText('Nf3')).toBeTruthy();
    expect(screen.getByText('1.')).toBeTruthy();
    expect(screen.getByText('2.')).toBeTruthy();
  });

  it('should render checkmate status', () => {
    render(<Panel {...defaultProps} result="checkmate" />);
    expect(screen.getByText(/checkmate/i)).toBeTruthy();
  });

  it('should render stalemate status', () => {
    render(<Panel {...defaultProps} result="stalemate" />);
    expect(screen.getByText(/stalemate/i)).toBeTruthy();
  });

  it('should render draw status', () => {
    render(<Panel {...defaultProps} result="draw" />);
    expect(screen.getByText(/draw/i)).toBeTruthy();
  });

  it('should render check status when in check and no result', () => {
    render(<Panel {...defaultProps} result={null} isInCheck={true} />);
    expect(screen.getByText(/check/i)).toBeTruthy();
  });

  it('should render action buttons', () => {
    render(<Panel {...defaultProps} />);
    expect(screen.getByRole('button', { name: /new game/i })).toBeTruthy();
    expect(screen.getByRole('button', { name: /undo/i })).toBeTruthy();
  });

  it('should call onNewGame when New Game clicked', async () => {
    const onNewGame = vi.fn();
    render(<Panel {...defaultProps} onNewGame={onNewGame} />);
    await userEvent.click(screen.getByRole('button', { name: /new game/i }));
    expect(onNewGame).toHaveBeenCalledTimes(1);
  });

  it('should call onUndo when Undo clicked', async () => {
    const onUndo = vi.fn();
    render(<Panel {...defaultProps} onUndo={onUndo} />);
    await userEvent.click(screen.getByRole('button', { name: /undo/i }));
    expect(onUndo).toHaveBeenCalledTimes(1);
  });

  it('should show empty state when no moves', () => {
    render(<Panel {...defaultProps} history={[]} />);
    expect(screen.getByText(/no moves yet/i)).toBeTruthy();
  });
});
