import { useAuth } from "../hooks/useAuth";

function Admin() {
  const { user } = useAuth();

  // Mock user list
  const users = [
    { id: "1", name: "Admin User", email: "admin@example.com", role: "admin" },
    { id: "2", name: "Regular User", email: "user@example.com", role: "user" },
    { id: "3", name: "John Doe", email: "john@example.com", role: "user" },
  ];

  return (
    <div className="page">
      <h2>⚙️ Admin Panel</h2>
      <p>
        This page is only accessible to users with <code>admin</code> role.
      </p>
      <p style={{ color: "var(--text-secondary)", marginTop: "0.5rem" }}>
        Current user: <strong>{user?.name}</strong> ({user?.role})
      </p>

      <div style={{ marginTop: "2rem" }}>
        <div className="card">
          <h3>User Management</h3>
          <div style={{ marginTop: "1rem", overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "2px solid var(--border-color)" }}>
                  <th style={{ padding: "0.75rem", textAlign: "left" }}>ID</th>
                  <th style={{ padding: "0.75rem", textAlign: "left" }}>
                    Name
                  </th>
                  <th style={{ padding: "0.75rem", textAlign: "left" }}>
                    Email
                  </th>
                  <th style={{ padding: "0.75rem", textAlign: "left" }}>
                    Role
                  </th>
                  <th style={{ padding: "0.75rem", textAlign: "left" }}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr
                    key={u.id}
                    style={{
                      borderBottom: "1px solid var(--border-color)",
                    }}
                  >
                    <td style={{ padding: "0.75rem" }}>{u.id}</td>
                    <td style={{ padding: "0.75rem" }}>{u.name}</td>
                    <td style={{ padding: "0.75rem" }}>{u.email}</td>
                    <td style={{ padding: "0.75rem" }}>
                      <code>{u.role}</code>
                    </td>
                    <td style={{ padding: "0.75rem" }}>
                      <button
                        style={{
                          padding: "0.25rem 0.75rem",
                          fontSize: "0.875rem",
                          marginRight: "0.5rem",
                        }}
                      >
                        Edit
                      </button>
                      <button
                        style={{
                          padding: "0.25rem 0.75rem",
                          fontSize: "0.875rem",
                          background: "var(--error-color)",
                          color: "white",
                        }}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card" style={{ marginTop: "1.5rem" }}>
          <h3>System Statistics</h3>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: "1rem",
              marginTop: "1rem",
            }}
          >
            <div
              style={{
                padding: "1rem",
                background: "var(--bg-secondary)",
                borderRadius: "8px",
              }}
            >
              <div
                style={{
                  fontSize: "2rem",
                  fontWeight: 700,
                  color: "var(--primary-color)",
                }}
              >
                {users.length}
              </div>
              <div
                style={{ fontSize: "0.875rem", color: "var(--text-secondary)" }}
              >
                Total Users
              </div>
            </div>
            <div
              style={{
                padding: "1rem",
                background: "var(--bg-secondary)",
                borderRadius: "8px",
              }}
            >
              <div
                style={{
                  fontSize: "2rem",
                  fontWeight: 700,
                  color: "var(--success-color)",
                }}
              >
                {users.filter((u) => u.role === "admin").length}
              </div>
              <div
                style={{ fontSize: "0.875rem", color: "var(--text-secondary)" }}
              >
                Administrators
              </div>
            </div>
            <div
              style={{
                padding: "1rem",
                background: "var(--bg-secondary)",
                borderRadius: "8px",
              }}
            >
              <div
                style={{
                  fontSize: "2rem",
                  fontWeight: 700,
                  color: "var(--warning-color)",
                }}
              >
                {users.filter((u) => u.role === "user").length}
              </div>
              <div
                style={{ fontSize: "0.875rem", color: "var(--text-secondary)" }}
              >
                Regular Users
              </div>
            </div>
          </div>
        </div>

        <div className="card" style={{ marginTop: "1.5rem" }}>
          <h3>Admin Actions</h3>
          <div
            style={{
              marginTop: "1rem",
              display: "flex",
              gap: "1rem",
              flexWrap: "wrap",
            }}
          >
            <button>Manage Permissions</button>
            <button>View Audit Logs</button>
            <button>System Settings</button>
            <button>Backup Data</button>
          </div>
          <p
            style={{
              marginTop: "1rem",
              fontSize: "0.875rem",
              color: "var(--text-secondary)",
            }}
          >
            💡 These actions are for demonstration purposes only
          </p>
        </div>
      </div>
    </div>
  );
}

export default Admin;
