import React, { useMemo } from 'react';
import type { BoardSquare, PieceColor, Algebraic } from '../../logic';
import { toSquareIndex } from '../../logic';
import Square from '../Square/Square';
import './Board.css';

export interface BoardProps {
  squares: BoardSquare[];
  sideToMove: PieceColor;
  selectedSquare: string | null;
  legalMoves: string[];
  lastMove: { from: string; to: string } | null;
  checkSquare: string | null;
  onSquareClick: (algebraic: string) => void;
  isFlipped?: boolean;
}

const FILES = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
const RANKS = ['1', '2', '3', '4', '5', '6', '7', '8'];
const RANKS_REVERSED = [...RANKS].reverse();

const Board = React.memo(function Board({
  squares,
  sideToMove: _sideToMove,
  selectedSquare,
  legalMoves,
  lastMove,
  checkSquare,
  onSquareClick,
  isFlipped = false,
}: BoardProps) {
  const { selected, validTargets, lastMoveSquares, check } = useMemo(
    () => ({
      selected: selectedSquare,
      validTargets: new Set(legalMoves),
      lastMoveSquares: lastMove ? new Set([lastMove.from, lastMove.to]) : new Set<string>(),
      check: checkSquare,
    }),
    [selectedSquare, legalMoves, lastMove, checkSquare],
  );

  const displayRanks = isFlipped ? RANKS : RANKS_REVERSED;
  const displayFiles = isFlipped ? [...FILES].reverse() : FILES;

  return (
    <div className="board" role="grid" aria-label="Chess board">
      {displayRanks.map((rank, rankIndex) => (
        <React.Fragment key={`rank-row-${rank}`}>
          <div
            className="board__label board__label--rank"
            style={{ gridRow: rankIndex + 1, gridColumn: 1 }}
          >
            {rank}
          </div>
          {displayFiles.map((file, fileIndex) => {
            const algebraic = `${file}${rank}` as Algebraic;
            const square = squares[toSquareIndex(algebraic)];
            return (
              <div
                key={algebraic}
                className="board__square"
                style={{ gridRow: rankIndex + 1, gridColumn: fileIndex + 2 }}
              >
                <Square
                  square={square}
                  isSelected={selected === algebraic}
                  isValidTarget={validTargets.has(algebraic)}
                  isLastMove={lastMoveSquares.has(algebraic)}
                  isCheck={check === algebraic}
                  onClick={() => onSquareClick(algebraic)}
                />
              </div>
            );
          })}
        </React.Fragment>
      ))}
      {displayFiles.map((file, fileIndex) => (
        <div
          key={`file-${file}`}
          className="board__label board__label--file"
          style={{ gridRow: 9, gridColumn: fileIndex + 2 }}
        >
          {file}
        </div>
      ))}
    </div>
  );
});

export default Board;
