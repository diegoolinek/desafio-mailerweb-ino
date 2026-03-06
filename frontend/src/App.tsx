import type { ReactNode } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { BookRoom } from './pages/BookRoom';
import { EditBooking } from './pages/EditBooking';

function PrivateRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) return <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">Carregando...</div>;

  return isAuthenticated ? children : <Navigate to="/login" />;
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

        <Route path="/book/:roomId" element={
          <PrivateRoute>
            <BookRoom />
          </PrivateRoute>
        } />

        <Route path="/edit-booking/:bookingId" element={
          <PrivateRoute>
            <EditBooking />
          </PrivateRoute>
        } />

      </Routes>
    </AuthProvider>
  );
}

export default App;
