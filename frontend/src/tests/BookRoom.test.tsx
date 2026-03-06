import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, vi } from 'vitest';
import { BookRoom } from '../pages/BookRoom';

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useParams: () => ({ roomId: '1' }),
    useNavigate: () => vi.fn(),
  };
});

vi.mock('@tanstack/react-query', () => ({
  useQuery: () => ({ data: { name: 'Sala Teste', capacity: 5 }, isLoading: false }),
  useMutation: () => ({ mutateAsync: vi.fn(), isPending: false }),
}));

describe('Página BookRoom', () => {
  it('deve renderizar o nome e a capacidade da sala selecionada', () => {
    render(<MemoryRouter><BookRoom /></MemoryRouter>);

    expect(screen.getByText('Sala Teste')).toBeInTheDocument();
    expect(screen.getByText('(Capacidade: 5 pessoas)')).toBeInTheDocument();
  });
});
