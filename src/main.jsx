import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { HeroUIProvider } from '@heroui/react';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import Profile from './pages/Profile';
import Library from './pages/Library';
import Admin from './pages/Admin';
import './index.css';

function App() {
  return (
    <BrowserRouter>
      <div className="dark text-foreground bg-background min-h-screen flex flex-col justify-between">
        <div>
          <Header />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/library" element={<Library />} />
            <Route path="/admin/*" element={<Admin />} />
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
