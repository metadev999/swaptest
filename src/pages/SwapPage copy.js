import React, { useState, useRef, useEffect } from 'react';
import { ethers } from 'ethers';

const ERC20_ABI = [
  'function name() view returns (string)',
  'function symbol() view returns (string)',
  'function decimals() view returns (uint8)',
  'function approve(address spender, uint amount) public returns (bool)',
  'function allowance(address owner, address spender) view returns (uint)',
];

const ROUTER_ABI = [
  'function swapExactTokensForTokens(uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline) external returns (uint[] memory amounts)',
];

const UNISWAP_ROUTER = '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D';

const INITIAL_TOKENS = {
  UNI: {
    address: '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984',
    icon: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984/logo.png',
  },
  WETH: {
    address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
    icon: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2/logo.png',
  },
  USDT: {
    address: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
    icon: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xdAC17F958D2ee523a2206206994597C13D831ec7/logo.png',
  },
  DAI: {
    address: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
    icon: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0x6B175474E89094C44Da98b954EedeAC495271d0F/logo.png',
  },
};

function TokenDropdown({ tokens, selected, onSelect }) {
  const [open, setOpen] = useState(false);
  const ref = useRef();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (ref.current && !ref.current.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedToken = Object.entries(tokens).find(
    ([, token]) => token.address.toLowerCase() === selected.toLowerCase()
  );

  return (
    <div ref={ref} className="relative w-full">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-2 bg-gray-800 p-3 rounded-lg text-white"
      >
        {selectedToken ? (
          <>
            {selectedToken[1].icon && (
              <img
                src={selectedToken[1].icon}
                alt={selectedToken[0]}
                className="w-6 h-6 rounded-full"
              />
            )}
            <span>{selectedToken[0]}</span>
          </>
        ) : (
          'Select Token'
        )}
        <svg
          className={`ml-auto w-4 h-4 transition-transform ${open ? 'rotate-180' : ''}`}
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="absolute z-10 mt-1 w-full bg-gray-800 rounded-lg shadow-lg max-h-60 overflow-auto">
          {Object.entries(tokens).map(([symbol, token]) => (
            <div
              key={symbol}
              onClick={() => {
                onSelect(token.address);
                setOpen(false);
              }}
              className="flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-gray-700"
            >
              {token.icon && (
                <img src={token.icon} alt={symbol} className="w-6 h-6 rounded-full" />
              )}
              <span>{symbol}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function SwapPage() {
  const [wallet, setWallet] = useState(null);
  const [TOKENS, setTOKENS] = useState(INITIAL_TOKENS);
  const [inputToken, setInputToken] = useState(INITIAL_TOKENS.WETH.address);
  const [outputToken, setOutputToken] = useState(INITIAL_TOKENS.USDT.address);
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [customInputAddr, setCustomInputAddr] = useState('');
  const [customOutputAddr, setCustomOutputAddr] = useState('');

  const connectWallet = async () => {
    if (!window.ethereum) return alert('🦊 Install MetaMask');
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    setWallet(signer);
  };

  const addCustomToken = async (address, setToken) => {
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const contract = new ethers.Contract(address, ERC20_ABI, provider);
      const symbol = await contract.symbol();
      const decimals = await contract.decimals();
      setTOKENS((prev) => ({
        ...prev,
        [symbol]: { address, icon: '', decimals },
      }));
      setToken(address);
    } catch (err) {
      alert('⚠️ Invalid ERC-20 address');
    }
  };

  const swapTokens = async () => {
    try {
      if (!wallet) return alert('Connect your wallet first.');
      if (inputToken === outputToken) return alert('Choose different tokens.');

      setLoading(true);

      const inputContract = new ethers.Contract(inputToken, ERC20_ABI, wallet);
      const router = new ethers.Contract(UNISWAP_ROUTER, ROUTER_ABI, wallet);

      const decimals = await inputContract.decimals();
      const amountIn = ethers.parseUnits(amount, decimals);

      const address = await wallet.getAddress();
      const allowance = await inputContract.allowance(address, UNISWAP_ROUTER);

      if (allowance < amountIn) {
        const approveTx = await inputContract.approve(UNISWAP_ROUTER, amountIn);
        await approveTx.wait();
      }

      const path = [inputToken, outputToken];
      const deadline = Math.floor(Date.now() / 1000) + 60 * 10;

      const tx = await router.swapExactTokensForTokens(
        amountIn,
        0,
        path,
        address,
        deadline
      );

      await tx.wait();
      alert('✅ Swap successful!');
      setAmount('');
    } catch (err) {
      console.error(err);
      alert('⚠️ Swap failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold"></h1>
        <button
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
          onClick={connectWallet}
        >
          {wallet ? 'Connected' : 'Connect Wallet'}
        </button>
      </div>

      <div className="text-center mb-10">
         <img
    src="logob.png" // <- replace with your actual logo path (e.g., public/logo.png)
    alt="EthIQ Logo"
    className="mx-auto w-20 h-20 md:w-28 md:h-28 mb-4"
  />
        <h1 className="text-4xl font-bold mb-2">ERC-20 Token Swap</h1>
        <p className="text-gray-400 max-w-2xl mx-auto">
         <p className="text-gray-400 max-w-2xl mx-auto">
          This is a basic decentralized token swap . It allows you to swap ERC-20 tokens using the Uniswap V2
          protocol. ⚙️ <br />
          <span className="text-yellow-400 font-medium">
            Note: This version is under development. Swap logic is functional but not production-ready.
          </span>
        </p>
          <span className="text-yellow-400 font-medium">
            Now supports custom token addresses!
          </span>
        </p>
      </div>

      <div className="max-w-xl mx-auto bg-gray-900 p-6 rounded-xl shadow-lg border border-gray-700 space-y-4">
        <div>
          <label className="block text-sm mb-1 text-gray-400">From</label>
          <div className="flex items-center gap-2 mb-2">
            <div className="flex-1">
              <TokenDropdown tokens={TOKENS} selected={inputToken} onSelect={setInputToken} />
            </div>
            <input
              type="number"
              placeholder="0.0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="flex-1 text-right bg-gray-800 p-3 rounded-lg text-white placeholder-gray-500 outline-none"
            />
          </div>
          <input
            type="text"
            placeholder="Enter custom token address"
            value={customInputAddr}
            onChange={(e) => setCustomInputAddr(e.target.value)}
            onBlur={() => customInputAddr && addCustomToken(customInputAddr, setInputToken)}
            className="w-full bg-gray-800 p-2 rounded-md text-sm text-gray-300"
          />
        </div>

        <div className="text-center text-gray-400">⬇️</div>

        <div>
          <label className="block text-sm mb-1 text-gray-400">To</label>
          <TokenDropdown tokens={TOKENS} selected={outputToken} onSelect={setOutputToken} />
          <input
            type="text"
            placeholder="Enter custom token address"
            value={customOutputAddr}
            onChange={(e) => setCustomOutputAddr(e.target.value)}
            onBlur={() => customOutputAddr && addCustomToken(customOutputAddr, setOutputToken)}
            className="w-full mt-2 bg-gray-800 p-2 rounded-md text-sm text-gray-300"
          />
        </div>

        <button
          onClick={swapTokens}
          disabled={loading || !amount}
          className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg text-lg font-semibold disabled:bg-gray-600"
        >
          {loading ? 'Swapping...' : 'Swap'}
        </button>
      </div>
      <p className="text-center text-sm text-gray-400 mt-4">
  ✅ <span className="font-medium text-white">Swap History Recorded</span><br />
  All token swaps are recorded for future rewards and loyalty purposes. Transaction details are securely stored to help recognize and reward early users.
</p>

    </div>
  );
}
