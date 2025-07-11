import React, { useState, useEffect } from 'react';
import axios from 'axios';

const OPENSEA_API_KEY = '3afa6a27382247e4b4fa026877e84b39';

const FEATURED_NFTS = [
  { name: 'Bored Ape Yacht Club', address: '0xbc4ca0eda7647a8ab7c2061c2e118a18a936f13d' },
  { name: 'Azuki', address: '0xed5af388653567af2f388e6224dc7c4b3241c544' },
  { name: 'Doodles', address: '0x8a90cab2b38dba80c64b7734e58ee1db38b8992e' },
  { name: 'Cool Cats', address: '0x1a92f7381b9f03921564a437210bb9396471050c' },
  { name: 'World of Women', address: '0xe785E82358879F061BC3dcAC6f0444462D4b5330' },
  { name: 'Moonbirds', address: '0x23581767a106ae21c074b2276d25e5c3e136a68b' },
  { name: 'CloneX', address: '0x49d7111e5e01c3e0c6f97cbd1500ec2e3fd48f4e' }, 
  { name: 'CryptoPunks', address: '0xb47e3cd837ddf8e4c57f05d70ab865de6e193bbb' },
  { name: 'Milady Maker', address: '0x3986c29b2c13f2e2ed6ca43f8e3d7ec0ac25da92' },
  { name: 'Pudgy Penguins', address: '0xbd3531da5cf5857e7cfaa92426877b022e612cf8' },
  { name: 'Otherside Vessels', address: '0x306b1ea3ecdf94ab739f1910bbda052ed4a9f949' },
];

const AI_COMMENTS = [
  "🤖 This NFT has strong cultural value in the crypto community.",
  "💰 The recent floor price activity suggests good flipping potential.",
  "📈 Strong holder distribution — not many paper hands here!",
  "🔍 Rarity score indicates this NFT is among the top tier in the collection.",
  "🖼️ The artwork is distinctive and has generated a lot of buzz.",
  "⚠️ Slight dip in volume recently, might be a buyer's market.",
  "🔥 Trending on OpenSea — likely to continue upward momentum.",
  "👀 High engagement on social platforms suggests real community backing.",
  "🎯 Listed below recent sales — could be a bargain opportunity.",
  "🧠 AI says: I wouldn’t fade this one just yet."
];

function useTypewriter(text, speed = 40) {
  const [displayed, setDisplayed] = useState('');

  useEffect(() => {
    setDisplayed('');
    if (!text) return;

    let i = 0;
    const interval = setInterval(() => {
      setDisplayed((prev) => prev + text[i]);
      i++;
      if (i >= text.length) clearInterval(interval);
    }, speed);

    return () => clearInterval(interval);
  }, [text, speed]);

  return displayed;
}

