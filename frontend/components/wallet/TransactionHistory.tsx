import { useState, useEffect, useCallback } from 'react';
import { useAuthStore } from '../../store/authStore';
import web3Service from '../../services/web3Service';
import { formatCurrency } from '../../services/tokenService';
import { format } from 'date-fns';

interface Transaction {
  blockNumber: number;
  transactionHash: string;
  args: any;
  timestamp?: number;
}

export default function TransactionHistory() {
  const { walletAddress } = useAuthStore();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'purchase' | 'transfer'>('all');

  const loadTransactions = useCallback(async () => {
    if (!walletAddress) return;

    try {
      setLoading(true);
      const txHistory = await web3Service.getTransactionHistory(walletAddress);
      
      // Enrich with timestamps (mock for demo)
      const enrichedTx = txHistory.map((tx, index) => ({
        ...tx,
        timestamp: Date.now() - (index * 3600000), // Mock: 1 hour apart
      }));

      setTransactions(enrichedTx);
    } catch (error) {
      console.error('Error loading transaction history:', error);
    } finally {
      setLoading(false);
    }
  }, [walletAddress]);

  useEffect(() => {
    if (walletAddress) {
      loadTransactions();
    }
  }, [walletAddress, loadTransactions]);

  const filteredTransactions = transactions.filter((tx) => {
    if (filter === 'all') return true;
    // Add filter logic based on transaction type
    return true;
  });

  const formatTxHash = (hash: string) => {
    return `${hash.substring(0, 10)}...${hash.substring(hash.length - 8)}`;
  };

  const getTransactionIcon = (type: string) => {
    return (
      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
        <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
          <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
        </svg>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Loading transaction history...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">Transaction History</h2>
          
          {/* Filter */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                filter === 'all'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter('purchase')}
              className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                filter === 'purchase'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Purchases
            </button>
            <button
              onClick={() => setFilter('transfer')}
              className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                filter === 'transfer'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Transfers
            </button>
          </div>
        </div>
      </div>

      {/* Transaction List */}
      <div className="divide-y divide-gray-200">
        {filteredTransactions.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-1">No Transactions Yet</h3>
            <p className="text-gray-600">Your blockchain transactions will appear here</p>
          </div>
        ) : (
          filteredTransactions.map((tx, index) => (
            <div key={index} className="px-6 py-4 hover:bg-gray-50 transition-colors">
              <div className="flex items-center gap-4">
                {/* Icon */}
                {getTransactionIcon('purchase')}

                {/* Transaction Info */}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-medium text-gray-900">Token Purchase</h3>
                    <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">
                      Success
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span className="font-mono">{formatTxHash(tx.transactionHash)}</span>
                    <span>Block #{tx.blockNumber}</span>
                    {tx.timestamp && (
                      <span>{format(new Date(tx.timestamp), 'MMM dd, yyyy HH:mm')}</span>
                    )}
                  </div>
                </div>

                {/* Action */}
                <a
                  href={`https://mumbai.polygonscan.com/tx/${tx.transactionHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-700"
                  aria-label="View transaction on PolygonScan"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Load More */}
      {filteredTransactions.length > 0 && (
        <div className="px-6 py-4 border-t border-gray-200">
          <button
            onClick={loadTransactions}
            className="w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
          >
            Load More
          </button>
        </div>
      )}
    </div>
  );
}
