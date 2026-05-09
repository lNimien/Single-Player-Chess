import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PromotionModal from './PromotionModal';

describe('PromotionModal', () => {
  const defaultProps = {
    isOpen: true,
    color: 'white' as const,
    onSelect: vi.fn(),
    onCancel: vi.fn(),
  };

  it('should render modal when isOpen is true', () => {
    render(<PromotionModal {...defaultProps} />);

    const dialog = screen.getByRole('dialog');
    expect(dialog).toBeInTheDocument();
  });

  it('should not render when isOpen is false', () => {
    render(<PromotionModal {...defaultProps} isOpen={false} />);

    const dialog = screen.queryByRole('dialog');
    expect(dialog).not.toBeInTheDocument();
  });

  it('should render 4 piece options (queen, rook, bishop, knight)', () => {
    render(<PromotionModal {...defaultProps} />);

    const queenButton = screen.getByRole('button', { name: /promote to queen/i });
    const rookButton = screen.getByRole('button', { name: /promote to rook/i });
    const bishopButton = screen.getByRole('button', { name: /promote to bishop/i });
    const knightButton = screen.getByRole('button', { name: /promote to knight/i });

    expect(queenButton).toBeInTheDocument();
    expect(rookButton).toBeInTheDocument();
    expect(bishopButton).toBeInTheDocument();
    expect(knightButton).toBeInTheDocument();
  });

  it('should call onSelect with correct piece type when a piece option is clicked', async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();

    render(<PromotionModal {...defaultProps} onSelect={onSelect} />);

    const queenButton = screen.getByRole('button', { name: /promote to queen/i });
    await user.click(queenButton);
    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(onSelect).toHaveBeenCalledWith('queen');

    const knightButton = screen.getByRole('button', { name: /promote to knight/i });
    await user.click(knightButton);
    expect(onSelect).toHaveBeenCalledTimes(2);
    expect(onSelect).toHaveBeenCalledWith('knight');
  });

  it('should call onCancel when cancel button is clicked', async () => {
    const user = userEvent.setup();
    const onCancel = vi.fn();

    render(<PromotionModal {...defaultProps} onCancel={onCancel} />);

    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    await user.click(cancelButton);

    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it('should have correct aria attributes', () => {
    render(<PromotionModal {...defaultProps} />);

    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(dialog).toHaveAttribute('aria-label', 'Choose promotion piece');
  });

  it('should render black pieces when color is black', () => {
    render(<PromotionModal {...defaultProps} color="black" />);

    const queenButton = screen.getByRole('button', { name: /promote to queen/i });
    expect(queenButton).toBeInTheDocument();
  });
});
