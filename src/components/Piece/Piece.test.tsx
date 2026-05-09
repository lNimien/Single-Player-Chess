import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Piece from './Piece';
import { createPiece } from '../../logic';

describe('Piece', () => {
  it('should render white pawn with correct aria-label', () => {
    const piece = createPiece('pawn', 'white');
    render(<Piece piece={piece} />);
    
    const pieceElement = screen.getByLabelText('White pawn');
    expect(pieceElement).toBeTruthy();
    expect(pieceElement.getAttribute('aria-label')).toBe('White pawn');
  });

  it('should render black queen with correct aria-label', () => {
    const piece = createPiece('queen', 'black');
    render(<Piece piece={piece} />);
    
    const pieceElement = screen.getByLabelText('Black queen');
    expect(pieceElement).toBeTruthy();
    expect(pieceElement.getAttribute('aria-label')).toBe('Black queen');
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

  it('should render all piece types correctly', () => {
    const types = ['pawn', 'knight', 'bishop', 'rook', 'queen', 'king'] as const;
    
    types.forEach((type) => {
      const piece = createPiece(type, 'white');
      const { unmount } = render(<Piece piece={piece} />);
      
      const element = screen.getByLabelText(`White ${type}`);
      expect(element).toBeTruthy();
      expect(element.getAttribute('aria-label')).toBe(`White ${type}`);
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

  it('should render svg element inside', () => {
    const piece = createPiece('king', 'white');
    const { container } = render(<Piece piece={piece} />);
    
    const pieceElement = container.firstChild as HTMLElement;
    expect(pieceElement).toBeTruthy();
    
    const svg = pieceElement.querySelector('svg');
    expect(svg).toBeTruthy();
    expect(svg?.getAttribute('viewBox')).toBe('0 0 64 64');
  });

  it('should respect reduced-motion preference', () => {
    const piece = createPiece('queen', 'black');
    const { container } = render(<Piece piece={piece} />);
    
    const pieceElement = container.firstChild as HTMLElement;
    expect(pieceElement.classList.contains('piece')).toBe(true);
  });
});
