import React from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

export default function AnalyticsView({ currentStore }) {
  const feedbacks = currentStore.feedbacks || [];
  const total = feedbacks.length;
  const sentimentData = [
    { name: 'Positif', value: currentStore.pos || 0, color: '#10B981' },
    { name: 'Netral', value: currentStore.net || 0, color: '#F59E0B' },
    { name: 'Negatif', value: currentStore.neg || 0, color: '#EF4444' },
  ].filter((item) => item.value > 0);
  const ratingData = [5, 4, 3, 2, 1].map((rating) => ({
    name: `${rating} Bintang`,
    count: feedbacks.filter((item) => Number(item.rating) === rating).length,
  }));

  return (
    <div className="space-y-6 pb-12">
      <header className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Analisis Sentimen & Rating</h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Perhitungan berdasarkan feedback toko pada periode filter terpilih.</p>
      </header>
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <section className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
          <h3 className="font-bold text-slate-900 dark:text-white">Proporsi Sentimen</h3>
          {total ? <><div className="relative mt-3 h-56"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={sentimentData} dataKey="value" nameKey="name" innerRadius={60} outerRadius={88} paddingAngle={3}>{sentimentData.map((item) => <Cell key={item.name} fill={item.color} />)}</Pie><Tooltip formatter={(value) => `${value}%`} /></PieChart></ResponsiveContainer><span className="pointer-events-none absolute inset-0 grid place-items-center text-xl font-bold text-slate-900 dark:text-white">{total}</span></div><div className="flex flex-wrap justify-center gap-4 text-xs text-slate-600 dark:text-slate-300">{sentimentData.map((item) => <span key={item.name} className="flex items-center gap-1.5"><i className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />{item.name}: {item.value}%</span>)}</div></> : <p className="grid h-64 place-items-center text-sm text-slate-500">Belum ada data sentimen.</p>}
        </section>
        <section className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
          <h3 className="font-bold text-slate-900 dark:text-white">Sebaran Rating</h3>
          {total ? <div className="mt-3 h-64"><ResponsiveContainer width="100%" height="100%"><BarChart data={ratingData} layout="vertical" margin={{ left: 12, right: 16 }}><CartesianGrid strokeDasharray="3 3" horizontal={false} /><XAxis type="number" allowDecimals={false} /><YAxis dataKey="name" type="category" width={80} /><Tooltip /><Bar dataKey="count" fill="#2563EB" radius={[0, 6, 6, 0]} /></BarChart></ResponsiveContainer></div> : <p className="grid h-64 place-items-center text-sm text-slate-500">Grafik rating tampil setelah ulasan masuk.</p>}
        </section>
      </div>
    </div>
  );
}
