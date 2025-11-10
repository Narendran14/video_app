import { Navigate } from "react-router-dom";
import { useAuthState } from "../context/AuthContext";

export default function ProtectedRoute({ children, roles = [] }) {
  const auth = useAuthState();
  if (!auth.token) return <Navigate to="/login" replace />;
  if (roles.length && !roles.some(r => auth.roles.includes(r))) {
    return <div className="p-4">Unauthorized</div>;
  }
  return children;
}
