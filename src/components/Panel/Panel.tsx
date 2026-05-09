import React from 'react';
import type { GameMove } from '../../state/game';

interface PanelProps {
  sideToMove: 'white' | 'black';
  history: GameMove[];
  result: 'checkmate' | 'stalemate' | 'draw' | null;
  isInCheck: boolean;
  onNewGame: () => void;
  onUndo: () => void;
  aiEnabled: boolean;
  aiLevel: number;
  isAIThinking: boolean;
  onToggleAI: () => void;
  onSetAILevel: (level: number) => void;
  onOpenSettings: () => void;
  onExportPGN: () => void;
  reviewOffset: number;
  isReviewingHistory: boolean;
  canReviewBackward: boolean;
  canReviewForward: boolean;
  onReviewBackward: () => void;
  onReviewForward: () => void;
  onExitReview: () => void;
}

function Panel({
  sideToMove,
  history,
  result,
  isInCheck,
  onNewGame,
  onUndo,
  aiEnabled,
  aiLevel,
  isAIThinking,
  onToggleAI,
  onSetAILevel,
  onOpenSettings,
  onExportPGN,
  reviewOffset,
  isReviewingHistory,
  canReviewBackward,
  canReviewForward,
  onReviewBackward,
  onReviewForward,
  onExitReview,
}: PanelProps) {
  const turnText = `${sideToMove === 'white' ? 'White' : 'Black'} to move`;

  return (
    <aside className="panel">
      <div className={`panel__turn panel__turn--${sideToMove}`}>
        {turnText}
      </div>

      {result && (
        <div className="panel__result">
          {result === 'checkmate' && 'Checkmate'}
          {result === 'stalemate' && 'Stalemate'}
          {result === 'draw' && 'Draw'}
        </div>
      )}

      {!result && isInCheck && (
        <div className="panel__check">Check</div>
      )}

      <div className="panel__history">
        {history.length === 0 ? (
          <div className="panel__empty">No moves yet</div>
        ) : (
          <div className="panel__moves">
            {Array.from({ length: Math.ceil(history.length / 2) }, (_, i) => {
              const whiteMove = history[i * 2];
              const blackMove = history[i * 2 + 1];
              return (
                <div key={i} className="panel__move-row">
                  <span>{i + 1}.</span>
                  {whiteMove && <span>{whiteMove.notation}</span>}
                  {blackMove && <span>{blackMove.notation}</span>}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="panel__section panel__review">
        <h3 className="panel__title">Review</h3>
        <div className="panel__review-controls" aria-label="Move review controls">
          <button type="button" onClick={onReviewBackward} disabled={!canReviewBackward}>Back</button>
          <button type="button" onClick={onReviewForward} disabled={!canReviewForward}>Forward</button>
          <button type="button" onClick={onExitReview} disabled={!isReviewingHistory}>Current</button>
        </div>
        {isReviewingHistory && (
          <div className="panel__review-status" aria-live="polite">
            Viewing {reviewOffset} move{reviewOffset === 1 ? '' : 's'} ago
          </div>
        )}
      </div>

      <div className="panel__section">
        <h3 className="panel__title">AI Opponent</h3>
        <label className="panel__ai-toggle">
          <input
            type="checkbox"
            checked={aiEnabled}
            onChange={onToggleAI}
            aria-label="Enable AI opponent"
          />
          <span>Play vs AI</span>
        </label>
        {aiEnabled && (
          <div className="panel__ai-level">
            <label htmlFor="ai-level">Level:</label>
            <select
              id="ai-level"
              value={aiLevel}
              onChange={(e) => onSetAILevel(Number(e.target.value))}
              aria-label="AI difficulty level"
            >
              <option value={1}>Beginner</option>
              <option value={2}>Easy</option>
              <option value={3}>Medium</option>
              <option value={4}>Hard</option>
              <option value={5}>Expert</option>
            </select>
          </div>
        )}
        {isAIThinking && (
          <div className="panel__ai-thinking" aria-live="polite">
            AI is thinking...
          </div>
        )}
      </div>

      <div className="panel__actions">
        <button type="button" onClick={onNewGame}>New Game</button>
        <button type="button" onClick={onUndo}>Undo</button>
        <button type="button" onClick={onExportPGN}>Export PGN</button>
        <button type="button" onClick={onOpenSettings} aria-label="Settings">Settings</button>
      </div>
    </aside>
  );
}

export default React.memo(Panel);
