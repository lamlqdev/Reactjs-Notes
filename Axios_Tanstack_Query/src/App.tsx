import { useEffect } from "react";
import { BrowserRouter, Routes, Route, NavLink, useNavigate } from "react-router-dom";
import { UsersPage } from "./pages/UsersPage";
import { UserDetailPage } from "./pages/UserDetailPage";
import { PostsPage } from "./pages/PostsPage";
import { PostDetailPage } from "./pages/PostDetailPage";

// Listens for session:expired event dispatched by the axios interceptor
// and redirects to login without a full page reload
function SessionGuard({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();

  useEffect(() => {
    const handler = () => navigate("/login", { replace: true });
    window.addEventListener("session:expired", handler);
    return () => window.removeEventListener("session:expired", handler);
  }, [navigate]);

  return <>{children}</>;
}

function Nav() {
  return (
    <nav>
      <span className="brand">axios-query demo</span>
      <NavLink to="/users">Users</NavLink>
      <NavLink to="/posts">Posts</NavLink>
    </nav>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <SessionGuard>
        <Nav />
        <Routes>
          <Route path="/" element={<UsersPage />} />
          <Route path="/users" element={<UsersPage />} />
          <Route path="/users/:id" element={<UserDetailPage />} />
          <Route path="/posts" element={<PostsPage />} />
          <Route path="/posts/:id" element={<PostDetailPage />} />
          <Route path="/login" element={<p className="status">Login page</p>} />
        </Routes>
      </SessionGuard>
    </BrowserRouter>
  );
}
