import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HelmetProvider } from 'react-helmet-async'
import './index.css'
import App from './App.jsx'
import { ThemeProvider } from './context/ThemeContext.jsx'
import RootErrorBoundary from './components/RootErrorBoundary.jsx'

const rootEl = document.getElementById('root')
if (!rootEl) {
  throw new Error('Root element #root not found')
}

// SEO: HelmetProvider enables react-helmet-async to update <head> per SPA route
createRoot(rootEl).render(
  <StrictMode>
    <RootErrorBoundary>
      <HelmetProvider>
        <ThemeProvider>
          <App />
        </ThemeProvider>
      </HelmetProvider>
    </RootErrorBoundary>
  </StrictMode>,
)
