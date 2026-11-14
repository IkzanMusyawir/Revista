import React, { useState, useRef } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { Download, Printer, Copy, Check, ShieldCheck, Wifi, Sparkles, ExternalLink } from 'lucide-react';

export default function QrCardView({ currentStore }) {
  const [copied, setCopied] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const qrCanvasRef = useRef(null);
  const feedbackUrl = `${window.location.origin}/?toko=${encodeURIComponent(currentStore.id)}&mode=review`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(feedbackUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadStandee = () => {
    const qrCanvas = qrCanvasRef.current?.querySelector('canvas');
    if (!qrCanvas) return;

    const canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 1100;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, 800, 1100);
    ctx.fillStyle = '#0F172A';
    ctx.fillRect(0, 0, 800, 220);
    ctx.fillStyle = '#FFFFFF';
    ctx.textAlign = 'center';
    ctx.font = 'bold 56px Arial, sans-serif';
    ctx.fillText('REVISTA', 400, 100);
    ctx.font = '24px Arial, sans-serif';
    ctx.fillStyle = '#93C5FD';
    ctx.fillText('Sistem Evaluasi Pelayanan Pelanggan', 400, 145);
    ctx.fillStyle = '#1E293B';
    ctx.font = 'bold 42px Arial, sans-serif';
    ctx.fillText(currentStore.name || 'Toko REVISTA', 400, 290);
    ctx.font = 'bold 26px Arial, sans-serif';
    ctx.fillStyle = '#334155';
    ctx.fillText('Scan QR Code untuk Memberi Penilaian', 400, 355);
    ctx.fillStyle = '#F1F5F9';
    ctx.fillRect(210, 390, 380, 380);
    ctx.drawImage(qrCanvas, 230, 410, 340, 340);
    ctx.fillStyle = '#10B981';
    ctx.font = 'bold 22px Arial, sans-serif';
    ctx.fillText('✓  Ulasan Anda 100% Anonim & Rahasia', 400, 820);
    if (currentStore.wifiName) {
      ctx.fillStyle = '#64748B';
      ctx.font = '20px Arial, sans-serif';
      ctx.fillText(`Wi-Fi Gratis: ${currentStore.wifiName}`, 400, 860);
    }
    if (currentStore.address) {
      ctx.fillStyle = '#94A3B8';
      ctx.font = '18px Arial, sans-serif';
      ctx.fillText(currentStore.address, 400, 900);
    }
    ctx.fillStyle = '#E2E8F0';
    ctx.fillRect(60, 940, 680, 2);
    ctx.fillStyle = '#94A3B8';
    ctx.font = '18px Arial, sans-serif';
    ctx.fillText('Powered by REVISTA', 400, 985);

    const link = document.createElement('a');
    link.download = `Standee-QR-${currentStore.id}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 2500);
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Generator Kartu QR Meja</h2>
          <p className="text-slate-500 dark:text-slate-400 text-xs mt-1">Kartu QR siap cetak. Satu QR berlaku untuk seluruh meja toko.</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={handleDownloadStandee} className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors">
            <Download className="w-3.5 h-3.5" />
            <span>{downloadSuccess ? 'Tersimpan!' : 'Unduh Standee (PNG)'}</span>
          </button>
          <button onClick={() => window.print()} className="flex items-center gap-2 px-4 py-2 bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors">
            <Printer className="w-3.5 h-3.5" />
            <span>Cetak</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-5 flex flex-col items-center">
          <div id="printable-standee" className="w-full max-w-[320px] bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden text-center">
            <div className="bg-slate-900 text-white px-6 py-5">
              <div className="flex items-center justify-center gap-2 mb-1">
                <div className="w-6 h-6 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-[10px]">R</div>
                <span className="font-extrabold text-sm tracking-tight">REVISTA</span>
              </div>
              <p className="text-[10px] text-blue-300">Sistem Evaluasi Pelayanan Pelanggan</p>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 tracking-tight leading-tight">{currentStore.name}</h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">Scan QR di bawah untuk memberikan penilaian pelayanan kami</p>
              </div>
              <div ref={qrCanvasRef} className="bg-slate-50 p-4 rounded-2xl border-2 border-dashed border-slate-300 inline-block mx-auto">
                <QRCodeCanvas value={feedbackUrl} size={160} level="H" includeMargin={false} />
              </div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 font-semibold text-[10px] border border-emerald-200">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>100% Anonim & Tanpa Unduh Aplikasi</span>
              </div>
              {currentStore.wifiName && <p className="text-[9px] text-slate-400 flex items-center justify-center gap-1"><Wifi className="w-3 h-3" /><span>Wi-Fi Gratis: <strong className="text-slate-600">{currentStore.wifiName}</strong></span></p>}
            </div>
          </div>
          <p className="mt-4 text-[11px] text-slate-400 text-center max-w-[280px]">Cetak standee ini dan pajang di meja, kasir, atau pintu masuk. Satu QR berlaku untuk seluruh toko.</p>
        </div>

        <div className="lg:col-span-7 space-y-5">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2"><Sparkles className="w-4 h-4 text-blue-600" />Alur Kerja Sistem REVISTA</h3>
            <div className="space-y-3 pt-1">
              {[
                { n: '1', title: 'Standee Dipajang di Toko', desc: 'Cetak kartu QR dan pajang di meja, kasir, atau pintu masuk. Satu QR cukup untuk seluruh toko.' },
                { n: '2', title: 'Pelanggan Memindai QR', desc: 'Pelanggan scan dengan kamera HP. Formulir ulasan langsung terbuka tanpa perlu memasang aplikasi.' },
                { n: '3', title: 'Ulasan Dianalisis Otomatis', desc: 'Naive Bayes mengelompokkan komentar menjadi Positif, Netral, atau Negatif dan memperbarui dasbor.' },
              ].map((item) => <div key={item.n} className="flex items-start gap-3"><div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">{item.n}</div><div><h4 className="text-xs font-bold text-slate-900 dark:text-white">{item.title}</h4><p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">{item.desc}</p></div></div>)}
            </div>
          </div>
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs space-y-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Tautan Formulir Pelanggan</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Bagikan tautan ini atau scan QR di atas untuk membuka formulir ulasan mobile.</p>
            <div className="flex items-center gap-2 p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl">
              <input type="text" readOnly value={feedbackUrl} className="flex-1 bg-transparent text-xs text-slate-700 dark:text-slate-200 font-mono px-2 focus:outline-hidden min-w-0" />
              <button onClick={handleCopyLink} className="px-3 py-1.5 bg-slate-900 dark:bg-blue-600 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold shrink-0 flex items-center gap-1.5 transition-colors min-h-[32px]">{copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}<span>{copied ? 'Tersalin' : 'Salin'}</span></button>
            </div>
            <a href={feedbackUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline"><span>Buka Formulir Pelanggan</span><ExternalLink className="w-3.5 h-3.5" /></a>
          </div>
        </div>
      </div>
    </div>
  );
}
