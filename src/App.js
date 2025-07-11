import React, { useState, useEffect, useCallback, createContext, useContext } from 'react';
import { ethers } from 'ethers'; // Import ethers.js

// --- MOCK DATA ---
const mockTokens = [
  {
    symbol: 'ETH',
    name: 'Wrapped Ether',
    logo: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2/logo.png',
    price: 3450.12,
    address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
    decimals: 18
  },
  {
    symbol: 'USDC',
    name: 'USD Coin',
    logo: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48/logo.png',
    price: 1.00,
    address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
    decimals: 6
  },
  {
    symbol: 'DAI',
    name: 'Dai Stablecoin',
    logo: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0x6B175474E89094C44Da98b954EedeAC495271d0F/logo.png',
    price: 1.00,
    address: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
    decimals: 18
  },
  {
    symbol: 'WBTC',
    name: 'Wrapped BTC',
    logo: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599/logo.png',
    price: 67050.45,
    address: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599',
    decimals: 8
  },
  {
    symbol: 'UNI',
    name: 'Uniswap',
    logo: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984/logo.png',
    price: 10.55,
    address: '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984',
    decimals: 18
  },
  {
    symbol: 'USDT',
    name: 'Tether USD',
    logo: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xdAC17F958D2ee523a2206206994597C13D831ec7/logo.png',
    price: 1.00,
    address: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
    decimals: 6
  }
];


// Uniswap V2 Router02 Address (Ethereum Mainnet)
const UNISWAP_ROUTER_ADDRESS = "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D";

// Simplified Uniswap V2 Router02 ABI for swapExactTokensForTokens and addLiquidity
const UNISWAP_ROUTER_ABI = [
  "function swapExactTokensForTokens(uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline) external returns (uint[] memory amounts)",
  "function addLiquidity(address tokenA, address tokenB, uint amountADesired, uint amountBDesired, uint amountAMin, uint amountBMin, address to, uint deadline) external returns (uint amountA, uint amountB, uint liquidity)",
  "function getAmountsOut(uint amountIn, address[] memory path) public view returns (uint[] memory amounts)", // For quoting prices
];

// Standard ERC-20 ABI for `approve` and `decimals`
const ERC20_ABI = [
  "function approve(address spender, uint256 amount) public returns (bool)",
  "function allowance(address owner, address spender) public view returns (uint256)",
  "function decimals() public view returns (uint8)",
  "function symbol() public view returns (string)",
  "function name() public view returns (string)",
  "function balanceOf(address account) public view returns (uint256)",
];


// --- CONTEXT for managing global state ---
const AppContext = createContext();

