import React from 'react';
import { 
  LayoutDashboard, 
  BarChart3, 
  Users, 
  QrCode, 
  Settings, 
  Building2,
  LogOut, 
  Sparkles, 
  X 
} from 'lucide-react';

export default function Sidebar({ 
  activeTab, 
  setActiveTab, 
  currentStore, 
  onLogout,
  isOpen,
  onClose
}) {
  const isAdmin = currentStore?.role === 'admin';

  const primaryNav = [
    { id: 'overview', label: 'Dasbor', icon: LayoutDashboard },
    { id: 'analytics', label: 'Analisis', icon: BarChart3 },
    { id: 'feedback', label: 'Data Ulasan', icon: Users },
    { id: 'qr', label: 'Kartu QR Meja', icon: QrCode },
    ...(isAdmin ? [{ id: 'admin-stores', label: 'Kelola Klien', icon: Building2 }] : []),
    { id: 'settings', label: 'Pengaturan', icon: Settings },
  ];

  return (
    <>
      {/* Overlay Mobile Backdrop */}
      {isOpen && (
        <div 
          onClick={onClose}
          className="fixed inset-0 bg-slate-950/50 backdrop-blur-xs z-40 lg:hidden transition-opacity"
        />
      )}

      {/* Acme Dash Clean Sidebar */}
      <aside 
        className={`fixed lg:static inset-y-0 left-0 z-50 w-60 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 flex flex-col justify-between border-r border-slate-200/90 dark:border-slate-800 shrink-0 select-none transition-transform duration-200 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div>
          {/* Brand Header */}
          <div className="p-5 pb-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-slate-900 dark:bg-blue-600 flex items-center justify-center text-white shadow-xs">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <span className="font-extrabold text-base text-slate-900 dark:text-white tracking-tight">
                REVISTA
              </span>
            </div>

            <button 
              onClick={onClose}
              className="lg:hidden p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-lg"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Navigasi Utama */}
          <div className="px-3 py-3">
            <nav className="space-y-1">
              {primaryNav.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id);
                      if (onClose) onClose();
                    }}
                    className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all text-left ${
                      isActive
                        ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white shadow-2xs font-bold'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/50'
                    }`}
                  >
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-slate-500 dark:text-slate-400'}`} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Bagian Bawah: Keluar & Profil Pengguna */}
        <div className="p-3 border-t border-slate-100 dark:border-slate-800 space-y-1">
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50/50 dark:hover:bg-rose-950/20 transition-colors"
          >
            <LogOut className="w-4 h-4 text-slate-400 hover:text-rose-600" />
            <span>Keluar Akun</span>
          </button>

          {/* Kartu Profil Toko */}
          <div className="pt-2 mt-2 border-t border-slate-100 dark:border-slate-800 flex items-center gap-3 px-2 py-1.5">
            <div className="w-8 h-8 rounded-full bg-slate-900 dark:bg-blue-600 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
              {currentStore.owner ? currentStore.owner.split(' ').map(n => n[0]).join('').slice(0, 2) : 'OC'}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-slate-900 dark:text-white truncate leading-tight">
                {currentStore.owner || 'Pemilik Toko'}
              </p>
              <p className="text-[10px] text-slate-400 truncate leading-tight mt-0.5">
                Pemilik • {currentStore.ownerEmail}
              </p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
