import { useEffect, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import { useInvestmentStore } from '@/store/investmentStore';
import ProtectedRoute from '@/components/common/ProtectedRoute';
import PortfolioWidget from '@/components/dashboard/PortfolioWidget';
import InvestmentTimeline from '@/components/dashboard/InvestmentTimeline';
import PortfolioDiversification from '@/components/dashboard/PortfolioDiversification';
import apiService from '@/services/apiService';
import toast from 'react-hot-toast';

export default function Dashboard() {
  const { user } = useAuthStore();
  const { investments, totalInvested, totalTokens, activeProjects, loadInvestments, updatePortfolioSummary } = useInvestmentStore();
  const [loading, setLoading] = useState(true);
  const [monthlyInterest, setMonthlyInterest] = useState(0);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      // Load user's investments from API
      const response = await apiService.get('/investments/user');
      if (response.data) {
        loadInvestments(response.data);
        
        // Calculate monthly interest
        const interest = response.data.reduce((sum: number, inv: any) => {
          return sum + (inv.interestEarned || 0);
        }, 0);
        setMonthlyInterest(interest);
      }
    } catch (error) {
      console.error('Error loading dashboard:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProtectedRoute>
      <Head>
        <title>Dashboard - INFRACHAIN</title>
      </Head>

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Investment Dashboard</h1>
          <p className="text-gray-600">Welcome back, {user?.name}!</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Portfolio Widget with Summary Cards */}
            <PortfolioWidget
              totalInvested={totalInvested}
              totalTokens={totalTokens}
              activeProjects={activeProjects}
              monthlyInterest={monthlyInterest}
              investments={investments}
            />

            {/* Investment Timeline Chart */}
            {investments.length > 0 && (
              <InvestmentTimeline investments={investments} />
            )}

            {/* Portfolio Diversification */}
            {investments.length > 0 && (
              <PortfolioDiversification investments={investments} />
            )}

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
              <div className="grid md:grid-cols-3 gap-4">
                <Link
                  href="/projects"
                  className="flex items-center gap-3 p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
                >
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Browse Projects</p>
                    <p className="text-sm text-gray-600">Find new investments</p>
                  </div>
                </Link>

                <Link
                  href="/transparency"
                  className="flex items-center gap-3 p-4 border-2 border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors"
                >
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                      <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Track Transparency</p>
                    <p className="text-sm text-gray-600">View fund utilization</p>
                  </div>
                </Link>

                <button
                  onClick={loadDashboardData}
                  className="flex items-center gap-3 p-4 border-2 border-gray-200 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-colors"
                >
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Refresh Data</p>
                    <p className="text-sm text-gray-600">Update portfolio</p>
                  </div>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
