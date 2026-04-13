import { useState, useEffect } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import Login from "./components/login.js";
import Register from "./components/register.js";
import Dashboard from "./components/dashboard.js";
import Upload from "./components/upload.js";

function App() {
  useEffect(() => {
    const token = localStorage.getItem("token");
    const path = window.location.pathname;

    if (!token && path !== "/login" && path !== "/register") {
      window.location.href = "/login";
    }
  }, []);

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  useEffect(() => {
    localStorage.removeItem("token");
  }, []);

  return (
    <Routes>
      {/* Default route */}
      <Route
        path="/"
        element={
          isLoggedIn ? <Navigate to="/dashboard" /> : <Navigate to="/login" />
        }
      />

      {/* Auth Routes */}
      <Route path="/login" element={<Login setIsLoggedIn={setIsLoggedIn} />} />
      <Route path="/register" element={<Register />} />

      {/* Protected Routes */}
      <Route
        path="/dashboard"
        element={<Dashboard setIsLoggedIn={setIsLoggedIn} />}
      />

      <Route path="/upload" element={<Upload />} />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default App;
