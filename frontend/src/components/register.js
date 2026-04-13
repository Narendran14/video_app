import React, { useState } from "react";
import axios from "axios";

function Register({ setIsLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("viewer");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleRegister = async () => {
    setError("");

    // ✅ Validation
    if (!email || !password) {
      setError("All fields are required");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    try {
      setLoading(true);

      await axios.post("http://localhost:5000/api/auth/register", {
        email,
        password,
        role,
      });

      alert("Registered successfully ✅");
      setIsLogin(true);
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h2> Register</h2>

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

        <select value={role} onChange={(e) => setRole(e.target.value)}>
          <option value="viewer">Viewer</option>
          <option value="editor">Editor</option>
          <option value="admin">Admin</option>
        </select>

        {/* ✅ ADD THIS ERROR MESSAGE HERE */}
        {error && <p style={{ color: "red", textAlign: "center" }}>{error}</p>}

        {/* ✅ UPDATE BUTTON HERE */}
        <button onClick={handleRegister} disabled={loading}>
          {loading ? "Registering..." : "Register"}
        </button>

        <p onClick={() => setIsLogin(true)}>Already have an account? Login</p>
      </div>
    </div>
  );
}

export default Register;
