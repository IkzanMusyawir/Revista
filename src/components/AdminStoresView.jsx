import React, { useState, useEffect } from 'react';
import { API_BASE } from '../api';
import { Store, UserPlus, CheckCircle2, AlertCircle, Phone, MapPin, Mail, Lock } from 'lucide-react';

export default function AdminStoresView({ token }) {
  const [stores, setStores] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Form tambah toko klien
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Kafe & Resto');
  const [owner, setOwner] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('toko123456');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');

  const fetchStores = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/admin/stores`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setStores(data);
      }
    } catch {}
  };

  useEffect(() => {
    fetchStores();
  }, []);

  const handleCreateStore = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const res = await fetch(`${API_BASE}/api/admin/create-client-store`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          name: name.trim(),
          category,
          owner: owner.trim(),
          email: email.trim(),
          password,
          phone: phone.trim(),
          address: address.trim()
        })
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Gagal mendaftarkan toko klien.');

      setSuccessMessage(`Toko "${name}" berhasil didaftarkan! Klien dapat login dengan email: ${email} dan password: ${password}`);
      setName('');
      setOwner('');
      setEmail('');
      setPhone('');
      setAddress('');
      setPassword('toko123456');
      fetchStores();
    } catch (err) {
      setErrorMessage(err.message || 'Gagal menambahkan toko.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-150">
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
          Kelola Toko Klien (Pembeli Standee QR)
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Daftarkan akun toko klien yang telah membeli paket standee akrilik meja. Klien akan langsung dapat login dengan email dan password yang Anda tentukan.
        </p>
      </div>

      {successMessage && (
        <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Form Tambah Toko */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs space-y-4">
          <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
            <UserPlus className="w-4 h-4 text-blue-600" />
            Daftarkan Toko Klien Baru
          </h3>

          <form onSubmit={handleCreateStore} className="space-y-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">Nama Usaha / Toko *</label>
              <input
                type="text"
                required
                placeholder="Contoh: Kopi Kulo Menteng"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-100 focus:outline-hidden focus:border-blue-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">Nama Pemilik *</label>
                <input
                  type="text"
                  required
                  placeholder="Nama Klien"
                  value={owner}
                  onChange={(e) => setOwner(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-100 focus:outline-hidden focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">Kategori</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-2 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-100 focus:outline-hidden focus:border-blue-500"
                >
                  <option value="Kafe & Resto">Kafe & Resto</option>
                  <option value="Barbershop">Barbershop</option>
                  <option value="Retail & Toko">Retail & Toko</option>
                  <option value="Jasa & Laundry">Jasa & Laundry</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">Email Login Toko *</label>
              <input
                type="email"
                required
                placeholder="email@toko.id"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-100 focus:outline-hidden focus:border-blue-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">Password Awal *</label>
                <input
                  type="text"
                  required
                  placeholder="Min. 6 karakter"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-100 focus:outline-hidden focus:border-blue-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">No. WhatsApp</label>
                <input
                  type="text"
                  placeholder="0812..."
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-100 focus:outline-hidden focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">Alamat Usaha</label>
              <input
                type="text"
                placeholder="Kota / Alamat Toko"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-100 focus:outline-hidden focus:border-blue-500"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2"
            >
              <span>{isLoading ? 'Menyimpan...' : 'Daftarkan Toko Klien'}</span>
            </button>
          </form>
        </div>

        {/* List Toko yang Terdaftar */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <Store className="w-4 h-4 text-emerald-600" />
              Daftar Semua Toko Aktif ({stores.length})
            </h3>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800/80 max-h-[420px] overflow-y-auto">
            {stores.map((s) => (
              <div key={s.id} className="py-3 flex items-center justify-between gap-4 text-xs">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 dark:text-white truncate">{s.name}</span>
                    <span className={`text-[10px] px-2 py-0.2 rounded-full font-semibold ${
                      s.role === 'admin' 
                        ? 'bg-purple-50 text-purple-700 border border-purple-200' 
                        : 'bg-blue-50 text-blue-700 border border-blue-200'
                    }`}>
                      {s.role === 'admin' ? 'Master Admin' : 'Klien'}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5 truncate">
                    Pemilik: {s.owner} • {s.owner_email} {s.phone ? `• ${s.phone}` : ''}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <span className="font-mono text-[10px] text-slate-400 block">ID: {s.id}</span>
                  <span className="text-[10px] text-emerald-600 font-semibold">Aktif</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
