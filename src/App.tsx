
import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Session } from '@supabase/supabase-js';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import Dashboard from './pages/Dashboard';
import GenerateBill from './pages/GenerateBill';
import BillResult from './pages/BillResult';
import BillHistory from './pages/BillHistory';
import SearchMeter from './pages/SearchMeter';
import ErrorPage from './pages/ErrorPage';
import { Toaster } from '@/components/ui/sonner';
import './App.css';

type Page = 'login' | 'register' | 'dashboard' | 'generate-bill' | 'bill-result' | 'bill-history' | 'search-meter' | 'error';

function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [currentPage, setCurrentPage] = useState<Page>('login');
  const [loading, setLoading] = useState(true);
  const [billData, setBillData] = useState<any>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) {
        setCurrentPage('dashboard');
      }
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        setCurrentPage('dashboard');
      } else {
        setCurrentPage('login');
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const navigateTo = (page: Page, data?: any) => {
    setCurrentPage(page);
    if (data) {
      setBillData(data);
    }
  };

  const showError = (message: string) => {
    setErrorMessage(message);
    setCurrentPage('error');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!session && currentPage !== 'register') {
    return (
      <>
        {currentPage === 'login' && <LoginPage onNavigate={navigateTo} />}
        <Toaster />
      </>
    );
  }

  if (!session && currentPage === 'register') {
    return (
      <>
        <RegisterPage onNavigate={navigateTo} />
        <Toaster />
      </>
    );
  }

  return (
    <>
      {currentPage === 'dashboard' && <Dashboard onNavigate={navigateTo} session={session} />}
      {currentPage === 'generate-bill' && <GenerateBill onNavigate={navigateTo} session={session} />}
      {currentPage === 'bill-result' && <BillResult onNavigate={navigateTo} billData={billData} />}
      {currentPage === 'bill-history' && <BillHistory onNavigate={navigateTo} session={session} />}
      {currentPage === 'search-meter' && <SearchMeter onNavigate={navigateTo} session={session} />}
      {currentPage === 'error' && <ErrorPage onNavigate={navigateTo} message={errorMessage} />}
      <Toaster />
    </>
  );
}

export default App;
