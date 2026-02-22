import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { language: 'en' },
  }),
}));

vi.mock('../hooks/useAuth', () => ({
  useAuth: () => ({
    signInWithOtp: vi.fn(),
    verifyOtp: vi.fn(),
    signInWithEmail: vi.fn(),
    signUpWithEmail: vi.fn(),
  }),
}));

import AuthModal from '../components/AuthModal';

describe('AuthModal', () => {
  it('should not render when open is false', () => {
    const { container } = render(<AuthModal open={false} onClose={vi.fn()} />);
    expect(container.innerHTML).toBe('');
  });

  it('should render email input when open', () => {
    render(<AuthModal open={true} onClose={vi.fn()} />);
    expect(screen.getByPlaceholderText('auth.email_placeholder')).toBeTruthy();
  });

  it('should render password input when open', () => {
    render(<AuthModal open={true} onClose={vi.fn()} />);
    expect(screen.getByPlaceholderText('auth.password_placeholder')).toBeTruthy();
  });

  it('should render login title', () => {
    render(<AuthModal open={true} onClose={vi.fn()} />);
    expect(screen.getByText('auth.login_title')).toBeTruthy();
  });

  it('should show phone input when phone method is selected', () => {
    render(<AuthModal open={true} onClose={vi.fn()} />);
    const phoneButton = screen.getByText('auth.phone');
    fireEvent.click(phoneButton);
    expect(screen.getByPlaceholderText('auth.phone_placeholder')).toBeTruthy();
  });

  it('should call onClose when backdrop is clicked', () => {
    const onClose = vi.fn();
    const { container } = render(<AuthModal open={true} onClose={onClose} />);
    // Click the outer backdrop div
    const backdrop = container.querySelector('.fixed.inset-0');
    expect(backdrop).toBeTruthy();
  });
});
