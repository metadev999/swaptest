import React, { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import { Alchemy, Network } from 'alchemy-sdk';

// Setup Alchemy SDK
const alchemy = new Alchemy({
  apiKey: 'dn9r7Y0OODPwCvKjGYltb', // Replace with your key
  network: Network.ETH_MAINNET,
});

// Typewriter effect
function useTypewriter(text = '', speed = 30) {
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

export default function WalletAnalyzer() {
  const [walletAddress, setWalletAddress] = useState('');
  const [ethBalance, setEthBalance] = useState('');
  const [tokens, setTokens] = useState([]);
const [summary, setSummary] = useState('');
const [connecting, setConnecting] = useState(false);

const typedSummary = useTypewriter(summary);

const connectWallet = async () => {
  if (!window.ethereum) {
    alert('Please install MetaMask!');
    return;
  }

  setConnecting(true);
  try {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const accounts = await provider.send('eth_requestAccounts', []);
    const address = accounts[0];
    setWalletAddress(address);

    // Fetch ETH balance
    const balance = await provider.getBalance(address);
    const ethFormatted = parseFloat(ethers.formatEther(balance)).toFixed(14);
    setEthBalance(ethFormatted);

    // Fetch ERC-20 tokens
    const res = await alchemy.core.getTokenBalances(address);
    const nonZero = res.tokenBalances.filter(t => t.tokenBalance !== '0x0');

    const detailedTokens = await Promise.all(
      nonZero.map(async t => {
        const meta = await alchemy.core.getTokenMetadata(t.contractAddress);
        const raw = t.tokenBalance;
        const balance = ethers.formatUnits(raw, meta.decimals || 18);
        return {
          symbol: meta.symbol,
          name: meta.name,
          balance: parseFloat(balance).toFixed(4),
        };
      })
    );

    setTokens(detailedTokens);

    // AI-style Summary
    const eth = parseFloat(ethers.formatEther(balance)).toFixed(4);
    if (detailedTokens.length === 0 && parseFloat(eth) === 0) {
      setSummary(
        "😕 This wallet holds no ETH or ERC-20 tokens. " +
        "Consider funding it to start exploring DeFi, NFTs, or supporting projects."
      );
    } else {
      let ethMsg = "";
      if (eth === "0.0000") {
        ethMsg = `⚠️ You currently have ${ethFormatted} ETH. Transactions and gas fees require ETH.`;
      } else if (parseFloat(eth) < 0.05) {
        ethMsg = `💡 You hold ${ethFormatted} ETH — enough for minor transactions. Consider topping up for future gas fees.`;
      } else if (parseFloat(eth) < 1) {
        ethMsg = `✅ You have ${ethFormatted} ETH — a solid base for using dApps.`;
      } else {
        ethMsg = `💰 You hold ${ethFormatted} ETH — impressive! You're well positioned in the Ethereum ecosystem.`;
      }

      const memecoins = detailedTokens.filter(t =>
        /pepe|doge|shib|elon|floki|meme/i.test(t.name)
      );

      let tokenMsg = `📊 You hold ${detailedTokens.length} ERC-20 token(s).`;
      if (memecoins.length > 0) {
        tokenMsg += ` 🐶 Memecoins detected: ${memecoins.map(t => t.symbol).join(', ')}.`;
      }

      const diversificationMsg = detailedTokens.length > 3
        ? "🧠 Your portfolio shows healthy diversification."
        : "🔍 Consider diversifying your holdings to reduce risk.";

      setSummary(`${ethMsg}\n\n${tokenMsg} ${diversificationMsg}`);
    }

  } catch (err) {
    console.error(err);
    setSummary('❌ Failed to analyze wallet.');
  }

  setConnecting(false);
};


  return (
    <div className="bg-black text-white min-h-screen flex flex-col items-center justify-center p-6">
      <div className="text-center mt-20">
         <img
    src="logob.png" // <- replace with your actual logo path (e.g., public/logo.png)
    alt="EthIQ Logo"
    className="mx-auto w-20 h-20 md:w-28 md:h-28 mb-4"
  />
        <h1 className="text-4xl font-bold text-white mb-4"> Connect Your Wallet to Analyze</h1>
        <p className="text-gray-400 text-lg max-w-xl mx-auto mb-8">
          This tool helps you understand your Ethereum wallet. It securely reads your ETH and ERC-20
          token balances, then provides an AI-generated analysis of your portfolio — without moving any funds.
        </p>
      </div>

      {!walletAddress ? (
        <button
          onClick={connectWallet}
          className="bg-blue-600 hover:bg-green-700 px-6 py-3 rounded text-lg"
        >
          {connecting ? 'Connecting...' : 'Connect Wallet'}
        </button>
      ) : (
        <div className="w-full max-w-3xl">
          <div className="mb-4 text-center">
            <p className="text-sm text-gray-400 break-all">Connected: {walletAddress}</p>
            <p className="text-lg mt-2 text-yellow-300">ETH: {ethBalance}</p>
          </div>

          <div className="bg-gray-800 rounded p-4 mb-6">
            <h2 className="text-xl font-bold mb-2">🧠 AI Analysis</h2>
            <p className="text-green-300 font-mono whitespace-pre-line">{typedSummary}</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {tokens.map((t, i) => (
              <div key={`${t.symbol}-${i}`} className="bg-gray-800 p-4 rounded shadow">
                <p className="font-bold">{t.name} ({t.symbol})</p>
                <p className="text-green-400">{t.balance}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
