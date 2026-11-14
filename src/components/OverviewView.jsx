import React from 'react';
import { Star, MessageSquare, ThumbsUp, Frown } from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, LineChart, Line, XAxis, YAxis, CartesianGrid } from 'recharts';

export default function OverviewView({ currentStore, onNavigateTab }) {
  const feedbacks = currentStore.feedbacks || [];
  const chartData = currentStore.dailyRatings || [];
  const latest = feedbacks.slice(0, 5);
  const highlight = feedbacks.find((item) => item.highlight) || latest[0];
  const donut = [
    { name: 'Positif', value: currentStore.pos || 0, color: '#10B981' },
    { name: 'Netral', value: currentStore.net || 0, color: '#F59E0B' },
    { name: 'Negatif', value: currentStore.neg || 0, color: '#EF4444' },
  ].filter((item) => item.value > 0);
  const metrics = [
    { label: 'Total ulasan', value: currentStore.totalFeedback || 0, icon: MessageSquare, iconClass: 'text-blue-500' },
    { label: 'Rata-rata rating', value: currentStore.totalFeedback ? `${currentStore.avgRating} / 5` : '—', icon: Star, iconClass: 'text-amber-500' },
    { label: 'Sentimen positif', value: `${currentStore.pos || 0}%`, icon: ThumbsUp, iconClass: 'text-emerald-500' },
    { label: 'Sentimen negatif', value: `${currentStore.neg || 0}%`, icon: Frown, iconClass: 'text-rose-500' },
  ];

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Ringkasan Pelayanan</h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Halo, {currentStore.owner}. Berikut evaluasi pelanggan Anda.</p>
        </div>
        <button onClick={() => onNavigateTab('qr')} className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700">Lihat QR Toko</button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map(({ label, value, icon: Icon, iconClass }) => (
          <div key={label} className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-500 dark:text-slate-400">{label}</span>
              <Icon className={`h-5 w-5 ${iconClass}`} />
            </div>
            <p className="mt-3 text-2xl font-bold text-slate-900 dark:text-white">{value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <section className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
          <h3 className="font-bold text-slate-900 dark:text-white">Analisis Sentimen</h3>
          {donut.length ? <div className="relative mt-3 h-56">
            <ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={donut} dataKey="value" nameKey="name" innerRadius={58} outerRadius={82} paddingAngle={3}>{donut.map((item) => <Cell key={item.name} fill={item.color} />)}</Pie><Tooltip formatter={(value) => `${value}%`} /></PieChart></ResponsiveContainer>
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center"><strong className="text-2xl text-slate-900 dark:text-white">{currentStore.totalFeedback}</strong><span className="text-xs text-slate-500">ulasan</span></div>
          </div> : <p className="grid h-56 place-items-center text-sm text-slate-500">Belum ada ulasan untuk dianalisis.</p>}
          <div className="flex flex-wrap justify-center gap-4 text-xs text-slate-600 dark:text-slate-300">{donut.map((item) => <span key={item.name} className="flex items-center gap-1.5"><i className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />{item.name}: {item.value}%</span>)}</div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
          <h3 className="font-bold text-slate-900 dark:text-white">Tren Rating</h3>
          {chartData.length ? <div className="mt-3 h-56"><ResponsiveContainer width="100%" height="100%"><LineChart data={chartData}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="day" tick={{ fontSize: 11 }} /><YAxis domain={[1, 5]} /><Tooltip /><Line type="monotone" dataKey="rating" stroke="#2563EB" strokeWidth={2} dot={false} /></LineChart></ResponsiveContainer></div> : <p className="grid h-56 place-items-center text-sm text-slate-500">Grafik muncul setelah ulasan diterima.</p>}
        </section>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <section className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
          <div className="mb-3 flex items-center justify-between"><h3 className="font-bold text-slate-900 dark:text-white">Ulasan Terbaru</h3><button onClick={() => onNavigateTab('feedback')} className="text-sm font-semibold text-blue-600">Lihat semua</button></div>
          {latest.length ? <div className="divide-y divide-slate-100 dark:divide-slate-800">{latest.map((item) => <div key={item.id} className="py-3"><div className="flex items-center justify-between gap-3"><span className="text-sm font-semibold text-slate-800 dark:text-slate-200">Pelanggan {item.id}</span><span className="text-xs text-slate-500">{item.date}</span></div><div className="my-1 flex items-center gap-0.5">{Array.from({ length: 5 }, (_, i) => <Star key={i} className={`h-3.5 w-3.5 ${i < item.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}`} />)}</div><p className="text-sm text-slate-600 dark:text-slate-400">{item.comment}</p></div>)}</div> : <p className="py-8 text-center text-sm text-slate-500">Belum ada ulasan. Cetak QR toko untuk mulai menerima feedback.</p>}
        </section>
        <section className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
          <h3 className="font-bold text-slate-900 dark:text-white">Sorotan Pelanggan</h3>
          {highlight ? <blockquote className="mt-4 border-l-4 border-blue-500 pl-4"><div className="mb-2 flex items-center gap-1 text-amber-500"><Star className="h-4 w-4 fill-current" /><span className="text-sm font-bold">{highlight.rating} / 5</span></div><p className="text-base italic text-slate-700 dark:text-slate-300">“{highlight.comment}”</p><footer className="mt-3 text-xs text-slate-500">Pelanggan {highlight.id} · {highlight.date}</footer></blockquote> : <p className="py-8 text-center text-sm text-slate-500">Sorotan akan tampil setelah toko menerima ulasan.</p>}
        </section>
      </div>
    </div>
  );
}
