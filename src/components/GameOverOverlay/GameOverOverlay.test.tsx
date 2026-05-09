import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import GameOverOverlay from './GameOverOverlay';

describe('GameOverOverlay', () => {
  const defaultProps = {
    result: 'checkmate' as const,
    winner: 'white' as const,
    onNewGame: vi.fn(),
  };

  it('should not render when result is null', () => {
    render(<GameOverOverlay {...defaultProps} result={null} winner={null} />);

    const dialog = screen.queryByRole('dialog');
    expect(dialog).not.toBeInTheDocument();
  });

  it('should render "Checkmate!" when result is checkmate', () => {
    render(<GameOverOverlay {...defaultProps} />);

    expect(screen.getByText('Checkmate!')).toBeInTheDocument();
  });

  it('should render "Stalemate!" when result is stalemate', () => {
    render(<GameOverOverlay {...defaultProps} result="stalemate" winner={null} />);

    expect(screen.getByText('Stalemate!')).toBeInTheDocument();
  });

  it('should render winner color when checkmate', () => {
    render(<GameOverOverlay {...defaultProps} winner="white" />);

    expect(screen.getByText('White wins')).toBeInTheDocument();
  });

  it('should render black winner when winner is black', () => {
    render(<GameOverOverlay {...defaultProps} winner="black" />);

    expect(screen.getByText('Black wins')).toBeInTheDocument();
  });

  it('should call onNewGame when button clicked', async () => {
    const user = userEvent.setup();
    const onNewGame = vi.fn();

    render(<GameOverOverlay {...defaultProps} onNewGame={onNewGame} />);

    const button = screen.getByRole('button', { name: /new game/i });
    await user.click(button);

    expect(onNewGame).toHaveBeenCalledTimes(1);
  });

  it('should have correct aria attributes', () => {
    render(<GameOverOverlay {...defaultProps} />);

    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(dialog).toHaveAttribute('aria-live', 'polite');
  });
});
