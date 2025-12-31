import { Outlet, NavLink, useParams, useNavigate } from 'react-router-dom'

interface User {
  id: number
  name: string
  email: string
}

const users: User[] = [
  { id: 1, name: 'John Doe', email: 'john@example.com' },
  { id: 2, name: 'Jane Smith', email: 'jane@example.com' },
  { id: 3, name: 'Bob Johnson', email: 'bob@example.com' },
]

function UserProfile() {
  const { userId } = useParams<{ userId: string }>()
  const navigate = useNavigate()

  const user = users.find((u) => u.id === Number(userId))

  if (!user) {
    return (
      <div className="page">
        <div className="error">
          <h2>User Not Found</h2>
          <p>User with ID {userId} does not exist.</p>
          <button onClick={() => navigate('/users')}>Back to Users</button>
        </div>
      </div>
    )
  }

  return (
    <div className="page">
      <button onClick={() => navigate('/users')} style={{ marginBottom: '1rem' }}>
        ← Back to Users
      </button>
      <div className="card">
        <h2>{user.name}</h2>
        <p>
          <strong>Email:</strong> {user.email}
        </p>
      </div>
      <div className="nested-routes">
        <nav className="nested-nav">
          <NavLink to={`/users/${userId}`} end>
            Posts
          </NavLink>
          <NavLink to={`/users/${userId}/settings`}>Settings</NavLink>
        </nav>
        <Outlet />
      </div>
    </div>
  )
}

export default UserProfile

