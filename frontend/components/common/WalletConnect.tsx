import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import web3Service from '@/services/web3Service';

export default function WalletConnect() {
  const {
    walletAddress,
    isConnecting,
    isAuthenticated,
    user,
    connectWallet,
    login,
    logout,
  } = useAuthStore();

  const [showLoginModal, setShowLoginModal] = useState(false);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const handleConnectWallet = async () => {
    try {
      await connectWallet();
      // After wallet is connected, check if user exists
      setShowLoginModal(true);
    } catch (error) {
      console.error('Connect wallet error:', error);
    }
  };

  const handleLogin = async () => {
    if (!walletAddress) return;

    setIsLoggingIn(true);
    try {
      // Try login (or register if new user)
      await login(email || undefined, name || undefined);
      setShowLoginModal(false);
      setEmail('');
      setName('');
    } catch (error: any) {
      // If error mentions email/name required, keep modal open
      if (error.message?.includes('Email and name required')) {
        // Modal stays open for user to fill details
      } else {
        setShowLoginModal(false);
      }
    } finally {
      setIsLoggingIn(false);
    }
  };

  const shortenAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  // If not connected
  if (!walletAddress) {
    return (
      <button
        onClick={handleConnectWallet}
        disabled={isConnecting}
        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
      >
        {isConnecting ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
            Connecting...
          </>
        ) : (
          <>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Connect Wallet
          </>
        )}
      </button>
    );
  }

  // If connected but not authenticated
  if (!isAuthenticated) {
    return (
      <>
        <button
          onClick={() => setShowLoginModal(true)}
          className="bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-2.5 rounded-lg font-medium transition-colors"
        >
          Sign In
        </button>

        {/* Login Modal */}
        {showLoginModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
              <h2 className="text-2xl font-bold mb-4">Welcome to INFRACHAIN</h2>
              <p className="text-gray-600 mb-6">
                Connected: {shortenAddress(walletAddress)}
              </p>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email (optional for existing users)
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Name (optional for existing users)
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your Name"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <p className="text-xs text-gray-500">
                  By signing in, you'll sign a message with your wallet to verify ownership.
                  New users will need to provide email and name.
                </p>

                <div className="flex gap-3">
                  <button
                    onClick={handleLogin}
                    disabled={isLoggingIn}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg font-medium transition-colors disabled:opacity-50"
                  >
                    {isLoggingIn ? 'Signing...' : 'Sign Message & Login'}
                  </button>
                  <button
                    onClick={() => {
                      setShowLoginModal(false);
                      logout();
                    }}
                    className="px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </>
    );
  }

  // If authenticated
  return (
    <div className="flex items-center gap-4">
      <div className="hidden md:flex flex-col items-end">
        <p className="text-sm font-medium text-gray-900">{user?.name}</p>
        <p className="text-xs text-gray-500">{shortenAddress(walletAddress)}</p>
      </div>
      
      <div className="flex items-center gap-2">
        <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-medium">
          {user?.kycStatus === 'verified' ? '✓ Verified' : 'KYC Pending'}
        </div>
        
        <button
          onClick={logout}
          className="text-gray-600 hover:text-gray-900 p-2 rounded-lg hover:bg-gray-100 transition-colors"
          title="Disconnect"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
        </button>
      </div>
    </div>
  );
}
