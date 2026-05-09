import React, { useMemo, useState } from 'react';
import { useChess } from './hooks/useChess';
import Board from './components/Board/Board';
import Panel from './components/Panel/Panel';
import PromotionModal from './components/PromotionModal/PromotionModal';
import GameOverOverlay from './components/GameOverOverlay/GameOverOverlay';
import SettingsModal from './components/SettingsModal/SettingsModal';
import { downloadPGN } from './state/pgn';
import { isInCheck, findKing, fromSquareIndex } from './logic';
import './App.css';

function App() {
  const [settingsOpen, setSettingsOpen] = useState(false);

  const {
    game,
    selectedSquare,
    legalMoves,
    currentTurn,
    isGameOver,
    history,
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
  } = useChess();

  const lastMove = useMemo(() => {
    if (history.length === 0) return null;
    const last = history[history.length - 1];
    return { from: last.from, to: last.to };
  }, [history]);

  const inCheck = useMemo(() => isInCheck(game.board, game.sideToMove), [game.board, game.sideToMove]);

  const checkSquare = useMemo(() => {
    if (!inCheck) return null;
    return fromSquareIndex(findKing(game.board, game.sideToMove));
  }, [inCheck, game.board, game.sideToMove]);

  return (
    <div className="app">
      <header className="app__header">
        <h1 className="app__title">Chess</h1>
      </header>
      <main className="app__main">
        <div style={{ position: 'relative' }}>
          <Board
            squares={game.board}
            sideToMove={currentTurn}
            selectedSquare={selectedSquare}
            legalMoves={legalMoves}
            lastMove={lastMove}
            checkSquare={checkSquare}
            onSquareClick={selectSquare}
            isFlipped={playerColor === 'black'}
          />
          <GameOverOverlay
            result={game.result}
            winner={game.result === 'checkmate' ? (game.sideToMove === 'white' ? 'black' : 'white') : null}
            onNewGame={reset}
          />
        </div>
        <Panel
          sideToMove={currentTurn}
          history={history}
          result={game.result}
          isInCheck={inCheck}
          onNewGame={reset}
          onUndo={undo}
          aiEnabled={aiEnabled}
          aiLevel={aiLevel}
          isAIThinking={isAIThinking}
          onToggleAI={toggleAI}
          onSetAILevel={setAILevel}
          onOpenSettings={() => setSettingsOpen(true)}
          onExportPGN={() => downloadPGN(game)}
        />
      </main>
      <PromotionModal
        isOpen={promotionPending !== null}
        color={currentTurn}
        onSelect={selectPromotionPiece}
        onCancel={cancelPromotion}
      />
      <SettingsModal
        isOpen={settingsOpen}
        playerColor={playerColor}
        animationsEnabled={animationsEnabled}
        soundsEnabled={soundsEnabled}
        onClose={() => setSettingsOpen(false)}
        onToggleColor={togglePlayerColor}
        onToggleAnimations={toggleAnimations}
        onToggleSounds={toggleSounds}
      />
    </div>
  );
}

export default React.memo(App);