// --- HELPER & ICON COMPONENTS ---
const ChevronDownIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>);
const SettingsIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 0 2l-.15.08a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.38a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1 0-2l.15.08a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15-.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" /><circle cx="12" cy="12" r="3" /></svg>);
const UniswapLogoIcon = () => (<svg width="28" height="28" viewBox="0 0 41 41" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M20.424 0.236328C9.38491 0.236328 0.423828 9.19741 0.423828 20.2365C0.423828 31.2756 9.38491 40.2367 20.424 40.2367C31.4631 40.2367 40.4242 31.2756 40.4242 20.2365C40.4242 9.19741 31.4631 0.236328 20.424 0.236328ZM28.4283 23.2365C28.4283 24.3386 27.5304 25.2365 26.4283 25.2365H24.4283V27.2365C24.4283 28.3386 23.5304 29.2365 22.4283 29.2365C21.3262 29.2365 20.4283 28.3386 20.4283 27.2365V25.2365H15.4283C14.3262 25.2365 13.4283 24.3386 13.4283 23.2365C13.4283 22.1344 14.3262 21.2365 15.4283 21.2365H20.4283V16.2365C20.4283 15.1344 21.3262 14.2365 22.4283 14.2365C23.5304 14.2365 24.4283 15.1344 24.4283 16.2365V21.2365H26.4283C27.5304 21.2365 28.4283 22.1344 28.4283 23.2365Z" fill="#FF007A"></path></svg>);


// --- MAIN UI COMPONENTS ---

// Settings Modal
function SettingsModal({ isOpen, onClose, slippage, setSlippage, deadline, setDeadline, tradeOption, setTradeOption }) {
  if (!isOpen) return null;

  const handleSlippageChange = (e) => {
    const value = e.target.value;
    if (/^\d*\.?\d*$/.test(value) || value === '') {
      setSlippage(value);
    }
  };

  const handleDeadlineChange = (e) => {
    const value = e.target.value;
    if (/^\d*$/.test(value) || value === '') {
      setDeadline(value);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 transition-opacity">
      <div className="bg-[#1f1f1f] rounded-2xl w-full max-w-md m-4 p-6 border border-gray-700 animate-fade-in-up">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-white">Transaction Settings</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-2xl">&times;</button>
        </div>

        <div className="mb-6">
          <label className="block text-gray-400 text-sm font-bold mb-2">Max slippage</label>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setSlippage('0.5')}
              className={`px-4 py-2 rounded-xl text-white ${slippage === '0.5' ? 'bg-[#ff007a]' : 'bg-gray-700 hover:bg-gray-600'}`}
            >
              0.5%
            </button>
            <button
              onClick={() => setSlippage('1')}
              className={`px-4 py-2 rounded-xl text-white ${slippage === '1' ? 'bg-[#ff007a]' : 'bg-gray-700 hover:bg-gray-600'}`}
            >
              1%
            </button>
            <input
              type="text"
              placeholder="Custom"
              value={slippage}
              onChange={handleSlippageChange}
              className="flex-1 bg-[#121212] border border-gray-700 rounded-xl p-3 text-white focus:outline-none focus:ring-2 focus:ring-[#ff007a]"
            />
            <span className="text-white">%</span>
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-gray-400 text-sm font-bold mb-2">Swap deadline</label>
          <div className="flex items-center space-x-2">
            <input
              type="text"
              placeholder="30"
              value={deadline}
              onChange={handleDeadlineChange}
              className="w-20 bg-[#121212] border border-gray-700 rounded-xl p-3 text-white text-center focus:outline-none focus:ring-2 focus:ring-[#ff007a]"
            />
            <span className="text-white">minutes</span>
          </div>
        </div>

        <div>
          <label className="block text-gray-400 text-sm font-bold mb-2">Trade options</label>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setTradeOption('default')}
              className={`px-4 py-2 rounded-xl text-white ${tradeOption === 'default' ? 'bg-[#ff007a]' : 'bg-gray-700 hover:bg-gray-600'}`}
            >
              Default
            </button>
            {/* Add more trade options if needed */}
          </div>
        </div>

      </div>
    </div>
  );
}


