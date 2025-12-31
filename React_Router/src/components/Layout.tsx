import { Outlet, NavLink, useLocation } from "react-router-dom";

function Layout() {
  const location = useLocation();

  return (
    <div className="app-container">
      <header>
        <h1>React Router Demo</h1>
        <nav>
          <NavLink to="/" end>
            Home
          </NavLink>
          <NavLink to="/about">About</NavLink>
          <NavLink to="/contact">Contact</NavLink>
          <NavLink to="/products">Products</NavLink>
          <NavLink to="/users">Users</NavLink>
          <NavLink to="/search">Search</NavLink>
          <NavLink to="/hooks-demo">Hooks Demo</NavLink>
          <NavLink to="/login">Login</NavLink>
          <NavLink to="/dashboard">Dashboard</NavLink>
        </nav>
        <p
          style={{
            marginTop: "0.5rem",
            fontSize: "0.9rem",
            opacity: 0.8,
          }}
        >
          Current path:{" "}
          <code style={{ color: "black" }}>{location.pathname}</code>
        </p>
      </header>
      <main>
        <Outlet />
      </main>
    </div>
  );
}

export default Layout;
