import { ReactNode, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuthStore } from '@/store/authStore';

interface AdminLayoutProps {
  children: ReactNode;
  title?: string;
}

export default function AdminLayout({ children, title = 'Admin Panel' }: AdminLayoutProps) {
  const { user, isAuthenticated, logout } = useAuthStore();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const isAdmin = user?.role === 'admin';
  const isProjectManager = user?.role === 'project_manager';
  const canAccess = isAdmin || isProjectManager;

  if (!isAuthenticated || !canAccess) {
    if (typeof window !== 'undefined') {
      router.push('/');
    }
    return null;
  }

  const navigation = [
    {
      name: 'Overview',
      href: '/admin/dashboard',
      icon: '📊',
      roles: ['admin', 'project_manager'],
    },
    {
      name: 'Projects',
      href: '/admin/projects',
      icon: '🏗️',
      roles: ['admin', 'project_manager'],
    },
    {
      name: 'Users',
      href: '/admin/users',
      icon: '👥',
      roles: ['admin'],
    },
    {
      name: 'KYC Approvals',
      href: '/admin/kyc',
      icon: '✅',
      roles: ['admin'],
    },
    {
      name: 'Analytics',
      href: '/admin/analytics',
      icon: '📈',
      roles: ['admin'],
    },
  ];

  const filteredNavigation = navigation.filter((item) =>
    item.roles.includes(user?.role || '')
  );

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  return (
    <>
      <Head>
        <title>{title} - INFRACHAIN Admin</title>
      </Head>

      <div className="min-h-screen bg-gray-100">
        {/* Sidebar */}
        <div
          className={`fixed inset-y-0 left-0 z-50 w-64 bg-gray-900 text-white transform transition-transform duration-300 ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          {/* Logo */}
          <div className="flex items-center justify-between h-16 px-6 bg-gray-800">
            <Link href="/admin/dashboard" className="text-xl font-bold">
              INFRACHAIN
            </Link>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-gray-400 hover:text-white"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Navigation */}
          <nav className="mt-8 px-4">
            {filteredNavigation.map((item) => {
              const isActive = router.pathname === item.href || router.pathname.startsWith(item.href + '/');
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 mb-2 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                  }`}
                >
                  <span className="text-xl">{item.icon}</span>
                  <span className="font-medium">{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* User Info */}
          <div className="absolute bottom-0 w-full p-4 bg-gray-800 border-t border-gray-700">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold">
                {user?.name?.charAt(0) || 'A'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{user?.name}</p>
                <p className="text-xs text-gray-400 capitalize">{user?.role?.replace('_', ' ')}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Link
                href="/"
                className="flex-1 px-3 py-2 text-sm text-center bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
              >
                Exit Admin
              </Link>
              <button
                onClick={handleLogout}
                className="flex-1 px-3 py-2 text-sm text-center bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className={`transition-all duration-300 ${sidebarOpen ? 'lg:pl-64' : ''}`}>
          {/* Top Bar */}
          <header className="bg-white shadow-sm">
            <div className="flex items-center justify-between h-16 px-6">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="text-gray-600 hover:text-gray-900"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <h1 className="text-xl font-semibold text-gray-900">{title}</h1>
              <div className="w-6" />
            </div>
          </header>

          {/* Page Content */}
          <main className="p-6">{children}</main>
        </div>
      </div>
    </>
  );
}
