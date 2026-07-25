import useWindowSize from '../hooks/useWindowSize'

function UseWindowSizeDemo() {
  const { width, height } = useWindowSize()

  const getSizeCategory = () => {
    if (width < 640) return { name: 'Mobile', emoji: '📱', color: '#f093fb' }
    if (width < 1024) return { name: 'Tablet', emoji: '📱', color: '#4facfe' }
    return { name: 'Desktop', emoji: '💻', color: '#667eea' }
  }

  const sizeCategory = getSizeCategory()

  return (
    <div className="page">
      <h2>📐 useWindowSize Hook</h2>
      <p>
        Track the window dimensions in real-time. Resize your browser window to
        see the values update automatically.
      </p>

      <div className="card" style={{ marginTop: '2rem' }}>
        <h3>Window Dimensions</h3>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem',
          marginTop: '1.5rem'
        }}>
          <div style={{
            padding: '1.5rem',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            borderRadius: '12px',
            color: 'white',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📏</div>
            <div style={{ fontSize: '0.875rem', opacity: 0.9 }}>Width</div>
            <div style={{ fontSize: '2rem', fontWeight: 700 }}>{width}px</div>
          </div>

          <div style={{
            padding: '1.5rem',
            background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
            borderRadius: '12px',
            color: 'white',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📐</div>
            <div style={{ fontSize: '0.875rem', opacity: 0.9 }}>Height</div>
            <div style={{ fontSize: '2rem', fontWeight: 700 }}>{height}px</div>
          </div>

          <div style={{
            padding: '1.5rem',
            background: `linear-gradient(135deg, ${sizeCategory.color} 0%, ${sizeCategory.color}dd 100%)`,
            borderRadius: '12px',
            color: 'white',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{sizeCategory.emoji}</div>
            <div style={{ fontSize: '0.875rem', opacity: 0.9 }}>Device Type</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{sizeCategory.name}</div>
          </div>
        </div>
      </div>

      <div className="card" style={{ marginTop: '1.5rem' }}>
        <h3>💡 Usage</h3>
        <pre>
          <code>{`const { width, height } = useWindowSize()

// Use for responsive design
{width < 768 && <MobileComponent />}
{width >= 768 && <DesktopComponent />}`}</code>
        </pre>
      </div>
    </div>
  )
}

export default UseWindowSizeDemo

