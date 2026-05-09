import { useState, useMemo, useCallback, useEffect } from 'react';
import type { GameState, GameMove } from '../state/game';
import { createGame, makeMove, undoMove, getLegalMoves, isGameOver } from '../state/game';
import { toSquareIndex } from '../logic';
import type { Algebraic, PieceType } from '../logic';
import { getAIMove } from '../logic/ai';

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
  promotionPending: { from: string; to: string } | null;
  selectPromotionPiece: (pieceType: PieceType) => void;
  cancelPromotion: () => void;
  aiEnabled: boolean;
  aiLevel: number;
  isAIThinking: boolean;
  toggleAI: () => void;
  setAILevel: (level: number) => void;
}

export function useChess(): UseChessReturn {
  const [game, setGame] = useState<GameState>(() => createGame());
  const [selectedSquare, setSelectedSquare] = useState<string | null>(null);
  const [promotionPending, setPromotionPending] = useState<{ from: string; to: string } | null>(null);
  const [aiEnabled, setAiEnabled] = useState(false);
  const [aiLevel, setAiLevel] = useState(3);
  const [isAIThinking, setIsAIThinking] = useState(false);

  const legalMoves = useMemo(() => {
    if (!selectedSquare) return [];
    const allLegal = getLegalMoves(game);
    return allLegal
      .filter((move) => move.fromAlgebraic === selectedSquare)
      .map((move) => move.toAlgebraic);
  }, [game, selectedSquare]);

  const currentTurn = game.sideToMove;
  const gameOver = isGameOver(game);

  const playAIMove = useCallback(async () => {
    if (!aiEnabled || isAIThinking || gameOver) return;
    setIsAIThinking(true);

    // Small delay to make AI feel natural
    await new Promise((resolve) => setTimeout(resolve, 300));

    const aiMove = getAIMove(game, aiLevel);
    if (aiMove) {
      setGame((prev) => makeMove(prev, aiMove));
    }
    setIsAIThinking(false);
  }, [aiEnabled, aiLevel, game, gameOver, isAIThinking]);

  useEffect(() => {
    if (aiEnabled && game.sideToMove === 'black' && !gameOver && !isAIThinking) {
      playAIMove();
    }
  }, [game.sideToMove, aiEnabled, gameOver, isAIThinking, playAIMove]);

  const toggleAI = useCallback(() => {
    setAiEnabled((prev) => !prev);
  }, []);

  const setAILevel = useCallback((level: number) => {
    setAiLevel(level);
  }, []);

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
          if (matchingMove.isPromotion) {
            setPromotionPending({ from: selectedSquare, to: algebraic });
            return prevGame;
          }
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

  const selectPromotionPiece = useCallback(
    (pieceType: PieceType) => {
      if (!promotionPending) return;
      const allLegal = getLegalMoves(game);
      const matchingMove = allLegal.find(
        (move) =>
          move.fromAlgebraic === promotionPending.from &&
          move.toAlgebraic === promotionPending.to &&
          move.isPromotion,
      );
      if (!matchingMove) return;
      const updatedMove = { ...matchingMove, promotionPiece: pieceType };
      setGame(makeMove(game, updatedMove));
      setPromotionPending(null);
      setSelectedSquare(null);
    },
    [game, promotionPending],
  );

  const cancelPromotion = useCallback(() => {
    setPromotionPending(null);
    setSelectedSquare(null);
  }, []);

  const undo = useCallback(() => {
    setGame((prevGame) => {
      setSelectedSquare(null);
      setPromotionPending(null);
      return undoMove(prevGame);
    });
  }, []);

  const reset = useCallback(() => {
    setSelectedSquare(null);
    setPromotionPending(null);
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
    promotionPending,
    selectPromotionPiece,
    cancelPromotion,
    aiEnabled,
    aiLevel,
    isAIThinking,
    toggleAI,
    setAILevel,
  };
}
