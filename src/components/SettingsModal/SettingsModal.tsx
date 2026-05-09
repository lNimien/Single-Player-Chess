import React from 'react';
import './SettingsModal.css';

export interface SettingsModalProps {
  isOpen: boolean;
  playerColor: 'white' | 'black';
  animationsEnabled: boolean;
  soundsEnabled: boolean;
  onClose: () => void;
  onToggleColor: () => void;
  onToggleAnimations: () => void;
  onToggleSounds: () => void;
}

const SettingsModal = React.memo(function SettingsModal({
  isOpen,
  playerColor,
  animationsEnabled,
  soundsEnabled,
  onClose,
  onToggleColor,
  onToggleAnimations,
  onToggleSounds,
}: SettingsModalProps) {
  if (!isOpen) return null;

  return (
    <div className="settings-modal__overlay" onClick={onClose}>
      <div
        className="settings-modal"
        role="dialog"
        aria-modal="true"
        aria-label="Game settings"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="settings-modal__title">Settings</h2>

        <div className="settings-modal__section">
          <span className="settings-modal__label">Play as</span>
          <div className="settings-modal__toggle-group">
            <button
              type="button"
              className={`settings-modal__option ${playerColor === 'white' ? 'settings-modal__option--active' : ''}`}
              onClick={playerColor === 'black' ? onToggleColor : undefined}
              aria-label="Toggle player color"
            >
              White
            </button>
            <button
              type="button"
              className={`settings-modal__option ${playerColor === 'black' ? 'settings-modal__option--active' : ''}`}
              onClick={playerColor === 'white' ? onToggleColor : undefined}
              aria-label="Toggle player color"
            >
              Black
            </button>
          </div>
        </div>

        <div className="settings-modal__section">
          <span className="settings-modal__label">Animations</span>
          <button
            type="button"
            className={`settings-modal__toggle ${animationsEnabled ? 'settings-modal__toggle--on' : 'settings-modal__toggle--off'}`}
            onClick={onToggleAnimations}
            aria-pressed={animationsEnabled}
            aria-label="Toggle animations"
          >
            {animationsEnabled ? 'On' : 'Off'}
          </button>
        </div>

        <div className="settings-modal__section">
          <span className="settings-modal__label">Sounds</span>
          <button
            type="button"
            className={`settings-modal__toggle ${soundsEnabled ? 'settings-modal__toggle--on' : 'settings-modal__toggle--off'}`}
            onClick={onToggleSounds}
            aria-pressed={soundsEnabled}
            aria-label="Toggle sounds"
          >
            {soundsEnabled ? 'On' : 'Off'}
          </button>
        </div>

        <button
          type="button"
          className="settings-modal__close"
          onClick={onClose}
          aria-label="Close settings"
        >
          Close
        </button>
      </div>
    </div>
  );
});

export default SettingsModal;
