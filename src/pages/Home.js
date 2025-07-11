import React, { useState, useEffect } from 'react';
import { BrowserProvider } from 'ethers';
import axios from 'axios'; 
import { Typewriter } from 'react-simple-typewriter';
 
import NewEthTokens from '../components/NewEthTokens'; 
 

function App() {
  const [walletAddress, setWalletAddress] = useState('');
  const [tokenAddress, setTokenAddress] = useState('');
  const [tokenData, setTokenData] = useState(null);
  const [error, setError] = useState('');
  const [riskData, setRiskData] = useState(null);
  const [riskStatus, setRiskStatus] = useState('');
  const [topTokens, setTopTokens] = useState([]);
  const [showModal, setShowModal] = useState(false);

  

  useEffect(() => {
    const topEthTokens = [
       {
        name: "PEPE",
        address: "0x6982508145454Ce325dDbE47a25d4ec3d2311933",
        icon: "https://dd.dexscreener.com/ds-data/tokens/ethereum/0x6982508145454ce325ddbe47a25d4ec3d2311933.png?size=lg&key=7d789c"
      },
       {
        name: "Peezy",
        address: "0x698b1d54E936b9F772b8F58447194bBc82EC1933",
        icon: "https://dd.dexscreener.com/ds-data/tokens/ethereum/0x698b1d54e936b9f772b8f58447194bbc82ec1933.png?size=lg&key=452bc0"
      },
       {
        name: "TRWA",
        address: "0x7b10d50b5885bE4c7985A88408265c109bd1EeC8",
        icon: "https://dd.dexscreener.com/ds-data/tokens/ethereum/0x7b10d50b5885be4c7985a88408265c109bd1eec8.png?size=lg&key=b3c842"
      },
       {
        name: "MANYU",
        address: "0x95AF4aF910c28E8EcE4512BFE46F1F33687424ce",
        icon: "https://dd.dexscreener.com/ds-data/tokens/ethereum/0x95af4af910c28e8ece4512bfe46f1f33687424ce.png"
      },
       {
        name: "Gasspas",
        address: "0x774eaF7A53471628768dc679dA945847d34b9a55",
        icon: "https://dd.dexscreener.com/ds-data/tokens/ethereum/0x774eaf7a53471628768dc679da945847d34b9a55.png?size=lg&key=dd1897"
      },
      {
        name: "MANYU",
        address: "0x95AF4aF910c28E8EcE4512BFE46F1F33687424ce",
        icon: "https://dd.dexscreener.com/ds-data/tokens/ethereum/0x95af4af910c28e8ece4512bfe46f1f33687424ce.png"
      },
      {
        name: "MASA",
        address: "0x1720257b0C2324b21961B6f632A2aBd39587e46A",
        icon: "https://dd.dexscreener.com/ds-data/tokens/ethereum/0x1720257b0c2324b21961b6f632a2abd39587e46a.png"
      },
      {
        name: "AP",
        address: "0xe60e9BD04ccc0a394f1fDf29874e35a773cb07f4",
        icon: "https://dd.dexscreener.com/ds-data/tokens/ethereum/0xe60e9bd04ccc0a394f1fdf29874e35a773cb07f4.png"
      },
      {
        name: "TAP",
        address: "0x8080779E8366ea28Cd1C99bD66aC6D04fcE73BF9",
        icon: "https://dd.dexscreener.com/ds-data/tokens/ethereum/0x8080779e8366ea28cd1c99bd66ac6d04fce73bf9.png"
      },
      {
        name: "SOLX",
        address: "0xe0B7AD7F8F26e2b00C8b47b5Df370f15F90fCF48",
        icon: "https://dd.dexscreener.com/ds-data/tokens/ethereum/0xe0b7ad7f8f26e2b00c8b47b5df370f15f90fcf48.png"
      }
    ];
    setTopTokens(topEthTokens);
  }, []);

  const connectWallet = async () => {
  if (!window.ethereum) {
    alert("Install MetaMask to continue");
    return;
  }

  try {
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    setWalletAddress(accounts[0]);
    console.log("Wallet connected:", accounts[0]);
  } catch (err) {
    console.error("Wallet connection failed", err);
  }
};


const summarizeRisk = (data) => {
  const issues = [];

  if (data.is_honeypot !== '0') issues.push("it might be a honeypot");
  if (data.cannot_sell_all !== '0') issues.push("you may not be able to sell all your tokens");
  if (data.can_take_back_ownership !== '0') issues.push("ownership can be taken back by the creator");
  if (data.slippage_modifiable !== '0') issues.push("slippage settings can be changed at any time");

  if (issues.length === 0) {
    return {
      text: "✅ This token appears to be safe based on smart contract checks. You may consider buying it on Uniswap — but always DYOR (Do Your Own Research).",
      color: "text-green-400"
    };
  }

  if (issues.length === 1) {
    return {
      text: `⚠️ This token has 1 minor warning: ${issues[0]}. It might still be tradable, but proceed with caution.`,
      color: "text-yellow-400"
    };
  }

  return {
    text: `❌ This token shows multiple risks: ${issues.join(", ")}. It may not be safe to buy. Avoid trading unless you're fully aware of the risks.`,
    color: "text-red-400"
  };
};


  const analyzeToken = async (address = tokenAddress) => {
    setError('');
    setTokenData(null);
    setRiskData(null);
    setRiskStatus('');
    setTokenAddress(address);
    setShowModal(true);

    try {
      const response = await axios.get(
        `https://api.dexscreener.com/latest/dex/search?q=${address}`
      );
      const pairData = response.data.pairs?.[0];
      if (!pairData) throw new Error("No pairs found");
      setTokenData(pairData);

      const securityResponse = await axios.get(
        `https://api.gopluslabs.io/api/v1/token_security/1?contract_addresses=${address}`
      );
      const tokenSecurity = securityResponse.data.result[address.toLowerCase()];
      setRiskData(tokenSecurity);

      const isSafe =
        tokenSecurity.is_honeypot === '0' &&
        tokenSecurity.cannot_sell_all === '0';

      setRiskStatus(
        isSafe
          ? '✅ SAFE – Low Risk of Honeypot'
          : '⚠️ WARNING – Risk Detected (Do Your Own Research)'
      );
    } catch (err) {
      console.error("Token fetch failed", err);
      setError("Failed to fetch token data. Please check the contract address.");
    }
  };

  const renderRiskDetail = (label, value) => {
    const safe = value === '0';
    return (
      <p>
        <strong>{label}:</strong>{' '}
        <span className={safe ? 'text-green-400' : 'text-red-400'}>
          {safe ? '✅ Safe' : '❌ Risky'}
        </span>
      </p>
    );
  };

  return (
    <div className="bg-gray-950 min-h-screen text-white p-6">
      {/* Header */}
      <header className="flex justify-between items-center mb-8">
        <div className="text-2xl font-bold flex items-center gap-2">
          
        </div>
        <button
          onClick={connectWallet}
          className="bg-blue-600 px-4 py-2 rounded hover:bg-blue-700 transition"
        >
          {walletAddress ? `Connected: ${walletAddress.slice(0, 6)}...` : 'Connect Wallet'}
        </button>
      </header>

      {/* Hero Section */}
<div className="text-center mb-12">
  <img
    src="logob.png" // <- replace with your actual logo path (e.g., public/logo.png)
    alt="EthIQ Logo"
    className="mx-auto w-20 h-20 md:w-28 md:h-28 mb-4"
  />
  <h1 className="text-3xl md:text-5xl font-extrabold text-white mb-2">EthIQ</h1>
  <p className="text-gray-400 max-w-xl mx-auto text-lg md:text-xl">
    AI-powered Ethereum Token Analyzer – Check safety, honeypot risk, and live data instantly.
  </p>
</div>
  
 
 

  
   

      {/* Analyze input */}
      <div className="flex flex-col md:flex-row gap-4 mb-10">


        
        <input
          placeholder="Paste Ethereum token address"
          value={tokenAddress}
          onChange={(e) => setTokenAddress(e.target.value)}
          className="p-3 text-black w-full rounded"
        />
        <button
          onClick={() => analyzeToken()}
          className="bg-blue-600 px-6 py-3 rounded hover:bg-green-700 transition"
        >
          Analyze
        </button>
      </div>

      {/* Top Tokens */}
      <section>
        <h3 className="text-xl font-semibold mb-4">🔥 Featured Tokens</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {topTokens.map((token) => (
            <div
              key={token.address}
              onClick={() => analyzeToken(token.address)}
              className="bg-gray-800 p-4 rounded-lg hover:bg-gray-700 cursor-pointer text-center transition"
            >
              <img src={token.icon} alt={token.name} className="w-12 h-12 mx-auto rounded-full mb-2" />
              <h4 className="text-lg font-medium">{token.name}</h4>
              <p className="text-xs text-gray-400">{token.address.slice(0, 10)}...</p>
            </div>
          ))}
        </div>
      </section>

      <div className="  flex items-center justify-center p-4 ad-banner gif-banner">
  <p> Place your Meme Coin here! ....</p>
     <img
          src="https://media.giphy.com/media/ICOgUNjpvO0PC/giphy.gif" // or "/assets/memecoin.gif"
          alt="MemeCoin Rocket"
          className="banner-gif"
        />
</div>
    
 
     <NewEthTokens  />

         

      {/* Modal for Analysis */}
      {showModal && tokenData && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
          <div className="bg-gray-900 p-6 rounded-xl max-w-4xl w-full mx-4 overflow-y-auto max-h-[90vh] relative">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-6 text-2xl text-white"
            >
              &times;
            </button>
            <h3 className="text-2xl mb-6">📊 Token Analysis</h3>
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <p><strong>Name:</strong> {tokenData.baseToken.name}</p>
                <p><strong>Symbol:</strong> {tokenData.baseToken.symbol}</p>
                <p><strong>Price USD:</strong> ${tokenData.priceUsd}</p>
                <p><strong>Liquidity:</strong> ${tokenData.liquidity.usd}</p>
                <p><strong>Volume 24h:</strong> ${tokenData.volume.h24}</p>
                <p><strong>DEX:</strong> {tokenData.dexId}</p>
                <a
                  href={tokenData.url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-blue-400"
                >
                  View on Dexscreener
                </a>
              </div>

            {riskData && (() => {
  const riskSummary = summarizeRisk(riskData);
  return (
    <div>
      <h4 className="text-lg font-semibold mb-2">🔐 Token Security</h4>
      <p className={`font-semibold mb-4 ${riskSummary.color}`}>
       <Typewriter
    words={[riskSummary.text]}
    loop={1}
    cursor
    cursorStyle="_"
    typeSpeed={35}
    deleteSpeed={0}
    delaySpeed={1000}
  />
      </p>
      <div className="grid grid-cols-1 gap-1 text-sm text-gray-300">
        {renderRiskDetail("Honeypot", riskData.is_honeypot)}
        {renderRiskDetail("Cannot Sell All", riskData.cannot_sell_all)}
        {renderRiskDetail("Can Take Back Ownership", riskData.can_take_back_ownership)}
        {renderRiskDetail("Slippage Modifiable", riskData.slippage_modifiable)}
      </div>
    </div>
  );
})()}

            </div>

       

 
            {/* Live Chart */}
            <div className="mt-6">
              <h4 className="text-lg font-semibold mb-2">📉 Live Chart</h4>
              <iframe
                title="Dexscreener Chart"
                src={`https://dexscreener.com/ethereum/${tokenData.pairAddress}?theme=dark&embed=1`}
                width="100%"
                height="400"
                className="rounded border border-gray-700"
                allowFullScreen
              ></iframe>
            </div>
          </div>
        </div>
      )}

      {error && <p className="text-red-400 mt-6">{error}</p>}
    </div>

    
  );
}
      

export default App;
