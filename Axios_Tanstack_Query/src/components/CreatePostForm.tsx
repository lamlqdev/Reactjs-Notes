import { useState } from 'react';
import { useCreatePost } from '../hooks/usePosts';

export function CreatePostForm() {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const createPost = useCreatePost();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createPost.mutate(
      {
        title,
        body,
        userId: 1, // Assume userId = 1
      },
      {
        onSuccess: () => {
          // Reset form after successful creation
          setTitle('');
          setBody('');
          alert('Post created successfully!');
        },
        onError: (error) => {
          alert(`Error: ${error instanceof Error ? error.message : 'An error occurred'}`);
        },
      }
    );
  };

  return (
    <form onSubmit={handleSubmit} className="create-post-form">
      <h2>Create New Post</h2>
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
      <button type="submit" disabled={createPost.isPending}>
        {createPost.isPending ? 'Creating...' : 'Create Post'}
      </button>
    </form>
  );
}

