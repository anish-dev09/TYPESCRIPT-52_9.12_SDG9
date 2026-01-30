import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface FundData {
  totalRaised: number;
  targetFunding: number;
  fundsReleased: number;
  fundsLocked: number;
  utilization: {
    construction: number;
    equipment: number;
    labor: number;
    materials: number;
    other: number;
  };
}

interface FundTrackerProps {
  data: FundData;
}

const COLORS = {
  raised: '#10B981',
  remaining: '#E5E7EB',
  released: '#3B82F6',
  locked: '#F59E0B',
  construction: '#8B5CF6',
  equipment: '#EC4899',
  labor: '#10B981',
  materials: '#F59E0B',
  other: '#6B7280',
};

export default function FundTracker({ data }: FundTrackerProps) {
  const fundingProgress = (data.totalRaised / data.targetFunding) * 100;
  const releaseProgress = (data.fundsReleased / data.totalRaised) * 100;

  const utilizationData = [
    { name: 'Construction', value: data.utilization.construction, color: COLORS.construction },
    { name: 'Equipment', value: data.utilization.equipment, color: COLORS.equipment },
    { name: 'Labor', value: data.utilization.labor, color: COLORS.labor },
    { name: 'Materials', value: data.utilization.materials, color: COLORS.materials },
    { name: 'Other', value: data.utilization.other, color: COLORS.other },
  ];

  const formatCurrency = (amount: number) => {
    if (amount >= 10000000) {
      return `₹${(amount / 10000000).toFixed(2)} Cr`;
    } else if (amount >= 100000) {
      return `₹${(amount / 100000).toFixed(2)} L`;
    }
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Real-Time Fund Tracker</h2>

      {/* Top Metrics Cards */}
      <div className="grid md:grid-cols-4 gap-4 mb-8">
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 border border-green-200">
          <div className="flex items-center gap-2 mb-2">
            <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span className="text-sm font-medium text-green-700">Total Raised</span>
          </div>
          <p className="text-2xl font-bold text-green-900">{formatCurrency(data.totalRaised)}</p>
          <p className="text-xs text-green-600 mt-1">{fundingProgress.toFixed(1)}% of target</p>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
          <div className="flex items-center gap-2 mb-2">
            <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
            </svg>
            <span className="text-sm font-medium text-blue-700">Funds Released</span>
          </div>
          <p className="text-2xl font-bold text-blue-900">{formatCurrency(data.fundsReleased)}</p>
          <p className="text-xs text-blue-600 mt-1">{releaseProgress.toFixed(1)}% released</p>
        </div>

        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg p-4 border border-yellow-200">
          <div className="flex items-center gap-2 mb-2">
            <svg className="w-5 h-5 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
            </svg>
            <span className="text-sm font-medium text-yellow-700">Funds Locked</span>
          </div>
          <p className="text-2xl font-bold text-yellow-900">{formatCurrency(data.fundsLocked)}</p>
          <p className="text-xs text-yellow-600 mt-1">In escrow</p>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 border border-purple-200">
          <div className="flex items-center gap-2 mb-2">
            <svg className="w-5 h-5 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
              <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
            </svg>
            <span className="text-sm font-medium text-purple-700">Target Funding</span>
          </div>
          <p className="text-2xl font-bold text-purple-900">{formatCurrency(data.targetFunding)}</p>
          <p className="text-xs text-purple-600 mt-1">Total goal</p>
        </div>
      </div>

      {/* Funding Progress Bar */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-lg font-semibold text-gray-900">Funding Progress</h3>
          <span className="text-sm font-medium text-gray-600">{fundingProgress.toFixed(1)}%</span>
        </div>
        <div className="relative w-full h-8 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="absolute top-0 left-0 h-full bg-gradient-to-r from-green-500 to-green-600 transition-all duration-500"
            {...({ style: { width: `${fundingProgress}%` } } as any)}
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xs font-semibold text-gray-700">
              {formatCurrency(data.totalRaised)} / {formatCurrency(data.targetFunding)}
            </span>
          </div>
        </div>
      </div>

      {/* Fund Release Progress Bar */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-lg font-semibold text-gray-900">Fund Release Status</h3>
          <span className="text-sm font-medium text-gray-600">{releaseProgress.toFixed(1)}%</span>
        </div>
        <div className="relative w-full h-8 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-500"
            {...({ style: { width: `${releaseProgress}%` } } as any)}
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xs font-semibold text-gray-700">
              {formatCurrency(data.fundsReleased)} released / {formatCurrency(data.fundsLocked)} locked
            </span>
          </div>
        </div>
      </div>

      {/* Fund Utilization Breakdown */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Fund Utilization Breakdown</h3>
        <div className="grid md:grid-cols-2 gap-6">
          {/* Pie Chart */}
          <div className="flex items-center justify-center">
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={utilizationData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {utilizationData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Legend with Amounts */}
          <div className="space-y-3">
            {utilizationData.map((item) => (
              <div key={item.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div
                    className="w-4 h-4 rounded"
                    {...({ style: { backgroundColor: item.color } } as any)}
                  />
                  <span className="font-medium text-gray-700">{item.name}</span>
                </div>
                <span className="font-semibold text-gray-900">{formatCurrency(item.value)}</span>
              </div>
            ))}
            <div className="pt-3 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-gray-900">Total Utilized</span>
                <span className="text-lg font-bold text-blue-600">
                  {formatCurrency(data.fundsReleased)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Transparency Badge */}
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-start gap-3">
          <svg className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          <div>
            <p className="font-semibold text-blue-900 mb-1">100% Transparent Fund Tracking</p>
            <p className="text-sm text-blue-700">
              All fund movements are recorded on the blockchain and verified by smart contracts. 
              Funds are released only upon milestone completion and multi-party verification.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
