import { useState, FormEvent } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, error, clearError, isLoading } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [localError, setLocalError] = useState("");

  // Get the page user was trying to access before login
  const from =
    (location.state as { from?: Location })?.from?.pathname || "/dashboard";

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLocalError("");
    clearError();

    if (!email || !password) {
      setLocalError("Please fill in all fields");
      return;
    }

    try {
      await login({ email, password });
      // Navigate to the page user was trying to access, or dashboard
      navigate(from, { replace: true });
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : "Login failed");
    }
  };

  return (
    <div className="page">
      <div style={{ textAlign: "center", marginBottom: "2rem" }}>
        <div
          style={{
            width: "80px",
            height: "80px",
            margin: "0 auto 1rem",
            borderRadius: "50%",
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "2.5rem",
            boxShadow: "0 4px 12px rgba(102, 126, 234, 0.3)",
          }}
        >
          🔐
        </div>
        <h2>Welcome Back</h2>
        <p style={{ color: "var(--text-secondary)" }}>
          Sign in to your account to continue
        </p>
      </div>

      {from !== "/dashboard" && (
        <div
          style={{
            padding: "1rem",
            background: "linear-gradient(135deg, #fff3cd 0%, #ffe69c 100%)",
            borderLeft: "4px solid #f59e0b",
            borderRadius: "8px",
            marginBottom: "1.5rem",
          }}
        >
          <p style={{ margin: 0, color: "#92400e" }}>
            <strong>⚠️ Authentication Required</strong>
            <br />
            You need to login to access:{" "}
            <code style={{ background: "rgba(0,0,0,0.1)" }}>{from}</code>
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Email</label>
          <div className="form-field-wrapper">
            <span className="field-icon">✉️</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your.email@example.com"
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label>Password</label>
          <div className="form-field-wrapper">
            <span className="field-icon">🔒</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
            />
          </div>
        </div>

        {(error || localError) && (
          <div className="error" style={{ marginTop: "1rem" }}>
            {error || localError}
          </div>
        )}

        <div className="form-actions">
          <button type="submit" disabled={isLoading} style={{ width: "100%" }}>
            {isLoading ? "Logging in..." : "Login →"}
          </button>
        </div>
      </form>

      <div
        style={{
          marginTop: "1.5rem",
          padding: "1rem",
          background: "var(--bg-secondary)",
          borderRadius: "8px",
          fontSize: "0.875rem",
          color: "var(--text-secondary)",
        }}
      >
        <strong>💡 Demo Credentials:</strong>
        <ul style={{ marginTop: "0.5rem", paddingLeft: "1.5rem" }}>
          <li>
            <strong>Admin:</strong> admin@example.com / admin123
          </li>
          <li>
            <strong>User:</strong> user@example.com / user123
          </li>
        </ul>
      </div>

      <div style={{ textAlign: "center", marginTop: "1rem" }}>
        <p style={{ color: "var(--text-secondary)" }}>
          Don't have an account?{" "}
          <Link
            to="/register"
            style={{ color: "var(--primary-color)", fontWeight: 600 }}
          >
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Login;
