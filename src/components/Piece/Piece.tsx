import React from 'react';
import type { Piece as PieceModel } from '../../logic';
import './Piece.css';

export interface PieceProps {
  piece: PieceModel;
  isSelected?: boolean;
}

const piecePaths: Record<string, string> = {
  pawn: 'M32 12 C32 8, 36 8, 36 12 C36 16, 32 16, 32 12 M32 18 C38 18, 42 22, 42 28 C42 32, 40 34, 38 36 L40 52 L24 52 L26 36 C24 34, 22 32, 22 28 C22 22, 26 18, 32 18',
  
  rook: 'M18 12 L18 20 L22 20 L22 12 L26 12 L26 20 L30 20 L30 12 L34 12 L34 20 L38 20 L38 12 L42 12 L42 20 L46 20 L46 28 L42 28 L42 52 L22 52 L22 28 L18 28 L18 20 Z',
  
  knight: 'M20 48 C20 48, 22 36, 24 32 C24 32, 20 28, 22 24 C24 20, 28 18, 32 18 C36 18, 40 20, 42 24 C44 28, 42 32, 40 34 C38 36, 36 38, 36 40 L38 48 L34 52 L30 48 L26 52 Z M32 22 C30 22, 28 24, 28 26 C28 28, 30 30, 32 30 C34 30, 36 28, 36 26 C36 24, 34 22, 32 22',
  
  bishop: 'M32 8 L36 16 L40 24 L38 32 L36 40 L38 48 L34 52 L30 48 L32 40 L30 32 L28 24 L32 16 L36 8 M32 24 L32 32',
  
  queen: 'M32 8 L36 16 L40 12 L42 20 L48 18 L46 28 L44 36 L42 48 L38 52 L26 52 L22 48 L20 36 L18 28 L16 18 L22 20 L24 12 L28 16 L32 8',
  
  king: 'M32 8 L32 14 M28 11 L36 11 M32 14 L36 18 L40 16 L42 24 L44 32 L42 40 L40 48 L36 52 L28 52 L24 48 L22 40 L20 32 L22 24 L24 16 L28 18 L32 14'
};

const Piece = React.memo(function Piece({ piece, isSelected = false }: PieceProps) {
  const className = [
    'piece',
    `piece--${piece.color}`,
    isSelected && 'piece--selected',
  ].filter(Boolean).join(' ');

  const ariaLabel = `${piece.color.charAt(0).toUpperCase() + piece.color.slice(1)} ${piece.type}`;

  return (
    <div 
      className={className}
      aria-label={`${piece.color === 'white' ? 'White' : 'Black'} ${piece.type}`}
      role="img"
      style={{ width: '100%', height: '100%', cursor: 'grab' }}
    >
      <svg
        viewBox="0 0 64 64"
        width="100%"
        height="100%"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d={piecePaths[piece.type]} fill="currentColor" />
      </svg>
    </div>
  );
});

export default Piece;
