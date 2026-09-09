import { startReactDsfr } from '@codegouvfr/react-dsfr/spa'
startReactDsfr({ defaultColorScheme: "system" })
import { createRoot } from 'react-dom/client'
import '@gouvfr/dsfr/dist/dsfr.min.css'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
    <App />
)
