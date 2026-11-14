import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Star, 
  Download, 
  ArrowUpDown,
  X
} from 'lucide-react';

function parsePhotos(photos) {
  if (Array.isArray(photos)) return photos;
  if (typeof photos !== 'string' || !photos) return [];
  try { return JSON.parse(photos); } catch { return []; }
}

export default function FeedbackListView({ currentStore }) {
  const [sentimentFilter, setSentimentFilter] = useState('Semua');
  const [starFilter, setStarFilter] = useState('Semua');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState('desc');
  const [previewPhoto, setPreviewPhoto] = useState(null);

  const filteredFeedbacks = useMemo(() => {
    const list = currentStore.feedbacks || [];
    const filtered = list
      .map((item, originalIndex) => ({ ...item, _idx: originalIndex }))
      .filter((item) => {
        if (sentimentFilter !== 'Semua' && item.sentiment !== sentimentFilter) {
          return false;
        }
        if (starFilter !== 'Semua' && item.rating !== parseInt(starFilter, 10)) {
          return false;
        }
        if (searchQuery.trim() !== '') {
          const query = searchQuery.toLowerCase();
          const commentMatch = (item.comment || '').toLowerCase().includes(query);
          const idMatch = (item.id || '').toLowerCase().includes(query);
          const userMatch = (item.user || '').toLowerCase().includes(query);
          if (!commentMatch && !idMatch && !userMatch) return false;
        }
        return true;
      });
    if (sortOrder === 'asc') {
      filtered.reverse();
    }
    return filtered;
  }, [currentStore.feedbacks, sentimentFilter, starFilter, searchQuery, sortOrder]);

  const handleExportCSV = () => {
    const headers = "ID Anonim,Nama,Rating,Sentimen,Confidence,Tanggal,Komentar\n";
    const rows = filteredFeedbacks.map(f => 
      `"${f.id}","${f.user || 'Anonim'}","${f.rating}","${f.sentiment}","${f.confidence || 90}%","${f.date}","${(f.comment || '').replace(/"/g, '""')}"`
    ).join("\n");
    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `REVISTA_Feedback_${currentStore.id}_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-150">
      {/* Top Banner */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
            Data Ulasan & Evaluasi Pelanggan
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-xs mt-1">
            Riwayat seluruh feedback anonim pelanggan terklasifikasi akurat dengan Naive Bayes.
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="flex items-center gap-2 px-4 py-2 bg-slate-900 dark:bg-blue-600 hover:bg-slate-800 dark:hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors self-start md:self-auto"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Ekspor CSV</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari kata kunci komentar atau nama..."
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-hidden focus:border-blue-500 transition-colors"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')} 
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            )}
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex p-1 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-medium">
              {['Semua', 'Positif', 'Netral', 'Negatif'].map((s) => (
                <button
                  key={s}
                  onClick={() => setSentimentFilter(s)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                    sentimentFilter === s
                      ? s === 'Positif' ? 'bg-emerald-600 text-white shadow-xs'
                        : s === 'Negatif' ? 'bg-rose-600 text-white shadow-xs'
                        : s === 'Netral' ? 'bg-amber-500 text-white shadow-xs'
                        : 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>

            <select
              value={starFilter}
              onChange={(e) => setStarFilter(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 focus:outline-hidden cursor-pointer"
            >
              <option value="Semua">Semua Rating</option>
              <option value="5">5 Bintang</option>
              <option value="4">4 Bintang</option>
              <option value="3">3 Bintang</option>
              <option value="2">2 Bintang</option>
              <option value="1">1 Bintang</option>
            </select>

            <button
              onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
            >
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
              <span>{sortOrder === 'desc' ? 'Terbaru' : 'Terlama'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 dark:bg-slate-800/60 border-b border-slate-200/80 dark:border-slate-800 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-5">Pelanggan</th>
                <th className="py-3 px-5">Waktu</th>
                <th className="py-3 px-5">Rating</th>
                <th className="py-3 px-5">Komentar Evaluasi</th>
                <th className="py-3 px-5 text-right">Sentimen Naive Bayes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
              {filteredFeedbacks.length === 0 ? (
                <tr>
                  <td colSpan="5" className="py-12 text-center text-slate-400">
                    <p className="font-semibold text-slate-600 dark:text-slate-300 text-xs">Tidak ada data feedback yang cocok</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">Coba sesuaikan kata kunci pencarian atau filter Anda.</p>
                  </td>
                </tr>
              ) : (
                filteredFeedbacks.map((fb, idx) => {
                  const initials = fb.user ? fb.user.split(' ').map(n => n[0]).join('').slice(0, 2) : `P${idx+1}`;
                  return (
                    <tr key={`${fb.id}-${idx}`} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-3.5 px-5 whitespace-nowrap">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-slate-900 dark:bg-slate-800 text-white flex items-center justify-center font-bold text-[10px] shrink-0">
                            {initials}
                          </div>
                          <div>
                            <span className="font-semibold text-slate-900 dark:text-white block">
                              {fb.user || `Pelanggan ${fb.id}`}
                            </span>
                            <span className="text-[10px] text-slate-400">{fb.id}</span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-5 whitespace-nowrap text-slate-500 dark:text-slate-400">
                        <div>{fb.date}</div>
                        <div className="text-[10px] text-slate-400">{fb.time || ''}</div>
                      </td>

                      <td className="py-3.5 px-5 whitespace-nowrap">
                        <div className="flex items-center gap-0.5">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star key={s} className={`w-3.5 h-3.5 ${s <= fb.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200 dark:text-slate-700'}`} />
                          ))}
                          <span className="font-bold text-slate-700 dark:text-slate-300 text-xs ml-1.5">{fb.rating}.0</span>
                        </div>
                      </td>

                      <td className="py-3.5 px-5 max-w-sm">
                        <p className="text-slate-700 dark:text-slate-300 leading-relaxed font-medium">"{fb.comment}"</p>
                        {parsePhotos(fb.photos).length > 0 && (
                          <div className="flex gap-2 mt-2">
                            {parsePhotos(fb.photos).map((photo, photoIdx) => (
                              <button
                                key={photoIdx}
                                type="button"
                                onClick={() => setPreviewPhoto(photo)}
                                className="relative w-12 h-12 rounded-lg overflow-hidden border border-slate-200 hover:border-blue-500 focus-visible:outline-2 focus-visible:outline-blue-500"
                                aria-label={`Lihat foto bukti ${photoIdx + 1}`}
                              >
                                <img src={photo} alt={`Foto bukti ${photoIdx + 1}`} className="w-full h-full object-cover" loading="lazy" />
                              </button>
                            ))}
                          </div>
                        )}
                      </td>

                      <td className="py-3.5 px-5 whitespace-nowrap text-right">
                        <div className="inline-flex items-center gap-1.5">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                              fb.sentiment === 'Positif'
                                ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
                                : fb.sentiment === 'Negatif'
                                ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-800'
                                : 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800'
                            }`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${
                              fb.sentiment === 'Positif' ? 'bg-emerald-500'
                                : fb.sentiment === 'Negatif' ? 'bg-rose-500'
                                : 'bg-amber-500'
                            }`}></span>
                            {fb.sentiment}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {fb.confidence ? `${fb.confidence}%` : '95%'}
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="p-3 bg-slate-50/80 dark:bg-slate-800/60 border-t border-slate-200/80 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 px-5">
          <span>Menampilkan {filteredFeedbacks.length} data ulasan</span>
          <span className="font-semibold text-blue-600 dark:text-blue-400">REVISTA Naive Bayes Real-Time</span>
        </div>
      </div>
      {previewPhoto && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Pratinjau foto bukti"
          onClick={() => setPreviewPhoto(null)}
          onKeyDown={(e) => e.key === 'Escape' && setPreviewPhoto(null)}
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 cursor-pointer"
        >
          <button
            type="button"
            aria-label="Tutup pratinjau"
            onClick={() => setPreviewPhoto(null)}
            className="absolute top-4 right-4 p-2 text-white bg-black/50 rounded-full"
          >
            <X className="w-5 h-5" />
          </button>
          <img src={previewPhoto} alt="Foto bukti ulasan ukuran penuh" className="max-w-full max-h-full object-contain rounded-lg" onClick={(e) => e.stopPropagation()} />
        </div>
      )}
    </div>
  );
}
