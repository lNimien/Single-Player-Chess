import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SettingsModal from './SettingsModal';

const defaultProps = {
  isOpen: true,
  playerColor: 'white' as const,
  animationsEnabled: true,
  soundsEnabled: true,
  onClose: vi.fn(),
  onToggleColor: vi.fn(),
  onToggleAnimations: vi.fn(),
  onToggleSounds: vi.fn(),
};

describe('SettingsModal', () => {
  it('should not render when isOpen is false', () => {
    render(<SettingsModal {...defaultProps} isOpen={false} />);
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('should render when isOpen is true', () => {
    render(<SettingsModal {...defaultProps} />);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('should display current player color as White', () => {
    render(<SettingsModal {...defaultProps} playerColor="white" />);
    expect(screen.getByText(/play as/i)).toBeInTheDocument();
    expect(screen.getByText('White')).toBeInTheDocument();
  });

  it('should display current player color as Black', () => {
    render(<SettingsModal {...defaultProps} playerColor="black" />);
    expect(screen.getByText('Black')).toBeInTheDocument();
  });

  it('should call onToggleColor when inactive color toggle is clicked', async () => {
    const onToggleColor = vi.fn();
    render(<SettingsModal {...defaultProps} playerColor="white" onToggleColor={onToggleColor} />);
    const colorToggle = screen.getByText('Black');
    await userEvent.click(colorToggle);
    expect(onToggleColor).toHaveBeenCalledTimes(1);
  });

  it('should show animations as enabled', () => {
    render(<SettingsModal {...defaultProps} animationsEnabled={true} />);
    expect(screen.getByText(/animations/i)).toBeInTheDocument();
    const toggle = screen.getByRole('button', { name: /toggle animations/i });
    expect(toggle).toHaveAttribute('aria-pressed', 'true');
  });

  it('should show animations as disabled', () => {
    render(<SettingsModal {...defaultProps} animationsEnabled={false} />);
    const toggle = screen.getByRole('button', { name: /toggle animations/i });
    expect(toggle).toHaveAttribute('aria-pressed', 'false');
  });

  it('should call onToggleAnimations when animations toggle is clicked', async () => {
    const onToggleAnimations = vi.fn();
    render(<SettingsModal {...defaultProps} onToggleAnimations={onToggleAnimations} />);
    const toggle = screen.getByRole('button', { name: /toggle animations/i });
    await userEvent.click(toggle);
    expect(onToggleAnimations).toHaveBeenCalledTimes(1);
  });

  it('should show sounds as enabled', () => {
    render(<SettingsModal {...defaultProps} soundsEnabled={true} />);
    expect(screen.getByText(/sounds/i)).toBeInTheDocument();
    const toggle = screen.getByRole('button', { name: /toggle sounds/i });
    expect(toggle).toHaveAttribute('aria-pressed', 'true');
  });

  it('should show sounds as disabled', () => {
    render(<SettingsModal {...defaultProps} soundsEnabled={false} />);
    const toggle = screen.getByRole('button', { name: /toggle sounds/i });
    expect(toggle).toHaveAttribute('aria-pressed', 'false');
  });

  it('should call onToggleSounds when sounds toggle is clicked', async () => {
    const onToggleSounds = vi.fn();
    render(<SettingsModal {...defaultProps} onToggleSounds={onToggleSounds} />);
    const toggle = screen.getByRole('button', { name: /toggle sounds/i });
    await userEvent.click(toggle);
    expect(onToggleSounds).toHaveBeenCalledTimes(1);
  });

  it('should call onClose when close button is clicked', async () => {
    const onClose = vi.fn();
    render(<SettingsModal {...defaultProps} onClose={onClose} />);
    const closeButton = screen.getByRole('button', { name: /close settings/i });
    await userEvent.click(closeButton);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('should call onClose when overlay is clicked', async () => {
    const onClose = vi.fn();
    render(<SettingsModal {...defaultProps} onClose={onClose} />);
    const overlay = screen.getByRole('dialog').parentElement;
    await userEvent.click(overlay!);
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
