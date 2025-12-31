import { useState, FormEvent } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

function Register() {
  const navigate = useNavigate();
  const { register, error, clearError, isLoading } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [localError, setLocalError] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLocalError("");
    clearError();

    if (!name || !email || !password || !confirmPassword) {
      setLocalError("Please fill in all fields");
      return;
    }

    if (password !== confirmPassword) {
      setLocalError("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      setLocalError("Password must be at least 6 characters");
      return;
    }

    try {
      await register({ name, email, password });
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : "Registration failed");
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
          ✨
        </div>
        <h2>Create Account</h2>
        <p style={{ color: "var(--text-secondary)" }}>
          Sign up to get started with your account
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Full Name</label>
          <div className="form-field-wrapper">
            <span className="field-icon">👤</span>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="John Doe"
              required
            />
          </div>
        </div>

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
              placeholder="At least 6 characters"
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label>Confirm Password</label>
          <div className="form-field-wrapper">
            <span className="field-icon">🔒</span>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm your password"
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
            {isLoading ? "Creating account..." : "Create Account →"}
          </button>
        </div>
      </form>

      <div style={{ textAlign: "center", marginTop: "1rem" }}>
        <p style={{ color: "var(--text-secondary)" }}>
          Already have an account?{" "}
          <Link
            to="/login"
            style={{ color: "var(--primary-color)", fontWeight: 600 }}
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Register;
