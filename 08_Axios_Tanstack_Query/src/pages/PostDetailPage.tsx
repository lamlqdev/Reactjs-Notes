import { useParams, Link } from "react-router-dom";
import { useState } from "react";
import { usePost } from "../hooks/queries/usePostQuery";
import { useUpdatePostMutation } from "../hooks/mutations/usePostMutation";
import { AppError } from "../api/axios-instance";

export function PostDetailPage() {
  const { id } = useParams<{ id: string }>();
  const postId = Number(id);

  const { data: post, isLoading } = usePost(postId);
  const updatePost = useUpdatePostMutation();

  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");

  const handleUpdate = async () => {
    try {
      // Optimistic update fires immediately (see useUpdatePostMutation)
      await updatePost.mutateAsync({ id: postId, data: { title, body } });
      setEditing(false);
    } catch (err) {
      if (err instanceof AppError) alert(`Error ${err.status}: ${err.message}`);
    }
  };

  if (isLoading) return <p className="status">Loading post…</p>;
  if (!post) return <p className="status error">Post not found.</p>;

  return (
    <div className="page">
      <Link to="/posts" className="btn-link">← Back to Posts</Link>

      <section className="card">
        {editing ? (
          <>
            <h2>Edit Post</h2>
            <div className="form">
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Title"
              />
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                rows={5}
                placeholder="Body"
              />
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <button onClick={handleUpdate} disabled={updatePost.isPending}>
                  {updatePost.isPending ? "Saving…" : "Save (Optimistic)"}
                </button>
                <button onClick={() => setEditing(false)}>Cancel</button>
              </div>
              <p className="muted" style={{ fontSize: "0.8rem" }}>
                The title updates instantly (optimistic) before the server responds.
                On error it rolls back automatically.
              </p>
            </div>
          </>
        ) : (
          <>
            <h1>{post.title}</h1>
            <p style={{ lineHeight: 1.7 }}>{post.body}</p>
            <p className="muted" style={{ marginTop: "1rem" }}>Post #{post.id} · User #{post.userId}</p>
            <button
              className="btn-link"
              style={{ marginTop: "1rem" }}
              onClick={() => { setEditing(true); setTitle(post.title); setBody(post.body); }}
            >
              Edit Post
            </button>
          </>
        )}
      </section>
    </div>
  );
}
