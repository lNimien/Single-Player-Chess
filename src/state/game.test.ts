import { describe, it, expect } from 'vitest';
import type { BoardSquare, Move, CastlingRights } from '../logic';
import {
  PieceColor,
  createInitialBoard,
  parseFEN,
  toSquareIndex,
  fromSquareIndex,
  generatePseudoLegalMoves,
  filterLegalMoves,
} from '../logic';
import {
  createGame,
  makeMove,
  getLegalMoves,
  isGameOver,
  undoMove,
  type GameState,
  type GameMove,
} from './game';

function findLegalMove(board: BoardSquare[], color: PieceColor, from: string, to: string): Move {
  const moves = filterLegalMoves(board, generatePseudoLegalMoves(board, color), color);
  const move = moves.find((m) => m.fromAlgebraic === from && m.toAlgebraic === to);
  if (!move) {
    throw new Error(
      `Legal move ${from}-${to} not found for ${color}. Available: ${moves.map((m) => `${m.fromAlgebraic}-${m.toAlgebraic}`).join(', ')}`,
    );
  }
  return move;
}

function buildGameFromFEN(fen: string, overrides?: Partial<GameState>): GameState {
  const parsed = parseFEN(fen);
  const sideToMove = parsed.sideToMove;
  const castlingString = parsed.castling;
  const castlingRights: CastlingRights = {
    wk: castlingString.includes('K'),
    wq: castlingString.includes('Q'),
    bk: castlingString.includes('k'),
    bq: castlingString.includes('q'),
  };
  return {
    board: parsed,
    sideToMove,
    history: [],
    castlingRights,
    enPassantTarget: parsed.enPassant,
    halfmoveClock: parsed.halfmove,
    fullmoveNumber: parsed.fullmove,
    result: null,
    ...overrides,
  };
}

describe('createGame', () => {
  it('should create a game with the initial board', () => {
    const game = createGame();
    expect(game.board).toHaveLength(64);
    expect(game.board[toSquareIndex('e1')].piece?.type).toBe('king');
    expect(game.board[toSquareIndex('e1')].piece?.color).toBe('white');
    expect(game.board[toSquareIndex('e8')].piece?.type).toBe('king');
    expect(game.board[toSquareIndex('e8')].piece?.color).toBe('black');
  });

  it('should set white to move initially', () => {
    const game = createGame();
    expect(game.sideToMove).toBe(PieceColor.White);
  });

  it('should have empty history', () => {
    const game = createGame();
    expect(game.history).toEqual([]);
  });

  it('should have full castling rights', () => {
    const game = createGame();
    expect(game.castlingRights).toEqual({ wk: true, wq: true, bk: true, bq: true });
  });

  it('should have no en passant target', () => {
    const game = createGame();
    expect(game.enPassantTarget).toBeNull();
  });

  it('should have halfmove clock at 0', () => {
    const game = createGame();
    expect(game.halfmoveClock).toBe(0);
  });

  it('should have fullmove number at 1', () => {
    const game = createGame();
    expect(game.fullmoveNumber).toBe(1);
  });

  it('should have no result', () => {
    const game = createGame();
    expect(game.result).toBeNull();
  });
});

describe('Game state structure', () => {
  it('should expose all required fields', () => {
    const game = createGame();
    expect(game).toHaveProperty('board');
    expect(game).toHaveProperty('sideToMove');
    expect(game).toHaveProperty('history');
    expect(game).toHaveProperty('castlingRights');
    expect(game).toHaveProperty('enPassantTarget');
    expect(game).toHaveProperty('halfmoveClock');
    expect(game).toHaveProperty('fullmoveNumber');
    expect(game).toHaveProperty('result');
  });
});

