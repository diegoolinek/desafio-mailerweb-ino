import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../services/api';
import { UserPlus, CheckCircle } from 'lucide-react';

const registerSchema = z.object({
  username: z.string().min(3, 'O usuário deve ter pelo menos 3 caracteres'),
  email: z.string().email('Digite um e-mail válido'),
  password: z.string().min(6, 'A senha deve ter pelo menos 6 caracteres'),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "As senhas não coincidem",
  path: ["confirmPassword"],
});

type RegisterForm = z.infer<typeof registerSchema>;

export function Register() {
  const navigate = useNavigate();
  const [apiError, setApiError] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterForm) => {
    try {
      setApiError('');

      await api.post('/auth/register/', {
        username: data.username,
        email: data.email,
        password: data.password,
      });

      setShowSuccessModal(true);

    } catch (error: any) {
      const errorData = error.response?.data;
      if (errorData?.username) {
        setApiError('Este nome de usuário já está em uso.');
      } else if (errorData?.email) {
        setApiError('Este e-mail já está cadastrado.');
      } else {
        setApiError('Ocorreu um erro ao criar a conta. Tente novamente.');
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 relative">
      <div className="bg-slate-800 p-8 rounded-xl shadow-2xl w-full max-w-md border border-slate-700">

        <div className="flex flex-col items-center mb-6">
          <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-full mb-3">
            <UserPlus size={32} />
          </div>
          <h1 className="text-3xl font-bold text-white text-center">Criar Conta</h1>
          <p className="text-slate-400 text-sm mt-1">Junte-se ao MailerWeb Booking</p>
        </div>

        {apiError && (
          <div className="bg-red-500/10 border border-red-500 text-red-500 p-3 rounded mb-4 text-sm text-center">
            {apiError}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-slate-300 mb-1 text-sm">Usuário</label>
            <input
              {...register('username')}
              className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white focus:outline-none focus:border-emerald-500 transition-colors"
              placeholder="ex: usuario"
            />
            {errors.username && <span className="text-red-400 text-xs mt-1 block">{errors.username.message}</span>}
          </div>

          <div>
            <label className="block text-slate-300 mb-1 text-sm">E-mail</label>
            <input
              type="email"
              {...register('email')}
              className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white focus:outline-none focus:border-emerald-500 transition-colors"
              placeholder="seu@email.com"
            />
            {errors.email && <span className="text-red-400 text-xs mt-1 block">{errors.email.message}</span>}
          </div>

          <div>
            <label className="block text-slate-300 mb-1 text-sm">Senha</label>
            <input
              type="password"
              {...register('password')}
              className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white focus:outline-none focus:border-emerald-500 transition-colors"
              placeholder="••••••••"
            />
            {errors.password && <span className="text-red-400 text-xs mt-1 block">{errors.password.message}</span>}
          </div>

          <div>
            <label className="block text-slate-300 mb-1 text-sm">Confirmar Senha</label>
            <input
              type="password"
              {...register('confirmPassword')}
              className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white focus:outline-none focus:border-emerald-500 transition-colors"
              placeholder="••••••••"
            />
            {errors.confirmPassword && <span className="text-red-400 text-xs mt-1 block">{errors.confirmPassword.message}</span>}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded transition-colors disabled:opacity-50 mt-6"
          >
            {isSubmitting ? 'Criando conta...' : 'Cadastrar'}
          </button>
        </form>

        <div className="mt-6 text-center border-t border-slate-700 pt-6">
          <p className="text-slate-400 text-sm">
            Já tem uma conta?{' '}
            <Link to="/login" className="text-emerald-400 hover:text-emerald-300 font-semibold transition-colors">
              Faça login
            </Link>
          </p>
        </div>
      </div>

      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-8 w-full max-w-sm shadow-2xl text-center transform transition-all">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-emerald-500/10 mb-6">
              <CheckCircle className="h-10 w-10 text-emerald-400" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">Conta Criada!</h3>
            <p className="text-slate-300 mb-8">
              Seu cadastro foi realizado com sucesso. Agora você já pode acessar o sistema.
            </p>
            <button
              onClick={() => navigate('/login')}
              className="w-full px-5 py-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition-colors font-bold"
            >
              Ir para o Login
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
