import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';

describe('App promotion modal', () => {
  it('should render promotion modal when a pawn reaches the last rank', async () => {
    const user = userEvent.setup();
    render(<App />);

    const moves: [string, string][] = [
      ['h2', 'h4'],
      ['a7', 'a5'],
      ['h4', 'h5'],
      ['a5', 'a4'],
      ['h5', 'h6'],
      ['a4', 'a3'],
      ['h6', 'g7'],
      ['a3', 'b2'],
    ];

    for (const [from, to] of moves) {
      const fromSquare = screen.getByLabelText(`Square ${from}`);
      await user.click(fromSquare);
      const toSquare = screen.getByLabelText(`Square ${to}`);
      await user.click(toSquare);
    }

    const fromSquare = screen.getByLabelText('Square g7');
    await user.click(fromSquare);
    const toSquare = screen.getByLabelText('Square f8');
    await user.click(toSquare);

    const modal = screen.getByRole('dialog');
    expect(modal).toBeInTheDocument();
  });
});
