import React from "react";
import { Outlet, Link } from "react-router-dom";

export default function Layout() {
  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-800 p-4 text-white">
        <h2 className="text-xl font-bold mb-4">ETH IQ</h2>
        <nav className="flex flex-col gap-2">
          <Link to="/" className="hover:text-blue-400">Wallet</Link>
          <Link to="/nft" className="hover:text-blue-400">NFTs</Link>
          <Link to="/portfolio" className="hover:text-blue-400">Portfolio</Link>
             <Link to="/swappage" className="hover:text-blue-400">Swap</Link>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 bg-gray-900 text-white">
        <Outlet />
      </main>
    </div>
  );
}
