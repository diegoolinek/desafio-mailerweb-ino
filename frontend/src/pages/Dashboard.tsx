import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { Users, DoorOpen, Calendar, Clock, Trash2, Edit, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export interface Room {
  id: string;
  name: string;
  capacity: number;
}

export function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [bookingToDelete, setBookingToDelete] = useState<string | null>(null);

  const { data: rooms, isLoading, isError } = useQuery<Room[]>({
    queryKey: ['rooms'],
    queryFn: async () => {
      const response = await api.get('/rooms/');
      return response.data;
    }
  });

  const { data: bookings, isLoading: isLoadingBookings } = useQuery({
    queryKey: ['bookings'],
    queryFn: async () => {
      const response = await api.get('/bookings/');
      return response.data.filter((b: any) => b.status !== 'CANCELED');
    }
  });

  const cancelBookingMutation = useMutation({
    mutationFn: async (bookingId: string) => {
      await api.post(`/bookings/${bookingId}/cancel/`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      setBookingToDelete(null);
    },
    onError: () => {
      alert('Não foi possível cancelar a reserva. Tente novamente.');
      setBookingToDelete(null);
    }
  });

  const handleCancelClick = (bookingId: string) => {
    setBookingToDelete(bookingId);
  };

  const confirmCancellation = () => {
    if (bookingToDelete) {
      cancelBookingMutation.mutate(bookingToDelete);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 p-8 text-white relative">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-10 border-b border-slate-700 pb-6">
          <h1 className="text-3xl font-bold text-emerald-400">Salas Disponíveis</h1>
          <div className="flex items-center gap-4">
            <span className="text-slate-300">
              Olá, <strong className="text-white">{user?.username}</strong>
            </span>
            <button
              onClick={logout}
              className="bg-slate-800 border border-slate-600 hover:bg-red-500/10 hover:border-red-500 hover:text-red-400 px-4 py-2 rounded font-bold transition-all"
            >
              Sair
            </button>
          </div>
        </div>

        {isLoading && (
          <div className="flex items-center justify-center py-20">
            <p className="text-slate-400 animate-pulse text-xl">Buscando salas...</p>
          </div>
        )}

        {isError && (
          <div className="bg-red-500/10 border border-red-500 text-red-400 p-4 rounded-lg text-center">
            Erro ao carregar as salas. O backend está rodando?
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {rooms?.map((room) => (
            <div key={room.id} className="bg-slate-800 border border-slate-700 rounded-xl p-6 hover:border-emerald-500 transition-colors group">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-slate-900 rounded-lg group-hover:bg-emerald-500/20 group-hover:text-emerald-400 text-slate-400 transition-colors">
                    <DoorOpen size={24} />
                  </div>
                  <h2 className="text-xl font-bold">{room.name}</h2>
                </div>
              </div>

              <div className="flex items-center gap-2 text-slate-400 mt-6 bg-slate-900/50 p-3 rounded-lg">
                <Users size={18} className="text-emerald-500" />
                <span>Capacidade: <strong>{room.capacity}</strong> pessoas</span>
              </div>

              <button
                onClick={() => navigate(`/book/${room.id}`)}
                className="w-full mt-6 bg-emerald-600/10 text-emerald-400 font-semibold py-3 rounded-lg border border-emerald-600/20 hover:bg-emerald-600 hover:text-white transition-all"
              >
                Reservar Sala
              </button>
            </div>
          ))}
        </div>

        {rooms?.length === 0 && !isLoading && (
          <div className="text-center text-slate-500 mt-20 p-10 border border-dashed border-slate-700 rounded-xl">
            <DoorOpen size={48} className="mx-auto mb-4 opacity-50" />
            <p className="text-xl">Nenhuma sala cadastrada ainda.</p>
            <p className="text-sm mt-2">Acesse o Swagger e cadastre uma sala para testar.</p>
          </div>
        )}

        <div className="mt-16">
          <div className="flex items-center gap-3 mb-6 border-b border-slate-700 pb-4">
            <Calendar className="text-emerald-400" size={28} />
            <h2 className="text-2xl font-bold">Próximas Reuniões</h2>
          </div>

          {isLoadingBookings ? (
            <p className="text-slate-400 animate-pulse">Carregando agenda...</p>
          ) : (
            <div className="space-y-4">
              {bookings?.length === 0 ? (
                <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 text-center text-slate-400">
                  Nenhuma reunião agendada no momento.
                </div>
              ) : (
                bookings?.map((booking: any) => (
                  <div key={booking.id} className="bg-slate-800 border-l-4 border-emerald-500 rounded-lg p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-lg hover:bg-slate-700/50 transition-colors group">

                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-white mb-1">{booking.title}</h3>
                      <p className="text-emerald-400 font-medium flex items-center gap-2 text-sm">
                        <DoorOpen size={16} /> {booking.room_name}
                      </p>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-6 text-slate-300 bg-slate-900/50 px-4 py-3 rounded-lg">
                        <div className="flex flex-col">
                          <span className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-1">Início</span>
                          <div className="flex items-center gap-2">
                            <Clock size={16} className="text-emerald-500" />
                            <span className="font-medium">
                              {format(parseISO(booking.start_at), "dd 'de' MMM, HH:mm", { locale: ptBR })}
                            </span>
                          </div>
                        </div>

                        <div className="w-px h-8 bg-slate-700 hidden md:block"></div>

                        <div className="flex flex-col">
                          <span className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-1">Término</span>
                          <div className="flex items-center gap-2">
                            <Clock size={16} className="text-red-400" />
                            <span className="font-medium">
                              {format(parseISO(booking.end_at), "dd 'de' MMM, HH:mm", { locale: ptBR })}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => navigate(`/edit-booking/${booking.id}`)}
                          className="p-3 bg-slate-900/50 text-slate-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors"
                          title="Editar Reunião"
                        >
                          <Edit size={20} />
                        </button>

                        <button
                          onClick={() => handleCancelClick(booking.id)}
                          className="p-3 bg-slate-900/50 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                          title="Cancelar Reunião"
                        >
                          <Trash2 size={20} />
                        </button>
                      </div>
                    </div>

                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      {bookingToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-red-500/10 text-red-400 rounded-full">
                <AlertTriangle size={28} />
              </div>
              <h3 className="text-2xl font-bold text-white">Cancelar Reunião</h3>
            </div>

            <p className="text-slate-300 mb-8 leading-relaxed">
              Tem certeza que deseja cancelar esta reserva? A sala ficará livre para outras pessoas e essa ação não poderá ser desfeita.
            </p>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setBookingToDelete(null)}
                disabled={cancelBookingMutation.isPending}
                className="px-5 py-2.5 rounded-lg text-slate-300 hover:bg-slate-700 transition-colors font-medium disabled:opacity-50"
              >
                Voltar
              </button>
              <button
                onClick={confirmCancellation}
                disabled={cancelBookingMutation.isPending}
                className="px-5 py-2.5 rounded-lg bg-red-600 hover:bg-red-500 text-white transition-colors font-bold flex items-center gap-2 disabled:opacity-50"
              >
                {cancelBookingMutation.isPending ? 'Cancelando...' : 'Sim, Cancelar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
