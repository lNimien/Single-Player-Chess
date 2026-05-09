import React from 'react';
import type { PieceColor } from '../../logic';
import './GameOverOverlay.css';

export interface GameOverOverlayProps {
  result: 'checkmate' | 'stalemate' | 'draw' | null;
  winner: PieceColor | null;
  onNewGame: () => void;
}

const GameOverOverlay = React.memo(function GameOverOverlay({
  result,
  winner,
  onNewGame,
}: GameOverOverlayProps) {
  if (!result) return null;

  const isCheckmate = result === 'checkmate';
  const title = isCheckmate ? 'Checkmate!' : 'Stalemate!';
  const subtitle = isCheckmate
    ? `${winner === 'white' ? 'White' : 'Black'} wins`
    : 'Draw — no legal moves';

  return (
    <div className="game-over-overlay" role="dialog" aria-modal="true" aria-live="polite">
      <div className="game-over-overlay__content">
        <h2 className="game-over-overlay__title">{title}</h2>
        <p className="game-over-overlay__subtitle">{subtitle}</p>
        <button className="game-over-overlay__button" onClick={onNewGame}>
          New Game
        </button>
      </div>
    </div>
  );
});

export default GameOverOverlay;
