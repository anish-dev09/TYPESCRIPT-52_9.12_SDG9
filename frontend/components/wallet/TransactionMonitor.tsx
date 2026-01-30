import { useState, useEffect, useCallback } from 'react';
import web3Service from '../../services/web3Service';

interface TransactionMonitorProps {
  txHash: string;
  onComplete?: (success: boolean) => void;
}

export default function TransactionMonitor({ txHash, onComplete }: TransactionMonitorProps) {
  const [status, setStatus] = useState<'pending' | 'confirmed' | 'failed'>('pending');
  const [confirmations, setConfirmations] = useState(0);
  const [receipt, setReceipt] = useState<any>(null);

  const loadReceipt = useCallback(async () => {
    try {
      const txReceipt = await web3Service.getTransactionReceipt(txHash);
      setReceipt(txReceipt);
    } catch (error) {
      console.error('Error loading receipt:', error);
    }
  }, [txHash]);

  const monitorTransaction = useCallback(async () => {
    try {
      await web3Service.monitorTransaction(txHash, (update) => {
        setStatus(update.status);
        if (update.confirmations) {
          setConfirmations(update.confirmations);
        }

        if (update.status === 'confirmed' || update.status === 'failed') {
          loadReceipt();
          onComplete?.(update.status === 'confirmed');
        }
      });
    } catch (error) {
      console.error('Error monitoring transaction:', error);
      setStatus('failed');
    }
  }, [txHash, loadReceipt, onComplete]);

  useEffect(() => {
    monitorTransaction();
  }, [monitorTransaction]);

  const getStatusColor = () => {
    switch (status) {
      case 'pending':
        return 'text-yellow-600 bg-yellow-100';
      case 'confirmed':
        return 'text-green-600 bg-green-100';
      case 'failed':
        return 'text-red-600 bg-red-100';
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'pending':
        return (
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-yellow-600" />
        );
      case 'confirmed':
        return (
          <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        );
      case 'failed':
        return (
          <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
        );
    }
  };

  const formatTxHash = (hash: string) => {
    return `${hash.substring(0, 10)}...${hash.substring(hash.length - 8)}`;
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
      {/* Status Header */}
      <div className="flex items-center gap-3 mb-4">
        {getStatusIcon()}
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            Transaction {status === 'pending' ? 'Processing' : status === 'confirmed' ? 'Confirmed' : 'Failed'}
          </h3>
          <p className="text-sm text-gray-600">
            {status === 'pending' && 'Waiting for network confirmation...'}
            {status === 'confirmed' && `Confirmed with ${confirmations} confirmation(s)`}
            {status === 'failed' && 'Transaction failed or was reverted'}
          </p>
        </div>
      </div>

      {/* Transaction Hash */}
      <div className="mb-4">
        <div className="text-xs text-gray-500 mb-1">Transaction Hash</div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-mono text-gray-900">{formatTxHash(txHash)}</span>
          <a
            href={`https://mumbai.polygonscan.com/tx/${txHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-700 text-sm"
            aria-label="View transaction on PolygonScan"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        </div>
      </div>

      {/* Progress Bar */}
      {status === 'pending' && (
        <div className="mb-4">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-yellow-600 h-2 rounded-full animate-pulse w-2/3" />
          </div>
        </div>
      )}

      {/* Receipt Details */}
      {receipt && status === 'confirmed' && (
        <div className="mt-4 pt-4 border-t border-gray-200 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Block Number</span>
            <span className="font-medium text-gray-900">{receipt.blockNumber}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Gas Used</span>
            <span className="font-medium text-gray-900">{receipt.gasUsed}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Gas Price</span>
            <span className="font-medium text-gray-900">{receipt.effectiveGasPrice} Gwei</span>
          </div>
        </div>
      )}

      {/* Status Badge */}
      <div className="mt-4">
        <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor()}`}>
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </span>
      </div>
    </div>
  );
}
