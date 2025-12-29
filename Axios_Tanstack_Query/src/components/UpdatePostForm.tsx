import { useState, useEffect } from 'react';
import { useUpdatePost, usePost } from '../hooks/usePosts';

interface UpdatePostFormProps {
  postId: number;
}

export function UpdatePostForm({ postId }: UpdatePostFormProps) {
  const { data: post } = usePost(postId);
  const updatePost = useUpdatePost();
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');

  // Load post data into form when data is available
  useEffect(() => {
    if (post) {
      setTitle(post.title);
      setBody(post.body);
    }
  }, [post]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updatePost.mutate(
      {
        id: postId,
        data: { title, body },
      },
      {
        onSuccess: () => {
          alert('Post updated successfully!');
        },
        onError: (error) => {
          alert(`Error: ${error instanceof Error ? error.message : 'An error occurred'}`);
        },
      }
    );
  };

  if (!post) {
    return <div>Loading...</div>;
  }

  return (
    <form onSubmit={handleSubmit} className="update-post-form">
      <h2>Update Post</h2>
      <div>
        <label>
          Title:
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </label>
      </div>
      <div>
        <label>
          Body:
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            required
          />
        </label>
      </div>
      <button type="submit" disabled={updatePost.isPending}>
        {updatePost.isPending ? 'Updating...' : 'Update'}
      </button>
    </form>
  );
}

