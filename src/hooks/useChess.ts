import { useState, useMemo, useCallback } from 'react';
import type { GameState, GameMove } from '../state/game';
import { createGame, makeMove, undoMove, getLegalMoves, isGameOver } from '../state/game';
import { toSquareIndex } from '../logic';
import type { Algebraic } from '../logic';

export interface UseChessReturn {
  game: GameState;
  selectedSquare: string | null;
  legalMoves: string[];
  currentTurn: 'white' | 'black';
  isGameOver: boolean;
  history: GameMove[];
  selectSquare: (algebraic: string) => void;
  undo: () => void;
  reset: () => void;
}

export function useChess(): UseChessReturn {
  const [game, setGame] = useState<GameState>(() => createGame());
  const [selectedSquare, setSelectedSquare] = useState<string | null>(null);

  const legalMoves = useMemo(() => {
    if (!selectedSquare) return [];
    const allLegal = getLegalMoves(game);
    return allLegal
      .filter((move) => move.fromAlgebraic === selectedSquare)
      .map((move) => move.toAlgebraic);
  }, [game, selectedSquare]);

  const currentTurn = game.sideToMove;
  const gameOver = isGameOver(game);

  const selectSquare = useCallback(
    (algebraic: string) => {
      setGame((prevGame) => {
        const squareIndex = toSquareIndex(algebraic as Algebraic);
        const square = prevGame.board[squareIndex];

        if (!selectedSquare) {
          if (square.piece && square.piece.color === prevGame.sideToMove) {
            setSelectedSquare(algebraic);
            return prevGame;
          }
          return prevGame;
        }

        if (selectedSquare === algebraic) {
          setSelectedSquare(null);
          return prevGame;
        }

        const allLegal = getLegalMoves(prevGame);
        const matchingMove = allLegal.find(
          (move) => move.fromAlgebraic === selectedSquare && move.toAlgebraic === algebraic,
        );

        if (matchingMove) {
          setSelectedSquare(null);
          return makeMove(prevGame, matchingMove);
        }

        if (square.piece && square.piece.color === prevGame.sideToMove) {
          setSelectedSquare(algebraic);
          return prevGame;
        }

        setSelectedSquare(null);
        return prevGame;
      });
    },
    [selectedSquare],
  );

  const undo = useCallback(() => {
    setGame((prevGame) => {
      setSelectedSquare(null);
      return undoMove(prevGame);
    });
  }, []);

  const reset = useCallback(() => {
    setSelectedSquare(null);
    setGame(createGame());
  }, []);

  return {
    game,
    selectedSquare,
    legalMoves,
    currentTurn,
    isGameOver: gameOver,
    history: game.history,
    selectSquare,
    undo,
    reset,
  };
}
