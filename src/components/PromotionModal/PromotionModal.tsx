import React from 'react';
import type { PieceColor, PieceType } from '../../logic';
import { createPiece } from '../../logic';
import Piece from '../Piece/Piece';
import './PromotionModal.css';

export interface PromotionModalProps {
  isOpen: boolean;
  color: PieceColor;
  onSelect: (pieceType: PieceType) => void;
  onCancel: () => void;
}

const PROMOTION_PIECES: PieceType[] = ['queen', 'rook', 'bishop', 'knight'];

const PromotionModal = React.memo(function PromotionModal({
  isOpen,
  color,
  onSelect,
  onCancel,
}: PromotionModalProps) {
  if (!isOpen) return null;

  return (
    <div className="promotion-modal__overlay" onClick={onCancel}>
      <div
        className="promotion-modal"
        role="dialog"
        aria-modal="true"
        aria-label="Choose promotion piece"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="promotion-modal__title">Promote Pawn</h2>
        <div className="promotion-modal__options">
          {PROMOTION_PIECES.map((type) => (
            <button
              key={type}
              className="promotion-modal__option"
              onClick={() => onSelect(type)}
              aria-label={`Promote to ${type}`}
            >
              <Piece piece={createPiece(type, color)} />
            </button>
          ))}
        </div>
        <button className="promotion-modal__cancel" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </div>
  );
});

export default PromotionModal;
