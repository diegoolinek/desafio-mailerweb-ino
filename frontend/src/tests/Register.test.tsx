import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, vi } from 'vitest';
import { Register } from '../pages/Register';

vi.mock('../services/api', () => ({
  api: {
    post: vi.fn(),
  }
}));

describe('Página de Registro', () => {
  it('deve exibir erro se a confirmação de senha for diferente', async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter>
        <Register />
      </MemoryRouter>
    );

    const usernameInput = await screen.findByPlaceholderText(/ex: usuario/i);
    const emailInput = await screen.findByPlaceholderText(/seu@email.com/i);
    const passwordInputs = await screen.findAllByPlaceholderText(/••••••••/i);

    await user.type(usernameInput, 'teste');
    await user.type(emailInput, 'teste@teste.com');
    await user.type(passwordInputs[0], 'senha123');
    await user.type(passwordInputs[1], 'senhaERRADA');

    await user.click(screen.getByRole('button', { name: /cadastrar/i }));

    expect(await screen.findByText(/As senhas não coincidem/i)).toBeInTheDocument();
  });
});
