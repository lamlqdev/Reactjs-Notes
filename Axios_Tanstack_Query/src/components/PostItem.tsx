import { Post } from '../api/postsApi';
import { useDeletePost } from '../hooks/usePosts';

interface PostItemProps {
  post: Post;
}

export function PostItem({ post }: PostItemProps) {
  const deletePost = useDeletePost();

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      deletePost.mutate(post.id);
    }
  };

  return (
    <li className="post-item">
      <h3>{post.title}</h3>
      <p>{post.body}</p>
      <div className="post-actions">
        <button
          onClick={handleDelete}
          disabled={deletePost.isPending}
          className="delete-btn"
        >
          {deletePost.isPending ? 'Deleting...' : 'Delete'}
        </button>
      </div>
    </li>
  );
}

