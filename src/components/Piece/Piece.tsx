import React from 'react';
import type { Piece as PieceModel, PieceColor, PieceType } from '../../logic';
import './Piece.css';

export interface PieceProps {
  piece: PieceModel;
  isSelected?: boolean;
}

const PIECE_IMAGES: Record<PieceColor, Record<PieceType, string>> = {
  white: {
    pawn: '/assets/pieces/w_pawn.png',
    rook: '/assets/pieces/w_rook.png',
    knight: '/assets/pieces/w_knight.png',
    bishop: '/assets/pieces/w_bishop.png',
    queen: '/assets/pieces/w_queen.png',
    king: '/assets/pieces/w_king.png',
  },
  black: {
    pawn: '/assets/pieces/b_pawn.png',
    rook: '/assets/pieces/b_rook.png',
    knight: '/assets/pieces/b_knight.png',
    bishop: '/assets/pieces/b_bishop.png',
    queen: '/assets/pieces/b_queen.png',
    king: '/assets/pieces/b_king.png',
  },
};

const Piece = React.memo(function Piece({ piece, isSelected = false }: PieceProps) {
  const className = [
    'piece',
    `piece--${piece.color}`,
    isSelected && 'piece--selected',
  ].filter(Boolean).join(' ');

  return (
    <div className={className}>
      <img
        src={PIECE_IMAGES[piece.color][piece.type]}
        alt={`${piece.color} ${piece.type}`}
        className="piece__image"
        draggable={false}
      />
    </div>
  );
});

export default Piece;
