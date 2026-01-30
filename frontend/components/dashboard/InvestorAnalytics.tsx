import React from 'react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface Portfolio {
  projectId: string;
  projectName: string;
  invested: number;
  currentValue: number;
  tokens: number;
  roi: number;
  category: string;
}

interface PerformanceData {
  month: string;
  portfolioValue: number;
  benchmark: number;
}

interface InvestorAnalyticsProps {
  portfolio: Portfolio[];
  performanceHistory: PerformanceData[];
  totalInvested: number;
  currentValue: number;
  totalROI: number;
  monthlyInterest: number;
}

const CATEGORY_COLORS: { [key: string]: string } = {
  'Transportation': '#3B82F6',
  'Energy': '#10B981',
  'Water': '#06B6D4',
  'Healthcare': '#EF4444',
  'Education': '#F59E0B',
  'Housing': '#8B5CF6',
};

export default function InvestorAnalytics({
  portfolio,
  performanceHistory,
  totalInvested,
  currentValue,
  totalROI,
  monthlyInterest,
}: InvestorAnalyticsProps) {
  const formatCurrency = (amount: number) => {
    if (amount >= 10000000) {
      return `₹${(amount / 10000000).toFixed(2)} Cr`;
    } else if (amount >= 100000) {
      return `₹${(amount / 100000).toFixed(2)} L`;
    }
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  // Calculate diversification data
  const diversificationData = portfolio.reduce((acc, item) => {
    const existing = acc.find(d => d.name === item.category);
    if (existing) {
      existing.value += item.currentValue;
    } else {
      acc.push({
        name: item.category,
        value: item.currentValue,
        color: CATEGORY_COLORS[item.category] || '#6B7280',
      });
    }
    return acc;
  }, [] as Array<{ name: string; value: number; color: string }>);

  // Sort portfolio by ROI
  const sortedPortfolio = [...portfolio].sort((a, b) => b.roi - a.roi);
  const bestPerforming = sortedPortfolio[0];
  const worstPerforming = sortedPortfolio[sortedPortfolio.length - 1];

  // Calculate average benchmark performance
  const avgBenchmark = performanceHistory.reduce((sum, item) => sum + item.benchmark, 0) / performanceHistory.length;
  const avgPortfolio = performanceHistory.reduce((sum, item) => sum + item.portfolioValue, 0) / performanceHistory.length;
  const outperformance = ((avgPortfolio - avgBenchmark) / avgBenchmark * 100).toFixed(2);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Investor Analytics</h2>
        <p className="text-gray-600">Track your investment performance and portfolio insights</p>
      </div>

      {/* Key Metrics */}
      <div className="grid md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-lg p-6 shadow-md">
          <div className="flex items-center gap-2 mb-2">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
            </svg>
            <span className="text-sm font-medium opacity-90">Total Invested</span>
          </div>
          <p className="text-3xl font-bold">{formatCurrency(totalInvested)}</p>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-lg p-6 shadow-md">
          <div className="flex items-center gap-2 mb-2">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" />
            </svg>
            <span className="text-sm font-medium opacity-90">Current Value</span>
          </div>
          <p className="text-3xl font-bold">{formatCurrency(currentValue)}</p>
          <p className="text-sm opacity-90 mt-1">+{totalROI.toFixed(2)}% ROI</p>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-lg p-6 shadow-md">
          <div className="flex items-center gap-2 mb-2">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
            </svg>
            <span className="text-sm font-medium opacity-90">Monthly Interest</span>
          </div>
          <p className="text-3xl font-bold">{formatCurrency(monthlyInterest)}</p>
          <p className="text-sm opacity-90 mt-1">Passive income</p>
        </div>

        <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 text-white rounded-lg p-6 shadow-md">
          <div className="flex items-center gap-2 mb-2">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
            </svg>
            <span className="text-sm font-medium opacity-90">Projects</span>
          </div>
          <p className="text-3xl font-bold">{portfolio.length}</p>
          <p className="text-sm opacity-90 mt-1">Diversified</p>
        </div>
      </div>

      {/* ROI Tracking Chart */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Portfolio Performance vs. Benchmark</h3>
        <div className="mb-4 flex gap-4">
          <div className="px-4 py-2 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-xs text-blue-600 font-medium">Your Portfolio</p>
            <p className="text-lg font-bold text-blue-700">{formatCurrency(currentValue)}</p>
          </div>
          <div className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg">
            <p className="text-xs text-gray-600 font-medium">Market Benchmark</p>
            <p className="text-lg font-bold text-gray-700">{formatCurrency(avgBenchmark)}</p>
          </div>
          <div className={`px-4 py-2 ${parseFloat(outperformance) >= 0 ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'} border rounded-lg`}>
            <p className="text-xs text-gray-600 font-medium">Outperformance</p>
            <p className={`text-lg font-bold ${parseFloat(outperformance) >= 0 ? 'text-green-700' : 'text-red-700'}`}>
              {parseFloat(outperformance) >= 0 ? '+' : ''}{outperformance}%
            </p>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={performanceHistory}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis tickFormatter={(value) => formatCurrency(value)} />
            <Tooltip formatter={(value: number) => formatCurrency(value)} />
            <Legend />
            <Line type="monotone" dataKey="portfolioValue" stroke="#3B82F6" strokeWidth={3} name="Your Portfolio" />
            <Line type="monotone" dataKey="benchmark" stroke="#6B7280" strokeWidth={2} strokeDasharray="5 5" name="Benchmark" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Portfolio Diversification */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Diversification Pie Chart */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Portfolio Diversification</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={diversificationData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {diversificationData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value: number) => formatCurrency(value)} />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-4 space-y-2">
            {diversificationData.map((item) => (
              <div key={item.name} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded"
                    {...({ style: { backgroundColor: item.color } } as any)}
                  />
                  <span className="text-sm font-medium text-gray-700">{item.name}</span>
                </div>
                <span className="text-sm font-semibold text-gray-900">{formatCurrency(item.value)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Top & Bottom Performers */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Performance Highlights</h3>
          
          {/* Best Performer */}
          <div className="mb-6 p-4 bg-green-50 border-2 border-green-200 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" />
              </svg>
              <span className="text-sm font-semibold text-green-700">Best Performer</span>
            </div>
            <p className="font-bold text-gray-900">{bestPerforming?.projectName}</p>
            <div className="mt-2 flex justify-between items-center">
              <span className="text-sm text-gray-600">ROI</span>
              <span className="text-lg font-bold text-green-600">+{bestPerforming?.roi.toFixed(2)}%</span>
            </div>
          </div>

          {/* Worst Performer */}
          {worstPerforming && worstPerforming.roi < 0 && (
            <div className="mb-6 p-4 bg-red-50 border-2 border-red-200 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M12 13a1 1 0 100 2h5a1 1 0 001-1V9a1 1 0 10-2 0v2.586l-4.293-4.293a1 1 0 00-1.414 0L8 9.586 3.707 5.293a1 1 0 00-1.414 1.414l5 5a1 1 0 001.414 0L11 9.414 14.586 13H12z" clipRule="evenodd" />
                </svg>
                <span className="text-sm font-semibold text-red-700">Needs Attention</span>
              </div>
              <p className="font-bold text-gray-900">{worstPerforming.projectName}</p>
              <div className="mt-2 flex justify-between items-center">
                <span className="text-sm text-gray-600">ROI</span>
                <span className="text-lg font-bold text-red-600">{worstPerforming.roi.toFixed(2)}%</span>
              </div>
            </div>
          )}

          {/* Top 3 Projects Bar Chart */}
          <div>
            <p className="text-sm font-semibold text-gray-700 mb-3">Top 3 Projects by ROI</p>
            <ResponsiveContainer width="100%" height={150}>
              <BarChart data={sortedPortfolio.slice(0, 3)}>
                <XAxis dataKey="projectName" tick={{ fontSize: 10 }} />
                <YAxis hide />
                <Tooltip formatter={(value: number) => `${value.toFixed(2)}%`} />
                <Bar dataKey="roi" fill="#10B981" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Insights & Recommendations */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-6 border-2 border-blue-200">
        <div className="flex items-start gap-3">
          <svg className="w-8 h-8 text-blue-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
            <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
          </svg>
          <div>
            <h3 className="text-lg font-bold text-blue-900 mb-2">Investment Insights</h3>
            <ul className="space-y-2 text-sm text-blue-800">
              <li className="flex items-start gap-2">
                <span>✓</span>
                <span>Your portfolio is outperforming the market benchmark by {outperformance}%</span>
              </li>
              <li className="flex items-start gap-2">
                <span>✓</span>
                <span>You&apos;re earning {formatCurrency(monthlyInterest)} per month in passive interest</span>
              </li>
              <li className="flex items-start gap-2">
                <span>💡</span>
                <span>Consider diversifying into {diversificationData.length < 3 ? 'more categories' : 'emerging sectors'} to reduce risk</span>
              </li>
              <li className="flex items-start gap-2">
                <span>📈</span>
                <span>Your best performing project is generating {bestPerforming?.roi.toFixed(2)}% ROI</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
