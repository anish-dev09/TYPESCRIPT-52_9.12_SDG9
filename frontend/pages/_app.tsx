import type { AppProps } from 'next/app';
import '../styles/globals.css';
import { Toaster } from 'react-hot-toast';
import Layout from '@/components/common/Layout';
import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/authStore';

export default function App({ Component, pageProps }: AppProps) {
  const { walletAddress, setWalletAddress, refreshUser, isAuthenticated } = useAuthStore();
  const [web3Service, setWeb3Service] = useState<any>(null);

  // Dynamically import web3Service only on client side (SSR-safe)
  useEffect(() => {
    import('@/services/web3Service').then((mod) => {
      setWeb3Service(mod.default);
    });
  }, []);

  // Initialize wallet connection on app load (only after web3Service is loaded)
  useEffect(() => {
    if (!web3Service) return;

    const initWallet = async () => {
      if (web3Service.isMetaMaskInstalled()) {
        const currentAccount = await web3Service.getCurrentAccount();
        if (currentAccount) {
          setWalletAddress(currentAccount);
        }
      }
    };

    initWallet();
  }, [web3Service, setWalletAddress]);

  // Refresh user data if authenticated (works for both wallet and email users)
  useEffect(() => {
    if (isAuthenticated) {
      refreshUser();
    }
  }, [isAuthenticated, walletAddress, refreshUser]);

  return (
    <Layout>
      <Component {...pageProps} />
      <Toaster position="top-right" />
    </Layout>
  );
}
