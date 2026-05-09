import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';

beforeEach(() => {
  global.AudioContext = vi.fn(function () {
    return {
      createOscillator: vi.fn(function () {
        return {
          connect: vi.fn().mockReturnThis(),
          start: vi.fn(),
          stop: vi.fn(),
          type: 'sine',
          frequency: { setValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn() },
        };
      }),
      createGain: vi.fn(function () {
        return {
          connect: vi.fn().mockReturnThis(),
          gain: { setValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn() },
        };
      }),
      currentTime: 0,
      destination: {},
    };
  }) as unknown as typeof AudioContext;
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('App promotion modal', () => {
  it('should expose an accessible GitHub repository link in the application header', () => {
    render(<App />);

    const repositoryLink = screen.getByRole('link', { name: /view source on github/i });
    expect(repositoryLink).toHaveAttribute('href', 'https://github.com/lNimien/Single-Player-Chess');
    expect(repositoryLink).toHaveAttribute('target', '_blank');
    expect(repositoryLink).toHaveAttribute('rel', 'noreferrer');
    expect(repositoryLink.querySelector('svg')).toBeTruthy();
  });

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
