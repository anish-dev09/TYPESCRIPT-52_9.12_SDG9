import { useState, useEffect, useCallback } from 'react';
import { useAuthStore } from '../../store/authStore';
import web3Service from '../../services/web3Service';
import toast from 'react-hot-toast';

export default function WalletConnect() {
  const { isAuthenticated, user, setWalletAddress } = useAuthStore();
  const [isConnecting, setIsConnecting] = useState(false);
  const [walletAddress, setLocalWalletAddress] = useState<string | null>(null);
  const [networkInfo, setNetworkInfo] = useState<{
    name: string;
    chainId: number;
    isTestnet: boolean;
  } | null>(null);
  const [balance, setBalance] = useState<string>('0');

  const loadWalletInfo = useCallback(async (address: string) => {
    try {
      const [balanceResult, networkResult] = await Promise.all([
        web3Service.getBalance(address),
        web3Service.getNetworkInfo(),
      ]);

      setBalance(balanceResult);
      setNetworkInfo(networkResult);
    } catch (error) {
      console.error('Error loading wallet info:', error);
    }
  }, []);

  const handleDisconnect = useCallback(() => {
    web3Service.disconnectWallet();
    setLocalWalletAddress(null);
    setBalance('0');
    setNetworkInfo({ chainId: 0, name: 'Unknown' });
    setWalletAddress(null);
    toast('Wallet disconnected', { icon: 'ℹ️' });
  }, [setWalletAddress]);

  const setupEventListeners = useCallback(() => {
    web3Service.onAccountsChanged((accounts) => {
      if (accounts.length === 0) {
        handleDisconnect();
      } else {
        setLocalWalletAddress(accounts[0]);
        loadWalletInfo(accounts[0]);
        toast('Account changed', { icon: 'ℹ️' });
      }
    });

    web3Service.onChainChanged(() => {
      window.location.reload();
    });
  }, [handleDisconnect, loadWalletInfo]);

  const checkConnection = useCallback(async () => {
    try {
      const account = await web3Service.getCurrentAccount();
      if (account) {
        setLocalWalletAddress(account);
        await loadWalletInfo(account);
      }
    } catch (error) {
      console.error('Error checking connection:', error);
    }
  }, [loadWalletInfo]);

  useEffect(() => {
    checkConnection();
    setupEventListeners();

    return () => {
      web3Service.removeAllListeners();
    };
  }, [checkConnection, setupEventListeners]);

  const handleConnect = async () => {
    if (!web3Service.isMetaMaskInstalled()) {
      toast.error('Please install MetaMask to continue');
      window.open('https://metamask.io/download/', '_blank');
      return;
    }

    try {
      setIsConnecting(true);
      const { address, chainId } = await web3Service.connectWallet();
      
      setLocalWalletAddress(address);
      setWalletAddress(address);
      
      await loadWalletInfo(address);

      // Check if on correct network (Polygon Mumbai testnet or local)
      if (chainId !== 80001 && chainId !== 31337) {
        toast.error('Please switch to Polygon Mumbai testnet');
      }
    } catch (error: any) {
      console.error('Connection error:', error);
    } finally {
      setIsConnecting(false);
    }
  };

  const formatAddress = (address: string) => {
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  const formatBalance = (bal: string) => {
    return parseFloat(bal).toFixed(4);
  };

  if (!walletAddress) {
    return (
      <button
        onClick={handleConnect}
        disabled={isConnecting}
        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isConnecting ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            <span>Connecting...</span>
          </>
        ) : (
          <>
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            <span>Connect Wallet</span>
          </>
        )}
      </button>
    );
  }

  return (
    <div className="relative group">
      <button className="flex items-center gap-3 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">
        {/* Network Indicator */}
        <div className={`w-2 h-2 rounded-full ${networkInfo?.isTestnet ? 'bg-yellow-500' : 'bg-green-500'}`} />
        
        {/* Wallet Info */}
        <div className="text-left">
          <div className="text-sm font-medium text-gray-900">
            {formatAddress(walletAddress)}
          </div>
          <div className="text-xs text-gray-500">
            {formatBalance(balance)} MATIC
          </div>
        </div>

        {/* Dropdown Icon */}
        <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown Menu */}
      <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 border border-gray-200">
        <div className="p-4">
          {/* Network Info */}
          <div className="mb-3 pb-3 border-b border-gray-200">
            <div className="text-xs text-gray-500 mb-1">Network</div>
            <div className="text-sm font-medium text-gray-900 flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${networkInfo?.isTestnet ? 'bg-yellow-500' : 'bg-green-500'}`} />
              {networkInfo?.name || 'Unknown'}
            </div>
          </div>

          {/* Wallet Address */}
          <div className="mb-3 pb-3 border-b border-gray-200">
            <div className="text-xs text-gray-500 mb-1">Address</div>
            <div className="text-sm font-mono text-gray-900">
              {formatAddress(walletAddress)}
            </div>
          </div>

          {/* Balance */}
          <div className="mb-3 pb-3 border-b border-gray-200">
            <div className="text-xs text-gray-500 mb-1">Balance</div>
            <div className="text-sm font-medium text-gray-900">
              {formatBalance(balance)} MATIC
            </div>
          </div>

          {/* Actions */}
          <button
            onClick={handleDisconnect}
            className="w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            Disconnect Wallet
          </button>
        </div>
      </div>
    </div>
  );
}