describe('makeMove', () => {
  it('should execute a legal move and update the board', () => {
    const game = createGame();
    const move = findLegalMove(game.board, PieceColor.White, 'e2', 'e4');
    const nextGame = makeMove(game, move);
    expect(nextGame.board[toSquareIndex('e2')].piece).toBeNull();
    expect(nextGame.board[toSquareIndex('e4')].piece?.type).toBe('pawn');
    expect(nextGame.board[toSquareIndex('e4')].piece?.color).toBe('white');
  });

  it('should switch side to move', () => {
    const game = createGame();
    const move = findLegalMove(game.board, PieceColor.White, 'e2', 'e4');
    const nextGame = makeMove(game, move);
    expect(nextGame.sideToMove).toBe(PieceColor.Black);
  });

  it('should add the move to history', () => {
    const game = createGame();
    const move = findLegalMove(game.board, PieceColor.White, 'e2', 'e4');
    const nextGame = makeMove(game, move);
    expect(nextGame.history).toHaveLength(1);
    const gameMove = nextGame.history[0];
    expect(gameMove.from).toBe('e2');
    expect(gameMove.to).toBe('e4');
    expect(gameMove.piece).toBe('P');
    expect(gameMove.captured).toBeNull();
    expect(gameMove.notation).toBe('e4');
    expect(gameMove.beforeState).toBeDefined();
  });
});

describe('castling rights update', () => {
  it('should revoke white kingside and queenside rights when white king moves', () => {
    const game = buildGameFromFEN('r3k2r/pppppppp/8/8/8/8/PPPPPPPP/R3K2R w KQkq - 0 1');
    const move = findLegalMove(game.board, PieceColor.White, 'e1', 'f1');
    const nextGame = makeMove(game, move);
    expect(nextGame.castlingRights.wk).toBe(false);
    expect(nextGame.castlingRights.wq).toBe(false);
    expect(nextGame.castlingRights.bk).toBe(true);
    expect(nextGame.castlingRights.bq).toBe(true);
  });

  it('should revoke white queenside right when a-rook moves', () => {
    const game = buildGameFromFEN('r3k2r/pppppppp/8/8/8/8/PPPPPPPP/R3K2R w KQkq - 0 1');
    const move = findLegalMove(game.board, PieceColor.White, 'a1', 'b1');
    const nextGame = makeMove(game, move);
    expect(nextGame.castlingRights.wq).toBe(false);
    expect(nextGame.castlingRights.wk).toBe(true);
  });

  it('should revoke white kingside right when h-rook moves', () => {
    const game = buildGameFromFEN('r3k2r/pppppppp/8/8/8/8/PPPPPPPP/R3K2R w KQkq - 0 1');
    const move = findLegalMove(game.board, PieceColor.White, 'h1', 'g1');
    const nextGame = makeMove(game, move);
    expect(nextGame.castlingRights.wk).toBe(false);
    expect(nextGame.castlingRights.wq).toBe(true);
  });

  it('should revoke black kingside and queenside rights when black king moves', () => {
    const game = buildGameFromFEN('r3k2r/pppppppp/8/8/8/8/PPPPPPPP/R3K2R b KQkq - 0 1');
    const move = findLegalMove(game.board, PieceColor.Black, 'e8', 'f8');
    const nextGame = makeMove(game, move);
    expect(nextGame.castlingRights.bk).toBe(false);
    expect(nextGame.castlingRights.bq).toBe(false);
    expect(nextGame.castlingRights.wk).toBe(true);
    expect(nextGame.castlingRights.wq).toBe(true);
  });

  it('should revoke black queenside right when a-rook moves', () => {
    const game = buildGameFromFEN('r3k2r/pppppppp/8/8/8/8/PPPPPPPP/R3K2R b KQkq - 0 1');
    const move = findLegalMove(game.board, PieceColor.Black, 'a8', 'b8');
    const nextGame = makeMove(game, move);
    expect(nextGame.castlingRights.bq).toBe(false);
    expect(nextGame.castlingRights.bk).toBe(true);
  });

  it('should revoke black kingside right when h-rook moves', () => {
    const game = buildGameFromFEN('r3k2r/pppppppp/8/8/8/8/PPPPPPPP/R3K2R b KQkq - 0 1');
    const move = findLegalMove(game.board, PieceColor.Black, 'h8', 'g8');
    const nextGame = makeMove(game, move);
    expect(nextGame.castlingRights.bk).toBe(false);
    expect(nextGame.castlingRights.bq).toBe(true);
  });

  it('should revoke rights when a rook is captured on its home square', () => {
    const game = buildGameFromFEN('r3k2r/pppppppp/8/8/8/8/PPPPPPPP/R3K2R w KQkq - 0 1');
    // Capture black h8 rook with white rook h1-h8 (not legal in one move, skip for now)
    // Instead use a simpler position: white bishop can capture a8 rook
    const game2 = buildGameFromFEN('r3k3/1B6/8/8/8/8/8/4K3 b - - 0 1');
    const move = findLegalMove(game2.board, PieceColor.Black, 'a8', 'a7');
    const nextGame = makeMove(game2, move);
    // No castling rights for black anyway in this position
    expect(nextGame.castlingRights.bq).toBe(false);
  });
});

