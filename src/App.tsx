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
    displayedGame,
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
    reviewOffset,
    isReviewingHistory,
    canReviewBackward,
    canReviewForward,
    reviewBackward,
    reviewForward,
    exitReview,
  } = useChess();

  const lastMove = useMemo(() => {
    if (history.length === 0) return null;
    const last = history[history.length - 1];
    return { from: last.from, to: last.to };
  }, [history]);

  const lastCapture = useMemo(() => {
    if (history.length === 0 || isReviewingHistory) return null;
    const last = history[history.length - 1];
    return last.captured ? last.to : null;
  }, [history, isReviewingHistory]);

  const inCheck = useMemo(() => isInCheck(displayedGame.board, displayedGame.sideToMove), [displayedGame.board, displayedGame.sideToMove]);

  const checkSquare = useMemo(() => {
    if (!inCheck) return null;
    return fromSquareIndex(findKing(displayedGame.board, displayedGame.sideToMove));
  }, [inCheck, displayedGame.board, displayedGame.sideToMove]);

  return (
    <div className="app">
      <header className="app__header">
        <h1 className="app__title">Chess</h1>
      </header>
      <main className="app__main">
        <div style={{ position: 'relative' }}>
          <Board
            squares={displayedGame.board}
            sideToMove={displayedGame.sideToMove}
            selectedSquare={isReviewingHistory ? null : selectedSquare}
            legalMoves={isReviewingHistory ? [] : legalMoves}
            lastMove={lastMove}
            lastCapture={lastCapture}
            checkSquare={checkSquare}
            onSquareClick={selectSquare}
            isFlipped={playerColor === 'black'}
          />
          <GameOverOverlay
            result={displayedGame.result}
            winner={displayedGame.result === 'checkmate' ? (displayedGame.sideToMove === 'white' ? 'black' : 'white') : null}
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
          reviewOffset={reviewOffset}
          isReviewingHistory={isReviewingHistory}
          canReviewBackward={canReviewBackward}
          canReviewForward={canReviewForward}
          onReviewBackward={reviewBackward}
          onReviewForward={reviewForward}
          onExitReview={exitReview}
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
