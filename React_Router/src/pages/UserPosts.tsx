import { useParams } from 'react-router-dom'

interface Post {
  id: number
  title: string
  content: string
  date: string
}

const postsByUser: Record<number, Post[]> = {
  1: [
    {
      id: 1,
      title: 'My First Post',
      content: 'This is my first blog post!',
      date: '2024-01-15',
    },
    {
      id: 2,
      title: 'Learning React Router',
      content: 'React Router is amazing for building SPAs!',
      date: '2024-01-20',
    },
  ],
  2: [
    {
      id: 3,
      title: 'TypeScript Tips',
      content: 'TypeScript makes React development much better.',
      date: '2024-01-18',
    },
  ],
  3: [
    {
      id: 4,
      title: 'Web Development Journey',
      content: 'Starting my journey as a web developer.',
      date: '2024-01-10',
    },
  ],
}

function UserPosts() {
  const { userId } = useParams<{ userId: string }>()
  const posts = postsByUser[Number(userId)] || []

  return (
    <div>
      <h3>User Posts</h3>
      {posts.length === 0 ? (
        <p>No posts found for this user.</p>
      ) : (
        <ul>
          {posts.map((post) => (
            <li key={post.id}>
              <h4>{post.title}</h4>
              <p>{post.content}</p>
              <small>Published: {post.date}</small>
            </li>
          ))}
        </ul>
      )}
      <p style={{ marginTop: '1rem', fontSize: '0.9rem', color: '#7f8c8d' }}>
        <strong>Note:</strong> This is a nested route component rendered inside
        UserProfile using <code>Outlet</code>.
      </p>
    </div>
  )
}

export default UserPosts

