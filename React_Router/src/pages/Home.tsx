import { Link } from 'react-router-dom'

function Home() {
  return (
    <div className="page">
      <h2>🚀 Welcome to React Router Demo</h2>
      <p style={{ fontSize: '1.125rem', marginBottom: '1.5rem' }}>
        A comprehensive demonstration of React Router v6 features with TypeScript.
      </p>
      <p>
        This demo showcases various React Router features including basic
        routing, nested routes, protected routes, and navigation hooks.
      </p>
      
      <div style={{ marginTop: '2.5rem' }}>
        <h3>✨ Quick Navigation</h3>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '1rem',
          marginTop: '1.5rem'
        }}>
          <Link 
            to="/about" 
            style={{
              display: 'block',
              padding: '1.5rem',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              borderRadius: '12px',
              textDecoration: 'none',
              transition: 'all 0.3s ease',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)'
              e.currentTarget.style.boxShadow = '0 8px 12px rgba(0, 0, 0, 0.15)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)'
            }}
          >
            <div style={{ fontWeight: 600, fontSize: '1.125rem', marginBottom: '0.5rem' }}>📖 About</div>
            <div style={{ fontSize: '0.875rem', opacity: 0.9 }}>Learn about React Router</div>
          </Link>
          
          <Link 
            to="/products"
            style={{
              display: 'block',
              padding: '1.5rem',
              background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
              color: 'white',
              borderRadius: '12px',
              textDecoration: 'none',
              transition: 'all 0.3s ease',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)'
              e.currentTarget.style.boxShadow = '0 8px 12px rgba(0, 0, 0, 0.15)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)'
            }}
          >
            <div style={{ fontWeight: 600, fontSize: '1.125rem', marginBottom: '0.5rem' }}>🛍️ Products</div>
            <div style={{ fontSize: '0.875rem', opacity: 0.9 }}>Explore dynamic routes</div>
          </Link>
          
          <Link 
            to="/users"
            style={{
              display: 'block',
              padding: '1.5rem',
              background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
              color: 'white',
              borderRadius: '12px',
              textDecoration: 'none',
              transition: 'all 0.3s ease',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)'
              e.currentTarget.style.boxShadow = '0 8px 12px rgba(0, 0, 0, 0.15)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)'
            }}
          >
            <div style={{ fontWeight: 600, fontSize: '1.125rem', marginBottom: '0.5rem' }}>👥 Users</div>
            <div style={{ fontSize: '0.875rem', opacity: 0.9 }}>See nested routes</div>
          </Link>
          
          <Link 
            to="/hooks-demo"
            style={{
              display: 'block',
              padding: '1.5rem',
              background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
              color: 'white',
              borderRadius: '12px',
              textDecoration: 'none',
              transition: 'all 0.3s ease',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)'
              e.currentTarget.style.boxShadow = '0 8px 12px rgba(0, 0, 0, 0.15)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)'
            }}
          >
            <div style={{ fontWeight: 600, fontSize: '1.125rem', marginBottom: '0.5rem' }}>🔗 Hooks Demo</div>
            <div style={{ fontSize: '0.875rem', opacity: 0.9 }}>Navigation hooks</div>
          </Link>
        </div>
      </div>
    </div>
  )
}

export default Home

