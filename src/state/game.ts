import type { PieceColor, BoardSquare, Move, CastlingRights } from '../logic';
import {
  PieceColor as PieceColorConst,
  createInitialBoard,
  toSquareIndex,
  fromSquareIndex,
  generatePseudoLegalMoves,
  filterLegalMoves,
  isInCheck,
  isSquareAttacked,
  getGameResult,
  createPiece,
  FEN_SYMBOLS,
} from '../logic';

export interface GameState {
  board: BoardSquare[];
  sideToMove: PieceColor;
  history: GameMove[];
  castlingRights: CastlingRights;
  enPassantTarget: string | null;
  halfmoveClock: number;
  fullmoveNumber: number;
  result: 'checkmate' | 'stalemate' | 'draw' | null;
}

export interface GameMove {
  from: string;
  to: string;
  piece: string;
  captured: string | null;
  notation: string;
  beforeState: GameState;
}

export function createGame(): GameState {
  return {
    board: createInitialBoard(),
    sideToMove: PieceColorConst.White,
    history: [],
    castlingRights: { wk: true, wq: true, bk: true, bq: true },
    enPassantTarget: null,
    halfmoveClock: 0,
    fullmoveNumber: 1,
    result: null,
  };
}

function buildNotation(move: Move, board: BoardSquare[], nextSide: PieceColor): string {
  let notation = '';

  if (move.castling === 'kingside') {
    notation = 'O-O';
  } else if (move.castling === 'queenside') {
    notation = 'O-O-O';
  } else {
    if (move.piece.type !== 'pawn') {
      notation += move.piece.symbol.toUpperCase();
    }

    if (move.captured) {
      if (move.piece.type === 'pawn') {
        notation += move.fromAlgebraic[0];
      }
      notation += 'x';
    }

    notation += move.toAlgebraic;

    if (move.isPromotion && move.promotionPiece) {
      notation += '=' + FEN_SYMBOLS['white'][move.promotionPiece];
    }
  }

  const result = getGameResult(board, nextSide);
  if (result === 'checkmate') {
    notation += '#';
  } else if (isInCheck(board, nextSide)) {
    notation += '+';
  }

  return notation;
}

function updateCastlingRights(current: CastlingRights, move: Move): CastlingRights {
  const next = { ...current };

  if (move.piece.type === 'king') {
    if (move.piece.color === 'white') {
      next.wk = false;
      next.wq = false;
    } else {
      next.bk = false;
      next.bq = false;
    }
  }

  if (move.piece.type === 'rook') {
    if (move.piece.color === 'white') {
      if (move.fromAlgebraic === 'a1') next.wq = false;
      if (move.fromAlgebraic === 'h1') next.wk = false;
    } else {
      if (move.fromAlgebraic === 'a8') next.bq = false;
      if (move.fromAlgebraic === 'h8') next.bk = false;
    }
  }

  if (move.captured?.type === 'rook') {
    if (move.captured.color === 'white') {
      if (move.toAlgebraic === 'a1') next.wq = false;
      if (move.toAlgebraic === 'h1') next.wk = false;
    } else {
      if (move.toAlgebraic === 'a8') next.bq = false;
      if (move.toAlgebraic === 'h8') next.bk = false;
    }
  }

  return next;
}

export function makeMove(game: GameState, move: Move): GameState {
  const nextBoard = game.board.map((sq) => ({ ...sq }));

  // Move piece
  nextBoard[move.from] = { ...nextBoard[move.from], piece: null };
  nextBoard[move.to] = { ...nextBoard[move.to], piece: move.piece };

  // Handle promotion
  if (move.isPromotion && move.promotionPiece) {
    nextBoard[move.to] = {
      ...nextBoard[move.to],
      piece: createPiece(move.promotionPiece, move.piece.color),
    };
  }

  // Handle en passant capture
  if (move.isEnPassant) {
    const capturedIndex = move.to + (move.piece.color === 'white' ? -8 : 8);
    nextBoard[capturedIndex] = { ...nextBoard[capturedIndex], piece: null };
  }

  // Handle castling: move the rook
  if (move.castling) {
    const rank = move.piece.color === 'white' ? '1' : '8';
    if (move.castling === 'kingside') {
      const fromRook = toSquareIndex(`h${rank}` as `${string}${string}`);
      const toRook = toSquareIndex(`f${rank}` as `${string}${string}`);
      nextBoard[toRook] = { ...nextBoard[toRook], piece: nextBoard[fromRook].piece };
      nextBoard[fromRook] = { ...nextBoard[fromRook], piece: null };
    } else {
      const fromRook = toSquareIndex(`a${rank}` as `${string}${string}`);
      const toRook = toSquareIndex(`d${rank}` as `${string}${string}`);
      nextBoard[toRook] = { ...nextBoard[toRook], piece: nextBoard[fromRook].piece };
      nextBoard[fromRook] = { ...nextBoard[fromRook], piece: null };
    }
  }

  // Update castling rights
  const nextCastlingRights = updateCastlingRights(game.castlingRights, move);

  // Update en passant target
  let nextEnPassantTarget: string | null = null;
  if (move.piece.type === 'pawn' && Math.abs(move.to - move.from) === 16) {
    nextEnPassantTarget = fromSquareIndex((move.from + move.to) / 2);
  }

  // Update halfmove clock
  let nextHalfmoveClock = game.halfmoveClock + 1;
  if (move.piece.type === 'pawn' || move.captured) {
    nextHalfmoveClock = 0;
  }

  // Update fullmove number
  let nextFullmoveNumber = game.fullmoveNumber;
  if (game.sideToMove === 'black') {
    nextFullmoveNumber += 1;
  }

  // Switch side
  const nextSide = game.sideToMove === 'white' ? 'black' : 'white';

  // Detect result
  const result = getGameResult(nextBoard, nextSide);

  const gameMove: GameMove = {
    from: move.fromAlgebraic,
    to: move.toAlgebraic,
    piece: move.piece.symbol,
    captured: move.captured?.symbol ?? null,
    notation: buildNotation(move, nextBoard, nextSide),
    beforeState: game,
  };

  return {
    board: nextBoard,
    sideToMove: nextSide,
    history: [...game.history, gameMove],
    castlingRights: nextCastlingRights,
    enPassantTarget: nextEnPassantTarget,
    halfmoveClock: nextHalfmoveClock,
    fullmoveNumber: nextFullmoveNumber,
    result,
  };
}

