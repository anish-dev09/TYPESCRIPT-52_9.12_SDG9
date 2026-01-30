import type { AppProps } from 'next/app';
import '@/styles/globals.css';
import { Toaster } from 'react-hot-toast';
import Layout from '@/components/common/Layout';
import { useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import web3Service from '@/services/web3Service';

export default function App({ Component, pageProps }: AppProps) {
  const { walletAddress, setWalletAddress, refreshUser, isAuthenticated } = useAuthStore();

  // Initialize wallet connection on app load
  useEffect(() => {
    const initWallet = async () => {
      if (web3Service.isMetaMaskInstalled()) {
        const currentAccount = await web3Service.getCurrentAccount();
        if (currentAccount) {
          setWalletAddress(currentAccount);
        }
      }
    };

    initWallet();
  }, [setWalletAddress]);

  // Refresh user data if authenticated
  useEffect(() => {
    if (isAuthenticated && walletAddress) {
      refreshUser();
    }
  }, [isAuthenticated, walletAddress, refreshUser]);

  return (
    <>
      <Layout>
        <Component {...pageProps} />
      </Layout>
      <Toaster position="top-right" />
    </>
  );
}
