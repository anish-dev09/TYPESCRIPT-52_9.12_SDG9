import Head from 'next/head';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';

export default function Home() {
  const { isAuthenticated, user } = useAuthStore();

  return (
    <>
      <Head>
        <title>INFRACHAIN - Tokenized Infrastructure Bonds</title>
        <meta name="description" content="Democratizing infrastructure investment through blockchain tokenization" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center mb-16">
            <h1 className="text-6xl font-bold text-gray-900 mb-4">
              INFRACHAIN
            </h1>
            <p className="text-2xl text-gray-600 mb-8">
              Tokenized Infrastructure Bonds
            </p>
            <p className="text-lg text-gray-500 max-w-2xl mx-auto mb-12">
              Democratizing infrastructure investment through blockchain tokenization.
              Invest from ₹100, track transparently, earn returns.
            </p>
            
            <div className="flex gap-4 justify-center">
              {isAuthenticated ? (
                <>
                  <Link
                    href="/projects"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-medium transition-colors"
                  >
                    Browse Projects
                  </Link>
                  <Link
                    href="/dashboard"
                    className="bg-white hover:bg-gray-50 text-blue-600 px-8 py-3 rounded-lg font-medium transition-colors border-2 border-blue-600"
                  >
                    My Dashboard
                  </Link>
                </>
              ) : (
                <Link
                  href="/projects"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-medium transition-colors"
                >
                  Explore Projects
                </Link>
              )}
            </div>
          </div>
            
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto mb-16">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="text-4xl mb-3">🏗️</div>
              <h3 className="text-xl font-semibold mb-2">Fractional Ownership</h3>
              <p className="text-gray-600">Invest in infrastructure from ₹100</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="text-4xl mb-3">📊</div>
              <h3 className="text-xl font-semibold mb-2">Transparent Tracking</h3>
              <p className="text-gray-600">Real-time fund usage visibility</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="text-4xl mb-3">💰</div>
              <h3 className="text-xl font-semibold mb-2">Earn Returns</h3>
              <p className="text-gray-600">Monthly interest on your holdings</p>
            </div>
          </div>

          {isAuthenticated && user && (
            <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-8">
              <h2 className="text-2xl font-bold mb-4">Welcome back, {user.name}!</h2>
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Total Invested</p>
                  <p className="text-2xl font-bold text-blue-600">
                    ${(user.totalInvested || 0).toLocaleString()}
                  </p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Tokens Held</p>
                  <p className="text-2xl font-bold text-green-600">
                    {(user.totalTokens || 0).toLocaleString()}
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <Link
                  href="/invest"
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-medium transition-colors text-center"
                >
                  Make Investment
                </Link>
                <Link
                  href="/dashboard"
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-900 py-3 rounded-lg font-medium transition-colors text-center"
                >
                  View Portfolio
                </Link>
              </div>
            </div>
          )}

          <div className="mt-16 text-center">
            <p className="text-gray-500 text-sm mb-2">
              ✅ Phase 5 Complete - Authentication & User Management Implemented!
            </p>
            <div className="flex gap-2 justify-center items-center text-xs text-gray-400">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                Smart Contracts Deployed
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                Backend API Ready
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                MetaMask Integration Active
              </span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
              <p className="text-gray-400 text-xs mt-2">
                Next: Phase 2 - Smart Contract Development
              </p>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
