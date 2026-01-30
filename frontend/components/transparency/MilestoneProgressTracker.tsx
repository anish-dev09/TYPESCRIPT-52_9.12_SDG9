import React from 'react';
import { format } from 'date-fns';

interface Milestone {
  id: string;
  name: string;
  description: string;
  targetDate: string;
  completedDate?: string;
  status: 'completed' | 'in-progress' | 'pending' | 'delayed';
  fundReleaseAmount: number;
  progressPercentage: number;
  deliverables: string[];
}

interface MilestoneProgressTrackerProps {
  milestones: Milestone[];
  totalFunding: number;
}

const statusConfig = {
  completed: {
    color: 'bg-green-500',
    textColor: 'text-green-700',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    icon: (
      <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
      </svg>
    ),
  },
  'in-progress': {
    color: 'bg-blue-500',
    textColor: 'text-blue-700',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    icon: (
      <svg className="w-6 h-6 text-white animate-spin" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
      </svg>
    ),
  },
  pending: {
    color: 'bg-gray-400',
    textColor: 'text-gray-700',
    bgColor: 'bg-gray-50',
    borderColor: 'border-gray-200',
    icon: (
      <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
      </svg>
    ),
  },
  delayed: {
    color: 'bg-red-500',
    textColor: 'text-red-700',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    icon: (
      <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
      </svg>
    ),
  },
};

export default function MilestoneProgressTracker({ milestones, totalFunding }: MilestoneProgressTrackerProps) {
  const completedMilestones = milestones.filter(m => m.status === 'completed').length;
  const totalProgress = (completedMilestones / milestones.length) * 100;
  const totalReleased = milestones
    .filter(m => m.status === 'completed')
    .reduce((sum, m) => sum + m.fundReleaseAmount, 0);

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
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Milestone Progress Tracker</h2>

      {/* Overview Cards */}
      <div className="grid md:grid-cols-3 gap-4 mb-8">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
          <div className="flex items-center gap-2 mb-2">
            <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
              <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm9.707 5.707a1 1 0 00-1.414-1.414L9 12.586l-1.293-1.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span className="text-sm font-medium text-blue-700">Overall Progress</span>
          </div>
          <p className="text-2xl font-bold text-blue-900">{totalProgress.toFixed(1)}%</p>
          <p className="text-xs text-blue-600 mt-1">{completedMilestones} of {milestones.length} milestones</p>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 border border-green-200">
          <div className="flex items-center gap-2 mb-2">
            <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
            </svg>
            <span className="text-sm font-medium text-green-700">Funds Released</span>
          </div>
          <p className="text-2xl font-bold text-green-900">{formatCurrency(totalReleased)}</p>
          <p className="text-xs text-green-600 mt-1">{((totalReleased / totalFunding) * 100).toFixed(1)}% of total</p>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 border border-purple-200">
          <div className="flex items-center gap-2 mb-2">
            <svg className="w-5 h-5 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
            </svg>
            <span className="text-sm font-medium text-purple-700">Completion Status</span>
          </div>
          <p className="text-2xl font-bold text-purple-900">{completedMilestones}/{milestones.length}</p>
          <p className="text-xs text-purple-600 mt-1">Milestones completed</p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-lg font-semibold text-gray-900">Overall Completion</h3>
          <span className="text-sm font-medium text-gray-600">{totalProgress.toFixed(1)}%</span>
        </div>
        <div className="relative w-full h-4 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-500 via-purple-500 to-green-500 transition-all duration-500"
            {...({ style: { width: `${totalProgress}%` } } as any)}
          />
        </div>
      </div>

      {/* Timeline */}
      <div className="space-y-4">
        {milestones.map((milestone, index) => {
          const config = statusConfig[milestone.status];
          const isLast = index === milestones.length - 1;

          return (
            <div key={milestone.id} className="relative">
              {/* Timeline Line */}
              {!isLast && (
                <div className="absolute left-6 top-12 bottom-0 w-0.5 bg-gray-200" />
              )}

              {/* Milestone Card */}
              <div className={`relative flex gap-4 p-4 rounded-lg border-2 ${config.borderColor} ${config.bgColor}`}>
                {/* Status Icon */}
                <div className={`flex-shrink-0 w-12 h-12 rounded-full ${config.color} flex items-center justify-center`}>
                  {config.icon}
                </div>

                {/* Content */}
                <div className="flex-1">
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">{milestone.name}</h3>
                      <p className="text-sm text-gray-600 mt-1">{milestone.description}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${config.textColor} ${config.bgColor} border ${config.borderColor} whitespace-nowrap`}>
                      {milestone.status.charAt(0).toUpperCase() + milestone.status.slice(1).replace('-', ' ')}
                    </span>
                  </div>

                  {/* Details Grid */}
                  <div className="grid md:grid-cols-2 gap-4 mt-3">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Target Date</p>
                      <p className="text-sm font-semibold text-gray-900">
                        {format(new Date(milestone.targetDate), 'MMM dd, yyyy')}
                      </p>
                    </div>
                    {milestone.completedDate && (
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Completed Date</p>
                        <p className="text-sm font-semibold text-green-700">
                          {format(new Date(milestone.completedDate), 'MMM dd, yyyy')}
                        </p>
                      </div>
                    )}
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Fund Release</p>
                      <p className="text-sm font-semibold text-gray-900">
                        {formatCurrency(milestone.fundReleaseAmount)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Progress</p>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${config.color} transition-all duration-500`}
                            {...({ style: { width: `${milestone.progressPercentage}%` } } as any)}
                          />
                        </div>
                        <span className="text-sm font-semibold text-gray-900 whitespace-nowrap">
                          {milestone.progressPercentage}%
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Deliverables */}
                  {milestone.deliverables.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <p className="text-xs font-semibold text-gray-700 mb-2">Key Deliverables:</p>
                      <ul className="space-y-1">
                        {milestone.deliverables.map((deliverable, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-xs text-gray-600">
                            <svg className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            {deliverable}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Smart Contract Info */}
      <div className="mt-6 p-4 bg-indigo-50 border border-indigo-200 rounded-lg">
        <div className="flex items-start gap-3">
          <svg className="w-6 h-6 text-indigo-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          <div>
            <p className="font-semibold text-indigo-900 mb-1">Smart Contract Enforced</p>
            <p className="text-sm text-indigo-700">
              Funds are automatically released only when milestones are verified and approved by project supervisors and independent auditors. All milestone completions are recorded immutably on the blockchain.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
