import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { LoginPage } from './LoginPage';

// vi.mock is hoisted above the imports, so the function it references must be
// created with vi.hoisted() to avoid a "Cannot access before initialization" error.
const { loginMock } = vi.hoisted(() => ({ loginMock: vi.fn() }));

vi.mock('../auth/AuthContext', () => ({
  useAuth: () => ({
    user: null,
    loading: false,
    login: loginMock,
    register: vi.fn(),
    logout: vi.fn(),
  }),
}));

function renderPage() {
  return render(
    <MemoryRouter initialEntries={['/login']}>
      <LoginPage />
    </MemoryRouter>,
  );
}

describe('LoginPage', () => {
  // Vitest has `globals` disabled, so Testing Library's auto-cleanup does not
  // run. Unmount between tests so each test starts with a fresh DOM.
  afterEach(cleanup);

  beforeEach(() => {
    loginMock.mockReset();
  });

  it('renders the sign-in form', () => {
    renderPage();
    expect(screen.getByRole('heading', { name: 'Sign in' })).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
  });

  it('calls login with the entered credentials on submit', async () => {
    loginMock.mockResolvedValue(undefined);
    renderPage();

    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'alice@test.edu' } });
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'password123' } });
    fireEvent.click(screen.getByRole('button', { name: 'Sign in' }));

    await waitFor(() => {
      expect(loginMock).toHaveBeenCalledWith('alice@test.edu', 'password123');
    });
  });

  it('shows the backend error message when login fails', async () => {
    loginMock.mockRejectedValue(new Error('Invalid email or password'));
    renderPage();

    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'a@test.edu' } });
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'wrong' } });
    fireEvent.click(screen.getByRole('button', { name: 'Sign in' }));

    await waitFor(() => {
      expect(screen.getByText('Something went wrong. Try again.')).toBeInTheDocument();
    });
  });
});
