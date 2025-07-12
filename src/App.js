import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
 import RugCheckModal from "./RugCheckModal";


import {
    Menu,
  X,
  ChevronLeft,
  ChevronRight,
  HomeIcon,
  Image,
  PieChart,
  Wallet,
  Repeat,
  Star,
  Bell,
  BarChart2,
  PlusSquare,
  TrendingUp,
  Megaphone,
  Globe,
  Rocket,
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
      { name: 'Home', path: '/', icon: <HomeIcon size={20} /> },
     { name: 'Watchlist', url: '/watchlist', icon: <Star size={20} /> },
  { name: 'Alerts', url: null, icon: <Bell size={20} /> },
  { name: 'Multicharts', url: '/multicharts', icon: <BarChart2 size={20} /> },
  { name: 'New Pairs', url: '/new-pairs', icon: <PlusSquare size={20} /> },
  { name: 'Gainers & Losers', url: '/gainers', icon: <TrendingUp size={20} /> },
    { name: 'Portfolio', path: '/wallet-analyzer', icon: <Wallet size={20} /> }, 
  { name: 'Tokenomics', url: '/moonshot', icon: <Rocket size={20} /> },
    { name: 'Swap', path: '/swap-page', icon: <Repeat size={20} /> },
  ];

  return (
    <BrowserRouter>

       <RugCheckModal />
      <div className="relative min-h-screen bg-gray-900 text-white">
        {/* Sidebar for Desktop */}
        <aside
          className={`fixed top-0 left-0 h-screen bg-gray-800 p-4 transition-all duration-300 z-30 ${
            sidebarOpen ? 'w-52' : 'w-14'
          } hidden lg:flex flex-col justify-between`}
        >
          <div>
            <div className="flex items-center justify-between mb-6">
              {sidebarOpen && (
                <div className="text-l font-bold flex items-center gap-2">
                 <img src="logo.png" alt="logo" className="h-8 w-8" />
                 Grokscreener
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

          {/* Social icons at the bottom */}
<div className="mt-auto pt-6">
  <div className="flex justify-center gap-3">
    <a
      href="https://x.com/GrokDex_Eth"
      target="_blank"
      rel="noopener noreferrer nofollow"
      className="hover:text-blue-400"
      title="Follow us on Twitter"
    >
      <svg viewBox="0 0 512 512" height="20" width="20" fill="currentColor">
        <path d="M389.2 48h70.6L305.6 224.2 487 464H345L233.7 318.6 106.5 464H35.8L200.7 275.5 26.8 48H172.4L272.9 180.9 389.2 48zM364.4 421.8h39.1L151.1 88h-42L364.4 421.8z" />
      </svg>
    </a>
    <a
      href="https://t.me/GrokDexERC"
      target="_blank"
      rel="noopener noreferrer nofollow"
      className="hover:text-blue-400"
      title="Join us on Telegram"
    >
      <svg viewBox="0 0 448 512" height="20" width="20" fill="currentColor">
        <path d="M446.7 98.6l-67.6 318.8c-5.1 22.5-18.4 28.1-37.3 17.5l-103-75.9-49.7 47.8c-5.5 5.5-10.1 10.1-20.7 10.1l7.4-104.9 190.9-172.5c8.3-7.4-1.8-11.5-12.9-4.1L117.8 284 16.2 252.2c-22.1-6.9-22.5-22.1 4.6-32.7L418.2 66.4c18.4-6.9 34.5 4.1 28.5 32.2z" />
      </svg>
    </a>
    <a
      href="#"
      target="_blank"
      rel="noopener noreferrer nofollow"
      className="hover:text-blue-400"
      title="Join us on Discord"
    >
      <svg viewBox="0 0 640 512" height="20" width="20" fill="currentColor">
        <path d="M524.531 69.836a1.5 1.5 0 0 0-.764-.7A485.065 485.065 0 0 0 404.081 32.03a1.816 1.816 0 0 0-1.923.91 337.461 337.461 0 0 0-14.9 30.6 447.848 447.848 0 0 0-134.426 0 309.541 309.541 0 0 0-15.135-30.6 1.89 1.89 0 0 0-1.924-.91 483.689 483.689 0 0 0-124.611 36.807 1.712 1.712 0 0 0-.788.676C39.068 183.651 18.186 294.69 28.43 404.354a2.016 2.016 0 0 0 .765 1.375A487.666 487.666 0 0 0 176.02 479.918a1.9 1.9 0 0 0 2.063-.676 348.2 348.2 0 0 0 30.037-48.842 1.86 1.86 0 0 0-1.019-2.588 321.173 321.173 0 0 1-45.868-21.853 1.885 1.885 0 0 1-.185-3.126c3.082-2.309 6.166-4.711 9.109-7.137a1.819 1.819 0 0 1 1.9-.256c96.229 43.917 200.41 43.917 295.5 0a1.812 1.812 0 0 1 1.924.233c2.944 2.426 6.027 4.851 9.132 7.16a1.884 1.884 0 0 1-.162 3.126 301.407 301.407 0 0 1-45.89 21.83 1.875 1.875 0 0 0-1 2.611 391.055 391.055 0 0 0 30.014 48.815 1.864 1.864 0 0 0 2.063.7A486.048 486.048 0 0 0 610.7 405.729a1.882 1.882 0 0 0 .765-1.352C623.729 277.594 590.933 167.465 524.531 69.836zM222.491 337.58c-28.972 0-52.844-26.587-52.844-59.239s23.409-59.239 52.844-59.239c29.665 0 53.306 26.82 52.843 59.239.459 32.419-22.951 59.239-52.843 59.239zm195.38 0c-28.971 0-52.843-26.587-52.843-59.239s23.409-59.239 52.843-59.239c29.667 0 53.307 26.82 52.844 59.239.459 32.419-22.951 59.239-52.844 59.239z"/>
      </svg>
    </a>

    {/* Lights toggle (placeholder button) */}
    <button
      type="button"
      className="hover:text-yellow-400"
      title="Lights on"
    >
      <svg viewBox="0 0 512 512" height="20" width="20" fill="currentColor">
        <path d="M256 160c-52.9 0-96 43.1-96 96s43.1 96 96 96 96-43.1 96-96-43.1-96-96-96zm246.4 80.5l-94.7-47.3 33.5-100.4c4.5-13.6-8.4-26.5-21.9-21.9l-100.4 33.5-47.4-94.8c-6.4-12.8-24.6-12.8-31 0l-47.3 94.7L92.7 70.8c-13.6-4.5-26.5 8.4-21.9 21.9l33.5 100.4-94.7 47.4c-12.8 6.4-12.8 24.6 0 31l94.7 47.3-33.5 100.5c-4.5 13.6 8.4 26.5 21.9 21.9l100.4-33.5 47.3 94.7c6.4 12.8 24.6 12.8 31 0l47.3-94.7 100.4 33.5c13.6 4.5 26.5-8.4 21.9-21.9l-33.5-100.4 94.7-47.3c13-6.5 13-24.7.2-31.1z"/>
      </svg>
    </button>
  </div>
</div>

 
        </aside>

        {/* Sidebar for Mobile */}
        {mobileOpen && (
          <div className="fixed inset-0 z-40 bg-gray-900 flex flex-col p-4 lg:hidden">
            <div className="flex items-center justify-between mb-6">
              <div className="text-2xl font-bold flex items-center gap-2">
                  <img src="logo.png" alt="logo" className="h-8 w-8" />
               
               Grokscreener
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
            sidebarOpen ? 'lg:ml-52' : 'lg:ml-14'
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
