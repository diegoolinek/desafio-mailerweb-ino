import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, vi } from 'vitest';
import { Login } from '../pages/Login';

vi.mock('../contexts/AuthContext', () => ({
  useAuth: () => ({
    login: vi.fn(),
  })
}));

describe('Página de Login', () => {
  it('deve exibir mensagens de erro ao tentar enviar o formulário vazio', async () => {
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    const submitButton = screen.getByRole('button', { name: /entrar/i });
    fireEvent.click(submitButton);

    expect(await screen.findByText('O usuário é obrigatório')).toBeInTheDocument();
    expect(await screen.findByText('A senha é obrigatória')).toBeInTheDocument();
  });
});
