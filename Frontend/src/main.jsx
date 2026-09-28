import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@fontsource/orbitron/600.css'
import '@fontsource/orbitron/800.css'
import '@fontsource/orbitron/900.css'
import '@fontsource/rajdhani/500.css'
import '@fontsource/rajdhani/600.css'
import '@fontsource/rajdhani/700.css'
import '@fontsource-variable/inter'
import './styles/base.css'
import './styles/layout.css'
import './styles/components.css'
import './styles/pages.css'
import App from './App'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
