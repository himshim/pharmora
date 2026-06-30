import React from 'react';
import ReactDOM from 'react-dom/client';
import { HeroUIProvider } from '@heroui/react';
import './index.css';

function App() {
  return (
    <div className="dark text-foreground bg-background min-h-screen p-8">
      <h1 className="text-3xl font-extrabold text-primary">Pharmora portal starting...</h1>
      <p className="text-text-soft mt-2">Vite, React, Tailwind and HeroUI layout initialized successfully.</p>
    </div>
  );
}

const rootEl = document.getElementById('root') || document.createElement('div');
if (!rootEl.id) {
  rootEl.id = 'root';
  document.body.appendChild(rootEl);
}

ReactDOM.createRoot(rootEl).render(
  <React.StrictMode>
    <HeroUIProvider>
      <App />
    </HeroUIProvider>
  </React.StrictMode>
);
