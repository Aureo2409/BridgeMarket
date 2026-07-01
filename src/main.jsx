import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
ReactDOM.createRoot(document.getElementById('root')).render(<React.StrictMode><App /></React.StrictMode>)

// Nota: o registo do Service Worker é feito em index.html, não aqui —
// aquele local verifica location.hostname !== "localhost" para não
// interferir com o hot-reload durante o desenvolvimento local.
