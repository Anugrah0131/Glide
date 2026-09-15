import { useAuth } from "../../hooks/useAuth";
import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex-center" style={{ height: '100vh', width: '100vw', background: 'var(--bg-dark)' }}>
        <div className="premium-loader">
          <div className="inner-circle"></div>
          <div className="orbit"></div>
        </div>
      </div>
    );
  }

  return user ? children : <Navigate to="/login" />;
}