import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import {
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  Home as HomeIcon,
  Image,
  PieChart,
  Wallet,
   Repeat, // ✅ Swap icon
} from 'lucide-react';

import Home from './pages/Home';
import NFT from './pages/NFT';
import Portfolio from './pages/Portfolio';
import WalletAnalyzer from './pages/WalletAnalyzer';
import Swap from './pages/SwapPage';

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false); // ✅ Chat toggle

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const toggleMobile = () => setMobileOpen(!mobileOpen);
  const closeMobile = () => setMobileOpen(false);

  const navItems = [
    { name: 'Token Analyzer ', path: '/', icon: <HomeIcon size={20} /> },
    { name: 'NFT Analyzer ', path: '/nft', icon: <Image size={20} /> },
    { name: 'Portfolio Analyzer', path: '/portfolio', icon: <PieChart size={20} /> },
    { name: 'Wallet Analyzer', path: '/wallet-analyzer', icon: <Wallet size={20} /> },
    { name: 'Swap', path: '/swap-page', icon: <Repeat size={20} /> },
  ];

  return (
    <BrowserRouter>
      <div className="relative min-h-screen bg-gray-900 text-white">
        {/* Sidebar for Desktop */}
        <aside
          className={`fixed top-0 left-0 h-screen bg-gray-800 p-4 transition-all duration-300 z-30 ${
            sidebarOpen ? 'w-64' : 'w-16'
          } hidden lg:flex flex-col justify-between`}
        >
          <div>
            <div className="flex items-center justify-between mb-6">
              {sidebarOpen && (
                <div className="text-2xl font-bold flex items-center gap-2">
                  <img src="logob.png" alt="logo" className="h-8 w-8" />
                  ETH IQ
                </div>
              )}
              <button onClick={toggleSidebar}>
                {sidebarOpen ? <ChevronLeft /> : <ChevronRight />}
              </button>
            </div>

            <nav className="flex flex-col gap-4">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.path}
                  className="flex items-center gap-3 hover:text-blue-400"
                >
                  {item.icon}
                  {sidebarOpen && item.name}
                </Link>
              ))}
            </nav>
          </div>

          {/* 💬 Chat Button (Desktop) */}
          <div className="mt-4">
            <button
              onClick={() => setChatOpen(true)}
              className="flex items-center gap-2 w-full bg-black text-blue-400 px-3 py-2 rounded-md hover:bg-gray-700 transition"
            >
              <span className="text-xl">💬</span>
              {sidebarOpen && <span className="text-sm font-medium">Chat with ETHIQ AGENT</span>}
            </button>
          </div>
        </aside>

        {/* Sidebar for Mobile */}
        {mobileOpen && (
          <div className="fixed inset-0 z-40 bg-gray-900 flex flex-col p-4 lg:hidden">
            <div className="flex items-center justify-between mb-6">
              <div className="text-2xl font-bold flex items-center gap-2">
                <img src="logob.png" alt="logo" className="h-8 w-8" />
                ETH IQ
              </div>
              <button onClick={closeMobile}>
                <X size={28} />
              </button>
            </div>

            <nav className="flex flex-col gap-6 text-lg">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.path}
                  onClick={closeMobile}
                  className="flex items-center gap-3 hover:text-blue-400"
                >
                  {item.icon}
                  {item.name}
                </Link>
              ))}

              {/* 💬 Chat Button (Mobile) */}
              <button
                onClick={() => {
                  closeMobile();
                  setChatOpen(true);
                }}
                className="flex items-center gap-2 mt-4 bg-black text-blue-400 px-3 py-2 rounded-md hover:bg-gray-700 transition"
              >
                <span className="text-xl">💬</span>
                <span className="text-sm font-medium">Chat with ETHIQ AGENT</span>
              </button>
            </nav>
          </div>
        )}

        {/* Mobile Hamburger Icon */}
        {!mobileOpen && (
          <button
            onClick={toggleMobile}
            className="lg:hidden fixed top-4 left-4 z-50 text-white"
          >
            <Menu size={28} />
          </button>
        )}

        {/* Main Content */}
        <main
          className={`transition-all duration-300 overflow-y-auto min-h-screen ${
            sidebarOpen ? 'lg:ml-64' : 'lg:ml-16'
          }`}
        >
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/nft" element={<NFT />} />
            <Route path="/portfolio" element={<Portfolio />} />
            <Route path="/wallet-analyzer" element={<WalletAnalyzer />} />
               <Route path="/swap-page" element={<Swap />} />
          </Routes>
        </main>

        {/* 💬 Chat Popup - LEFT side */}
        {chatOpen && (
          <div className="fixed bottom-4 left-4 bg-white text-black w-80 shadow-lg rounded-lg z-50 flex flex-col">
            <div className="flex justify-between items-center p-3 border-b">
              <h2 className="font-semibold text-lg">ETHIQ AI Chat</h2>
              <button
                onClick={() => setChatOpen(false)}
                className="text-gray-600 hover:text-red-500"
              >
                ✖
              </button>
            </div>
            
            <div className="p-3 text-sm bg-gray-100 h-32 overflow-y-auto rounded-b">
              Hi! ETHIQ AI Agent is currently <strong>offline</strong>. Please try again later.
            </div>
            <div className="p-2 border-t bg-gray-200 flex items-center gap-2">
              <input
                type="text"
                className="flex-grow px-3 py-1 rounded-md border border-gray-300 text-sm"
                placeholder="Type your message..."
                disabled
              />
              <button
                className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 text-sm"
                disabled
              >
                Send
              </button>
            </div>
          </div>
        )}
      </div>
    </BrowserRouter>
  );
}

export default App;
