import React from 'react';
import ReactDOM from 'react-dom/client';
import { HeroUIProvider } from '@heroui/react';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import './index.css';

function App() {
  return (
    <div className="dark text-foreground bg-background min-h-screen flex flex-col justify-between">
      <div>
        <Header />
        <Home />
      </div>
      <Footer />
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
