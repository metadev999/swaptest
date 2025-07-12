import React, { useEffect, useState } from "react";

function RugCheckPopup() {
  const [show, setShow] = useState(true);

  const handleClose = () => setShow(false);

  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key === "Enter") handleClose();
    };
    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, []);

  if (!show) return null;

  return (
    <div className="fixed top-10 left-1/2 transform -translate-x-1/2 z-50 max-w-md w-full p-6 bg-zinc-900 text-white rounded-2xl shadow-xl border border-zinc-700">
      <div className="flex justify-between items-start mb-4"><div className="text-center">
  <img src="logo.png" alt="logo" className="inline-block w-20" />
</div>
        <h2 className="text-xl font-bold"> GrokDex Rug Check Key Features</h2>
        <button
          onClick={handleClose}
          className="text-zinc-400 hover:text-white text-sm px-2 py-1"
        >
          ✖
        </button>
      </div>
      <ul className="list-disc pl-5 text-sm space-y-2">
        <li>
          <strong>Ownership controls:</strong> Are the contract’s ownership or admin
          functions centralized?
        </li>
        <li>
          <strong>Blacklist features:</strong> Can wallets be frozen or blocked?
        </li>
        <li>
          <strong>Mint/burn authority:</strong> Can tokens be minted or burned at will?
        </li>
        <li>
          <strong>Timelocks & renouncement:</strong> Are crucial functions time-locked or renounced?
        </li>
      </ul>
      <div className="my-4 text-sm">
        <p className="font-bold">🔍 Why It Matters</p>
        <ul className="list-disc pl-5 mt-1 space-y-1">
          <li>Prevents rug pulls and honeypots</li>
          <li>Protects your funds from hidden admin powers</li>
          <li>Boosts peace of mind with contract transparency</li>
        </ul>
      </div>
      <div className="text-sm">
        <p className="font-bold">✅ ETH Contract Rug-Check Checklist</p>
        <ul className="list-disc pl-5 mt-1 space-y-1">
          <li>🕵️ Ownership & Admin – Are they renounced or time-locked?</li>
          <li>⚠️ Blacklists/Mint Functions – Can tokens be restricted?</li>
          <li>🔐 Liquidity Locks – Any external audit or verified lock?</li>
        </ul>
      </div>
    </div>
  );
}

export default RugCheckPopup;
