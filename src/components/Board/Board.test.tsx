import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Board from './Board';
import { createInitialBoard } from '../../logic';

describe('Board', () => {
  const defaultProps = {
    squares: createInitialBoard(),
    sideToMove: 'white' as const,
    selectedSquare: null,
    legalMoves: [] as string[],
    lastMove: null as { from: string; to: string } | null,
    checkSquare: null as string | null,
    onSquareClick: vi.fn(),
  };

  it('should render 64 squares', () => {
    render(<Board {...defaultProps} />);
    const squares = screen.getAllByRole('button');
    expect(squares).toHaveLength(64);
  });

  it('should render coordinate labels a-h and 1-8', () => {
    render(<Board {...defaultProps} />);
    ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'].forEach((file) => {
      expect(screen.getByText(file)).toBeTruthy();
    });
    ['1', '2', '3', '4', '5', '6', '7', '8'].forEach((rank) => {
      expect(screen.getByText(rank)).toBeTruthy();
    });
  });

  it('should highlight selected square', () => {
    render(<Board {...defaultProps} selectedSquare="e2" />);
    const selected = screen.getByLabelText('Square e2');
    expect(selected.classList.contains('square--selected')).toBe(true);
  });

  it('should highlight valid move targets', () => {
    render(<Board {...defaultProps} legalMoves={['e3', 'e4']} />);
    const e3 = screen.getByLabelText('Square e3');
    const e4 = screen.getByLabelText('Square e4');
    expect(e3.classList.contains('square--valid-target')).toBe(true);
    expect(e4.classList.contains('square--valid-target')).toBe(true);
  });

  it('should highlight last move squares', () => {
    render(<Board {...defaultProps} lastMove={{ from: 'e2', to: 'e4' }} />);
    const from = screen.getByLabelText('Square e2');
    const to = screen.getByLabelText('Square e4');
    expect(from.classList.contains('square--last-move')).toBe(true);
    expect(to.classList.contains('square--last-move')).toBe(true);
  });

  it('should highlight check square', () => {
    render(<Board {...defaultProps} checkSquare="e1" />);
    const check = screen.getByLabelText('Square e1');
    expect(check.classList.contains('square--check')).toBe(true);
  });

  it('should call onSquareClick with algebraic when square clicked', () => {
    const onSquareClick = vi.fn();
    render(<Board {...defaultProps} onSquareClick={onSquareClick} />);
    const e2 = screen.getByLabelText('Square e2');
    fireEvent.click(e2);
    expect(onSquareClick).toHaveBeenCalledTimes(1);
    expect(onSquareClick).toHaveBeenCalledWith('e2');
  });
});
