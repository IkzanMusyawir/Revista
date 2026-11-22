import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import OverviewView from './components/OverviewView';
import AnalyticsView from './components/AnalyticsView';
import FeedbackListView from './components/FeedbackListView';
import QrCardView from './components/QrCardView';
import SettingsView from './components/SettingsView';
import AdminStoresView from './components/AdminStoresView';
import MobileCustomerView from './components/MobileCustomerView';
import LoginView from './components/LoginView';
import { API_BASE } from './api';
import { X } from 'lucide-react';

export default function App() {
  const [stores, setStores] = useState([]);
  const [publicStore, setPublicStore] = useState(undefined);
  const [authChecking, setAuthChecking] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [dateRange, setDateRange] = useState('30d');
  const [searchQuery, setSearchQuery] = useState('');
  const [toastMessage, setToastMessage] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem('revista_theme') === 'dark';
  });

  // Manajemen Sesi Toko
  const [session, setSession] = useState(() => {
    try {
      const saved = sessionStorage.getItem('revista_auth_session');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });

  // Deteksi mode pengisian ulasan pelanggan via pemindaian QR (?mode=review)
  const urlParams = new URLSearchParams(window.location.search);
  const isMobileReviewMode = urlParams.get('mode') === 'review';



  useEffect(() => {
    localStorage.removeItem('revista_auth_session');
  }, []);

  // Sinkronisasi kelas dark pada elemen root HTML
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('revista_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('revista_theme', 'light');
    }
  }, [isDarkMode]);

  // Helper Notifikasi Toast
  const showToast = (title, message, sentiment = 'Positif') => {
    setToastMessage({ title, message, sentiment });
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const storeIdParam = urlParams.get('toko') || urlParams.get('store');

  const syncStore = async (token = session?.token, range = dateRange) => {
    if (!token) return;
    const res = await fetch(`${API_BASE}/api/store?range=${range}`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    });
    if (res.status === 401) throw new Error('Sesi kedaluwarsa. Silakan masuk kembali.');
    if (!res.ok) throw new Error('Data toko gagal dimuat.');
    const store = await res.json();
    setStores([store]);
  };

  useEffect(() => {
    if (!isMobileReviewMode || !storeIdParam) return;
    fetch(`${API_BASE}/api/public/stores/${encodeURIComponent(storeIdParam)}`)
      .then((res) => res.ok ? res.json() : Promise.reject())
      .then(setPublicStore)
      .catch(() => setPublicStore(null));
  }, [isMobileReviewMode, storeIdParam]);

  useEffect(() => {
    if (!session?.token) {
      setAuthChecking(false);
      return;
    }
    syncStore(session.token)
      .catch(() => {
        sessionStorage.removeItem('revista_auth_session');
        setSession(null);
      })
      .finally(() => setAuthChecking(false));
  }, []);

  useEffect(() => {
    if (!session?.token) return;
    syncStore(session.token, dateRange).catch(() => {});
    const interval = setInterval(() => syncStore(session.token, dateRange).catch(() => {}), 10000);
    return () => clearInterval(interval);
  }, [session?.token, dateRange]);

  const currentStore = stores[0] || session?.store;

  if (isMobileReviewMode) {
    if (publicStore === undefined && storeIdParam) {
      return <main className="min-h-screen grid place-items-center"><div className="w-7 h-7 border-2 border-slate-200 border-t-blue-600 rounded-full animate-spin" /></main>;
    }
    return publicStore
      ? <MobileCustomerView currentStore={publicStore} onFeedbackSubmitted={() => {}} />
      : <main className="min-h-screen grid place-items-center p-6 text-center text-slate-600">Toko tidak ditemukan atau tautan QR tidak valid.</main>;
  }

  // Berhasil Masuk
  const handleLoginSuccess = (authData) => {
    setSession(authData);
    sessionStorage.setItem('revista_auth_session', JSON.stringify(authData));
    syncStore(authData.token).catch(() => {});
    showToast('Sesi Terverifikasi', `Selamat datang, ${authData.store.owner}!`, 'Positif');
  };

  // Keluar Akun
  const handleLogout = () => {
    if (session?.token) {
      fetch(`${API_BASE}/api/auth/logout`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${session.token}` },
      }).catch(() => {});
    }
    sessionStorage.removeItem('revista_auth_session');
    setSession(null);
    showToast('Sesi Berakhir', 'Anda telah keluar dari sistem secara aman.', 'Netral');
  };

  // Jika belum login, tampilkan portal masuk resmi
  if (authChecking) return <main className="min-h-screen grid place-items-center text-sm text-slate-500">Memeriksa sesi...</main>;

  if (!session) {
    return <LoginView onLoginSuccess={handleLoginSuccess} />;
  }

  // Pembaruan Profil Toko
  const handleUpdateStore = (updatedStore) => {
    setStores([updatedStore]);
    showToast('Profil Diperbarui', 'Pengaturan toko berhasil disimpan.', 'Positif');
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0B0F19] flex font-sans text-slate-800 dark:text-slate-100">
      
      {/* SIDEBAR: Desain Acme Dash Bersih */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentStore={currentStore}
        onLogout={handleLogout}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      {/* CONTAINER UTAMA */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto bg-[#F8FAFC] dark:bg-[#0B0F19] transition-colors duration-150">
        
        {/* HEADER TOPBAR */}
        <Topbar
          currentStore={currentStore}
          activeTab={activeTab}
          isDarkMode={isDarkMode}
          setIsDarkMode={setIsDarkMode}
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          dateRange={dateRange}
          setDateRange={setDateRange}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
        />

        {/* HALAMAN UTAMA */}
        <main className="flex-1 px-6 sm:px-8 py-2 max-w-7xl w-full mx-auto">
          {activeTab === 'overview' && (
            <OverviewView
              currentStore={currentStore}
              onNavigateTab={setActiveTab}
            />
          )}

          {activeTab === 'analytics' && (
            <AnalyticsView
              currentStore={currentStore}
            />
          )}

          {activeTab === 'feedback' && (
            <FeedbackListView
              currentStore={currentStore}
            />
          )}

          {activeTab === 'qr' && <QrCardView currentStore={currentStore} />}

          {activeTab === 'admin-stores' && (
            <AdminStoresView token={session.token} />
          )}

          {activeTab === 'settings' && (
            <SettingsView
              currentStore={currentStore}
              token={session.token}
              onUpdateStore={handleUpdateStore}
            />
          )}
        </main>
      </div>

      {/* Notifikasi Toast Mengambang */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-3 duration-150 max-w-sm w-full px-4">
          <div className="bg-slate-900/95 dark:bg-slate-800 text-white p-4 rounded-2xl shadow-2xl border border-slate-800 flex items-start gap-3">
            <span
              className={`w-2.5 h-2.5 rounded-full mt-1.5 shrink-0 ${
                toastMessage.sentiment === 'Positif'
                  ? 'bg-emerald-400 ring-4 ring-emerald-400/20'
                  : toastMessage.sentiment === 'Negatif'
                  ? 'bg-rose-400 ring-4 ring-rose-400/20'
                  : 'bg-blue-400 ring-4 ring-blue-400/20'
              }`}
            />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-white">{toastMessage.title}</p>
              <p className="text-[11px] text-slate-300 leading-snug mt-0.5">{toastMessage.message}</p>
            </div>
            <button
              onClick={() => setToastMessage(null)}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
