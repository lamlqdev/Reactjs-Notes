import { useState, FormEvent } from "react";
import { useAuth } from "../hooks/useAuth";

function Profile() {
  const { user, logout } = useAuth();
  const [name, setName] = useState(user?.name || "");
  const [isEditing, setIsEditing] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    // In real app, this would update the user profile
    alert("Profile updated! (This is a demo)");
    setIsEditing(false);
  };

  const handleLogout = async () => {
    if (window.confirm("Are you sure you want to logout?")) {
      await logout();
      window.location.href = "/";
    }
  };

  return (
    <div className="page">
      <h2>👤 Profile</h2>
      <p>Manage your account settings and preferences.</p>

      <div style={{ marginTop: "2rem" }}>
        <div className="card">
          <h3>Account Information</h3>
          <form onSubmit={handleSubmit} style={{ marginTop: "1rem" }}>
            <div className="form-group">
              <label>Name</label>
              <div className="form-field-wrapper">
                <span className="field-icon">👤</span>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={!isEditing}
                />
              </div>
            </div>

            <div className="form-group">
              <label>Email</label>
              <div className="form-field-wrapper">
                <span className="field-icon">✉️</span>
                <input type="email" value={user?.email || ""} disabled />
              </div>
              <small>Email cannot be changed</small>
            </div>

            <div className="form-group">
              <label>Role</label>
              <div className="form-field-wrapper">
                <span className="field-icon">🎭</span>
                <input type="text" value={user?.role || ""} disabled />
              </div>
              <small>Role is assigned by administrator</small>
            </div>

            <div className="form-actions">
              {isEditing ? (
                <>
                  <button type="submit">Save Changes</button>
                  <button
                    type="button"
                    onClick={() => {
                      setName(user?.name || "");
                      setIsEditing(false);
                    }}
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <button type="button" onClick={() => setIsEditing(true)}>
                  Edit Profile
                </button>
              )}
            </div>
          </form>
        </div>

        <div className="card" style={{ marginTop: "1.5rem" }}>
          <h3>Security</h3>
          <div style={{ marginTop: "1rem" }}>
            <button style={{ marginRight: "1rem" }}>Change Password</button>
            <button style={{ marginRight: "1rem" }}>
              Two-Factor Authentication
            </button>
            <button>View Active Sessions</button>
          </div>
          <p
            style={{
              marginTop: "1rem",
              fontSize: "0.875rem",
              color: "var(--text-secondary)",
            }}
          >
            💡 These features are for demonstration purposes only
          </p>
        </div>

        <div
          className="card"
          style={{
            marginTop: "1.5rem",
            border: "2px solid var(--error-color)",
          }}
        >
          <h3 style={{ color: "var(--error-color)" }}>Danger Zone</h3>
          <div style={{ marginTop: "1rem" }}>
            <button
              onClick={handleLogout}
              style={{
                background: "var(--error-color)",
                color: "white",
              }}
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;
