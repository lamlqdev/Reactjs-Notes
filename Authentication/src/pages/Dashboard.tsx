import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { tokenStorage } from "../utils/tokenStorage";
import { getTokenExpiration, decodeToken } from "../utils/tokenUtils";

function Dashboard() {
  const { user } = useAuth();
  const accessToken = tokenStorage.getAccessToken();
  const refreshToken = tokenStorage.getRefreshToken();
  const tokenExpiration = accessToken ? getTokenExpiration(accessToken) : null;
  const tokenPayload = accessToken ? decodeToken(accessToken) : null;

  return (
    <div className="page">
      <h2>📊 Dashboard</h2>
      <p>Welcome to your dashboard! This is a protected route.</p>

      <div style={{ marginTop: "2rem" }}>
        <div className="card">
          <h3>User Information</h3>
          <div style={{ marginTop: "1rem" }}>
            <p>
              <strong>Name:</strong> {user?.name}
            </p>
            <p>
              <strong>Email:</strong> {user?.email}
            </p>
            <p>
              <strong>Role:</strong> <code>{user?.role}</code>
            </p>
            <p>
              <strong>User ID:</strong> <code>{user?.id}</code>
            </p>
          </div>
        </div>

        <div className="card" style={{ marginTop: "1.5rem" }}>
          <h3>Token Information</h3>
          <div style={{ marginTop: "1rem" }}>
            <p>
              <strong>Access Token:</strong>{" "}
              <code style={{ fontSize: "0.75rem", wordBreak: "break-all" }}>
                {accessToken
                  ? `${accessToken.substring(0, 30)}...`
                  : "Not available"}
              </code>
            </p>
            <p>
              <strong>Refresh Token:</strong>{" "}
              <code style={{ fontSize: "0.75rem", wordBreak: "break-all" }}>
                {refreshToken
                  ? `${refreshToken.substring(0, 30)}...`
                  : "Not available"}
              </code>
            </p>
            {tokenExpiration && (
              <p>
                <strong>Token Expires:</strong>{" "}
                {new Date(tokenExpiration).toLocaleString()}
              </p>
            )}
            {tokenPayload && (
              <details style={{ marginTop: "1rem" }}>
                <summary style={{ cursor: "pointer", fontWeight: 600 }}>
                  View Token Payload
                </summary>
                <pre style={{ marginTop: "0.5rem", fontSize: "0.75rem" }}>
                  {JSON.stringify(tokenPayload, null, 2)}
                </pre>
              </details>
            )}
          </div>
        </div>

        <div className="card" style={{ marginTop: "1.5rem" }}>
          <h3>Quick Actions</h3>
          <div
            style={{
              marginTop: "1rem",
              display: "flex",
              gap: "1rem",
              flexWrap: "wrap",
            }}
          >
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
      </div>
    </div>
  );
}

export default Dashboard;