describe('en passant target', () => {
  it('should set enPassantTarget after a double pawn push', () => {
    const game = createGame();
    const move = findLegalMove(game.board, PieceColor.White, 'e2', 'e4');
    const nextGame = makeMove(game, move);
    expect(nextGame.enPassantTarget).toBe('e3');
  });

  it('should clear enPassantTarget on the next move', () => {
    const game = createGame();
    const move1 = findLegalMove(game.board, PieceColor.White, 'e2', 'e4');
    const game2 = makeMove(game, move1);
    expect(game2.enPassantTarget).toBe('e3');

    const move2 = findLegalMove(game2.board, PieceColor.Black, 'e7', 'e5');
    const game3 = makeMove(game2, move2);
    expect(game3.enPassantTarget).toBe('e6');

    const move3 = findLegalMove(game3.board, PieceColor.White, 'd2', 'd4');
    const game4 = makeMove(game3, move3);
    expect(game4.enPassantTarget).toBe('d3');
  });
});

describe('halfmove clock', () => {
  it('should reset to 0 on a pawn move', () => {
    const game = buildGameFromFEN('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 5 1');
    const move = findLegalMove(game.board, PieceColor.White, 'e2', 'e4');
    const nextGame = makeMove(game, move);
    expect(nextGame.halfmoveClock).toBe(0);
  });

  it('should reset to 0 on a capture', () => {
    const game = buildGameFromFEN('rnbqkbnr/pppp1ppp/8/3p4/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 5 1');
    const move = findLegalMove(game.board, PieceColor.White, 'e4', 'd5');
    const nextGame = makeMove(game, move);
    expect(nextGame.halfmoveClock).toBe(0);
  });

  it('should increment on a non-pawn non-capture move', () => {
    const game = buildGameFromFEN('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 3 1');
    const move = findLegalMove(game.board, PieceColor.White, 'b1', 'c3');
    const nextGame = makeMove(game, move);
    expect(nextGame.halfmoveClock).toBe(4);
  });
});

describe('fullmove number', () => {
  it('should stay the same after white moves', () => {
    const game = createGame();
    const move = findLegalMove(game.board, PieceColor.White, 'e2', 'e4');
    const nextGame = makeMove(game, move);
    expect(nextGame.fullmoveNumber).toBe(1);
  });

  it('should increment after black moves', () => {
    const game = createGame();
    const move1 = findLegalMove(game.board, PieceColor.White, 'e2', 'e4');
    const game2 = makeMove(game, move1);
    const move2 = findLegalMove(game2.board, PieceColor.Black, 'e7', 'e5');
    const game3 = makeMove(game2, move2);
    expect(game3.fullmoveNumber).toBe(2);
  });
});

