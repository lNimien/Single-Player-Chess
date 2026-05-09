import React from 'react';
import type { GameMove } from '../../state/game';

interface PanelProps {
  sideToMove: 'white' | 'black';
  history: GameMove[];
  result: 'checkmate' | 'stalemate' | 'draw' | null;
  isInCheck: boolean;
  onNewGame: () => void;
  onUndo: () => void;
}

function Panel({ sideToMove, history, result, isInCheck, onNewGame, onUndo }: PanelProps) {
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

      <div className="panel__actions">
        <button type="button" onClick={onNewGame}>New Game</button>
        <button type="button" onClick={onUndo}>Undo</button>
      </div>
    </aside>
  );
}

export default React.memo(Panel);
