import { useNavigate } from 'react-router-dom'

function Dashboard() {
  const navigate = useNavigate()

  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated')
    navigate('/login')
  }

  return (
    <div className="page">
      <h2>Dashboard</h2>
      <p>This is a protected route. Only authenticated users can access it.</p>
      <div className="card" style={{ marginTop: '1rem' }}>
        <h3>Welcome to the Dashboard!</h3>
        <p>You are successfully logged in.</p>
        <button onClick={handleLogout} style={{ marginTop: '1rem' }}>
          Logout
        </button>
      </div>
      <p style={{ marginTop: '1rem', fontSize: '0.9rem', color: '#7f8c8d' }}>
        <strong>Note:</strong> Try accessing this page without logging in. You'll
        be redirected to the login page, and after login, you'll be brought back
        here.
      </p>
    </div>
  )
}

export default Dashboard