function NftAnalyzerApp() {
  const [walletAddress, setWalletAddress] = useState('');
  const [nftAddress, setNftAddress] = useState('');
  const [nftData, setNftData] = useState(null);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [featuredData, setFeaturedData] = useState([]);
  const [aiComment, setAiComment] = useState('');
  const typedAiComment = useTypewriter(aiComment);

  const connectWallet = async () => {
    if (!window.ethereum) return alert('Please install MetaMask');
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    setWalletAddress(accounts[0]);
  };

  const fetchOpenSeaMetadata = async (address, token_id = '1') => {
    try {
      console.log('📡 Fetching OpenSea metadata for:', address, 'Token ID:', token_id);
      const res = await axios.get(
        `https://api.opensea.io/api/v2/chain/ethereum/contract/${address}/nfts/${token_id}`,
        {
          headers: {
            'x-api-key': OPENSEA_API_KEY,
            'accept': 'application/json',
          },
        }
      );

      const nft = res.data.nft;
      return {
        name: nft.name || 'Unnamed NFT',
        image_url: nft.image_url || nft.image_preview_url || '',
        token_id: nft.identifier || token_id,
        contract_address: address,
        description: nft.description || '',
      };
    } catch (err) {
      console.error('❌ OpenSea Error:', err.response?.data || err.message);
      throw new Error(err.response?.data?.errors?.[0] || 'Could not fetch metadata from OpenSea.');
    }
  };

  const analyzeNFT = async (address, token_id = '1') => {
    setError('');
    setNftData(null);
    setShowModal(true);
    try {
      const finalAddress = address || nftAddress;
      const data = await fetchOpenSeaMetadata(finalAddress, token_id);
      setNftData(data);
      const random = AI_COMMENTS[Math.floor(Math.random() * AI_COMMENTS.length)];
      setAiComment(random);
    } catch (err) {
      setError(`❌ Could not fetch metadata. ${err.message}`);
    }
  };

  useEffect(() => {
    const loadFeatured = async () => {
      console.log('🔥 Loading featured NFTs...');
      const all = await Promise.all(
        FEATURED_NFTS.map(async (nft) => {
          try {
            const metadata = await fetchOpenSeaMetadata(nft.address, nft.token_id || '1');
            return { ...nft, ...metadata };
          } catch (e) {
            console.warn('Failed to fetch NFT:', nft.name);
            return null;
          }
        })
      );
      setFeaturedData(all.filter(Boolean));
    };
    loadFeatured();
  }, []);

  return (
    <div className="bg-black text-white min-h-screen p-6">
      <header className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold"> </h1>
        <button onClick={connectWallet} className="bg-blue-600 px-4 py-2 rounded hover:bg-blue-700">
          {walletAddress ? `Wallet: ${walletAddress.slice(0, 6)}...` : 'Connect Wallet'}
        </button>
      </header>
 

 <div className="text-center mt-20">
     <img
    src="logob.png" // <- replace with your actual logo path (e.g., public/logo.png)
    alt="EthIQ Logo"
    className="mx-auto w-20 h-20 md:w-28 md:h-28 mb-4"
  />
  <h1 className="text-4xl font-bold text-white mb-4"> NFT IQ Analyzer</h1>
  <p className="text-gray-400 text-lg max-w-xl mx-auto mb-8">
    Curious about your NFT collection? This analyzer helps you view all NFTs associated with your wallet — 
    including art, collectibles, gaming assets, and more. Get insights into what you own and discover hidden gems. 
    All data is read-only and securely accessed on-chain. No NFTs are ever moved or modified.
  </p>
</div>

      <div className="flex flex-col md:flex-row gap-4  ">
        <input
          value={nftAddress}
          onChange={(e) => setNftAddress(e.target.value)}
          placeholder="Paste NFT contract address"
          className="p-3 text-black w-full rounded"
        />
        <button onClick={() => analyzeNFT()} className="bg-blue-600 px-6 py-3 rounded hover:bg-blue-700">
          AnalyzeNFT
        </button>
      </div>

      {showModal && nftData && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
          <div className="bg-gray-900 p-6 rounded-lg max-w-xl w-full relative">
            <button onClick={() => setShowModal(false)} className="absolute top-4 right-6 text-2xl">
              &times;
            </button>
            <h3 className="text-xl mb-4 font-semibold">📊 NFT Metadata</h3>
            <div className="mt-4 p-3 bg-gray-800 rounded text-green-400 font-mono">
              {typedAiComment}
            </div>
            <div className="flex gap-4 mt-4">
              {nftData.image_url && (
                <img
                  src={nftData.image_url}
                  alt={nftData.name}
                  className="w-24 h-24 object-cover rounded"
                />
              )}
              <div>
                <p><strong>Name:</strong> {nftData.name}</p>
                <p><strong>Token ID:</strong> {nftData.token_id}</p>
                <p><strong>Description:</strong> {nftData.description}</p>
                <a
                  href={`https://opensea.io/assets/ethereum/${nftData.contract_address}/${nftData.token_id}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-blue-400"
                >
                  View on OpenSea
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {error && <p className="text-red-500 mt-4">{error}</p>}

      <h2 className="text-2xl font-semibold mt-10 mb-4">🔥 Featured NFT Collections</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {featuredData.map((nft) => (
          <div
            key={nft.address}
            className="bg-gray-800 rounded p-4 cursor-pointer hover:bg-gray-700 transition"
            onClick={() => analyzeNFT(nft.address, nft.token_id || '1')}
          >
            <img
              src={nft.image_url || '/placeholder.png'}
              alt={nft.name}
              className="w-full h-32 object-cover rounded mb-2"
            />
            <p className="text-lg font-medium">{nft.name}</p>
            <p className="text-xs text-gray-400">{nft.address}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default NftAnalyzerApp;
