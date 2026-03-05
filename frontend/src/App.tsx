import { ReactNode } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Login } from './pages/Login';

function PrivateRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) return <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">Carregando...</div>;
  
  return isAuthenticated ? children : <Navigate to="/login" />;
}

function Dashboard() {
  const { user, logout } = useAuth();
  return (
    <div className="min-h-screen bg-slate-900 p-8 text-white">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Dashboard de Reservas</h1>
        <div className="flex items-center gap-4">
          <span>Olá, {user?.username}</span>
          <button onClick={logout} className="bg-red-600 hover:bg-red-500 px-4 py-2 rounded text-sm font-bold transition-colors">Sair</button>
        </div>
      </div>
      <p className="text-slate-400">Em desenvolvimento...</p>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<Login />} />
        
        <Route path="/" element={
          <PrivateRoute>
            <Dashboard />
          </PrivateRoute>
        } />
      </Routes>
    </AuthProvider>
  );
}

export default App;
