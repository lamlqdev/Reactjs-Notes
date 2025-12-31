import { useParams, Link, useNavigate } from 'react-router-dom'

interface Product {
  id: number
  name: string
  price: number
  description: string
  category: string
}

const products: Product[] = [
  {
    id: 1,
    name: 'Laptop',
    price: 999,
    description: 'High-performance laptop for work and gaming',
    category: 'Electronics',
  },
  {
    id: 2,
    name: 'Smartphone',
    price: 699,
    description: 'Latest smartphone with advanced features',
    category: 'Electronics',
  },
  {
    id: 3,
    name: 'Tablet',
    price: 499,
    description: 'Perfect for reading and entertainment',
    category: 'Electronics',
  },
  {
    id: 4,
    name: 'Headphones',
    price: 199,
    description: 'Wireless headphones with noise cancellation',
    category: 'Audio',
  },
]

function ProductDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const product = products.find((p) => p.id === Number(id))

  if (!product) {
    return (
      <div className="page">
        <div className="error">
          <h2>Product Not Found</h2>
          <p>Product with ID {id} does not exist.</p>
          <button onClick={() => navigate('/products')}>
            Back to Products
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="page">
      <button onClick={() => navigate(-1)} style={{ marginBottom: '1rem' }}>
        ← Go Back
      </button>
      <div className="card">
        <h2>{product.name}</h2>
        <p>
          <strong>Price:</strong> ${product.price}
        </p>
        <p>
          <strong>Category:</strong> {product.category}
        </p>
        <p>
          <strong>Description:</strong> {product.description}
        </p>
        <div style={{ marginTop: '1rem' }}>
          <Link to="/products">
            <button>Back to Products</button>
          </Link>
        </div>
      </div>
      <div style={{ marginTop: '1rem', fontSize: '0.9rem', color: '#7f8c8d' }}>
        <p>
          <strong>Note:</strong> This page uses <code>useParams</code> to get
          the product ID from the URL and <code>useNavigate</code> for
          programmatic navigation.
        </p>
      </div>
    </div>
  )
}

export default ProductDetail

