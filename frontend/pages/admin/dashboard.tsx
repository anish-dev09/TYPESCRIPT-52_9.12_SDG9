import { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import apiService from '@/services/apiService';
import { formatCurrency } from '@/services/tokenService';
import Link from 'next/link';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<any>({
    totalUsers: 0,
    totalProjects: 0,
    totalInvestments: 0,
    totalFunding: 0,
    activeProjects: 0,
    pendingKYC: 0,
    recentInvestments: [],
    recentUsers: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardStats();
  }, []);

  const loadDashboardStats = async () => {
    try {
      setLoading(true);
      // Load admin stats
      const statsResponse = await apiService.get('/admin/stats');
      
      // Load projects
      const projectsResponse = await apiService.getProjects();
      const projects = projectsResponse.data || [];
      
      setStats({
        ...statsResponse.data,
        activeProjects: projects.filter((p: any) => p.status === 'active').length,
      });
    } catch (error) {
      console.error('Failed to load dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout title="Dashboard">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Dashboard">
      <div className="space-y-6">
        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Users</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalUsers || 0}</p>
              </div>
              <div className="text-4xl">👥</div>
            </div>
            <Link href="/admin/users" className="text-sm text-blue-600 hover:underline mt-2 block">
              Manage Users →
            </Link>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Projects</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalProjects || 0}</p>
                <p className="text-xs text-green-600 mt-1">{stats.activeProjects} active</p>
              </div>
              <div className="text-4xl">🏗️</div>
            </div>
            <Link href="/admin/projects" className="text-sm text-blue-600 hover:underline mt-2 block">
              Manage Projects →
            </Link>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Investments</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalInvestments || 0}</p>
              </div>
              <div className="text-4xl">💰</div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Funding</p>
                <p className="text-3xl font-bold text-gray-900">
                  {formatCurrency(stats.totalFunding || 0)}
                </p>
              </div>
              <div className="text-4xl">📈</div>
            </div>
          </div>
        </div>

        {/* KYC Pending & Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Pending Actions</h2>
            <div className="space-y-3">
              <Link
                href="/admin/kyc"
                className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg hover:bg-yellow-100 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="text-2xl">✅</div>
                  <div>
                    <p className="font-medium text-gray-900">KYC Approvals</p>
                    <p className="text-sm text-gray-600">{stats.pendingKYC || 0} pending reviews</p>
                  </div>
                </div>
                <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>

              <Link
                href="/admin/projects/create"
                className="flex items-center justify-between p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="text-2xl">➕</div>
                  <div>
                    <p className="font-medium text-gray-900">Create New Project</p>
                    <p className="text-sm text-gray-600">Add infrastructure project</p>
                  </div>
                </div>
                <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>

          {/* Platform Health */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Platform Health</h2>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Project Funding</span>
                  <span className="font-medium">75%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-green-600 h-2 rounded-full" style={{ width: '75%' }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">User Engagement</span>
                  <span className="font-medium">82%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full" style={{ width: '82%' }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">KYC Completion</span>
                  <span className="font-medium">68%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-yellow-600 h-2 rounded-full" style={{ width: '68%' }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Users */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold">Recent Users</h2>
            </div>
            <div className="p-6">
              {stats.recentUsers && stats.recentUsers.length > 0 ? (
                <div className="space-y-3">
                  {stats.recentUsers.slice(0, 5).map((user: any) => (
                    <div key={user.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold">
                          {user.name?.charAt(0) || 'U'}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{user.name || 'Unknown'}</p>
                          <p className="text-sm text-gray-500">{user.email}</p>
                        </div>
                      </div>
                      <span className="text-xs text-gray-500 capitalize">{user.role}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">No recent users</p>
              )}
            </div>
          </div>

          {/* Recent Investments */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold">Recent Investments</h2>
            </div>
            <div className="p-6">
              {stats.recentInvestments && stats.recentInvestments.length > 0 ? (
                <div className="space-y-3">
                  {stats.recentInvestments.slice(0, 5).map((investment: any) => (
                    <div key={investment.id} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">{investment.project?.name || 'Project'}</p>
                        <p className="text-sm text-gray-500">{investment.user?.name || 'Investor'}</p>
                      </div>
                      <span className="font-semibold text-green-600">
                        {formatCurrency(investment.amount)}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">No recent investments</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
