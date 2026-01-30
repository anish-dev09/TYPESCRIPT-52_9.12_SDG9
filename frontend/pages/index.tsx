import Head from 'next/head';

export default function Home() {
  return (
    <>
      <Head>
        <title>INFRACHAIN - Tokenized Infrastructure Bonds</title>
        <meta name="description" content="Democratizing infrastructure investment through blockchain tokenization" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center">
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
            
            <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
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

            <div className="mt-12">
              <p className="text-gray-500 text-sm">
                🚀 Phase 1 Complete - Repository Setup Done!
              </p>
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
