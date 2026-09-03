import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { startReactDsfr } from "@codegouvfr/react-dsfr/spa";
import App from './App.tsx'

startReactDsfr({ defaultColorScheme: "system" });

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)