import { useState, useMemo, useCallback, useEffect } from 'react';
import type { GameState, GameMove } from '../state/game';
import { createGame, makeMove, undoMove, getLegalMoves, isGameOver } from '../state/game';
import { toSquareIndex, isInCheck } from '../logic';
import type { Algebraic, PieceType } from '../logic';
import { getAIMove } from '../logic/ai';

export interface UseChessReturn {
  game: GameState;
  displayedGame: GameState;
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
  playerColor: 'white' | 'black';
  animationsEnabled: boolean;
  soundsEnabled: boolean;
  togglePlayerColor: () => void;
  toggleAnimations: () => void;
  toggleSounds: () => void;
  reviewOffset: number;
  isReviewingHistory: boolean;
  canReviewBackward: boolean;
  canReviewForward: boolean;
  reviewBackward: () => void;
  reviewForward: () => void;
  exitReview: () => void;
}

function playMoveSound() {
  if (typeof AudioContext === 'undefined') return;
  const audioCtx = new AudioContext();
  const oscillator = audioCtx.createOscillator();
  const gainNode = audioCtx.createGain();
  oscillator.connect(gainNode);
  gainNode.connect(audioCtx.destination);
  oscillator.type = 'sine';
  oscillator.frequency.setValueAtTime(300, audioCtx.currentTime);
  oscillator.frequency.exponentialRampToValueAtTime(100, audioCtx.currentTime + 0.1);
  gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);
  oscillator.start();
  oscillator.stop(audioCtx.currentTime + 0.1);
}

function playCaptureSound() {
  if (typeof AudioContext === 'undefined') return;
  const audioCtx = new AudioContext();
  const oscillator = audioCtx.createOscillator();
  const gainNode = audioCtx.createGain();
  oscillator.connect(gainNode);
  gainNode.connect(audioCtx.destination);
  oscillator.type = 'square';
  oscillator.frequency.setValueAtTime(150, audioCtx.currentTime);
  gainNode.gain.setValueAtTime(0.15, audioCtx.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.15);
  oscillator.start();
  oscillator.stop(audioCtx.currentTime + 0.15);
}

function playCheckSound() {
  if (typeof AudioContext === 'undefined') return;
  const audioCtx = new AudioContext();
  const oscillator = audioCtx.createOscillator();
  const gainNode = audioCtx.createGain();
  oscillator.connect(gainNode);
  gainNode.connect(audioCtx.destination);
  oscillator.type = 'sine';
  oscillator.frequency.setValueAtTime(600, audioCtx.currentTime);
  oscillator.frequency.setValueAtTime(800, audioCtx.currentTime + 0.1);
  gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.2);
  oscillator.start();
  oscillator.stop(audioCtx.currentTime + 0.2);
}

function playSoundForMove(move: ReturnType<typeof makeMove>, matchingMove: { captured: unknown }) {
  const nextSide = move.sideToMove;
  const isCheck = isInCheck(move.board, nextSide);
  if (isCheck) {
    playCheckSound();
  } else if (matchingMove.captured) {
    playCaptureSound();
  } else {
    playMoveSound();
  }
}

export function useChess(): UseChessReturn {
  const [game, setGame] = useState<GameState>(() => createGame());
  const [selectedSquare, setSelectedSquare] = useState<string | null>(null);
  const [promotionPending, setPromotionPending] = useState<{ from: string; to: string } | null>(null);
  const [aiEnabled, setAiEnabled] = useState(false);
  const [aiLevel, setAiLevel] = useState(3);
  const [isAIThinking, setIsAIThinking] = useState(false);
  const [playerColor, setPlayerColor] = useState<'white' | 'black'>('white');
  const [animationsEnabled, setAnimationsEnabled] = useState(true);
  const [soundsEnabled, setSoundsEnabled] = useState(true);
  const [reviewOffset, setReviewOffset] = useState(0);

  const displayedGame = useMemo(() => {
    if (reviewOffset === 0) return game;
    const moveIndex = game.history.length - reviewOffset;
    return game.history[moveIndex]?.beforeState ?? game;
  }, [game, reviewOffset]);

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
      setGame((prev) => {
        const nextGame = makeMove(prev, aiMove);
        if (soundsEnabled) {
          playSoundForMove(nextGame, aiMove);
        }
        return nextGame;
      });
    }
    setIsAIThinking(false);
  }, [aiEnabled, aiLevel, game, gameOver, isAIThinking, soundsEnabled]);

  useEffect(() => {
    const aiSide = playerColor === 'white' ? 'black' : 'white';
    if (aiEnabled && game.sideToMove === aiSide && !gameOver && !isAIThinking) {
      playAIMove();
    }
  }, [game.sideToMove, aiEnabled, playerColor, gameOver, isAIThinking, playAIMove]);

  const toggleAI = useCallback(() => {
    setAiEnabled((prev) => !prev);
  }, []);

  const setAILevel = useCallback((level: number) => {
    setAiLevel(level);
  }, []);

  const togglePlayerColor = useCallback(() => {
    setPlayerColor((prev) => (prev === 'white' ? 'black' : 'white'));
  }, []);

  const toggleAnimations = useCallback(() => {
    setAnimationsEnabled((prev) => !prev);
  }, []);

  const toggleSounds = useCallback(() => {
    setSoundsEnabled((prev) => !prev);
  }, []);

  const selectSquare = useCallback(
    (algebraic: string) => {
      if (reviewOffset > 0) return;
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
          const nextGame = makeMove(prevGame, matchingMove);
          if (soundsEnabled) {
            playSoundForMove(nextGame, matchingMove);
          }
          return nextGame;
        }

        if (square.piece && square.piece.color === prevGame.sideToMove) {
          setSelectedSquare(algebraic);
          return prevGame;
        }

        setSelectedSquare(null);
        return prevGame;
      });
    },
    [reviewOffset, selectedSquare, soundsEnabled],
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
      const nextGame = makeMove(game, updatedMove);
      if (soundsEnabled) {
        playSoundForMove(nextGame, matchingMove);
      }
      setGame(nextGame);
      setReviewOffset(0);
      setPromotionPending(null);
      setSelectedSquare(null);
    },
    [game, promotionPending, soundsEnabled],
  );

  const cancelPromotion = useCallback(() => {
    setPromotionPending(null);
    setSelectedSquare(null);
  }, []);

  const undo = useCallback(() => {
    setGame((prevGame) => {
      setSelectedSquare(null);
      setPromotionPending(null);
      setReviewOffset(0);
      return undoMove(prevGame);
    });
  }, []);

  const reset = useCallback(() => {
    setSelectedSquare(null);
    setPromotionPending(null);
    setReviewOffset(0);
    setGame(createGame());
  }, []);

  const reviewBackward = useCallback(() => {
    setSelectedSquare(null);
    setPromotionPending(null);
    setReviewOffset((prev) => Math.min(game.history.length, prev + 1));
  }, [game.history.length]);

  const reviewForward = useCallback(() => {
    setReviewOffset((prev) => Math.max(0, prev - 1));
  }, []);

  const exitReview = useCallback(() => {
    setReviewOffset(0);
  }, []);

  return {
    game,
    displayedGame,
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
    playerColor,
    animationsEnabled,
    soundsEnabled,
    togglePlayerColor,
    toggleAnimations,
    toggleSounds,
    reviewOffset,
    isReviewingHistory: reviewOffset > 0,
    canReviewBackward: reviewOffset < game.history.length,
    canReviewForward: reviewOffset > 0,
    reviewBackward,
    reviewForward,
    exitReview,
  };
}
