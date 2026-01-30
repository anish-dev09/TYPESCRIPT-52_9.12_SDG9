import { formatCurrency, calculateProgressPercentage } from '../../services/tokenService';

interface Milestone {
  id: string;
  title: string;
  status: string;
  targetDate: string;
  amountReleased?: number;
}

interface TransparencyChartProps {
  totalFunding: number;
  currentFunding: number;
  fundsReleased: number;
  fundsLocked: number;
  milestones: Milestone[];
}

export default function TransparencyChart({
  totalFunding,
  currentFunding,
  fundsReleased,
  fundsLocked,
  milestones,
}: TransparencyChartProps) {
  const progressPercentage = calculateProgressPercentage(currentFunding, totalFunding);
  const releasePercentage = totalFunding > 0 ? (fundsReleased / totalFunding) * 100 : 0;
  const lockedPercentage = totalFunding > 0 ? (fundsLocked / totalFunding) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Funding Overview */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-6">Fund Utilization</h3>
        
        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-600">Total Raised</span>
            <span className="font-semibold text-gray-900">
              {formatCurrency(currentFunding)} / {formatCurrency(totalFunding)}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="bg-blue-600 h-3 rounded-full transition-all"
              style={{ width: `${Math.min(progressPercentage, 100)}%` }}
            />
          </div>
        </div>

        {/* Fund Breakdown */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-sm text-gray-600 mb-1">Funds Released</div>
            <div className="text-xl font-bold text-green-600">{formatCurrency(fundsReleased)}</div>
            <div className="text-xs text-gray-500">{releasePercentage.toFixed(1)}% of total</div>
          </div>
          <div>
            <div className="text-sm text-gray-600 mb-1">Funds Locked</div>
            <div className="text-xl font-bold text-yellow-600">{formatCurrency(fundsLocked)}</div>
            <div className="text-xs text-gray-500">{lockedPercentage.toFixed(1)}% of total</div>
          </div>
        </div>

        {/* Visual Chart */}
        <div className="mt-6">
          <div className="flex h-8 rounded-lg overflow-hidden">
            <div
              className="bg-green-500 flex items-center justify-center text-white text-xs font-medium"
              style={{ width: `${releasePercentage}%` }}
              title={`Released: ${formatCurrency(fundsReleased)}`}
            >
              {releasePercentage > 10 && `${releasePercentage.toFixed(0)}%`}
            </div>
            <div
              className="bg-yellow-500 flex items-center justify-center text-white text-xs font-medium"
              style={{ width: `${lockedPercentage}%` }}
              title={`Locked: ${formatCurrency(fundsLocked)}`}
            >
              {lockedPercentage > 10 && `${lockedPercentage.toFixed(0)}%`}
            </div>
            <div
              className="bg-gray-200 flex items-center justify-center text-gray-500 text-xs font-medium"
              style={{ width: `${100 - releasePercentage - lockedPercentage}%` }}
            >
              {(100 - releasePercentage - lockedPercentage) > 10 && 'Pending'}
            </div>
          </div>
          <div className="flex justify-between text-xs text-gray-600 mt-2">
            <span>Released</span>
            <span>Locked in Escrow</span>
            <span>Yet to Raise</span>
          </div>
        </div>
      </div>

      {/* Milestone Timeline */}
      {milestones && milestones.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-6">Milestone Timeline</h3>
          <div className="space-y-4">
            {milestones.map((milestone, index) => (
              <div key={milestone.id} className="flex items-start gap-4">
                <div className="flex-shrink-0 relative">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    milestone.status === 'completed'
                      ? 'bg-green-100 text-green-600'
                      : milestone.status === 'in_progress'
                      ? 'bg-blue-100 text-blue-600'
                      : 'bg-gray-100 text-gray-400'
                  }`}>
                    {milestone.status === 'completed' ? (
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      <span className="text-sm font-medium">{index + 1}</span>
                    )}
                  </div>
                  {index < milestones.length - 1 && (
                    <div className={`absolute top-10 left-5 w-0.5 h-full ${
                      milestone.status === 'completed' ? 'bg-green-300' : 'bg-gray-200'
                    }`} />
                  )}
                </div>
                <div className="flex-1 pb-8">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-medium text-gray-900">{milestone.title}</h4>
                      <p className="text-sm text-gray-600 mt-1">
                        Target: {new Date(milestone.targetDate).toLocaleDateString()}
                      </p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      milestone.status === 'completed'
                        ? 'bg-green-100 text-green-800'
                        : milestone.status === 'in_progress'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {milestone.status.replace('_', ' ')}
                    </span>
                  </div>
                  {milestone.amountReleased && milestone.amountReleased > 0 && (
                    <div className="mt-2 text-sm text-green-600 font-medium">
                      Released: {formatCurrency(milestone.amountReleased)}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