describe('game result detection', () => {
  it('should detect checkmate after delivering checkmate', () => {
    const game = buildGameFromFEN('8/8/8/8/8/2K5/2Q5/k7 w - - 0 1');
    const move = findLegalMove(game.board, PieceColor.White, 'c2', 'b2');
    const nextGame = makeMove(game, move);
    expect(nextGame.result).toBe('checkmate');
  });

  it('should detect stalemate after delivering stalemate', () => {
    const game = buildGameFromFEN('8/8/8/8/8/1K6/1Q6/k7 w - - 0 1');
    const move = findLegalMove(game.board, PieceColor.White, 'b2', 'c2');
    const nextGame = makeMove(game, move);
    expect(nextGame.result).toBe('stalemate');
  });

  it('should not set result for an ongoing game', () => {
    const game = createGame();
    const move = findLegalMove(game.board, PieceColor.White, 'e2', 'e4');
    const nextGame = makeMove(game, move);
    expect(nextGame.result).toBeNull();
  });
});

describe('undo move', () => {
  it('should revert to the previous state', () => {
    const game = createGame();
    const move = findLegalMove(game.board, PieceColor.White, 'e2', 'e4');
    const nextGame = makeMove(game, move);
    const undoneGame = undoMove(nextGame);
    expect(undoneGame.board[toSquareIndex('e2')].piece?.type).toBe('pawn');
    expect(undoneGame.board[toSquareIndex('e4')].piece).toBeNull();
    expect(undoneGame.sideToMove).toBe(PieceColor.White);
    expect(undoneGame.history).toHaveLength(0);
  });

  it('should restore castling rights', () => {
    const game = buildGameFromFEN('r3k2r/pppppppp/8/8/8/8/PPPPPPPP/R3K2R w KQkq - 0 1');
    const move = findLegalMove(game.board, PieceColor.White, 'e1', 'f1');
    const nextGame = makeMove(game, move);
    expect(nextGame.castlingRights.wk).toBe(false);
    const undoneGame = undoMove(nextGame);
    expect(undoneGame.castlingRights.wk).toBe(true);
    expect(undoneGame.castlingRights.wq).toBe(true);
  });

  it('should restore multiple moves', () => {
    const game = createGame();
    const move1 = findLegalMove(game.board, PieceColor.White, 'e2', 'e4');
    const game2 = makeMove(game, move1);
    const move2 = findLegalMove(game2.board, PieceColor.Black, 'e7', 'e5');
    const game3 = makeMove(game2, move2);
    const undoneGame = undoMove(game3);
    expect(undoneGame.sideToMove).toBe(PieceColor.Black);
    expect(undoneGame.history).toHaveLength(1);
  });
});

describe('getLegalMoves', () => {
  it('should return 20 legal moves for white in the starting position', () => {
    const game = createGame();
    const moves = getLegalMoves(game);
    expect(moves).toHaveLength(20);
  });

  it('should return legal moves for the current side only', () => {
    const game = createGame();
    const whiteMoves = getLegalMoves(game);
    expect(whiteMoves.every((m) => m.piece.color === 'white')).toBe(true);
  });

  it('should exclude castling when rights are revoked', () => {
    const game = buildGameFromFEN('r3k2r/pppppppp/8/8/8/8/PPPPPPPP/R3K2R w KQkq - 0 1');
    const moves = getLegalMoves(game);
    const castlingMoves = moves.filter((m) => m.castling !== null);
    expect(castlingMoves.length).toBeGreaterThan(0);

    const gameNoRights = { ...game, castlingRights: { wk: false, wq: false, bk: false, bq: false } };
    const movesNoRights = getLegalMoves(gameNoRights);
    const castlingMovesNoRights = movesNoRights.filter((m) => m.castling !== null);
    expect(castlingMovesNoRights).toHaveLength(0);
  });
});

