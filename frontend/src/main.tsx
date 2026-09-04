import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { startReactDsfr } from "@codegouvfr/react-dsfr/spa";
import './index.css'
import App from './App.tsx'

//import 'dist/dsfr.min.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)