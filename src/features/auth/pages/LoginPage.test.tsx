import { fireEvent, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { LoginPage } from '@/features/auth/pages/LoginPage';
import { renderWithProviders } from '@/test/renderWithProviders';
import { authApi } from '@/api/authApi';

vi.mock('@/api/authApi', () => ({
  authApi: {
    login: vi.fn(),
  },
}));

describe('LoginPage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('shows validation errors for invalid input', async () => {
    renderWithProviders(<LoginPage />);

    fireEvent.click(screen.getByRole('button', { name: 'Sign in' }));

    await waitFor(() => {
      expect(screen.getByText('Please enter a valid email address')).toBeInTheDocument();
      expect(screen.getByText('Password must be at least 8 characters')).toBeInTheDocument();
    });
  });

  it('submits and stores auth token', async () => {
    vi.mocked(authApi.login).mockResolvedValueOnce('jwt-token-123');

    renderWithProviders(<LoginPage />);

    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'merchant@demo.com' } });
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'password123' } });
    fireEvent.click(screen.getByRole('button', { name: 'Sign in' }));

    await waitFor(() => {
      const raw = localStorage.getItem('payment-ai.auth-session');
      expect(raw).toBeTruthy();
      expect(raw).toContain('jwt-token-123');
    });
  });
});