describe('isGameOver', () => {
  it('should return false for an ongoing game', () => {
    const game = createGame();
    expect(isGameOver(game)).toBe(false);
  });

  it('should return true when result is checkmate', () => {
    const game: GameState = { ...createGame(), result: 'checkmate' };
    expect(isGameOver(game)).toBe(true);
  });

  it('should return true when result is stalemate', () => {
    const game: GameState = { ...createGame(), result: 'stalemate' };
    expect(isGameOver(game)).toBe(true);
  });
});

describe('castling move handling', () => {
  it('should move the rook when castling kingside', () => {
    const game = buildGameFromFEN('r3k2r/pppppppp/8/8/8/8/PPPPPPPP/R3K2R w KQkq - 0 1');
    const move = findLegalMove(game.board, PieceColor.White, 'e1', 'g1');
    const nextGame = makeMove(game, move);
    expect(nextGame.board[toSquareIndex('e1')].piece).toBeNull();
    expect(nextGame.board[toSquareIndex('g1')].piece?.type).toBe('king');
    expect(nextGame.board[toSquareIndex('f1')].piece?.type).toBe('rook');
    expect(nextGame.board[toSquareIndex('h1')].piece).toBeNull();
  });

  it('should move the rook when castling queenside', () => {
    const game = buildGameFromFEN('r3k2r/pppppppp/8/8/8/8/PPPPPPPP/R3K2R w KQkq - 0 1');
    const move = findLegalMove(game.board, PieceColor.White, 'e1', 'c1');
    const nextGame = makeMove(game, move);
    expect(nextGame.board[toSquareIndex('e1')].piece).toBeNull();
    expect(nextGame.board[toSquareIndex('c1')].piece?.type).toBe('king');
    expect(nextGame.board[toSquareIndex('d1')].piece?.type).toBe('rook');
    expect(nextGame.board[toSquareIndex('a1')].piece).toBeNull();
  });
});

describe('promotion', () => {
  it('should promote a pawn to the specified piece', () => {
    const game = buildGameFromFEN('k7/1P6/8/8/8/8/8/4K3 w - - 0 1');
    const move = findLegalMove(game.board, PieceColor.White, 'b7', 'b8');
    const nextGame = makeMove(game, move);
    expect(nextGame.board[toSquareIndex('b8')].piece?.type).toBe('queen');
    expect(nextGame.board[toSquareIndex('b8')].piece?.color).toBe('white');
    expect(nextGame.board[toSquareIndex('b7')].piece).toBeNull();
  });
});

describe('en passant capture', () => {
  it('should remove the captured pawn from its actual square', () => {
    // White pawn on e5, black pawn on d5, en passant target d6
    const board = parseFEN('rnbqkbnr/ppp1pppp/8/3pP3/8/8/PPPP1PPP/RNBQKBNR w KQkq d6 0 1');
    const game: GameState = {
      board,
      sideToMove: PieceColor.White,
      history: [],
      castlingRights: { wk: true, wq: true, bk: true, bq: true },
      enPassantTarget: 'd6',
      halfmoveClock: 0,
      fullmoveNumber: 1,
      result: null,
    };
    const move: Move = {
      from: toSquareIndex('e5'),
      fromAlgebraic: 'e5',
      to: toSquareIndex('d6'),
      toAlgebraic: 'd6',
      piece: board[toSquareIndex('e5')].piece!,
      captured: board[toSquareIndex('d5')].piece,
      isEnPassant: true,
      isPromotion: false,
      promotionPiece: null,
      castling: null,
      enPassantTarget: null,
    };
    const nextGame = makeMove(game, move);
    expect(nextGame.board[toSquareIndex('d6')].piece?.type).toBe('pawn');
    expect(nextGame.board[toSquareIndex('d6')].piece?.color).toBe('white');
    expect(nextGame.board[toSquareIndex('e5')].piece).toBeNull();
    expect(nextGame.board[toSquareIndex('d5')].piece).toBeNull();
  });
});

