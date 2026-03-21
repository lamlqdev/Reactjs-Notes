import { useParams, Link } from "react-router-dom";
import { useUser } from "../hooks/queries/useUserQuery";
import { usePostsByUser } from "../hooks/queries/usePostQuery";
import { useUpdateUserMutation } from "../hooks/mutations/useUserMutation";
import { AppError } from "../api/axios-instance";
import { useState } from "react";

export function UserDetailPage() {
  const { id } = useParams<{ id: string }>();
  const userId = Number(id);

  const { data: user, isLoading: userLoading } = useUser(userId);
  const { data: posts, isLoading: postsLoading } = usePostsByUser(userId);
  const updateUser = useUpdateUserMutation();

  const [editing, setEditing] = useState(false);
  const [name, setName] = useState("");

  const handleUpdate = async () => {
    try {
      await updateUser.mutateAsync({ id: userId, data: { name } });
      setEditing(false);
      alert("Updated! (JSONPlaceholder echoes back — won't persist in list)");
    } catch (err) {
      if (err instanceof AppError) alert(`Error ${err.status}: ${err.message}`);
    }
  };

  if (userLoading) return <p className="status">Loading user…</p>;
  if (!user) return <p className="status error">User not found.</p>;

  return (
    <div className="page">
      <Link to="/users" className="btn-link">← Back to Users</Link>

      {/* User info */}
      <section className="card">
        <h1>{user.name}</h1>
        <p className="muted">@{user.username} · {user.email}</p>
        <p className="muted">{user.phone} · {user.website}</p>

        {editing ? (
          <div className="form" style={{ marginTop: "1rem" }}>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="New name"
            />
            <button onClick={handleUpdate} disabled={updateUser.isPending}>
              {updateUser.isPending ? "Saving…" : "Save"}
            </button>
            <button onClick={() => setEditing(false)}>Cancel</button>
          </div>
        ) : (
          <button
            className="btn-link"
            style={{ marginTop: "1rem" }}
            onClick={() => { setEditing(true); setName(user.name); }}
          >
            Edit Name
          </button>
        )}
      </section>

      {/* Posts by user */}
      <section className="card">
        <h2>Posts by {user.name}</h2>
        {postsLoading ? (
          <p className="muted">Loading posts…</p>
        ) : (
          <ul className="list">
            {posts?.map((post) => (
              <li key={post.id} className="list-item">
                <Link to={`/posts/${post.id}`} className="post-title">
                  {post.title}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
