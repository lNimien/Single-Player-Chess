import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Piece from './Piece';
import { createPiece } from '../../logic';

describe('Piece', () => {
  it('should render white pawn image with correct src and alt', () => {
    const piece = createPiece('pawn', 'white');
    render(<Piece piece={piece} />);

    const img = screen.getByAltText('white pawn');
    expect(img).toBeTruthy();
    expect(img.getAttribute('src')).toBe('/assets/pieces/w_pawn.png');
    expect(img.tagName.toLowerCase()).toBe('img');
  });

  it('should render black queen image with correct src and alt', () => {
    const piece = createPiece('queen', 'black');
    render(<Piece piece={piece} />);

    const img = screen.getByAltText('black queen');
    expect(img).toBeTruthy();
    expect(img.getAttribute('src')).toBe('/assets/pieces/b_queen.png');
  });

  it('should apply selected class when isSelected is true', () => {
    const piece = createPiece('knight', 'white');
    const { container } = render(<Piece piece={piece} isSelected={true} />);

    const element = container.firstChild as HTMLElement;
    expect(element.classList.contains('piece--selected')).toBe(true);
  });

  it('should not apply selected class when isSelected is false', () => {
    const piece = createPiece('knight', 'white');
    const { container } = render(<Piece piece={piece} isSelected={false} />);

    const element = container.firstChild as HTMLElement;
    expect(element.classList.contains('piece--selected')).toBe(false);
  });

  it('should apply correct CSS class based on color', () => {
    const whitePiece = createPiece('rook', 'white');
    const { container: whiteContainer } = render(<Piece piece={whitePiece} />);

    const whiteElement = whiteContainer.firstChild as HTMLElement;
    expect(whiteElement.classList.contains('piece--white')).toBe(true);
    expect(whiteElement.classList.contains('piece--black')).toBe(false);

    const blackPiece = createPiece('rook', 'black');
    const { container: blackContainer } = render(<Piece piece={blackPiece} />);

    const blackElement = blackContainer.firstChild as HTMLElement;
    expect(blackElement.classList.contains('piece--black')).toBe(true);
    expect(blackElement.classList.contains('piece--white')).toBe(false);
  });

  it('should render all piece types correctly', () => {
    const types = ['pawn', 'knight', 'bishop', 'rook', 'queen', 'king'] as const;

    types.forEach((type) => {
      const piece = createPiece(type, 'white');
      const { unmount } = render(<Piece piece={piece} />);

      const img = screen.getByAltText(`white ${type}`);
      expect(img).toBeTruthy();
      expect(img.getAttribute('src')).toContain(`/assets/pieces/w_${type}.png`);
      unmount();
    });
  });

  it('should have proper piece class structure', () => {
    const piece = createPiece('bishop', 'white');
    const { container } = render(<Piece piece={piece} />);

    const pieceElement = container.firstChild as HTMLElement;
    expect(pieceElement.classList.contains('piece')).toBe(true);
    expect(pieceElement.classList.contains('piece--white')).toBe(true);
  });

  it('should render img element with draggable false', () => {
    const piece = createPiece('king', 'white');
    render(<Piece piece={piece} />);

    const img = screen.getByAltText('white king');
    expect(img).toBeTruthy();
    expect(img.getAttribute('draggable')).toBe('false');
  });
});
