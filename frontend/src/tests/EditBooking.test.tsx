import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, vi } from 'vitest';
import { EditBooking } from '../pages/EditBooking';

const mockBooking = {
  title: 'Planejamento Mensal',
  room_name: 'Sala Grace Hopper',
  start_at: '2026-03-06T10:00:00Z',
  end_at: '2026-03-06T11:00:00Z'
};

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useParams: () => ({ bookingId: '123' }),
    useNavigate: () => vi.fn(),
  };
});

vi.mock('@tanstack/react-query', () => ({
  useQuery: () => ({
    data: mockBooking,
    isLoading: false
  }),
  useMutation: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useQueryClient: () => ({ invalidateQueries: vi.fn() })
}));

describe('Página EditBooking', () => {
  it('deve carregar o nome da sala da reserva na tela', async () => {
    render(<MemoryRouter><EditBooking /></MemoryRouter>);

    expect(await screen.findByText('Sala Grace Hopper')).toBeInTheDocument();
  });
});
