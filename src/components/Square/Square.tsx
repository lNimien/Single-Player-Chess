import React from 'react';
import type { BoardSquare } from '../../logic';
import Piece from '../Piece/Piece';
import './Square.css';

export interface SquareProps {
  square: BoardSquare;
  isSelected?: boolean;
  isValidTarget?: boolean;
  isLastMove?: boolean;
  isCheck?: boolean;
  onClick?: () => void;
}

const Square = React.memo(function Square({
  square,
  isSelected = false,
  isValidTarget = false,
  isLastMove = false,
  isCheck = false,
  onClick,
}: SquareProps) {
  const className = [
    'square',
    square.isLight ? 'square--light' : 'square--dark',
    isSelected && 'square--selected',
    isValidTarget && 'square--valid-target',
    isLastMove && 'square--last-move',
    isCheck && 'square--check',
  ].filter(Boolean).join(' ');

  return (
    <button
      className={className}
      data-algebraic={square.algebraic}
      onClick={onClick}
      aria-label={`Square ${square.algebraic}`}
    >
      {square.piece && <Piece piece={square.piece} isSelected={isSelected} />}
      {isValidTarget && <span className="square__indicator" aria-hidden="true" />}
    </button>
  );
});

export default Square;
