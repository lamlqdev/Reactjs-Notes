import { usePost } from '../hooks/usePosts';

interface PostDetailProps {
  postId: number;
}

export function PostDetail({ postId }: PostDetailProps) {
  const { data: post, isLoading, error, isError } = usePost(postId);

  if (isLoading) {
    return <div className="loading">Loading post details...</div>;
  }

  if (isError) {
    return (
      <div className="error">
        Error: {error instanceof Error ? error.message : 'An error occurred'}
      </div>
    );
  }

  if (!post) {
    return <div>Post not found</div>;
  }

  return (
    <div className="post-detail">
      <h2>{post.title}</h2>
      <p>{post.body}</p>
      <p className="post-meta">User ID: {post.userId}</p>
    </div>
  );
}

