type Page = 
  | 'home'
  | 'useLocalStorage'
  | 'useDebounce'
  | 'useToggle'
  | 'useWindowSize'
  | 'useMediaQuery'
  | 'useFetch'
  | 'usePrevious'

interface HomeProps {
  onNavigate: (page: Page) => void
}

const hooks = [
  { id: 'useLocalStorage' as Page, name: 'useLocalStorage', icon: '💾', description: 'Sync state with localStorage' },
  { id: 'useDebounce' as Page, name: 'useDebounce', icon: '⏱️', description: 'Debounce values to reduce updates' },
  { id: 'useToggle' as Page, name: 'useToggle', icon: '🔄', description: 'Toggle boolean values easily' },
  { id: 'useWindowSize' as Page, name: 'useWindowSize', icon: '📐', description: 'Track window dimensions' },
  { id: 'useMediaQuery' as Page, name: 'useMediaQuery', icon: '📱', description: 'React to media query changes' },
  { id: 'useFetch' as Page, name: 'useFetch', icon: '🌐', description: 'Fetch data with loading states' },
  { id: 'usePrevious' as Page, name: 'usePrevious', icon: '⏮️', description: 'Track previous values' },
]

function Home({ onNavigate }: HomeProps) {
  return (
    <div className="page">
      <h2>🎣 Welcome to Custom Hooks Demo</h2>
      <p style={{ fontSize: '1.125rem', marginBottom: '2rem' }}>
        A comprehensive collection of reusable custom React hooks with TypeScript.
        Learn how to create and use custom hooks to extract and reuse stateful logic.
      </p>

      <div style={{ 
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '1.5rem',
        marginTop: '2rem'
      }}>
        {hooks.map((hook) => (
          <div
            key={hook.id}
            className="card"
            onClick={() => onNavigate(hook.id)}
            style={{
              cursor: 'pointer',
              textAlign: 'center',
              padding: '2rem'
            }}
          >
            <div style={{
              fontSize: '3rem',
              marginBottom: '1rem'
            }}>
              {hook.icon}
            </div>
            <h3 style={{ marginBottom: '0.5rem' }}>{hook.name}</h3>
            <p style={{ 
              color: 'var(--text-secondary)',
              fontSize: '0.9375rem',
              marginBottom: '1rem'
            }}>
              {hook.description}
            </p>
            <button style={{ width: '100%' }}>
              Try it →
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Home

