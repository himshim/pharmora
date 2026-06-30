import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { HeroUIProvider } from '@heroui/react';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import './index.css';

function AdminPlaceholder() {
  return (
    <div className="max-w-7xl mx-auto px-6 py-12 text-center text-text-soft">
      <h2 className="text-2xl font-black text-primary">Admin Workbench React Migration in Progress</h2>
      <p className="mt-2 text-sm">We are moving admin modules here in the next phase!</p>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <div className="dark text-foreground bg-background min-h-screen flex flex-col justify-between">
        <div>
          <Header />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/admin/*" element={<AdminPlaceholder />} />
          </Routes>
        </div>
        <Footer />
      </div>
    </BrowserRouter>
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
