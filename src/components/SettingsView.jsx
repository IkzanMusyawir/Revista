import React, { useState } from 'react';
import { API_BASE } from '../api';
import { 
  Store, 
  MapPin, 
  Phone, 
  Wifi, 
  Save, 
  ShieldCheck, 
  Lock, 
  CheckCircle2, 
  AlertCircle, 
  Building2, 
  QrCode 
} from 'lucide-react';

export default function SettingsView({ currentStore, token, onUpdateStore }) {
  const [name, setName] = useState(currentStore.name || '');
  const [category, setCategory] = useState(currentStore.category || 'Food & Beverage');
  const [owner, setOwner] = useState(currentStore.owner || '');
  const [phone, setPhone] = useState(currentStore.phone || '0812-8899-1020');
  const [address, setAddress] = useState(currentStore.address || '');
  const [wifiName, setWifiName] = useState(currentStore.wifiName || 'REVISTA-HighSpeed');

  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage(null);

    const updated = {
      ...currentStore,
      name,
      category,
      owner,
      phone,
      address,
      tableCount: parseInt(tableCount, 10) || 20,
      wifiName
    };

    try {
      const res = await fetch(`${API_BASE}/api/store`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(updated),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Perubahan gagal disimpan.');
      }
      setMessage({ type: 'success', text: 'Pengaturan toko berhasil disimpan.' });
      onUpdateStore?.(updated);
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Server tidak dapat dihubungi.' });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-150">
      {/* Top Banner */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
            Pengaturan Toko & Outlet
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-xs mt-1">
            Kelola profil resmi usaha, jumlah meja, dan parameter kartu evaluasi QR yang aktif.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
            <ShieldCheck className="w-3.5 h-3.5" />
            Database Terhubung
          </span>
        </div>
      </div>

      {message && (
        <div className={`p-4 rounded-xl border text-xs flex items-center gap-2.5 ${
          message.type === 'success' 
            ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800' 
            : 'bg-rose-50 text-rose-800 border-rose-200'
        }`}>
          <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span>{message.text}</span>
        </div>
      )}

      {/* Main Settings Form */}
      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: General Store Info */}
        <div className="lg:col-span-8 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-5">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white pb-3 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2">
            <Building2 className="w-4 h-4 text-blue-600" />
            Informasi Profil Toko
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Nama Usaha / Toko *
              </label>
              <div className="relative">
                <Store className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-hidden focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Kategori Usaha
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-hidden focus:border-blue-500"
              >
                <option value="Food & Beverage">Food & Beverage (Kafe, Resto)</option>
                <option value="Barbershop & Grooming">Barbershop & Grooming</option>
                <option value="Retail & Fashion">Retail & Fashion</option>
                <option value="Jasa & Konsultasi">Jasa & Konsultasi</option>
                <option value="Kesehatan & Spa">Kesehatan & Spa</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Nama Pemilik / Manajer *
              </label>
              <input
                type="text"
                required
                value={owner}
                onChange={(e) => setOwner(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-hidden focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Nomor Telepon / WhatsApp
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-hidden focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Alamat Lengkap Usaha
            </label>
            <div className="relative">
              <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-hidden focus:border-blue-500"
              />
            </div>
          </div>

          <div className="pt-2">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Nama Wi-Fi Toko (Ditampilkan di Kartu Standee Meja)
            </label>
            <div className="relative">
              <Wifi className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
              <input
                type="text"
                placeholder="Contoh: KopiSenja-FreeWiFi"
                value={wifiName}
                onChange={(e) => setWifiName(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-hidden focus:border-blue-500"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
            <button
              type="submit"
              disabled={isSaving}
              className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-all disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'Menyimpan...' : 'Simpan Perubahan'}</span>
            </button>
          </div>
        </div>

        {/* Right: Security & Deployment Summary */}
        <div className="lg:col-span-4 space-y-5">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Lock className="w-4 h-4 text-emerald-600" />
              Keamanan Akun
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Akun resmi dilindungi dengan enkripsi Salted SHA-256 dan token sesi 256-bit terisolasi.
            </p>

            <div className="p-3 bg-slate-50 dark:bg-slate-800/70 rounded-xl border border-slate-200/60 dark:border-slate-700 text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-400">Email Login:</span>
                <span className="font-semibold text-slate-700 dark:text-slate-200">{currentStore.ownerEmail}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Status Toko:</span>
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">Aktif & Siap Jual</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Mode Proteksi:</span>
                <span className="font-semibold text-slate-700 dark:text-slate-200">Anti-Spam & XSS</span>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-6 rounded-2xl text-white shadow-lg shadow-blue-500/15 space-y-3">
            <div className="w-8 h-8 rounded-xl bg-white/20 backdrop-blur-xs flex items-center justify-center">
              <QrCode className="w-4 h-4 text-white" />
            </div>
            <h4 className="font-bold text-sm">Paket Standee Akrilik Siap Pakai</h4>
            <p className="text-xs text-blue-100 leading-relaxed">
              Cetak QR Code meja beresolusi tinggi untuk dipajang di kasir atau nomor meja pelanggan.
            </p>
          </div>
        </div>
      </form>
    </div>
  );
}
