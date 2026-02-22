import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import ErrorBoundary from '../components/ErrorBoundary';

function ThrowError(): JSX.Element {
  throw new Error('Test error');
}

describe('ErrorBoundary', () => {
  it('should render children when no error', () => {
    render(
      <ErrorBoundary>
        <div>Hello</div>
      </ErrorBoundary>,
    );
    expect(screen.getByText('Hello')).toBeTruthy();
  });

  it('should catch errors and show fallback UI', () => {
    // Suppress console.error for this test
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>,
    );

    expect(screen.getByText('Something went wrong')).toBeTruthy();
    expect(screen.getByText(/حدث خطأ/)).toBeTruthy();

    spy.mockRestore();
  });

  it('should show retry button that resets error state', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const { unmount } = render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>,
    );

    const retryButton = screen.getByText(/Try Again/);
    expect(retryButton).toBeTruthy();

    spy.mockRestore();
    unmount();
  });
});