// Token Selection Modal
function TokenModal({ isOpen, onClose, onSelectToken }) {
  const [searchTerm, setSearchTerm] = useState('');
  const filteredTokens = mockTokens.filter(token =>
    token.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    token.symbol.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 transition-opacity">
      <div className="bg-[#1f1f1f] rounded-2xl w-full max-w-md m-4 p-6 border border-gray-700 animate-fade-in-up">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-white">Select a token</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-2xl">&times;</button>
        </div>
        <input
          type="text"
          placeholder="Search name or paste address"
          className="w-full bg-[#121212] border border-gray-700 rounded-xl p-3 text-white focus:outline-none focus:ring-2 focus:ring-[#ff007a]"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <div className="space-y-2 max-h-80 overflow-y-auto mt-4 custom-scrollbar"> {/* Added custom-scrollbar class */}
          {filteredTokens.map(token => (
            <button key={token.symbol} onClick={() => { onSelectToken(token); onClose(); }} className="w-full flex items-center p-3 hover:bg-gray-800 rounded-xl text-left transition-colors">
              <img src={token.logo} alt={token.name} className="w-8 h-8 mr-4 rounded-full" />
              <div><p className="font-semibold text-white">{token.symbol}</p><p className="text-sm text-gray-400">{token.name}</p></div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// Token Input Field (Minor adjustment for decimals)
function TokenInput({ label, amount, onAmountChange, selectedToken, onSelectTokenClick, isInput = true }) {
  const handleAmountChange = (e) => {
    const value = e.target.value;
    // Allow only numbers and a single decimal point
    if (/^\d*\.?\d*$/.test(value)) { onAmountChange(value); }
  };
  return (
    <div className="bg-[#191919] p-4 rounded-2xl border border-gray-800">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm text-gray-400">{label}</span>
      </div>
      <div className="flex justify-between items-center">
        <input
          type="text"
          inputMode="decimal"
          placeholder="0"
          value={amount}
          onChange={handleAmountChange}
          className="bg-transparent text-3xl font-mono text-white w-full focus:outline-none"
          disabled={!isInput}
        />
        <button onClick={onSelectTokenClick} className="flex items-center bg-[#2b2b2b] hover:bg-gray-700 text-white font-semibold py-2 px-3 rounded-2xl transition-colors">
          {selectedToken ? (
            <><img src={selectedToken.logo} alt={selectedToken.name} className="w-6 h-6 mr-2 rounded-full" />{selectedToken.symbol}</>
          ) : (
            "Select token"
          )}
          <ChevronDownIcon />
        </button>
      </div>
    </div>
  );
}

// Swap View
function SwapView() {
  const { walletAddress, provider, signer, showMessage } = useContext(AppContext);
  const [tokenIn, setTokenIn] = useState(mockTokens[0]);
  const [tokenOut, setTokenOut] = useState(mockTokens[1]); // Default to USDC as tokenOut
  const [amountIn, setAmountIn] = useState('');
  const [amountOut, setAmountOut] = useState('');
  const [isTokenModalOpen, setIsTokenModalOpen] = useState(false); // Renamed for clarity
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false); // New state for settings modal
  const [modalType, setModalType] = useState('in');
  const [isApproving, setIsApproving] = useState(false);
  const [isSwapping, setIsSwapping] = useState(false);

  // New states for settings
  const [slippage, setSlippage] = useState('0.5'); // Default slippage to 0.5%
  const [deadline, setDeadline] = useState('30'); // Default deadline to 30 minutes
  const [tradeOption, setTradeOption] = useState('default'); // Default trade option

  // Function to get an estimated amount out using Uniswap Router's getAmountsOut
  const getEstimatedAmountOut = useCallback(async (inputAmount, inputToken, outputToken) => {
    if (!inputAmount || !inputToken || !outputToken || parseFloat(inputAmount) === 0 || !provider) {
      return '';
    }

    try {
      const routerContract = new ethers.Contract(UNISWAP_ROUTER_ADDRESS, UNISWAP_ROUTER_ABI, provider);

      // Convert amountIn to BigNumber with correct decimals
      const amountInWei = ethers.parseUnits(inputAmount, inputToken.decimals);

      // Path for the swap
      const path = [inputToken.address, outputToken.address];

      const amounts = await routerContract.getAmountsOut(amountInWei, path);
      const estimatedAmountOut = ethers.formatUnits(amounts[1], outputToken.decimals);
      return parseFloat(estimatedAmountOut).toFixed(6); // Format to 6 decimal places for display
    } catch (error) {
      console.error("Error getting estimated amount out:", error);
      return '';
    }
  }, [provider]);

  // Effect to update amountOut when amountIn or tokens change
  useEffect(() => {
    const handler = setTimeout(async () => {
      const estimated = await getEstimatedAmountOut(amountIn, tokenIn, tokenOut);
      setAmountOut(estimated);
    }, 500); // Debounce price fetching

    return () => clearTimeout(handler);
  }, [amountIn, tokenIn, tokenOut, getEstimatedAmountOut]);

  // Updated openModal to distinguish between token and settings modals
  const openTokenModal = (type) => { setModalType(type); setIsTokenModalOpen(true); };
  const openSettingsModal = () => { setIsSettingsModalOpen(true); };


  const handleSelectToken = (token) => {
    if (modalType === 'in') {
      if (tokenOut && token.symbol === tokenOut.symbol) {
        setTokenOut(tokenIn); // Swap tokenOut with current tokenIn if same token is selected
      }
      setTokenIn(token);
    } else {
      if (tokenIn && token.symbol === tokenIn.symbol) {
        setTokenIn(tokenOut); // Swap tokenIn with current tokenOut if same token is selected
      }
      setTokenOut(token);
    }
    setAmountIn(''); // Clear amounts on token change
    setAmountOut('');
  };

  const handleSwapTokens = () => {
    setTokenIn(tokenOut);
    setTokenOut(tokenIn);
    setAmountIn(amountOut); // Swap amounts too
    setAmountOut(amountIn);
  };

  const handleApprove = async () => {
    if (!walletAddress || !signer || !tokenIn || parseFloat(amountIn) <= 0) {
      showMessage("Please connect your wallet, select token, and enter amount.", "error");
      return;
    }

    setIsApproving(true);
    showMessage(`Approving ${tokenIn.symbol}...`, "info");

    try {
      const tokenContract = new ethers.Contract(tokenIn.address, ERC20_ABI, signer);
      const amountToApprove = ethers.parseUnits(amountIn, tokenIn.decimals);

      // Check current allowance
      const currentAllowance = await tokenContract.allowance(walletAddress, UNISWAP_ROUTER_ADDRESS);

      if (currentAllowance < amountToApprove) {
        const tx = await tokenContract.approve(UNISWAP_ROUTER_ADDRESS, ethers.MaxUint256); // Approve max for convenience
        await tx.wait(); // Wait for the transaction to be mined
        showMessage(`${tokenIn.symbol} approval successful!`, "success");
      } else {
        showMessage(`${tokenIn.symbol} already approved for this amount.`, "info");
      }
    } catch (error) {
      console.error("Approval error:", error);
      showMessage(`Approval failed: ${error.message}`, "error");
    } finally {
      setIsApproving(false);
    }
  };

  const handleSwap = async () => {
    if (!walletAddress || !signer || !tokenIn || !tokenOut || parseFloat(amountIn) <= 0) {
      showMessage("Please fill all fields correctly.", "error");
      return;
    }

    setIsSwapping(true);
    showMessage(`Swapping ${amountIn} ${tokenIn.symbol} for ${tokenOut.symbol}...`, "info");

    try {
      const routerContract = new ethers.Contract(UNISWAP_ROUTER_ADDRESS, UNISWAP_ROUTER_ABI, signer);

      const amountInWei = ethers.parseUnits(amountIn, tokenIn.decimals);
      
      // Calculate amountOutMin using slippage
      const parsedSlippage = parseFloat(slippage);
      if (isNaN(parsedSlippage) || parsedSlippage < 0 || parsedSlippage >= 100) {
          showMessage("Invalid slippage percentage. Please enter a value between 0 and 99.99.", "error");
          setIsSwapping(false);
          return;
      }
      const slippageFactor = (100 - parsedSlippage) / 100;

      const estimatedAmountOutWei = ethers.parseUnits(amountOut, tokenOut.decimals);
      // Ensure we don't multiply by a negative or zero factor if slippage is too high
      const minAmountOutWei = estimatedAmountOutWei.mul(ethers.parseUnits(slippageFactor.toString(), 18)).div(ethers.parseUnits("1", 18));
      
      const path = [tokenIn.address, tokenOut.address];
      const to = walletAddress; // Recipient address
      
      // Calculate deadline from minutes
      const parsedDeadline = parseInt(deadline, 10);
      if (isNaN(parsedDeadline) || parsedDeadline <= 0) {
          showMessage("Invalid deadline. Please enter a positive number of minutes.", "error");
          setIsSwapping(false);
          return;
      }
      const txDeadline = Math.floor(Date.now() / 1000) + (parsedDeadline * 60); // Convert minutes to seconds

      // Check allowance before attempting swap
      const tokenContract = new ethers.Contract(tokenIn.address, ERC20_ABI, provider);
      const currentAllowance = await tokenContract.allowance(walletAddress, UNISWAP_ROUTER_ADDRESS);

      if (currentAllowance < amountInWei) {
        showMessage(`Please approve ${tokenIn.symbol} first.`, "error");
        setIsSwapping(false);
        return;
      }

      const tx = await routerContract.swapExactTokensForTokens(
        amountInWei,
        minAmountOutWei,
        path,
        to,
        txDeadline
      );
      await tx.wait();
      showMessage(`Swap successful! Transaction hash: ${tx.hash}`, "success");
      setAmountIn('');
      setAmountOut('');
    } catch (error) {
      console.error("Swap error:", error);
      showMessage(`Swap failed: ${error.message}`, "error");
    } finally {
      setIsSwapping(false);
    }
  };

  return (
    <>
      <div className="bg-[#121212] p-4 rounded-2xl border border-gray-800 w-full max-w-md mx-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-white">Swap</h2>
          <button onClick={openSettingsModal} className="text-gray-400 hover:text-white"><SettingsIcon /></button>
        </div>
        <div className="relative space-y-2">
          <TokenInput label="You sell" amount={amountIn} onAmountChange={setAmountIn} selectedToken={tokenIn} onSelectTokenClick={() => openTokenModal('in')} />
          <button onClick={handleSwapTokens} className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 bg-[#191919] border-4 border-[#121212] rounded-full p-2 text-white hover:bg-gray-800 transition-transform duration-200 hover:rotate-180">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><polyline points="19 12 12 19 5 12"></polyline></svg>
          </button>
          <TokenInput label="You buy" amount={amountOut} onAmountChange={setAmountOut} selectedToken={tokenOut} onSelectTokenClick={() => openTokenModal('out')} isInput={false} />
        </div>
        <div className="mt-4 flex flex-col gap-2">
          {walletAddress ? (
            <>
              <button
                onClick={handleApprove}
                className="w-full bg-blue-600 text-white font-bold py-3 rounded-2xl hover:bg-blue-700 transition-colors text-lg"
                disabled={isApproving || !amountIn || !tokenIn || parseFloat(amountIn) <= 0}
              >
                {isApproving ? "Approving..." : `Approve ${tokenIn?.symbol}`}
              </button>
              <button
                onClick={handleSwap}
                className="w-full bg-[#ff007a] text-white font-bold py-4 rounded-2xl hover:bg-opacity-90 transition-colors text-lg"
                disabled={isSwapping || !amountIn || !tokenIn || !tokenOut || parseFloat(amountIn) <= 0 || parseFloat(amountOut) <= 0} // Disable if amountOut is not calculated
              >
                {isSwapping ? "Swapping..." : "Swap"}
              </button>
            </>
          ) : (
            <button onClick={() => showMessage("Please connect your wallet first.", "info")} className="w-full bg-[#2b2b2b] text-gray-400 font-bold py-4 rounded-2xl hover:bg-opacity-90 transition-colors text-lg">
              Connect Wallet
            </button>
          )}
        </div>
      </div>
      <TokenModal isOpen={isTokenModalOpen} onClose={() => setIsTokenModalOpen(false)} onSelectToken={handleSelectToken} />
      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        slippage={slippage}
        setSlippage={setSlippage}
        deadline={deadline}
        setDeadline={setDeadline}
        tradeOption={tradeOption}
        setTradeOption={setTradeOption}
      />
    </>
  );
}

// Pool View
function PoolView() {
  const { walletAddress, provider, signer, showMessage } = useContext(AppContext);
  const [token1, setToken1] = useState(mockTokens[0]);
  const [token2, setToken2] = useState(mockTokens[1]);
  const [amount1, setAmount1] = useState('');
  const [amount2, setAmount2] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState('1'); // '1' or '2'
  const [isApproving1, setIsApproving1] = useState(false);
  const [isApproving2, setIsApproving2] = useState(false);
  const [isAddingLiquidity, setIsAddingLiquidity] = useState(false);


  const openModal = (type) => { setModalType(type); setIsModalOpen(true); };

  const handleSelectToken = (token) => {
    if (modalType === '1') {
      if (token2 && token.symbol === token2.symbol) {
        setToken2(token1);
      }
      setToken1(token);
    } else {
      if (token1 && token.symbol === token1.symbol) {
        setToken1(token2);
      }
      setToken2(token);
    }
    setAmount1('');
    setAmount2('');
  };

  const handleApproveToken = async (token, amount, setApprovingState) => {
    if (!walletAddress || !signer || !token || parseFloat(amount) <= 0) {
      showMessage("Please connect your wallet, select token, and enter amount.", "error");
      return false;
    }

    setApprovingState(true);
    showMessage(`Approving ${token.symbol}...`, "info");

    try {
      const tokenContract = new ethers.Contract(token.address, ERC20_ABI, signer);
      const amountToApprove = ethers.parseUnits(amount, token.decimals);

      const currentAllowance = await tokenContract.allowance(walletAddress, UNISWAP_ROUTER_ADDRESS);

      if (currentAllowance < amountToApprove) {
       const tx = await tokenContract.approve(UNISWAP_ROUTER_ADDRESS, ethers.MaxUint256);
 // Approve max for convenience
        await tx.wait();
        showMessage(`${token.symbol} approval successful!`, "success");
      } else {
        showMessage(`${token.symbol} already approved for this amount.`, "info");
      }
      return true;
    } catch (error) {
      console.error(`Approval for ${token.symbol} error:`, error);
      showMessage(`Approval for ${token.symbol} failed: ${error.message}`, "error");
      return false;
    } finally {
      setApprovingState(false);
    }
  };

  const handleAddLiquidity = async () => {
    if (!walletAddress || !signer || !token1 || !token2 || parseFloat(amount1) <= 0 || parseFloat(amount2) <= 0) {
      showMessage("Please select tokens and enter amounts.", "error");
      return;
    }

    setIsAddingLiquidity(true);
    showMessage(`Adding liquidity for ${token1.symbol}-${token2.symbol} pair...`, "info");

    try {
      // Approve both tokens if necessary
      const approved1 = await handleApproveToken(token1, amount1, setIsApproving1);
      if (!approved1) { setIsAddingLiquidity(false); return; }
      
      const approved2 = await handleApproveToken(token2, amount2, setIsApproving2);
      if (!approved2) { setIsAddingLiquidity(false); return; }

      const routerContract = new ethers.Contract(UNISWAP_ROUTER_ADDRESS, UNISWAP_ROUTER_ABI, signer);

      const amount1Desired = ethers.parseUnits(amount1, token1.decimals);
      const amount2Desired = ethers.parseUnits(amount2, token2.decimals);

      // For simplicity, we'll use a 1% slippage for min amounts.
      // In a real app, you might calculate reserves to determine optimal amounts.
      const slippageTolerance = 1; // 1%
      const amount1Min = amount1Desired.mul(Math.floor((100 - slippageTolerance) * 100)).div(10000);
      const amount2Min = amount2Desired.mul(Math.floor((100 - slippageTolerance) * 100)).div(10000);
      
      const to = walletAddress;
      const deadline = Math.floor(Date.now() / 1000) + 60 * 20; // 20 minutes from now

      const tx = await routerContract.addLiquidity(
        token1.address,
        token2.address,
        amount1Desired,
        amount2Desired,
        amount1Min,
        amount2Min,
        to,
        deadline
      );
      await tx.wait();
      showMessage(`Liquidity added successfully! Transaction hash: ${tx.hash}`, "success");
      setAmount1('');
      setAmount2('');
    } catch (error) {
      console.error("Add liquidity error:", error);
      showMessage(`Failed to add liquidity: ${error.message}`, "error");
    } finally {
      setIsAddingLiquidity(false);
    }
  };

  return (
    <>
      <div className="bg-[#121212] p-4 rounded-2xl border border-gray-800 w-full max-w-md mx-auto text-white">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Add Liquidity</h2>
          <button className="text-gray-400 hover:text-white"><SettingsIcon /></button>
        </div>
        <div className="space-y-2">
          <TokenInput label="Token 1" amount={amount1} onAmountChange={setAmount1} selectedToken={token1} onSelectTokenClick={() => openModal('1')} />
          <div className="flex justify-center text-2xl font-bold text-gray-500">+</div>
          <TokenInput label="Token 2" amount={amount2} onAmountChange={setAmount2} selectedToken={token2} onSelectTokenClick={() => openModal('2')} />
        </div>
        <div className="mt-4 flex flex-col gap-2">
          {walletAddress ? (
            <>
              <button
                onClick={() => handleApproveToken(token1, amount1, setIsApproving1)}
                className="w-full bg-blue-600 text-white font-bold py-3 rounded-2xl hover:bg-blue-700 transition-colors text-lg"
                disabled={isApproving1 || !amount1 || !token1 || parseFloat(amount1) <= 0}
              >
                {isApproving1 ? "Approving..." : `Approve ${token1?.symbol}`}
              </button>
              <button
                onClick={() => handleApproveToken(token2, amount2, setIsApproving2)}
                className="w-full bg-blue-600 text-white font-bold py-3 rounded-2xl hover:bg-blue-700 transition-colors text-lg"
                disabled={isApproving2 || !amount2 || !token2 || parseFloat(amount2) <= 0}
              >
                {isApproving2 ? "Approving..." : `Approve ${token2?.symbol}`}
              </button>
              <button
                onClick={handleAddLiquidity}
                className="w-full bg-[#ff007a] text-white font-bold py-4 rounded-2xl hover:bg-opacity-90 transition-colors text-lg"
                disabled={isAddingLiquidity || !amount1 || !amount2 || !token1 || !token2 || parseFloat(amount1) <= 0 || parseFloat(amount2) <= 0}
              >
                {isAddingLiquidity ? "Adding Liquidity..." : "Add Liquidity"}
              </button>
            </>
          ) : (
            <button onClick={() => showMessage("Please connect your wallet first.", "info")} className="w-full bg-[#2b2b2b] text-gray-400 font-bold py-4 rounded-2xl hover:bg-opacity-90 transition-colors text-lg">
              Connect Wallet
            </button>
          )}
        </div>
      </div>
      <TokenModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSelectToken={handleSelectToken} />
    </>
  );
}

// Explore View (Placeholder)
function ExploreView() {
    return (
        <div className="text-center text-gray-400 p-8">
            <h2 className="text-2xl font-bold mb-4 text-white">Explore Tokens and Pools</h2>
            <p>This section is under construction. Use the sidebar to navigate.</p>
        </div>
    );
}

// Header
function Header({ activeView, setActiveView }) {
  const { walletAddress, connectWallet } = useContext(AppContext);
  return (
    <header className="grid grid-cols-3 items-center p-4 border-b border-gray-800">
        <div className="flex items-center gap-4">
            <UniswapLogoIcon />
            <nav className="hidden md:flex items-center gap-2">
                <button onClick={() => setActiveView('swap')} className={`px-3 py-2 rounded-lg text-md font-semibold ${activeView === 'swap' ? 'text-white' : 'text-gray-400 hover:text-white'}`}>Trade</button>
                <button onClick={() => setActiveView('explore')} className={`px-3 py-2 rounded-lg text-md font-semibold ${activeView === 'explore' ? 'text-white' : 'text-gray-400 hover:text-white'}`}>Explore</button>
                <button onClick={() => setActiveView('pool')} className={`px-3 py-2 rounded-lg text-md font-semibold ${activeView === 'pool' ? 'text-white' : 'text-gray-400 hover:text-white'}`}>Pool</button>
            </nav>
        </div>
        <div className="flex justify-center">
            <div className="relative w-full max-w-lg">
                <input type="text" placeholder="Search tokens and pools" className="w-full bg-[#191919] border border-gray-700 rounded-xl p-3 pl-10 text-white focus:outline-none focus:ring-2 focus:ring-[#ff007a]" />
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" /></svg>
            </div>
        </div>
        <div className="flex items-center justify-end gap-3">
            <button className="flex items-center gap-2 bg-[#191919] hover:bg-gray-700 text-white font-semibold py-2 px-3 rounded-xl transition-colors">
                <img src={mockTokens[0].logo} alt="Ethereum" className="w-5 h-5 rounded-full" />
                <span>Ethereum</span>
                <ChevronDownIcon />
            </button>
            <button onClick={connectWallet} className="bg-[#ff007a] text-white font-bold py-2 px-4 rounded-xl hover:bg-opacity-90 transition-colors">
                {walletAddress ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}` : 'Connect'}
            </button>
        </div>
    </header>
  );
}

// Sidebar for Explore section
function Sidebar({ activeSubView, setActiveSubView }) {
    return (
        <aside className="w-64 p-4 border-r border-gray-800">
            <nav className="space-y-2">
                <button onClick={() => setActiveSubView('tokens')} className={`w-full text-left px-4 py-2 rounded-lg text-md font-semibold ${activeSubView === 'tokens' ? 'bg-gray-800 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}>Tokens</button>
                <button onClick={() => setActiveSubView('pools')} className={`w-full text-left px-4 py-2 rounded-lg text-md font-semibold ${activeSubView === 'pools' ? 'bg-gray-800 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}>Pools</button>
                <button onClick={() => setActiveSubView('transactions')} className={`w-full text-left px-4 py-2 rounded-lg text-md font-semibold ${activeSubView === 'transactions' ? 'bg-gray-800 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}>Transactions</button>
            </nav>
        </aside>
    );
}

// Message/Toast component
function Message({ message, type, onDismiss }) {
    const baseStyle = "fixed bottom-5 right-5 p-4 rounded-lg text-white shadow-lg animate-fade-in-up flex items-center z-50";
    const styles = { success: "bg-green-500", error: "bg-red-500", info: "bg-blue-500" };
    useEffect(() => { const timer = setTimeout(onDismiss, 4000); return () => clearTimeout(timer); }, [onDismiss]);
    return (<div className={`${baseStyle} ${styles[type]}`}><p>{message}</p><button onClick={onDismiss} className="ml-4 text-xl font-bold">&times;</button></div>);
}

// Main App Component
export default function App() {
  const [activeView, setActiveView] = useState('swap');
  const [activeSubView, setActiveSubView] = useState('tokens');
  const [walletAddress, setWalletAddress] = useState(null);
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [message, setMessage] = useState(null);
  
  const showMessage = (text, type) => { setMessage({ text, type }); };
  const dismissMessage = () => { setMessage(null); };

  const connectWallet = useCallback(async () => {
    if (window.ethereum) {
      try {
        if (walletAddress) {
          // Disconnect logic (MetaMask doesn't have a direct disconnect API for programmatic use,
          // but removing the provider/signer effectively disconnects from the app's perspective)
          setWalletAddress(null);
          setProvider(null);
          setSigner(null);
          showMessage("Wallet disconnected.", "info");
        } else {
          const newProvider = new ethers.BrowserProvider(window.ethereum);
          await newProvider.send("eth_requestAccounts", []); // Request accounts access
          const newSigner = await newProvider.getSigner();
          const address = await newSigner.getAddress();
          setProvider(newProvider);
          setSigner(newSigner);
          setWalletAddress(address);
          showMessage("Wallet connected successfully!", "success");
        }
      } catch (error) {
        console.error("Failed to connect wallet:", error);
        showMessage(`Failed to connect wallet: ${error.message}`, "error");
      }
    } else {
      showMessage("MetaMask not detected. Please install MetaMask.", "error");
    }
  }, [walletAddress, showMessage]);

  // Listen for account changes in MetaMask
  useEffect(() => {
    if (window.ethereum) {
      const handleAccountsChanged = (accounts) => {
        if (accounts.length === 0) {
          // MetaMask is locked or the user has disconnected all accounts
          setWalletAddress(null);
          setProvider(null);
          setSigner(null);
          showMessage("Wallet disconnected.", "info");
        } else if (accounts[0] !== walletAddress) {
          // Account changed
          const newProvider = new ethers.BrowserProvider(window.ethereum);
          newProvider.getSigner().then(newSigner => {
            setSigner(newSigner);
            setWalletAddress(accounts[0]);
            showMessage("Wallet account changed.", "info");
          });
        }
      };

      // Listen for chain changes (e.g., from Mainnet to Sepolia)
      const handleChainChanged = (chainId) => {
        // You might want to re-initialize provider/signer or notify the user
        console.log("Chain changed to:", chainId);
        // For simplicity, we'll just log it. In a real app, you might force a reconnect
        // or ensure the Dapp functions correctly on the new chain.
        showMessage(`Network changed to Chain ID: ${parseInt(chainId, 16)}`, "info");
        connectWallet(); // Attempt to reconnect to get new provider/signer for the new chain
      };

      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);


      return () => {
        if (window.ethereum) {
          window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
          window.ethereum.removeListener('chainChanged', handleChainChanged);
        }
      };
    }
  }, [walletAddress, showMessage, connectWallet]); // Added connectWallet to dependency array

  const contextValue = { walletAddress, connectWallet, showMessage, provider, signer };

  const renderView = () => {
      if (activeView === 'explore') return <ExploreView />;
      if (activeView === 'pool') return <PoolView />;
      return <SwapView />; // Default to swap
  }

  return (
    <AppContext.Provider value={contextValue}>
      <div className="bg-black min-h-screen font-sans text-white relative overflow-hidden">
        {/* Blob animations */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-purple-900 rounded-full mix-blend-screen filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-pink-900 rounded-full mix-blend-screen filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-blue-900 rounded-full mix-blend-screen filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
        
        <div className="relative z-10 flex flex-col h-screen">
            <Header activeView={activeView} setActiveView={setActiveView} />
            <div className="flex flex-1 overflow-hidden">
                {activeView === 'explore' && <Sidebar activeSubView={activeSubView} setActiveSubView={setActiveSubView} />}
                <main className="flex-1 flex justify-center items-start p-6 overflow-y-auto">
                    {renderView()}
                </main>
            </div>
        </div>
        
        {message && <Message message={message.text} type={message.type} onDismiss={dismissMessage} />}

        <style>{`
          /* Custom scrollbar for TokenModal */
          .custom-scrollbar::-webkit-scrollbar { width: 8px; }
          .custom-scrollbar::-webkit-scrollbar-track { background: #1f1f1f; border-radius: 10px; }
          .custom-scrollbar::-webkit-scrollbar-thumb { background: #555; border-radius: 10px; }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #777; }

          @keyframes fade-in-up { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
          .animate-fade-in-up { animation: fade-in-up 0.3s ease-out forwards; }
          @keyframes blob { 0% { transform: translate(0px, 0px) scale(1); } 33% { transform: translate(30px, -50px) scale(1.1); } 66% { transform: translate(-20px, 20px) scale(0.9); } 100% { transform: translate(0px, 0px) scale(1); } }
          .animate-blob { animation: blob 7s infinite; }
          .animation-delay-2000 { animation-delay: 2s; }
          .animation-delay-4000 { animation-delay: 4s; }
        `}</style>
      </div>
    </AppContext.Provider>
  );
}