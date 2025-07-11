import React, { useEffect, useState } from 'react';

const USAGE_COMMENTS = [
  "💹 This portfolio exhibits strong upside potential, indicating a strategic selection of high-growth tokens that could yield significant returns over time.",
  "💧 The token distribution appears balanced, suggesting a thoughtful long-term investment strategy with reduced exposure to volatility.",
  "🔋 A large proportion of stablecoins is present in this wallet, which may imply that the user is either hedging against market risk or temporarily parking funds while awaiting new opportunities.",
  "⚡ This wallet is heavily concentrated in a single token, reflecting high conviction in that asset’s future performance—though it also comes with higher risk if the asset underperforms.",
  "🌐 The wallet contains a diverse range of tokens across different sectors, suggesting the holder is aiming for broad market exposure and portfolio resilience.",
  "📈 Recent token acquisitions show activity during market dips, indicating the user might be employing a value investing or dollar-cost averaging approach.",
  "🧠 The token mix includes several early-stage or low-cap assets, which may reflect a high-risk, high-reward strategy or strong familiarity with emerging projects.",
  "🪙 The wallet shows a preference for utility tokens, suggesting the holder is actively engaged in DeFi platforms or decentralized applications.",
];

const FEATURED_WALLETS = [
  { name: 'Whale A', address: '0x46376d00b596d120e95bfa12b025ccd23910a698' },
  { name: 'Whale B', address: '0x8221f0939cf7f12917d3142610412947648ca116' },
  { name: 'Binance hot wallet', address: '0x28c6c06298d514db089934071355e5743bf21d60' }, // Binance hot wallet
  { name: 'Whale D', address: '0xa3d97f25871b45e8780727f51d1f295a4fbf4e85' },
  { name: 'Whale E', address: '0x96237397f87f526c9503b8bb68f65234ea5fe3bb' },
  { name: 'Kraken wallet', address: '0x564286362092d8e7936f0549571a803b203aaced' }, // Kraken wallet
  { name: 'Bitfinex ', address: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e' }, // Bitfinex cold wallet
  { name: 'Top DeFi user', address: '0x66f820a414680b5bcda5eeca5dea238543f42054' }, // Top DeFi user
];

function useTypewriter(text = '', speed = 40) {
  const [displayed, setDisplayed] = useState('');
  useEffect(() => {
    setDisplayed('');
    if (!text) return;
    let i = 0;
    const id = setInterval(() => {
      setDisplayed(prev => prev + text[i]);
      i++;
      if (i >= text.length) clearInterval(id);
    }, speed);
    return () => clearInterval(id);
  }, [text, speed]);
  return displayed;
}

function formatValue(value, decimals) {
  return (Number(value) / Math.pow(10, decimals)).toFixed(2);
}

export default function PortfolioAnalyzer() {
  const [wallet, setWallet] = useState('');
  const [tokens, setTokens] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [comment, setComment] = useState('');
  const typedComment = useTypewriter(comment);

  const fetchPortfolio = async (target) => {
    if (!target) return;
    setLoading(true);
    setError('');
    setTokens([]);
    setComment('');

    try {
      const res = await fetch(`http://localhost:5001/proxy/${target}`);
      const { tokens: tokenData } = await res.json();

      if (!tokenData || !Array.isArray(tokenData) || tokenData.length === 0) {
        setError('⚠️ No tokens found for this wallet.');
        return;
      }

      const enriched = tokenData.map(t => {
        return {
          name: t.tokenName,
          symbol: t.tokenSymbol,
          balance: formatValue(t.value, t.tokenDecimal),
          logoUri: t.logoUri,
          from: t.from,
          to: t.to,
          hash: t.hash,
        };
      });

      setTokens(enriched);
      setComment(USAGE_COMMENTS[Math.floor(Math.random() * USAGE_COMMENTS.length)]);
    } catch (err) {
      console.error(err);
      setError('❌ Failed to fetch portfolio from backend.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-black text-white min-h-screen p-6">
      <div className="text-center mt-20">
        <img
          src="logob.png"
          alt="EthIQ Logo"
          className="mx-auto w-20 h-20 md:w-28 md:h-28 mb-4"
        />
        <h1 className="text-4xl font-bold text-white mb-4">Portfolio Analyzer</h1>
        <p className="text-gray-400 text-lg max-w-xl mx-auto mb-8">
          Analyze your Ethereum wallet instantly. View ERC-20 tokens and get insights powered by real-time data and AI commentary.
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <input
          className="p-3 rounded text-black w-full"
          placeholder="Enter Ethereum wallet address"
          value={wallet}
          onChange={e => setWallet(e.target.value.trim())}
        />
        <button
          onClick={() => fetchPortfolio(wallet)}
          className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded"
        >
          Analyze Wallet
        </button>
      </div>

      {loading && <p className="text-yellow-300">🔄 Loading portfolio...</p>}
      {error && <p className="text-red-500">{error}</p>}
      {typedComment && (
        <div className="mt-4 p-3 bg-gray-800 rounded text-green-400 font-mono">
          {typedComment}
        </div>
      )}

      <h2 className="text-2xl font-semibold mt-10 mb-4">🦈 Featured Wallets</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        {FEATURED_WALLETS.map(w => (
          <div
            key={w.address}
            onClick={() => {
              setWallet(w.address);
              fetchPortfolio(w.address);
            }}
            className="bg-gray-800 p-3 rounded cursor-pointer hover:bg-gray-700"
          >
            <p className="font-semibold">{w.name}</p>
            <p className="text-xs text-gray-400 break-all">{w.address}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {tokens.map((t, i) => (
          <div key={i} className="bg-gray-800 p-4 rounded shadow">
            <div className="flex items-center gap-3">
              {t.logoUri && (
                <img
                  src={t.logoUri}
                  alt={`${t.symbol} logo`}
                  className="w-10 h-10 rounded"
                />
              )}
              <div>
                <p className="font-bold">{t.name} ({t.symbol})</p>
                <p className="text-green-400">{t.balance}</p>
              </div>
            </div>
            <div className="mt-2 text-sm text-gray-300">
              <p>From: {t.from}</p>
              <p>To: {t.to}</p>
              <a
                className="text-blue-400 underline"
                href={`https://etherscan.io/tx/${t.hash}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                🔗 View on Etherscan
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
