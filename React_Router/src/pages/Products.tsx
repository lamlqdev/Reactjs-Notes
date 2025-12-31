import { Link } from 'react-router-dom'

interface Product {
  id: number
  name: string
  price: number
  description: string
}

const products: Product[] = [
  {
    id: 1,
    name: 'Laptop',
    price: 999,
    description: 'High-performance laptop for work and gaming',
  },
  {
    id: 2,
    name: 'Smartphone',
    price: 699,
    description: 'Latest smartphone with advanced features',
  },
  {
    id: 3,
    name: 'Tablet',
    price: 499,
    description: 'Perfect for reading and entertainment',
  },
  {
    id: 4,
    name: 'Headphones',
    price: 199,
    description: 'Wireless headphones with noise cancellation',
  },
]

function Products() {
  return (
    <div className="page">
      <h2>Products Page</h2>
      <p>
        This page demonstrates dynamic routes. Click on a product to see its
        details.
      </p>
      <div style={{ 
        marginTop: '2rem',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: '1.5rem'
      }}>
        {products.map((product) => (
          <div key={product.id} className="card" style={{ 
            display: 'flex',
            flexDirection: 'column',
            height: '100%'
          }}>
            <div style={{ 
              width: '100%',
              height: '200px',
              background: `linear-gradient(135deg, ${
                product.id === 1 ? '#667eea, #764ba2' :
                product.id === 2 ? '#f093fb, #f5576c' :
                product.id === 3 ? '#4facfe, #00f2fe' :
                '#fa709a, #fee140'
              })`,
              borderRadius: '8px',
              marginBottom: '1rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '3rem',
              color: 'white',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
            }}>
              {product.id === 1 ? '💻' : product.id === 2 ? '📱' : product.id === 3 ? '📱' : '🎧'}
            </div>
            <h3 style={{ marginBottom: '0.75rem' }}>
              <Link 
                to={`/products/${product.id}`}
                style={{ 
                  color: 'inherit',
                  textDecoration: 'none',
                  transition: 'color 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.color = 'var(--primary-color)'}
                onMouseLeave={(e) => e.currentTarget.style.color = 'inherit'}
              >
                {product.name}
              </Link>
            </h3>
            <p style={{ 
              fontSize: '1.5rem',
              fontWeight: 700,
              color: 'var(--primary-color)',
              marginBottom: '0.5rem'
            }}>
              ${product.price}
            </p>
            <p style={{ 
              flex: 1,
              color: 'var(--text-secondary)',
              marginBottom: '1rem'
            }}>
              {product.description}
            </p>
            <Link to={`/products/${product.id}`} style={{ marginTop: 'auto' }}>
              <button style={{ width: '100%' }}>View Details →</button>
            </Link>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Products

