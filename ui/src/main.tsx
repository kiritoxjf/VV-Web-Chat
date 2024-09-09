import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/base.scss'
import Routes from './routes/index.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Routes />
  </StrictMode>
)
