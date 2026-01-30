import { useEffect, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import ProtectedRoute from '@/components/common/ProtectedRoute';
import apiService from '@/services/apiService';

export default function Dashboard() {
  const { user } = useAuthStore();
  const [portfolio, setPortfolio] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPortfolio();
  }, []);

  const loadPortfolio = async () => {
    try {
      const data = await apiService.getUserPortfolio();
      setPortfolio(data);
    } catch (error) {
      console.error('Error loading portfolio:', error);
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
          <>
            {/* Stats Grid */}
            <div className="grid md:grid-cols-4 gap-6 mb-8">
              <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-blue-500">
                <p className="text-sm text-gray-600 mb-1">Total Invested</p>
                <p className="text-3xl font-bold text-gray-900">
                  ${(user?.totalInvested || 0).toLocaleString()}
                </p>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-green-500">
                <p className="text-sm text-gray-600 mb-1">Tokens Held</p>
                <p className="text-3xl font-bold text-gray-900">
                  {(user?.totalTokens || 0).toLocaleString()}
                </p>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-yellow-500">
                <p className="text-sm text-gray-600 mb-1">Active Projects</p>
                <p className="text-3xl font-bold text-gray-900">
                  {portfolio?.investments?.length || 0}
                </p>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-purple-500">
                <p className="text-sm text-gray-600 mb-1">Est. Monthly Interest</p>
                <p className="text-3xl font-bold text-gray-900">
                  ${((user?.totalInvested || 0) * 0.007).toFixed(2)}
                </p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
              <div className="grid md:grid-cols-3 gap-4">
                <Link
                  href="/projects"
                  className="flex items-center gap-3 p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
                >
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <span className="text-2xl">🔍</span>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Browse Projects</p>
                    <p className="text-sm text-gray-600">Find new investments</p>
                  </div>
                </Link>

                <Link
                  href="/invest"
                  className="flex items-center gap-3 p-4 border-2 border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors"
                >
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <span className="text-2xl">💰</span>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Make Investment</p>
                    <p className="text-sm text-gray-600">Purchase bond tokens</p>
                  </div>
                </Link>

                <button
                  onClick={loadPortfolio}
                  className="flex items-center gap-3 p-4 border-2 border-gray-200 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-colors"
                >
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <span className="text-2xl">🔄</span>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Refresh Data</p>
                    <p className="text-sm text-gray-600">Update portfolio</p>
                  </div>
                </button>
              </div>
            </div>

            {/* Recent Investments */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Your Investments</h2>
              {portfolio?.investments && portfolio.investments.length > 0 ? (
                <div className="space-y-4">
                  {portfolio.investments.map((investment: any) => (
                    <div
                      key={investment.id}
                      className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                    >
                      <div>
                        <p className="font-semibold text-gray-900">{investment.project?.name || 'Unknown Project'}</p>
                        <p className="text-sm text-gray-600">
                          {investment.tokensMinted} tokens • ${investment.amount.toLocaleString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            investment.status === 'confirmed'
                              ? 'bg-green-100 text-green-800'
                              : investment.status === 'pending'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {investment.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-500 mb-4">No investments yet</p>
                  <Link
                    href="/projects"
                    className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                  >
                    Start Investing
                  </Link>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </ProtectedRoute>
  );
}
