import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery, useMutation } from '@tanstack/react-query';
import { api } from '../services/api';
import { ArrowLeft, CalendarDays, Clock } from 'lucide-react';

const bookingSchema = z.object({
    title: z.string().min(3, 'O título deve ter pelo menos 3 caracteres'),
    start_at: z.string().min(1, 'A data de início é obrigatória'),
    end_at: z.string().min(1, 'A data de término é obrigatória'),
});

type BookingForm = z.infer<typeof bookingSchema>;

export function BookRoom() {
    const { roomId } = useParams<{ roomId: string }>();
    const navigate = useNavigate();
    const [apiError, setApiError] = useState('');

    const { data: room, isLoading: isLoadingRoom } = useQuery({
        queryKey: ['room', roomId],
        queryFn: async () => {
            const response = await api.get(`/rooms/${roomId}/`);
            return response.data;
        },
        enabled: !!roomId,
    });

    const { register, handleSubmit, formState: { errors } } = useForm<BookingForm>({
        resolver: zodResolver(bookingSchema),
    });

    const { mutateAsync: createBooking, isPending } = useMutation({
        mutationFn: async (data: BookingForm) => {
            const payload = {
                room: roomId,
                title: data.title,
                start_at: new Date(data.start_at).toISOString(),
                end_at: new Date(data.end_at).toISOString(),
            };
            const response = await api.post('/bookings/', payload);
            return response.data;
        },
        onSuccess: () => {
            navigate('/');
        },
        onError: (error: any) => {
            const errorData = error.response?.data;
            let friendlyMessage = 'Ocorreu um erro inesperado ao tentar reservar a sala.';

            if (errorData?.error) {
                const rawError = typeof errorData.error === 'string'
                    ? errorData.error
                    : JSON.stringify(errorData.error);

                if (rawError.includes('overlap')) {
                    friendlyMessage = 'Ops! Já existe uma reunião agendada para este horário nesta sala. Por favor, tente outro horário.';
                } else if (rawError.includes('15 minutes')) {
                    friendlyMessage = 'A reserva precisa ter duração mínima de 15 minutos.';
                } else if (rawError.includes('8 hours')) {
                    friendlyMessage = 'A reserva não pode ultrapassar o limite máximo de 8 horas.';
                } else if (rawError.includes('start_at')) {
                    friendlyMessage = 'A data e hora de término deve ser posterior à data de início.';
                } else {
                    friendlyMessage = errorData.error;
                }
            }

            setApiError(friendlyMessage);
        }
    });

    const onSubmit = async (data: BookingForm) => {
        setApiError('');
        await createBooking(data);
    };

    if (isLoadingRoom) {
        return <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">Carregando sala...</div>;
    }

    return (
        <div className="min-h-screen bg-slate-900 p-8 text-white">
            <div className="max-w-2xl mx-auto">

                {/* Botão de Voltar */}
                <button
                    onClick={() => navigate('/')}
                    className="flex items-center gap-2 text-slate-400 hover:text-emerald-400 transition-colors mb-8"
                >
                    <ArrowLeft size={20} />
                    Voltar para o Dashboard
                </button>

                <div className="bg-slate-800 border border-slate-700 rounded-xl p-8 shadow-2xl">
                    <div className="border-b border-slate-700 pb-6 mb-6">
                        <h1 className="text-3xl font-bold text-white mb-2">Agendar Reunião</h1>
                        <p className="text-slate-400 flex items-center gap-2">
                            <span className="bg-emerald-500/10 text-emerald-400 px-3 py-1 rounded-full text-sm font-semibold border border-emerald-500/20">
                                {room?.name}
                            </span>
                            <span>(Capacidade: {room?.capacity} pessoas)</span>
                        </p>
                    </div>

                    {apiError && (
                        <div className="bg-red-500/10 border border-red-500 text-red-400 p-4 rounded-lg mb-6 flex items-start gap-3">
                            <Clock className="shrink-0 mt-0.5" size={20} />
                            <p>{apiError}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        <div>
                            <label className="block text-slate-300 mb-2 font-medium">Título da Reunião</label>
                            <input
                                {...register('title')}
                                className="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 text-white focus:outline-none focus:border-emerald-500 transition-colors"
                                placeholder="Ex: Reunião de Planejamento Q3"
                            />
                            {errors.title && <span className="text-red-400 text-sm mt-1 block">{errors.title.message}</span>}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-slate-300 mb-2 font-medium items-center gap-2">
                                    <CalendarDays size={18} /> Início
                                </label>
                                <input
                                    type="datetime-local"
                                    {...register('start_at')}
                                    className="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 text-white focus:outline-none focus:border-emerald-500 transition-colors scheme-dark"
                                />
                                {errors.start_at && <span className="text-red-400 text-sm mt-1 block">{errors.start_at.message}</span>}
                            </div>

                            <div>
                                <label className="block text-slate-300 mb-2 font-medium items-center gap-2">
                                    <CalendarDays size={18} /> Término
                                </label>
                                <input
                                    type="datetime-local"
                                    {...register('end_at')}
                                    className="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 text-white focus:outline-none focus:border-emerald-500 transition-colors scheme-dark"
                                />
                                {errors.end_at && <span className="text-red-400 text-sm mt-1 block">{errors.end_at.message}</span>}
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isPending}
                            className="w-full mt-8 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-lg"
                        >
                            {isPending ? 'Confirmando Reserva...' : 'Confirmar Reserva'}
                        </button>
                    </form>
                </div>

            </div>
        </div>
    );
}
