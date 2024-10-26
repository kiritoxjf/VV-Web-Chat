// import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/base.scss'
import './scripts/global_click.ts'
import Routes from './routes/index.tsx'
import { StrictMode } from 'react'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Routes />
  </StrictMode>
)
