import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Login({ setIsLoggedIn, setIsLogin }) {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async () => {
    setError("");

    // ✅ Validation
    if (!email || !password) {
      setError("All fields are required");
      return;
    }

    if (!email.includes("@") || !email.includes(".com")) {
      setError("Invalid email format");
      return;
    }

    try {
      setLoading(true);

      const res = await axios.post("http://localhost:5000/api/auth/login", {
        email,
        password,
      });

      // ✅ Save auth
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("role", res.data.role);
      localStorage.setItem("user", JSON.stringify(res.data.user));

      setIsLoggedIn(true);
      navigate("/dashboard");
    } catch (err) {
      setError("Invalid credentials");
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="auth-container">
      <div className="auth-box">
        <h2> Login</h2>

        <input
          type="email"
          placeholder="Enter email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Enter password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button onClick={handleLogin}>Login</button>

        <p onClick={() => setIsLogin(false)}>Don't have an account? Register</p>
      </div>
    </div>
  );
}

export default Login;