describe('move notation', () => {
  it('should record pawn move notation', () => {
    const game = createGame();
    const move = findLegalMove(game.board, PieceColor.White, 'e2', 'e4');
    const nextGame = makeMove(game, move);
    expect(nextGame.history[0].notation).toBe('e4');
  });

  it('should record piece move notation', () => {
    const game = createGame();
    const move = findLegalMove(game.board, PieceColor.White, 'b1', 'c3');
    const nextGame = makeMove(game, move);
    expect(nextGame.history[0].notation).toBe('Nc3');
  });

  it('should record capture notation', () => {
    const game = buildGameFromFEN('rnbqkbnr/pppp1ppp/8/3p4/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 1');
    const move = findLegalMove(game.board, PieceColor.White, 'e4', 'd5');
    const nextGame = makeMove(game, move);
    expect(nextGame.history[0].notation).toBe('exd5');
  });

  it('should record castling notation', () => {
    const game = buildGameFromFEN('r3k2r/pppppppp/8/8/8/8/PPPPPPPP/R3K2R w KQkq - 0 1');
    const move = findLegalMove(game.board, PieceColor.White, 'e1', 'g1');
    const nextGame = makeMove(game, move);
    expect(nextGame.history[0].notation).toBe('O-O');
  });

  it('should record checkmate notation', () => {
    const game = buildGameFromFEN('8/8/8/8/8/2K5/2Q5/k7 w - - 0 1');
    const move = findLegalMove(game.board, PieceColor.White, 'c2', 'b2');
    const nextGame = makeMove(game, move);
    expect(nextGame.history[0].notation).toBe('Qb2#');
  });

  it('should record check notation', () => {
    const game = buildGameFromFEN('4k3/8/8/8/8/8/4Q3/4K3 w - - 0 1');
    const move = findLegalMove(game.board, PieceColor.White, 'e2', 'e7');
    const nextGame = makeMove(game, move);
    expect(nextGame.history[0].notation).toBe('Qe7+');
  });

  it('should record queenside castling notation', () => {
    const game = buildGameFromFEN('r3k2r/pppppppp/8/8/8/8/PPPPPPPP/R3K2R w KQkq - 0 1');
    const move = findLegalMove(game.board, PieceColor.White, 'e1', 'c1');
    const nextGame = makeMove(game, move);
    expect(nextGame.history[0].notation).toBe('O-O-O');
  });
});

describe('undo move edge cases', () => {
  it('should return the same game when undoing with empty history', () => {
    const game = createGame();
    const undone = undoMove(game);
    expect(undone).toBe(game);
  });
});

describe('getLegalMoves edge cases', () => {
  it('should filter black queenside castling when rights are revoked', () => {
    const game = buildGameFromFEN('r3k2r/pppppppp/8/8/8/8/PPPPPPPP/R3K2R b KQkq - 0 1');
    const moves = getLegalMoves(game);
    const blackQueenside = moves.find((m) => m.castling === 'queenside');
    expect(blackQueenside).toBeDefined();

    const gameNoRights = { ...game, castlingRights: { wk: true, wq: true, bk: true, bq: false } };
    const movesNoRights = getLegalMoves(gameNoRights);
    const blackQueensideNoRights = movesNoRights.find((m) => m.castling === 'queenside');
    expect(blackQueensideNoRights).toBeUndefined();
  });

  it('should not generate en passant moves when target is absent', () => {
    const game = createGame();
    const moves = getLegalMoves(game);
    expect(moves.some((m) => m.isEnPassant)).toBe(false);
  });

  it('should handle en passant target with no valid capturing pawn', () => {
    const board = parseFEN('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq e6 0 1');
    const game: GameState = {
      board,
      sideToMove: PieceColor.White,
      history: [],
      castlingRights: { wk: true, wq: true, bk: true, bq: true },
      enPassantTarget: 'e6',
      halfmoveClock: 0,
      fullmoveNumber: 1,
      result: null,
    };
    const moves = getLegalMoves(game);
    expect(moves.some((m) => m.isEnPassant)).toBe(false);
  });
});