export function undoMove(game: GameState): GameState {
  if (game.history.length === 0) {
    return game;
  }
  const lastMove = game.history[game.history.length - 1];
  return lastMove.beforeState;
}

function generateEnPassantMoves(board: BoardSquare[], color: PieceColor, enPassantTarget: string | null): Move[] {
  if (!enPassantTarget) return [];

  const targetIndex = toSquareIndex(enPassantTarget as `${string}${string}`);
  const targetRank = Math.floor(targetIndex / 8);
  const targetFile = targetIndex % 8;

  const pawnRank = color === 'white' ? targetRank - 1 : targetRank + 1;
  if (pawnRank < 0 || pawnRank > 7) return [];

  const moves: Move[] = [];
  for (const fileDelta of [-1, 1]) {
    const pawnFile = targetFile + fileDelta;
    if (pawnFile < 0 || pawnFile > 7) continue;

    const pawnIndex = pawnRank * 8 + pawnFile;
    const pawn = board[pawnIndex].piece;
    if (pawn && pawn.type === 'pawn' && pawn.color === color) {
      const capturedIndex = targetIndex + (color === 'white' ? -8 : 8);
      const captured = board[capturedIndex].piece;
      moves.push({
        from: pawnIndex,
        fromAlgebraic: fromSquareIndex(pawnIndex),
        to: targetIndex,
        toAlgebraic: enPassantTarget,
        piece: pawn,
        captured: captured,
        isEnPassant: true,
        isPromotion: false,
        promotionPiece: null,
        castling: null,
        enPassantTarget: null,
      });
    }
  }

  return moves;
}

function filterMovesByCastlingRights(moves: Move[], rights: CastlingRights, color: PieceColor): Move[] {
  return moves.filter((move) => {
    if (!move.castling) return true;
    if (color === 'white') {
      if (move.castling === 'kingside') return rights.wk;
      return rights.wq;
    }
    if (move.castling === 'kingside') return rights.bk;
    return rights.bq;
  });
}

function opponentOf(color: PieceColor): PieceColor {
  return color === 'white' ? 'black' : 'white';
}

function isCastlingPathSafe(board: BoardSquare[], move: Move, color: PieceColor): boolean {
  if (!move.castling) return true;
  if (isInCheck(board, color)) return false;

  const rank = color === 'white' ? '1' : '8';
  const path = move.castling === 'kingside'
    ? [`f${rank}`, `g${rank}`]
    : [`d${rank}`, `c${rank}`];

  return path.every((square) => !isSquareAttacked(board, opponentOf(color), toSquareIndex(square as `${string}${string}`)));
}

export function getLegalMoves(game: GameState): Move[] {
  const pseudoLegal = generatePseudoLegalMoves(game.board, game.sideToMove);
  const legal = filterLegalMoves(game.board, pseudoLegal, game.sideToMove);
  const withCastlingFiltered = filterMovesByCastlingRights(legal, game.castlingRights, game.sideToMove);
  const withSafeCastling = withCastlingFiltered.filter((move) => isCastlingPathSafe(game.board, move, game.sideToMove));
  const enPassantMoves = generateEnPassantMoves(game.board, game.sideToMove, game.enPassantTarget);
  const enPassantLegal = filterLegalMoves(game.board, enPassantMoves, game.sideToMove);
  return [...withSafeCastling, ...enPassantLegal];
}

export function isGameOver(game: GameState): boolean {
  return game.result !== null;
}
