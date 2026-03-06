import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, vi } from 'vitest';
import { Dashboard } from '../pages/Dashboard';

vi.mock('../contexts/AuthContext', () => ({
  useAuth: () => ({ user: { username: 'diegodev' }, logout: vi.fn() })
}));

vi.mock('@tanstack/react-query', () => ({
  useQuery: vi.fn().mockImplementation((options) => {
    if (options.queryKey[0] === 'rooms') {
      return { data: [{ id: '1', name: 'Sala Ada Lovelace', capacity: 10 }], isLoading: false };
    }
    if (options.queryKey[0] === 'bookings') {
      return {
        data: [{ id: '100', title: 'Reunião de Arquitetura', room_name: 'Sala Ada Lovelace', start_at: '2026-03-10T10:00:00Z', end_at: '2026-03-10T11:00:00Z', status: 'ACTIVE' }],
        isLoading: false
      };
    }
    return { data: null, isLoading: false };
  }),
  useMutation: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useQueryClient: () => ({ invalidateQueries: vi.fn() })
}));

describe('Página Dashboard', () => {
  it('deve renderizar o nome do usuário logado e a sala mockada', async () => {
    render(<MemoryRouter><Dashboard /></MemoryRouter>);

    expect(await screen.findByText('diegodev')).toBeInTheDocument();

    const roomTexts = await screen.findAllByText(/Sala Ada Lovelace/i);
    expect(roomTexts.length).toBeGreaterThan(0);

    expect(await screen.findByText('Reunião de Arquitetura')).toBeInTheDocument();
  });
});
