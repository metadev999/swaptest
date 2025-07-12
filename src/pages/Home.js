import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Typewriter } from 'react-simple-typewriter';
import NewEthTokens from '../components/NewEthTokens';

function App() {
  const [walletAddress, setWalletAddress] = useState('');
  const [tokenAddress, setTokenAddress] = useState('0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984'); // UNI default
  const [tokenData, setTokenData] = useState(null);
  const [error, setError] = useState('');
  const [riskData, setRiskData] = useState(null);
  const [topTokens, setTopTokens] = useState([]);
  const [swapTokenAddress, setSwapTokenAddress] = useState('');
  const analysisRef = useRef();

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
        name: "MASA",
        address: "0x1720257b0C2324b21961B6f632A2aBd39587e46A",
        icon: "https://dd.dexscreener.com/ds-data/tokens/ethereum/0x1720257b0c2324b21961b6f632a2abd39587e46a.png"
      },
      {
        name: "AP",
        address: "0xe60e9BD04ccc0a394f1fDf29874e35a773cb07f4",
        icon: "https://dd.dexscreener.com/ds-data/tokens/ethereum/0xe60e9bd04ccc0a394f1fdf29874e35a773cb07f4.png"
      },
      
    ];
    setTopTokens(topEthTokens);
    analyzeToken(tokenAddress);
  }, []);

  const connectWallet = async () => {
    if (!window.ethereum) return alert("Install MetaMask to continue");
    try {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      setWalletAddress(accounts[0]);
    } catch (err) {
      console.error("Wallet connection failed", err);
    }
  };

  const summarizeRisk = (data) => {
    const issues = [];
    if (data.is_honeypot !== '0') issues.push("it might be a honeypot");
    if (data.cannot_sell_all !== '0') issues.push("you may not be able to sell all your tokens");
    if (data.can_take_back_ownership !== '0') issues.push("ownership can be taken back");
    if (data.slippage_modifiable !== '0') issues.push("slippage can be changed");

    if (issues.length === 0) {
      return { text: "✅ Token looks safe. DYOR always.", color: "text-green-400" };
    } else if (issues.length === 1) {
      return { text: `⚠️ 1 minor risk: ${issues[0]}`, color: "text-yellow-400" };
    }
    return { text: `❌ Risks: ${issues.join(', ')}`, color: "text-red-400" };
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

  const analyzeToken = async (address) => {
    setError('');
    setTokenData(null);
    setRiskData(null);
    setTokenAddress(address);
    setSwapTokenAddress(address);

    try {
      const response = await axios.get(`https://api.dexscreener.com/latest/dex/search?q=${address}`);
      const pairData = response.data.pairs?.[0];
      if (!pairData) throw new Error("No pairs found");
      setTokenData(pairData);

      const securityRes = await axios.get(`https://api.gopluslabs.io/api/v1/token_security/1?contract_addresses=${address}`);
      const tokenSec = securityRes.data.result[address.toLowerCase()];
      setRiskData(tokenSec);

      setTimeout(() => {
        analysisRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 300);
    } catch (err) {
      console.error("Token fetch failed", err);
      setError("❌ Could not fetch token data.");
    }
  };

  return (
    <div className="bg-gray-950 min-h-screen text-white p-6">
      {/* Header */}
       <header className=" mb-8">
        
   <section className="mb-6 mb-6 flex items-center justify-between">
  <h3 className="text-base font-semibold text-white mb-2">
    🔥 Trending Dex Tokens
  </h3>

   {/* Connect button (always visible) */}
    <button
      onClick={connectWallet}
      className="flex-none bg-blue-600 px-4 py-2 rounded hover:bg-blue-700 text-white text-sm"
    >
      {walletAddress ? `${walletAddress.slice(0, 6)}…` : 'Connect Wallet'}
    </button>

  
</section>



<div className="flex items-center space-x-4">
    {/* Token scroller */}
    <div className="flex-1 overflow-x-auto no-scrollbar">
      <div className="flex space-x-3">
        {topTokens.map((token, idx) => (
          <div
            key={token.address}
            onClick={() => analyzeToken(token.address)}
            className="flex items-center space-x-2 bg-gray-800 hover:bg-gray-700 px-3 py-2 rounded-lg shadow text-white text-sm cursor-pointer min-w-fit"
          >
            <span className="text-gray-400 font-semibold">#{idx + 1}</span>
            <img src={token.icon} alt={token.name} className="w-6 h-6 rounded-full" />
            <div className="flex flex-col leading-tight">
              <span className="font-semibold">{token.symbol?.toUpperCase()}</span>
              <span className="text-xs text-gray-400">{token.name}</span>
            </div>
            <span className="text-yellow-400 font-medium whitespace-nowrap">
              ⚡ {token.power}
            </span>
            <span className="text-green-400 font-medium whitespace-nowrap">
              {token.gain}
            </span>
            <span className="text-teal-400 font-medium whitespace-nowrap">
              {token.time}
            </span>
          </div>
        ))}
      </div>
    </div>

   
  </div>
        
      </header>


     

      {/* Token Input */}
      <div className="flex flex-col md:flex-row gap-4 mt-10 mb-6">
        <input
          placeholder="Paste Ethereum token address"
          value={tokenAddress}
          onChange={(e) => setTokenAddress(e.target.value)}
          className="p-3 text-black w-full rounded"
        />
        <button
          onClick={() => analyzeToken(tokenAddress)}
          className="bg-blue-600 px-6 py-3 rounded hover:bg-green-700 transition"
        >
          SEARCH
        </button>
      </div>

      {/* Token Analysis */}
     <section ref={analysisRef} className="mt-6 bg-gray-900 p-6 rounded-xl">
  <h3 className="text-2xl mb-6"> </h3>
  {tokenData ? (
    <>
      {/* Full-width Chart */}
    <div
  className="relative overflow-hidden mb-12" // ✅ mb-12 adds space after the chart
  style={{ height: '460px' }}
>
  <iframe
    title="Dexscreener Chart"
    src={`https://dexscreener.com/ethereum/${tokenData.pairAddress}?theme=dark&embed=1`}
    width="100%"
    height="500px"
    className="rounded border border-gray-700"
    style={{
      border: 'none',
      marginBottom: '-60px', // Hides the logo
    }}
    allowFullScreen
  ></iframe>

  {/* Optional: fade out logo area instead */}
  {/* <div
    className="absolute bottom-0 left-0 w-full"
    style={{
      height: '60px',
      background: 'linear-gradient(to top, #111 80%, transparent)',
    }}
  ></div> */}
</div>


 
      {/* Info, Swap, Security Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Token Info (Left) */}
        <div className="bg-gray-800 p-4 rounded-xl space-y-2">
          <h4 className="text-lg font-semibold mb-2">📄 Token Info</h4>
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
            className="text-blue-400 block mt-2"
          >
            View on Dexscreener
          </a>
        </div>

        {/* Swap Widget (Center) */}
 <div
  className="bg-gray-800 p-4 rounded-xl overflow-hidden relative"
  style={{ height: '460px' }}
> 
  <h4 className="text-lg font-semibold mb-2 relative z-10">
     
  </h4>
  <div
    style={{
      position: 'absolute',
      top: '-70px',
      left: 0,
      right: 0,
      bottom: 0,
      overflow: 'hidden',
    }}
  >
    <iframe
      src={`https://app.uniswap.org/#/swap?inputCurrency=${swapTokenAddress}&outputCurrency=ETH&theme=dark`}
      title="Uniswap Swap"
      sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
      style={{
         width: '100%',
  height: '820px',
  border: 'none', 
      }}
    ></iframe>
  </div>
</div>


        {/* Security Summary (Right) */}
        <div className="bg-gray-800 p-4 rounded-xl">
          <h4 className="text-lg font-semibold mb-2">🔐 Token Security</h4>
          {riskData ? (
            <>
              <p className={`font-semibold mb-4 ${summarizeRisk(riskData).color}`}>
                <Typewriter
                  words={[summarizeRisk(riskData).text]}
                  loop={1}
                  cursor
                  cursorStyle="_"
                  typeSpeed={35}
                  deleteSpeed={0}
                  delaySpeed={1000}
                />
              </p>
              <div className="text-sm text-gray-300 space-y-1">
                {renderRiskDetail("Honeypot", riskData.is_honeypot)}
                {renderRiskDetail("Cannot Sell All", riskData.cannot_sell_all)}
                {renderRiskDetail("Can Take Back Ownership", riskData.can_take_back_ownership)}
                {renderRiskDetail("Slippage Modifiable", riskData.slippage_modifiable)}
              </div>
            </>
          ) : (
            <p>Loading risk info...</p>
          )}
        </div>
      </div>
    </>
  ) : (
    <p className="text-gray-400 text-center">🔍 Search or select a token to see live data and risks.</p>
  )}
</section>


      {/* Ad Section */}
      <div className="flex items-center justify-center mt-10 p-4 bg-gray-800 rounded-lg">
        <p className="mr-4">Place your Meme Coin here!</p>
        <img
          src="https://media.giphy.com/media/ICOgUNjpvO0PC/giphy.gif"
          alt="MemeCoin Rocket"
          className="w-12 h-12"
        />
      </div>


       {/* Featured Tokens */}
       <br></br>
     



      {/* New Tokens Feed */}

      <NewEthTokens />

      {error && <p className="text-red-400 mt-6 text-center">{error}</p>}
    </div>
  );
}

export default App;
