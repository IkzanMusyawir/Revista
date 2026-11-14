import React, { useState, useRef, useEffect } from 'react';
import { 
  Search, 
  Calendar, 
  Filter, 
  Sun, 
  Moon, 
  Menu, 
  Check 
} from 'lucide-react';

export default function Topbar({ 
  currentStore,
  activeTab,
  isDarkMode,
  setIsDarkMode,
  onToggleSidebar,
  dateRange,
  setDateRange,
  searchQuery,
  setSearchQuery
}) {
  const [filterOpen, setFilterOpen] = useState(false);
  const filterRef = useRef(null);

  // Tutup dropdown saat klik di luar
  useEffect(() => {
    function handleClickOutside(e) {
      if (filterRef.current && !filterRef.current.contains(e.target)) {
        setFilterOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const tabTitles = {
    overview: 'Dasbor',
    analytics: 'Analisis',
    feedback: 'Data Ulasan',
    qr: 'Kartu QR Meja',
    'admin-stores': 'Kelola Toko Klien',
    settings: 'Pengaturan Toko',
  };

  const currentDate = new Date().toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });

  return (
    <header className="px-6 sm:px-8 pt-6 pb-4 flex flex-col md:flex-row md:items-center justify-between gap-4 select-none">
      {/* Kiri: Judul Halaman & Subjudul */}
      <div className="flex items-start gap-3">
        <button
          onClick={onToggleSidebar}
          className="lg:hidden p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-xl transition-colors mt-0.5"
          title="Buka Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {tabTitles[activeTab] || 'Dasbor'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium mt-0.5">
            Selamat datang kembali, {currentStore.owner || 'Pemilik'} — berikut ringkasan evaluasi hari ini
          </p>
        </div>
      </div>

      {/* Kanan: Pencarian, Tanggal, Filter Waktu, Tombol Tema Terang/Gelap */}
      <div className="flex items-center gap-2.5 flex-wrap self-end md:self-auto">
        {/* Kolom Pencarian */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery || ''}
            onChange={(e) => setSearchQuery && setSearchQuery(e.target.value)}
            placeholder="Cari ulasan..."
            className="w-36 sm:w-48 pl-8 pr-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-hidden focus:border-blue-500 shadow-2xs transition-all"
          />
        </div>

        {/* Tanggal Hari Ini */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-300 shadow-2xs">
          <Calendar className="w-3.5 h-3.5 text-slate-400" />
          <span>{currentDate}</span>
        </div>

        {/* Filter Rentang Waktu */}
        <div className="relative" ref={filterRef}>
          <button
            onClick={() => setFilterOpen(!filterOpen)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 rounded-xl shadow-2xs transition-colors"
          >
            <Filter className="w-3.5 h-3.5 text-slate-500" />
            <span>Filter</span>
          </button>

          {filterOpen && (
            <div className="absolute right-0 mt-2 w-44 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 p-1.5 z-50 animate-in fade-in duration-100">
              {[
                { id: '7d', label: '7 Hari Terakhir' },
                { id: '30d', label: '30 Hari Terakhir' },
                { id: 'all', label: 'Semua Waktu' }
              ].map((opt) => {
                const isSelected = dateRange === opt.id;
                return (
                  <button
                    key={opt.id}
                    onClick={() => {
                      if (setDateRange) setDateRange(opt.id);
                      setFilterOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 text-xs font-medium rounded-lg flex items-center justify-between transition-colors ${
                      isSelected 
                        ? 'bg-blue-50 dark:bg-slate-800 text-blue-600 dark:text-blue-400 font-bold' 
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                    }`}
                  >
                    <span>{opt.label}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Tombol Beralih Mode Terang & Gelap — ikon saja */}
        <button
          onClick={() => setIsDarkMode(!isDarkMode)}
          className="p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl shadow-2xs transition-colors"
          title={isDarkMode ? 'Ganti ke Mode Terang' : 'Ganti ke Mode Gelap'}
        >
          {isDarkMode
            ? <Sun className="w-4 h-4 text-amber-400" />
            : <Moon className="w-4 h-4 text-slate-600" />
          }
        </button>
      </div>
    </header>
  );
}
