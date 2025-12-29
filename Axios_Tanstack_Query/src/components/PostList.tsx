import { usePosts } from '../hooks/usePosts';
import { PostItem } from './PostItem';

export function PostList() {
  const { data: posts, isLoading, error, isError } = usePosts();

  if (isLoading) {
    return <div className="loading">Loading posts...</div>;
  }

  if (isError) {
    return (
      <div className="error">
        Error: {error instanceof Error ? error.message : 'An error occurred'}
      </div>
    );
  }

  return (
    <div className="post-list">
      <h2>Posts List</h2>
      {posts && posts.length > 0 ? (
        <ul>
          {posts.map((post) => (
            <PostItem key={post.id} post={post} />
          ))}
        </ul>
      ) : (
        <p>No posts available</p>
      )}
    </div>
  );
}

