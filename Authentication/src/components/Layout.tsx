import { Outlet, Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

function Layout() {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <div className="app-container">
      <header>
        <h1>🔐 Frontend Authentication</h1>
        <nav>
          <Link to="/">🏠 Home</Link>
          {isAuthenticated ? (
            <>
              <Link to="/dashboard">📊 Dashboard</Link>
              <Link to="/profile">👤 Profile</Link>
              {user?.role === "admin" && <Link to="/admin">⚙️ Admin</Link>}
              <button onClick={handleLogout} style={{ marginLeft: "auto" }}>
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login">🔑 Login</Link>
              <Link to="/register">✨ Register</Link>
            </>
          )}
        </nav>
      </header>
      <main>
        <Outlet />
      </main>
    </div>
  );
}

export default Layout;
