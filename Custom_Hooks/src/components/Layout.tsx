import { ReactNode } from 'react'

type Page = 
  | 'home'
  | 'useLocalStorage'
  | 'useDebounce'
  | 'useToggle'
  | 'useWindowSize'
  | 'useMediaQuery'
  | 'useFetch'
  | 'usePrevious'

interface LayoutProps {
  children: ReactNode
  currentPage: Page
  onNavigate: (page: Page) => void
}

const hooks = [
  { id: 'useLocalStorage' as Page, name: 'useLocalStorage', icon: '💾' },
  { id: 'useDebounce' as Page, name: 'useDebounce', icon: '⏱️' },
  { id: 'useToggle' as Page, name: 'useToggle', icon: '🔄' },
  { id: 'useWindowSize' as Page, name: 'useWindowSize', icon: '📐' },
  { id: 'useMediaQuery' as Page, name: 'useMediaQuery', icon: '📱' },
  { id: 'useFetch' as Page, name: 'useFetch', icon: '🌐' },
  { id: 'usePrevious' as Page, name: 'usePrevious', icon: '⏮️' },
]

function Layout({ children, currentPage, onNavigate }: LayoutProps) {
  return (
    <div className="app-container">
      <header>
        <h1>🎣 Custom Hooks Demo</h1>
        <nav>
          <button
            className={currentPage === 'home' ? 'active' : ''}
            onClick={() => onNavigate('home')}
          >
            🏠 Home
          </button>
          {hooks.map((hook) => (
            <button
              key={hook.id}
              className={currentPage === hook.id ? 'active' : ''}
              onClick={() => onNavigate(hook.id)}
            >
              {hook.icon} {hook.name}
            </button>
          ))}
        </nav>
      </header>
      <main>{children}</main>
    </div>
  )
}

export default Layout

