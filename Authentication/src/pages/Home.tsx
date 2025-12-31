import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

function Home() {
  const { isAuthenticated, user } = useAuth();

  return (
    <div className="page">
      <h2>🔐 Frontend Authentication Demo</h2>
      <p style={{ fontSize: "1.125rem", marginBottom: "2rem" }}>
        A comprehensive demo application demonstrating authentication patterns
        and best practices in React with TypeScript.
      </p>

      {isAuthenticated ? (
        <div className="card">
          <h3>Welcome back, {user?.name}!</h3>
          <p>
            You are currently logged in as: <strong>{user?.email}</strong>
          </p>
          <p>
            Role: <strong>{user?.role}</strong>
          </p>
          <div
            style={{
              marginTop: "1.5rem",
              display: "flex",
              gap: "1rem",
              flexWrap: "wrap",
            }}
          >
            <Link to="/dashboard">
              <button>Go to Dashboard</button>
            </Link>
            <Link to="/profile">
              <button>View Profile</button>
            </Link>
            {user?.role === "admin" && (
              <Link to="/admin">
                <button>Admin Panel</button>
              </Link>
            )}
          </div>
        </div>
      ) : (
        <div className="card">
          <h3>Get Started</h3>
          <p>Please login or register to access the demo features.</p>
          <div
            style={{
              marginTop: "1.5rem",
              display: "flex",
              gap: "1rem",
              flexWrap: "wrap",
            }}
          >
            <Link to="/login">
              <button>Login</button>
            </Link>
            <Link to="/register">
              <button>Register</button>
            </Link>
          </div>
        </div>
      )}

      <div style={{ marginTop: "2rem" }}>
        <h3>Features Demonstrated</h3>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
            gap: "1.5rem",
            marginTop: "1.5rem",
          }}
        >
          <div className="card">
            <h4>🔑 Token Management</h4>
            <p>JWT tokens, refresh tokens, and secure storage strategies</p>
          </div>
          <div className="card">
            <h4>🛡️ Protected Routes</h4>
            <p>Route protection and authentication guards</p>
          </div>
          <div className="card">
            <h4>👥 Role-Based Access</h4>
            <p>Role-based access control (RBAC) implementation</p>
          </div>
          <div className="card">
            <h4>🔄 Auto Token Refresh</h4>
            <p>Automatic token refresh before expiration</p>
          </div>
          <div className="card">
            <h4>🌐 Axios Interceptors</h4>
            <p>Request/response interceptors for token management</p>
          </div>
          <div className="card">
            <h4>📦 Context API</h4>
            <p>Global authentication state management</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;
