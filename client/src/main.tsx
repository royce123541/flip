import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { SetupNotice } from './components/SetupNotice.tsx'

const root = createRoot(document.getElementById('root')!)

if (import.meta.env.VITE_FIREBASE_API_KEY) {
  // Loaded lazily: importing the app initialises Firebase, which throws without an API key.
  import('./App.tsx').then(({ default: App }) =>
    root.render(
      <StrictMode>
        <App />
      </StrictMode>,
    ),
  )
} else {
  root.render(<SetupNotice />)
}
