import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import web3Service from '@/services/web3Service';

/**
 * TokenAirdrop Component
 * Admin utility for testing - sends mock tokens to specified address
 * Used for demo scenarios and development testing
 */
const TokenAirdrop: React.FC = () => {
  const [address, setAddress] = useState('');
  const [amount, setAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const validateAddress = (addr: string): boolean => {
    // Basic Ethereum address validation
    return /^0x[a-fA-F0-9]{40}$/.test(addr);
  };

  const handleAirdrop = async () => {
    // Validate inputs
    if (!address || !validateAddress(address)) {
      toast.error('Please enter a valid Ethereum address');
      return;
    }

    const amountNum = parseFloat(amount);
    if (!amount || isNaN(amountNum) || amountNum <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    setIsLoading(true);
    try {
      const txHash = await web3Service.mockTokenAirdrop(address, amount);
      
      toast.success(
        <div>
          <p className="font-semibold">Mock Airdrop Successful!</p>
          <p className="text-sm text-gray-600 mt-1">{amountNum} tokens sent to {address.slice(0, 6)}...{address.slice(-4)}</p>
          <p className="text-xs text-gray-500 mt-1">Tx: {txHash.slice(0, 10)}...{txHash.slice(-8)}</p>
        </div>,
        { duration: 5000 }
      );

      // Reset form
      setAddress('');
      setAmount('');
    } catch (error: any) {
      console.error('Airdrop error:', error);
      toast.error(error.message || 'Failed to send airdrop');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickFill = async () => {
    const currentAccount = await web3Service.getCurrentAccount();
    if (currentAccount) {
      setAddress(currentAccount);
      toast.success('Address filled with connected wallet');
    } else {
      toast.error('No wallet connected');
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 max-w-md">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Mock Token Airdrop</h2>
        <p className="text-sm text-gray-600">
          Testing utility - Send mock tokens to any address for demo purposes
        </p>
        <div className="mt-2 px-3 py-2 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-800">
          ⚠️ Development/Testing Only
        </div>
      </div>

      {/* Form */}
      <div className="space-y-4">
        {/* Address Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Recipient Address
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="0x..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm font-mono"
            />
            <button
              onClick={handleQuickFill}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
            >
              My Wallet
            </button>
          </div>
          {address && !validateAddress(address) && (
            <p className="mt-1 text-xs text-red-600">Invalid Ethereum address format</p>
          )}
        </div>

        {/* Amount Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Token Amount
          </label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="100"
            min="0"
            step="0.01"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
          />
          <div className="mt-2 flex gap-2">
            {[10, 50, 100, 500].map((preset) => (
              <button
                key={preset}
                onClick={() => setAmount(preset.toString())}
                className="px-3 py-1 bg-blue-50 text-blue-600 rounded text-xs hover:bg-blue-100 transition-colors"
              >
                {preset}
              </button>
            ))}
          </div>
        </div>

        {/* Submit Button */}
        <button
          onClick={handleAirdrop}
          disabled={isLoading || !address || !amount || !validateAddress(address)}
          className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <span>Sending...</span>
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
              </svg>
              <span>Send Airdrop</span>
            </>
          )}
        </button>
      </div>

      {/* Info Footer */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="space-y-2 text-xs text-gray-600">
          <div className="flex items-start gap-2">
            <span className="font-semibold">ℹ️</span>
            <p>This is a mock function that generates fake transaction hashes for testing the investment flow without real blockchain transactions.</p>
          </div>
          <div className="flex items-start gap-2">
            <span className="font-semibold">💡</span>
            <p>Use this to test transaction monitoring, balance updates, and UI components during development.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TokenAirdrop;
