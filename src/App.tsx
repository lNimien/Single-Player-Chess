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

const GITHUB_REPOSITORY_URL = 'https://github.com/lNimien/Single-Player-Chess';

function GitHubIcon() {
  return (
    <svg className="app__github-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path
        fill="currentColor"
        d="M12 2C6.48 2 2 6.59 2 12.25c0 4.53 2.87 8.37 6.84 9.73.5.1.68-.22.68-.49 0-.24-.01-1.04-.01-1.89-2.78.62-3.37-1.21-3.37-1.21-.45-1.19-1.11-1.5-1.11-1.5-.91-.64.07-.63.07-.63 1 .07 1.53 1.06 1.53 1.06.9 1.57 2.36 1.12 2.93.86.09-.66.35-1.12.63-1.37-2.22-.26-4.56-1.14-4.56-5.06 0-1.12.39-2.03 1.03-2.75-.1-.26-.45-1.3.1-2.71 0 0 .84-.28 2.75 1.05A9.34 9.34 0 0 1 12 7.01c.85 0 1.7.12 2.5.34 1.9-1.33 2.74-1.05 2.74-1.05.55 1.41.2 2.45.1 2.71.64.72 1.03 1.63 1.03 2.75 0 3.93-2.34 4.8-4.57 5.05.36.32.68.94.68 1.9 0 1.37-.01 2.47-.01 2.8 0 .27.18.59.69.49A10.08 10.08 0 0 0 22 12.25C22 6.59 17.52 2 12 2Z"
      />
    </svg>
  );
}

function App() {
  const [settingsOpen, setSettingsOpen] = useState(false);

  const {
    game,
    displayedGame,
    selectedSquare,
    legalMoves,
    currentTurn,
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
        <div className="app__header-bar">
          <h1 className="app__title">Chess</h1>
          <a
            className="app__github-link"
            href={GITHUB_REPOSITORY_URL}
            target="_blank"
            rel="noreferrer"
            aria-label="View source on GitHub"
          >
            <GitHubIcon />
            <span className="app__github-label">GitHub</span>
          </a>
        </div>
      </header>
      <main className="app__main">
        <div className="app__board-stage">
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
