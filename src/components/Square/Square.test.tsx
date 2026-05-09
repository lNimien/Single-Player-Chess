import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Square from './Square';
import { createPiece } from '../../logic';
import type { BoardSquare } from '../../logic';

function makeSquare(overrides: Partial<BoardSquare> = {}): BoardSquare {
  return {
    index: 0,
    algebraic: 'a1',
    piece: null,
    isLight: false,
    ...overrides,
  };
}

describe('Square', () => {
  it('should render a light square', () => {
    const square = makeSquare({ algebraic: 'a2', isLight: true });
    const { container } = render(<Square square={square} />);
    expect(container.firstChild).toHaveClass('square--light');
    expect(container.firstChild).not.toHaveClass('square--dark');
  });

  it('should render a dark square', () => {
    const square = makeSquare({ algebraic: 'a1', isLight: false });
    const { container } = render(<Square square={square} />);
    expect(container.firstChild).toHaveClass('square--dark');
    expect(container.firstChild).not.toHaveClass('square--light');
  });

  it('should render selected state', () => {
    const square = makeSquare();
    const { container } = render(<Square square={square} isSelected />);
    expect(container.firstChild).toHaveClass('square--selected');
  });

  it('should render valid-move-target state', () => {
    const square = makeSquare();
    const { container } = render(<Square square={square} isValidTarget />);
    expect(container.firstChild).toHaveClass('square--valid-target');
    expect(container.querySelector('.square__indicator')).toBeInTheDocument();
  });

  it('should render last-move state', () => {
    const square = makeSquare();
    const { container } = render(<Square square={square} isLastMove />);
    expect(container.firstChild).toHaveClass('square--last-move');
  });

  it('should render check state', () => {
    const square = makeSquare();
    const { container } = render(<Square square={square} isCheck />);
    expect(container.firstChild).toHaveClass('square--check');
  });

  it('should render piece inside square', () => {
    const piece = createPiece('rook', 'white');
    const square = makeSquare({ piece });
    render(<Square square={square} />);
    expect(screen.getByLabelText('White rook')).toBeInTheDocument();
  });

  it('should call onClick when clicked', () => {
    const handleClick = vi.fn();
    const square = makeSquare();
    render(<Square square={square} onClick={handleClick} />);
    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('should have correct data-algebraic attribute', () => {
    const square = makeSquare({ algebraic: 'e4' });
    render(<Square square={square} />);
    expect(screen.getByRole('button')).toHaveAttribute('data-algebraic', 'e4');
  });
});
