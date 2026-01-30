import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Investment } from '@/store/investmentStore';
import { formatCurrency } from '@/services/tokenService';

interface PortfolioDiversificationProps {
  investments: Investment[];
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'];

export default function PortfolioDiversification({ investments }: PortfolioDiversificationProps) {
  // Group investments by project
  const projectMap = investments.reduce((acc: any, investment) => {
    const projectName = investment.projectName;
    if (!acc[projectName]) {
      acc[projectName] = {
        name: projectName,
        value: 0,
        tokens: 0,
        count: 0,
      };
    }
    acc[projectName].value += investment.investmentAmount;
    acc[projectName].tokens += investment.tokensHeld;
    acc[projectName].count += 1;
    return acc;
  }, {});

  const data = Object.values(projectMap);

  // Calculate total investment
  const totalInvestment = investments.reduce((sum, inv) => sum + inv.investmentAmount, 0);

  if (data.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Portfolio Diversification</h3>
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
              d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z"
            />
          </svg>
          <p className="text-gray-500 mb-2">No diversification data yet</p>
          <p className="text-sm text-gray-400">Invest in multiple projects to see diversification</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h3 className="text-lg font-bold text-gray-900 mb-6">Portfolio Diversification</h3>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Pie Chart */}
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }: any) => `${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    const percentage = ((data.value / totalInvestment) * 100).toFixed(1);
                    return (
                      <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3">
                        <p className="text-sm font-semibold text-gray-900 mb-2">{data.name}</p>
                        <p className="text-sm text-gray-600 mb-1">
                          Amount: {formatCurrency(data.value)}
                        </p>
                        <p className="text-sm text-gray-600 mb-1">
                          Tokens: {data.tokens.toFixed(2)}
                        </p>
                        <p className="text-sm font-semibold text-blue-600">
                          {percentage}% of portfolio
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Project List */}
        <div className="space-y-3">
          <p className="text-sm text-gray-600 font-medium mb-3">
            Portfolio breakdown by project:
          </p>
          {data.map((project: any, index: number) => {
            const percentage = ((project.value / totalInvestment) * 100).toFixed(1);
            return (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1">
                  <div
                    className="w-4 h-4 rounded-full flex-shrink-0"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{project.name}</p>
                    <p className="text-xs text-gray-500">
                      {project.tokens.toFixed(2)} tokens • {project.count} {project.count === 1 ? 'investment' : 'investments'}
                    </p>
                  </div>
                </div>
                <div className="text-right ml-4">
                  <p className="text-sm font-semibold text-gray-900">{formatCurrency(project.value)}</p>
                  <p className="text-xs text-gray-500">{percentage}%</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Diversification Score */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600 mb-1">Diversification Score</p>
            <p className="text-xs text-gray-500">Based on portfolio spread across projects</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-blue-600">
              {Math.min(data.length * 20, 100)}/100
            </p>
            <p className="text-xs text-gray-500">
              {data.length === 1 && 'Consider diversifying'}
              {data.length === 2 && 'Fair diversification'}
              {data.length === 3 && 'Good diversification'}
              {data.length === 4 && 'Great diversification'}
              {data.length >= 5 && 'Excellent diversification'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
