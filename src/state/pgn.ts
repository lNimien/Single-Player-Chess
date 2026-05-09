import type { GameState, GameMove } from './game';

function formatDate(date: Date): string {
  return date.toISOString().split('T')[0].replace(/-/g, '.');
}

function formatResult(result: GameState['result'], sideToMove: GameState['sideToMove']): string {
  if (result === 'checkmate') {
    return sideToMove === 'white' ? '0-1' : '1-0';
  }
  if (result === 'stalemate' || result === 'draw') {
    return '1/2-1/2';
  }
  return '*';
}

function formatMoves(history: GameMove[]): string {
  if (history.length === 0) return '';

  const pairs: string[] = [];
  for (let i = 0; i < history.length; i += 2) {
    const moveNumber = Math.floor(i / 2) + 1;
    const whiteMove = history[i].notation;
    const blackMove = history[i + 1]?.notation ?? '';
    pairs.push(`${moveNumber}. ${whiteMove}${blackMove ? ' ' + blackMove : ''}`);
  }

  return pairs.join(' ');
}

export function exportToPGN(game: GameState): string {
  const result = formatResult(game.result, game.sideToMove);
  const date = formatDate(new Date());
  const moves = formatMoves(game.history);

  return `[Event "Casual Game"]
[Site "ChessWebsite"]
[Date "${date}"]
[Round "1"]
[White "Player"]
[Black "${game.result ? 'AI' : 'Player'}"]
[Result "${result}"]

${moves} ${result}
`;
}

export function downloadPGN(game: GameState): void {
  const pgn = exportToPGN(game);
  const blob = new Blob([pgn], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `chess_game_${new Date().toISOString().split('T')[0]}.pgn`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
