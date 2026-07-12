import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import { ErrorBoundary } from './components/shared/ErrorBoundary.jsx'

// O ErrorBoundary envolve toda a aplicação, no ponto mais alto possível.
// Sem isto, qualquer erro de renderização em qualquer componente (em
// qualquer profundidade da árvore) fazia o React desmontar tudo
// silenciosamente, resultando num ecrã completamente em branco sem
// nenhuma mensagem — o que já aconteceu e era impossível de diagnosticar
// sem esta camada de captura.
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
)

// Nota: o registo do Service Worker é feito em index.html, não aqui —
// aquele local verifica location.hostname !== "localhost" para não
// interferir com o hot-reload durante o desenvolvimento local.
