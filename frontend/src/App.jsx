import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import { useAuthState } from "./context/AuthContext";
import styles from './App.module.css';

export default function App() {
  const auth = useAuthState();

  // Simple protection for routes
  const ProtectedRoute = ({ children }) => {
    if (!auth.token) {
      return <Navigate to="/login" replace />;
    }
    return children;
  };

  return (
    <div className={styles.container}>
      <Routes>
        <Route path="/login" element={
          auth.token ? <Navigate to="/dashboard" replace /> : <Login />
        } />
        <Route path="/register" element={
          auth.token ? <Navigate to="/dashboard" replace /> : <Register />
        } />
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />
        <Route path="/" element={
          auth.token ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />
        } />
      </Routes>
    </div>
  );
}
