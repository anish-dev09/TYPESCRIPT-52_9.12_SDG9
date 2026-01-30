import { Project } from '../../store/investmentStore';
import { formatCurrency, calculateProgressPercentage, getRiskColor, getStatusColor } from '../../services/tokenService';

interface ProjectCardProps {
  project: Project;
  onClick: () => void;
}

export default function ProjectCard({ project, onClick }: ProjectCardProps) {
  const progressPercentage = calculateProgressPercentage(
    project.currentFunding,
    project.targetFunding
  );

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer overflow-hidden"
    >
      {/* Project Image/Icon */}
      <div className="bg-gradient-to-br from-blue-500 to-blue-600 h-40 flex items-center justify-center">
        <svg
          className="w-16 h-16 text-white opacity-80"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
          />
        </svg>
      </div>

      <div className="p-6">
        {/* Header */}
        <div className="mb-4">
          <div className="flex items-start justify-between mb-2">
            <h3 className="text-lg font-bold text-gray-900 flex-1 mr-2">
              {project.name}
            </h3>
            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(project.status)}`}>
              {project.status}
            </span>
          </div>
          <p className="text-sm text-gray-600 line-clamp-2">
            {project.description}
          </p>
        </div>

        {/* Location & Category */}
        {(project.location || project.category) && (
          <div className="flex items-center gap-4 mb-4 text-sm text-gray-500">
            {project.location && (
              <div className="flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>{project.location}</span>
              </div>
            )}
            {project.category && (
              <div className="flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
                <span>{project.category}</span>
              </div>
            )}
          </div>
        )}

        {/* Social Proof Badge */}
        {project.investorCount && project.investorCount > 0 && (
          <div className="mb-4 flex items-center gap-2 text-sm">
            <div className="flex -space-x-1">
              {[...Array(Math.min(project.investorCount, 3))].map((_, i) => (
                <div
                  key={i}
                  className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 border-2 border-white"
                />
              ))}
            </div>
            <span className="text-gray-600">
              <span className="font-semibold text-gray-900">{project.investorCount.toLocaleString()}</span>{' '}
              {project.investorCount === 1 ? 'investor' : 'investors'}
            </span>
          </div>
        )}

        {/* Funding Progress */}
        <div className="mb-4">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-600">Funding Progress</span>
            <span className="font-semibold text-gray-900">
              {progressPercentage.toFixed(1)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all"
              style={{ width: `${Math.min(progressPercentage, 100)}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>{formatCurrency(project.currentFunding)}</span>
            <span>{formatCurrency(project.targetFunding)}</span>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-3 gap-4 mb-4 pb-4 border-b border-gray-200">
          <div>
            <div className="text-xs text-gray-500 mb-1">Interest Rate</div>
            <div className="text-sm font-semibold text-green-600">
              {project.interestRate}%
            </div>
          </div>
          <div>
            <div className="text-xs text-gray-500 mb-1">Duration</div>
            <div className="text-sm font-semibold text-gray-900">
              {project.duration} months
            </div>
          </div>
          <div>
            <div className="text-xs text-gray-500 mb-1">Risk Level</div>
            <div className={`text-xs font-semibold px-2 py-1 rounded ${getRiskColor(project.risk)}`}>
              {project.risk}
            </div>
          </div>
        </div>

        {/* Token Price */}
        <div className="flex justify-between items-center">
          <div>
            <div className="text-xs text-gray-500">Token Price</div>
            <div className="text-lg font-bold text-gray-900">
              {formatCurrency(project.tokenPrice)}
            </div>
          </div>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
            Invest Now
          </button>
        </div>
      </div>
    </div>
  );
}
