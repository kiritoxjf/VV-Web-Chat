// import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/base.scss'
import './scripts/global_click.ts'
import Routes from './routes/index.tsx'

createRoot(document.getElementById('root')!).render(
  // <StrictMode>
    <Routes />
  // </StrictMode>
)
