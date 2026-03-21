import { useState } from "react";
import { useUsers } from "../hooks/queries/useUserQuery";
import { useCreateUserMutation, useDeleteUserMutation } from "../hooks/mutations/useUserMutation";
import { AppError } from "../api/axios-instance";
import { Link } from "react-router-dom";

export function UsersPage() {
  const { data: users, isLoading, isError, error } = useUsers();
  const createUser = useCreateUserMutation();
  const deleteUser = useDeleteUserMutation();

  const [form, setForm] = useState({ name: "", username: "", email: "" });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createUser.mutateAsync(form);
      setForm({ name: "", username: "", email: "" });
      alert("User created! (JSONPlaceholder echoes back — won't appear in list)");
    } catch (err) {
      if (err instanceof AppError) alert(`Error ${err.status}: ${err.message}`);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm(`Delete user #${id}?`)) return;
    try {
      await deleteUser.mutateAsync(id);
      alert("Deleted! (JSONPlaceholder doesn't persist — list stays the same)");
    } catch (err) {
      if (err instanceof AppError) alert(`Error ${err.status}: ${err.message}`);
    }
  };

  if (isLoading) return <p className="status">Loading users…</p>;

  if (isError) {
    const msg = error instanceof AppError
      ? `[${error.code}] ${error.message}`
      : "Unexpected error";
    return <p className="status error">{msg}</p>;
  }

  return (
    <div className="page">
      <h1>Users</h1>

      {/* Create form */}
      <section className="card">
        <h2>Create User</h2>
        <form onSubmit={handleCreate} className="form">
          <input
            placeholder="Name"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            required
          />
          <input
            placeholder="Username"
            value={form.username}
            onChange={(e) => setForm((f) => ({ ...f, username: e.target.value }))}
            required
          />
          <input
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            required
          />
          <button type="submit" disabled={createUser.isPending}>
            {createUser.isPending ? "Creating…" : "Create"}
          </button>
        </form>
      </section>

      {/* User list */}
      <section className="card">
        <h2>User List ({users?.length})</h2>
        <ul className="list">
          {users?.map((user) => (
            <li key={user.id} className="list-item">
              <div>
                <strong>{user.name}</strong>
                <span className="muted"> @{user.username}</span>
                <br />
                <span className="muted">{user.email}</span>
              </div>
              <div className="actions">
                <Link to={`/users/${user.id}`} className="btn-link">
                  View Posts
                </Link>
                <button
                  className="btn-danger"
                  onClick={() => handleDelete(user.id)}
                  disabled={deleteUser.isPending}
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
