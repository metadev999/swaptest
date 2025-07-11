import React, { useEffect, useState } from "react";
import axios from "axios";
import { Typewriter } from "react-simple-typewriter";

const NewEthTokens = ({ onAnalyze }) => {
  const [coins, setCoins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedToken, setSelectedToken] = useState(null);
  const [analysisText, setAnalysisText] = useState("");
  const [showText, setShowText] = useState(false);

  useEffect(() => {
    axios
      .get("https://api.coingecko.com/api/v3/search/trending")
      .then((res) => {
        const items = (res.data.coins || []).map((c) => c.item);
        setCoins(items);
      })
      .catch((err) => console.error("❌ Trending fetch error:", err.message))
      .finally(() => setLoading(false));
  }, []);

  const copyToClipboard = (address) => {
    if (!address) return alert("No address available");
    navigator.clipboard
      .writeText(address)
      .then(() => alert("Copied to clipboard!"))
      .catch(() => alert("Failed to copy!"));
  };

  const analyseToken = (token) => {
    if (!token) return;
    setSelectedToken(token);
    setShowText(false);

    let message = "";
    const { market_cap_rank: rank } = token;

    if (!rank) {
      message = "⚠️ No market rank data available. Exercise caution and do your own research.";
    } else if (rank < 100) {
      message =
        "✅ This token ranks well below 100, indicating strong market momentum and high investor interest. It's potentially a good short-to-mid-term opportunity — though always consider broader market trends.";
    } else if (rank < 300) {
      message =
        "🟡 This token holds a moderate market rank. It could offer upside potential, but further research is recommended. Consider team background, use case, and recent news.";
    } else {
      message =
        "❌ This token has a weak market presence. It may be illiquid, volatile, or recently launched. High risk — not recommended unless you're highly familiar with the project.";
    }

    setAnalysisText(message);
    setTimeout(() => setShowText(true), 200); // delay start to sync typewriter
    onAnalyze?.(token.contract_address);
  };

  return (
    <div className="p-6 rounded-xl mb-8">
      <h2 className="text-2xl font-semibold mb-6">Trending Crypto</h2>

      {loading ? (
        <p>Loading…</p>
      ) : coins.length === 0 ? (
        <p>No trending coins found.</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {coins.map((token) => (
            <div
              key={token.id}
              onClick={() => analyseToken(token)}
              className="bg-gray-800 p-4 rounded-lg hover:bg-gray-700 cursor-pointer transition text-center"
            >
              <img
                src={token.thumb}
                alt={token.name}
                className="w-10 h-10 mx-auto mb-2 rounded-full"
              />
              <strong>{token.name}</strong>
              <p className="text-sm text-gray-400">
                Rank: {token.market_cap_rank ?? "N/A"}
              </p>
              <p className="text-xs text-gray-400 mb-2">
                {token.symbol?.toUpperCase()}
              </p>
            </div>
          ))}
        </div>
      )}

      {selectedToken && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
          <div className="bg-gray-900 text-white p-6 rounded-xl max-w-lg w-full relative shadow-lg border border-gray-700">
            <button
              onClick={() => {
                setSelectedToken(null);
                setAnalysisText("");
                setShowText(false);
              }}
              className="absolute top-2 right-3 text-gray-400 hover:text-white text-xl"
            >
              ×
            </button>

            <div className="text-center">
              <img
                src={selectedToken.image || selectedToken.thumb}
                alt={selectedToken.name}
                className="w-12 h-12 mx-auto mb-2"
              />
              <h3 className="text-xl font-bold mb-2">{selectedToken.name}</h3>
              <p>
                <strong>Symbol:</strong> {selectedToken.symbol?.toUpperCase()}
              </p>
              <p>
                <strong>Rank:</strong> {selectedToken.market_cap_rank ?? "N/A"}
              </p>
              {selectedToken.contract_address && (
                <p className="break-all mt-2">
                  <strong>Address:</strong> {selectedToken.contract_address}
                  <button
                    onClick={() => copyToClipboard(selectedToken.contract_address)}
                    className="ml-2 text-blue-400 hover:text-blue-200 text-sm"
                  >
                    📋 Copy
                  </button>
                </p>
              )}
            </div>

            <div className="mt-6 bg-gray-800 p-4 rounded-md text-sm font-mono min-h-[80px]">
              <strong>Analysis:</strong>
              <p className="mt-2 text-gray-300 whitespace-pre-line">
                {showText ? <Typewriter words={[analysisText]} loop={1} cursor={false} typeSpeed={30} /> : null}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NewEthTokens;
