import { useState } from "react";
import { Link } from "react-router-dom";
import { usePosts, usePrefetchPost } from "../hooks/queries/usePostQuery";
import { useCreatePostMutation, useDeletePostMutation } from "../hooks/mutations/usePostMutation";
import { AppError } from "../api/axios-instance";

export function PostsPage() {
  const { data: posts, isLoading, isError, error } = usePosts();
  const createPost = useCreatePostMutation();
  const deletePost = useDeletePostMutation();
  const prefetchPost = usePrefetchPost();

  const [form, setForm] = useState({ title: "", body: "" });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createPost.mutateAsync({ userId: 1, ...form });
      setForm({ title: "", body: "" });
      alert("Post created! (JSONPlaceholder echoes back — won't appear in list)");
    } catch (err) {
      if (err instanceof AppError) alert(`Error ${err.status}: ${err.message}`);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm(`Delete post #${id}?`)) return;
    try {
      await deletePost.mutateAsync(id);
      alert("Deleted! (JSONPlaceholder doesn't persist)");
    } catch (err) {
      if (err instanceof AppError) alert(`Error ${err.status}: ${err.message}`);
    }
  };

  if (isLoading) return <p className="status">Loading posts…</p>;

  if (isError) {
    const msg = error instanceof AppError
      ? `[${error.code}] ${error.message}`
      : "Unexpected error";
    return <p className="status error">{msg}</p>;
  }

  return (
    <div className="page">
      <h1>Posts</h1>

      {/* Create form */}
      <section className="card">
        <h2>Create Post</h2>
        <form onSubmit={handleCreate} className="form">
          <input
            placeholder="Title"
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            required
          />
          <textarea
            placeholder="Body"
            value={form.body}
            onChange={(e) => setForm((f) => ({ ...f, body: e.target.value }))}
            rows={3}
            required
          />
          <button type="submit" disabled={createPost.isPending}>
            {createPost.isPending ? "Creating…" : "Create Post"}
          </button>
        </form>
      </section>

      {/* Post list — prefetch on hover */}
      <section className="card">
        <h2>Post List ({posts?.length})</h2>
        <p className="muted" style={{ marginBottom: "1rem" }}>
          Hover a post title to prefetch its detail page.
        </p>
        <ul className="list">
          {posts?.slice(0, 20).map((post) => (
            <li key={post.id} className="list-item">
              <div>
                <Link
                  to={`/posts/${post.id}`}
                  className="post-title"
                  onMouseEnter={() => prefetchPost(post.id)}
                >
                  {post.title}
                </Link>
                <p className="muted body-preview">{post.body}</p>
              </div>
              <button
                className="btn-danger"
                onClick={() => handleDelete(post.id)}
                disabled={deletePost.isPending}
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
