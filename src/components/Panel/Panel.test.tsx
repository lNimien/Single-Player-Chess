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
  aiEnabled: false,
  aiLevel: 3,
  isAIThinking: false,
  onToggleAI: vi.fn(),
  onSetAILevel: vi.fn(),
  onOpenSettings: vi.fn(),
  onExportPGN: vi.fn(),
  reviewOffset: 0,
  isReviewingHistory: false,
  canReviewBackward: false,
  canReviewForward: false,
  onReviewBackward: vi.fn(),
  onReviewForward: vi.fn(),
  onExitReview: vi.fn(),
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
    expect(screen.getByRole('button', { name: /export pgn/i })).toBeTruthy();
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

  it('should render AI toggle unchecked when aiEnabled is false', () => {
    render(<Panel {...defaultProps} aiEnabled={false} />);
    const checkbox = screen.getByRole('checkbox', { name: /enable ai opponent/i });
    expect(checkbox).not.toBeChecked();
  });

  it('should render AI toggle checked when aiEnabled is true', () => {
    render(<Panel {...defaultProps} aiEnabled={true} />);
    const checkbox = screen.getByRole('checkbox', { name: /enable ai opponent/i });
    expect(checkbox).toBeChecked();
  });

  it('should call onToggleAI when AI checkbox is clicked', async () => {
    const onToggleAI = vi.fn();
    render(<Panel {...defaultProps} onToggleAI={onToggleAI} />);
    const checkbox = screen.getByRole('checkbox', { name: /enable ai opponent/i });
    await userEvent.click(checkbox);
    expect(onToggleAI).toHaveBeenCalledTimes(1);
  });

  it('should show AI level select when aiEnabled is true', () => {
    render(<Panel {...defaultProps} aiEnabled={true} aiLevel={3} />);
    expect(screen.getByLabelText(/ai difficulty level/i)).toBeTruthy();
    expect(screen.getByText(/beginner/i)).toBeTruthy();
    expect(screen.getByText(/expert/i)).toBeTruthy();
  });

  it('should not show AI level select when aiEnabled is false', () => {
    render(<Panel {...defaultProps} aiEnabled={false} />);
    expect(screen.queryByLabelText(/ai difficulty level/i)).toBeNull();
  });

  it('should call onSetAILevel when level is changed', async () => {
    const onSetAILevel = vi.fn();
    render(<Panel {...defaultProps} aiEnabled={true} onSetAILevel={onSetAILevel} />);
    const select = screen.getByLabelText(/ai difficulty level/i);
    await userEvent.selectOptions(select, '5');
    expect(onSetAILevel).toHaveBeenCalledWith(5);
  });

  it('should show thinking indicator when isAIThinking is true', () => {
    render(<Panel {...defaultProps} aiEnabled={true} isAIThinking={true} />);
    expect(screen.getByText(/ai is thinking/i)).toBeTruthy();
  });

  it('should not show thinking indicator when isAIThinking is false', () => {
    render(<Panel {...defaultProps} aiEnabled={true} isAIThinking={false} />);
    expect(screen.queryByText(/ai is thinking/i)).toBeNull();
  });

  it('should render Settings button', () => {
    render(<Panel {...defaultProps} />);
    expect(screen.getByRole('button', { name: /settings/i })).toBeTruthy();
  });

  it('should call onOpenSettings when Settings button is clicked', async () => {
    const onOpenSettings = vi.fn();
    render(<Panel {...defaultProps} onOpenSettings={onOpenSettings} />);
    await userEvent.click(screen.getByRole('button', { name: /settings/i }));
    expect(onOpenSettings).toHaveBeenCalledTimes(1);
  });

  it('should call onExportPGN when Export PGN button is clicked', async () => {
    const onExportPGN = vi.fn();
    render(<Panel {...defaultProps} onExportPGN={onExportPGN} />);
    await userEvent.click(screen.getByRole('button', { name: /export pgn/i }));
    expect(onExportPGN).toHaveBeenCalledTimes(1);
  });

  it('should render review controls', () => {
    render(<Panel {...defaultProps} canReviewBackward={true} />);
    expect(screen.getByRole('button', { name: /back/i })).toBeTruthy();
    expect(screen.getByRole('button', { name: /forward/i })).toBeTruthy();
    expect(screen.getByRole('button', { name: /current/i })).toBeTruthy();
  });

  it('should show review status when viewing previous moves', () => {
    render(<Panel {...defaultProps} isReviewingHistory={true} reviewOffset={3} canReviewForward={true} />);
    expect(screen.getByText(/viewing 3 moves ago/i)).toBeTruthy();
  });

  it('should call review callbacks', async () => {
    const onReviewBackward = vi.fn();
    const onReviewForward = vi.fn();
    const onExitReview = vi.fn();
    render(
      <Panel
        {...defaultProps}
        isReviewingHistory={true}
        canReviewBackward={true}
        canReviewForward={true}
        onReviewBackward={onReviewBackward}
        onReviewForward={onReviewForward}
        onExitReview={onExitReview}
      />,
    );
    await userEvent.click(screen.getByRole('button', { name: /back/i }));
    await userEvent.click(screen.getByRole('button', { name: /forward/i }));
    await userEvent.click(screen.getByRole('button', { name: /current/i }));
    expect(onReviewBackward).toHaveBeenCalledTimes(1);
    expect(onReviewForward).toHaveBeenCalledTimes(1);
    expect(onExitReview).toHaveBeenCalledTimes(1);
  });
});
