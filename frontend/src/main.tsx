import { startReactDsfr } from '@codegouvfr/react-dsfr/spa'
startReactDsfr({ defaultColorScheme: "system" })
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@gouvfr/dsfr/dist/dsfr.min.css'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
