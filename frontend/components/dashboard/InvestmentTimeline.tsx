import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Investment } from '@/store/investmentStore';
import { formatCurrency } from '@/services/tokenService';

interface InvestmentTimelineProps {
  investments: Investment[];
}

export default function InvestmentTimeline({ investments }: InvestmentTimelineProps) {
  // Sort investments by date and create cumulative data
  const sortedInvestments = [...investments].sort(
    (a, b) => new Date(a.purchaseDate).getTime() - new Date(b.purchaseDate).getTime()
  );

  // Create timeline data with cumulative values
  const timelineData = sortedInvestments.reduce((acc: any[], investment, index) => {
    const previousTotal = index > 0 ? acc[index - 1].cumulative : 0;
    const previousInterest = index > 0 ? acc[index - 1].totalInterest : 0;

    acc.push({
      date: new Date(investment.purchaseDate).toLocaleDateString('en-IN', {
        month: 'short',
        day: 'numeric',
      }),
      investment: investment.investmentAmount,
      cumulative: previousTotal + investment.investmentAmount,
      totalInterest: previousInterest + investment.interestEarned,
      projectName: investment.projectName,
    });

    return acc;
  }, []);

  // If no investments, show empty state
  if (timelineData.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Investment Timeline</h3>
        <div className="text-center py-12">
          <svg
            className="mx-auto h-16 w-16 text-gray-400 mb-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
            />
          </svg>
          <p className="text-gray-500 mb-2">No investment history yet</p>
          <p className="text-sm text-gray-400">Your investment timeline will appear here</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h3 className="text-lg font-bold text-gray-900 mb-6">Investment Timeline</h3>

      {/* Chart */}
      <div className="h-80 mb-6">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={timelineData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis
              dataKey="date"
              stroke="#6b7280"
              style={{ fontSize: '12px' }}
            />
            <YAxis
              stroke="#6b7280"
              style={{ fontSize: '12px' }}
              tickFormatter={(value) => `₹${(value / 100000).toFixed(0)}L`}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3">
                      <p className="text-sm font-semibold text-gray-900 mb-2">
                        {payload[0].payload.date}
                      </p>
                      <p className="text-xs text-gray-600 mb-1">
                        {payload[0].payload.projectName}
                      </p>
                      <p className="text-sm text-blue-600 mb-1">
                        Investment: {formatCurrency(payload[0].payload.investment)}
                      </p>
                      <p className="text-sm text-purple-600 mb-1">
                        Cumulative: {formatCurrency(payload[0].payload.cumulative)}
                      </p>
                      <p className="text-sm text-green-600">
                        Interest Earned: {formatCurrency(payload[0].payload.totalInterest)}
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Legend
              wrapperStyle={{ fontSize: '12px' }}
              iconType="line"
            />
            <Line
              type="monotone"
              dataKey="cumulative"
              stroke="#3b82f6"
              strokeWidth={2}
              name="Total Invested"
              dot={{ fill: '#3b82f6', r: 4 }}
              activeDot={{ r: 6 }}
            />
            <Line
              type="monotone"
              dataKey="totalInterest"
              stroke="#10b981"
              strokeWidth={2}
              name="Total Interest"
              dot={{ fill: '#10b981', r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-200">
        <div>
          <p className="text-sm text-gray-600 mb-1">Total Investments</p>
          <p className="text-xl font-bold text-blue-600">{investments.length}</p>
        </div>
        <div>
          <p className="text-sm text-gray-600 mb-1">Total Invested</p>
          <p className="text-xl font-bold text-purple-600">
            {formatCurrency(
              timelineData[timelineData.length - 1]?.cumulative || 0
            )}
          </p>
        </div>
        <div>
          <p className="text-sm text-gray-600 mb-1">Total Interest</p>
          <p className="text-xl font-bold text-green-600">
            {formatCurrency(
              timelineData[timelineData.length - 1]?.totalInterest || 0
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
