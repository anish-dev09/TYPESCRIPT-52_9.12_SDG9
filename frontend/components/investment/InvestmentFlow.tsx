import { useState } from 'react';
import { useInvestmentStore, Project } from '../../store/investmentStore';
import { useAuthStore } from '../../store/authStore';
import { formatCurrency, validateInvestmentAmount, calculateTokensForInvestment } from '../../services/tokenService';
import web3Service from '../../services/web3Service';
import apiService from '../../services/apiService';
import TransactionMonitor from '../wallet/TransactionMonitor';
import toast from 'react-hot-toast';

interface InvestmentFlowProps {
  project: Project;
  onClose: () => void;
}

export default function InvestmentFlow({ project, onClose }: InvestmentFlowProps) {
  const { user, isAuthenticated } = useAuthStore();
  const { selectProject, setInvestmentAmount, startTransaction, updateTransaction, completeInvestment } = useInvestmentStore();
  
  const [step, setStep] = useState(1);
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [txHash, setTxHash] = useState<string>('');
  const [gasEstimate, setGasEstimate] = useState<{
    gasLimit: bigint;
    gasPrice: bigint;
    estimatedCost: string;
  } | null>(null);

  const handleAmountChange = (value: string) => {
    setAmount(value);
  };

  const tokens = calculateTokensForInvestment(parseFloat(amount) || 0, project.tokenPrice);

  const handleNextStep = async () => {
    if (step === 1) {
      const numAmount = parseFloat(amount) || 0;
      const validation = validateInvestmentAmount(numAmount, 100);
      
      if (!validation.valid) {
        toast.error(validation.error || 'Invalid amount');
        return;
      }
      
      selectProject(project);
      setStep(2);
      
      // Estimate gas for the transaction
      try {
        const estimate = await web3Service.estimateGasForPurchase(project.id, amount);
        setGasEstimate(estimate);
      } catch (error) {
        console.error('Gas estimation failed:', error);
        // Continue without gas estimate
      }
    } else if (step === 2) {
      setStep(3);
    }
  };

  const handleInvest = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to invest');
      return;
    }

    // Check wallet connection
    const walletConnected = await web3Service.getCurrentAccount();
    if (!walletConnected) {
      toast.error('Please connect your wallet first');
      return;
    }

    try {
      setLoading(true);
      startTransaction();
      
      // PHASE 8: Blockchain token purchase
      const { txHash: transactionHash, tokensMinted } = await web3Service.purchaseTokens(
        project.id,
        amount
      );

      setTxHash(transactionHash);
      
      // Call backend API to record investment
      const response = await apiService.createInvestment({
        projectId: parseInt(project.id, 10),
        amount: parseFloat(amount),
        tokensMinted,
        transactionHash,
      });

      // Complete investment
      completeInvestment({
        id: response.data.id,
        projectId: project.id,
        projectName: project.name,
        tokenAmount: tokensMinted,
        tokensHeld: tokensMinted,
        investmentAmount: parseFloat(amount),
        purchaseDate: new Date().toISOString(),
        interestEarned: 0,
        currentValue: parseFloat(amount),
      });

      toast.success('Investment successful!');
      setStep(4);
    } catch (error: any) {
      console.error('Investment failed:', error);
      toast.error(error.response?.data?.message || 'Investment failed');
      updateTransaction({ status: 'error', message: 'Investment failed' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">
            {step === 4 ? 'Investment Complete!' : 'Invest in Project'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
            aria-label="Close investment modal"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Progress Steps */}
        {step < 4 && (
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              {[1, 2, 3].map((s) => (
                <div key={s} className="flex items-center flex-1">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    step >= s ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-400'
                  }`}>
                    {s}
                  </div>
                  {s < 3 && (
                    <div className={`flex-1 h-1 mx-2 ${
                      step > s ? 'bg-blue-600' : 'bg-gray-200'
                    }`} />
                  )}
                </div>
              ))}
            </div>
            <div className="flex justify-between mt-2 text-xs text-gray-600">
              <span>Amount</span>
              <span>Review</span>
              <span>Confirm</span>
            </div>
          </div>
        )}

        {/* Content */}
        <div className="p-6">
          {/* Step 1: Enter Amount */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{project.name}</h3>
                <p className="text-sm text-gray-600">{project.description}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Investment Amount
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-3 text-gray-500">₹</span>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => handleAmountChange(e.target.value)}
                    placeholder="Enter amount (min ₹100)"
                    className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    min="100"
                  />
                </div>
                <p className="text-sm text-gray-500 mt-1">Minimum investment: ₹100</p>
              </div>

              {amount && parseFloat(amount) >= 100 && (
                <div className="bg-blue-50 rounded-lg p-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">You will receive</span>
                    <span className="font-semibold text-gray-900">{tokens.toFixed(2)} tokens</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Token Price</span>
                    <span className="font-semibold text-gray-900">{formatCurrency(project.tokenPrice)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Interest Rate</span>
                    <span className="font-semibold text-green-600">{project.interestRate}% p.a.</span>
                  </div>
                </div>
              )}

              <button
                onClick={handleNextStep}
                disabled={!amount || parseFloat(amount) < 100}
                className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium"
              >
                Continue
              </button>
            </div>
          )}

          {/* Step 2: Review */}
          {step === 2 && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Review Investment</h3>

              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Project</span>
                  <span className="font-semibold text-gray-900">{project.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Investment Amount</span>
                  <span className="font-semibold text-gray-900">{formatCurrency(parseFloat(amount))}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tokens</span>
                  <span className="font-semibold text-gray-900">{tokens.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Interest Rate</span>
                  <span className="font-semibold text-green-600">{project.interestRate}% p.a.</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Duration</span>
                  <span className="font-semibold text-gray-900">{project.duration} months</span>
                </div>
                {gasEstimate && (
                  <div className="pt-3 border-t border-gray-200">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Estimated Gas Fee</span>
                      <span className="font-semibold text-gray-900">{gasEstimate.estimatedCost} MATIC</span>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => setStep(1)}
                  className="flex-1 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  Back
                </button>
                <button
                  onClick={handleNextStep}
                  className="flex-1 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Confirm
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Confirm & Process */}
          {step === 3 && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Confirm Transaction</h3>
                <p className="text-sm text-gray-600">
                  Click the button below to complete your investment
                </p>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-sm text-yellow-800">
                  ⚠️ Please review all details before confirming. This action cannot be undone.
                </p>
              </div>

              <button
                onClick={handleInvest}
                disabled={loading}
                className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-300 transition-colors font-medium flex items-center justify-center"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Processing...
                  </>
                ) : (
                  'Complete Investment'
                )}
              </button>
            </div>
          )}

          {/* Step 4: Success */}
          {step === 4 && (
            <div className="space-y-6">
              {/* Success Header */}
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Investment Successful!</h3>
                <p className="text-gray-600">
                  You have successfully invested {formatCurrency(parseFloat(amount))} in {project.name}
                </p>
              </div>

              {/* Transaction Monitor */}
              {txHash && <TransactionMonitor txHash={txHash} />}

              {/* Investment Summary */}
              <div className="bg-green-50 rounded-lg p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Tokens Received</span>
                  <span className="font-semibold text-gray-900">{tokens.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Expected Monthly Interest</span>
                  <span className="font-semibold text-green-600">
                    {formatCurrency((parseFloat(amount) * project.interestRate) / 12 / 100)}
                  </span>
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => window.location.href = '/dashboard'}
                  className="flex-1 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  View Dashboard
                </button>
                <button
                  onClick={onClose}
                  className="flex-1 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
