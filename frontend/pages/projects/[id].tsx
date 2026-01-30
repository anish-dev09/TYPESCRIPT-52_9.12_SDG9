import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '../../components/common/Layout';
import InvestmentFlow from '../../components/investment/InvestmentFlow';
import apiService from '../../services/apiService';
import { Project } from '../../store/investmentStore';
import { formatCurrency, calculateProgressPercentage, getRiskColor, getStatusColor } from '../../services/tokenService';
import toast from 'react-hot-toast';

export default function ProjectDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [showInvestmentFlow, setShowInvestmentFlow] = useState(false);
  const [milestones, setMilestones] = useState<any[]>([]);

  useEffect(() => {
    if (id) {
      loadProjectDetails();
      loadMilestones();
    }
  }, [id]);

  const loadProjectDetails = async () => {
    try {
      setLoading(true);
      const response = await apiService.getProject(id as string);
      setProject(response.data);
    } catch (error: any) {
      console.error('Failed to load project:', error);
      toast.error('Failed to load project details');
      router.push('/projects');
    } finally {
      setLoading(false);
    }
  };

  const loadMilestones = async () => {
    try {
      const response = await apiService.getMilestones(id as string);
      setMilestones(response.data || []);
    } catch (error) {
      console.error('Failed to load milestones:', error);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </Layout>
    );
  }

  if (!project) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900">Project not found</h2>
            <button
              onClick={() => router.push('/projects')}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Back to Projects
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  const progressPercentage = calculateProgressPercentage(
    project.currentFunding,
    project.targetFunding
  );

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Back Button */}
          <button
            onClick={() => router.push('/projects')}
            className="mb-6 flex items-center text-gray-600 hover:text-gray-900"
          >
            <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Projects
          </button>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Project Header */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                      {project.name}
                    </h1>
                    <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                      {project.location && (
                        <span className="flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          </svg>
                          {project.location}
                        </span>
                      )}
                      {project.category && (
                        <span className="flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                          </svg>
                          {project.category}
                        </span>
                      )}
                    </div>
                    
                    {/* Social Proof - Investor Count */}
                    <div className="flex items-center gap-2 mt-3">
                      <div className="flex -space-x-2">
                        {[...Array(Math.min(project.investorCount || 0, 5))].map((_, i) => (
                          <div
                            key={i}
                            className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 border-2 border-white flex items-center justify-center text-white text-xs font-bold"
                          >
                            {String.fromCharCode(65 + i)}
                          </div>
                        ))}
                      </div>
                      <span className="text-sm font-medium text-gray-700">
                        {project.investorCount ? (
                          <>
                            <span className="text-blue-600 font-bold">{project.investorCount.toLocaleString()}</span>{' '}
                            {project.investorCount === 1 ? 'investor' : 'investors'} backed this project
                          </>
                        ) : (
                          <span className="text-gray-500">Be the first investor!</span>
                        )}
                      </span>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(project.status)}`}>
                    {project.status}
                  </span>
                </div>

                <p className="text-gray-700 leading-relaxed">
                  {project.description}
                </p>
              </div>

              {/* Key Metrics */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white rounded-lg shadow-sm p-4">
                  <div className="text-sm text-gray-600 mb-1">Interest Rate</div>
                  <div className="text-2xl font-bold text-green-600">{project.interestRate}%</div>
                </div>
                <div className="bg-white rounded-lg shadow-sm p-4">
                  <div className="text-sm text-gray-600 mb-1">Duration</div>
                  <div className="text-2xl font-bold text-gray-900">{project.duration}m</div>
                </div>
                <div className="bg-white rounded-lg shadow-sm p-4">
                  <div className="text-sm text-gray-600 mb-1">Risk Level</div>
                  <div className={`inline-block px-3 py-1 rounded-lg text-sm font-bold ${getRiskColor(project.risk)}`}>
                    {project.risk}
                  </div>
                </div>
                <div className="bg-white rounded-lg shadow-sm p-4">
                  <div className="text-sm text-gray-600 mb-1">Token Price</div>
                  <div className="text-2xl font-bold text-blue-600">{formatCurrency(project.tokenPrice)}</div>
                </div>
              </div>

              {/* Funding Progress */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Funding Progress</h2>
                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-600">Target: {formatCurrency(project.targetFunding)}</span>
                    <span className="font-semibold text-gray-900">{progressPercentage.toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-blue-600 h-3 rounded-full transition-all"
                      style={{ width: `${Math.min(progressPercentage, 100)}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-sm text-gray-600 mt-2">
                    <span>Raised: {formatCurrency(project.currentFunding)}</span>
                    <span>Remaining: {formatCurrency(project.targetFunding - project.currentFunding)}</span>
                  </div>
                </div>
              </div>

              {/* Milestones */}
              {milestones.length > 0 && (
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">Project Milestones</h2>
                  <div className="space-y-4">
                    {milestones.map((milestone, index) => (
                      <div key={milestone.id} className="flex items-start gap-4">
                        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                          milestone.status === 'completed' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
                        }`}>
                          {milestone.status === 'completed' ? (
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          ) : (
                            <span className="text-sm font-medium">{index + 1}</span>
                          )}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900">{milestone.title}</h3>
                          <p className="text-sm text-gray-600">{milestone.description}</p>
                          <div className="text-xs text-gray-500 mt-1">
                            Target: {new Date(milestone.targetDate).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar - Investment Card */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-sm p-6 sticky top-8">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Invest in this Project</h2>
                
                <div className="space-y-4 mb-6">
                  <div>
                    <span className="text-sm text-gray-600">Minimum Investment</span>
                    <div className="text-lg font-semibold text-gray-900">{formatCurrency(100)}</div>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Expected Monthly Returns</span>
                    <div className="text-lg font-semibold text-green-600">
                      {((project.interestRate / 12) * 100).toFixed(2)}%
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setShowInvestmentFlow(true)}
                  className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Start Investment
                </button>

                <div className="mt-6 pt-6 border-t border-gray-200 space-y-2 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>Blockchain secured</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>Instant liquidity</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>Transparent tracking</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Investment Flow Modal */}
      {showInvestmentFlow && (
        <InvestmentFlow
          project={project}
          onClose={() => setShowInvestmentFlow(false)}
        />
      )}
    </Layout>
  );
}
