import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import './style.css'
import { initializeOneSignal } from './utils/onesignal'

// Initialize OneSignal on app start
initializeOneSignal().catch(console.error)

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter basename="/react_project/productsnap">
      <App />
    </BrowserRouter>
  </React.StrictMode>,
)

