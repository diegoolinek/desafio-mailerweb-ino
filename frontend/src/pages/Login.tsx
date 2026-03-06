import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '../contexts/AuthContext';
import { useState } from 'react';

const loginSchema = z.object({
  username: z.string().min(1, 'O usuário é obrigatório'),
  password: z.string().min(1, 'A senha é obrigatória'),
});

type LoginForm = z.infer<typeof loginSchema>;

export function Login() {
  const { login } = useAuth();
  const [errorMsg, setErrorMsg] = useState('');

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    try {
      setErrorMsg('');
      await login(data);
    } catch (error) {
      setErrorMsg('Usuário ou senha inválidos.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="bg-slate-800 p-8 rounded-xl shadow-2xl w-full max-w-md border border-slate-700">
        <h1 className="text-3xl font-bold text-white text-center mb-6">MailerWeb</h1>

        {errorMsg && (
          <div className="bg-red-500/10 border border-red-500 text-red-500 p-3 rounded mb-4 text-sm text-center">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-slate-300 mb-1 text-sm">Usuário</label>
            <input
              {...register('username')}
              className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white focus:outline-none focus:border-emerald-500 transition-colors"
              placeholder="Digite seu usuário"
            />
            {errors.username && <span className="text-red-400 text-xs">{errors.username.message}</span>}
          </div>

          <div>
            <label className="block text-slate-300 mb-1 text-sm">Senha</label>
            <input
              type="password"
              {...register('password')}
              className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white focus:outline-none focus:border-emerald-500 transition-colors"
              placeholder="••••••••"
            />
            {errors.password && <span className="text-red-400 text-xs">{errors.password.message}</span>}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2 px-4 rounded transition-colors disabled:opacity-50"
          >
            {isSubmitting ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  );
}
