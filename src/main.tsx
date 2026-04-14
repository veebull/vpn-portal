import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter, Routes, Route } from 'react-router-dom'
import App from './App.tsx'
import { DeepLinkRedirect } from './components/DeepLinkRedirect.tsx'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HashRouter>
      <Routes>
        {/* Deep link redirect: /#/open/<encodedDeeplink> */}
        <Route path="/open/:encodedDeeplink" element={<DeepLinkRedirect />} />
        <Route path="*" element={<App />} />
      </Routes>
    </HashRouter>
  </StrictMode>,
)
