import React, { useState, useRef } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { Download, Printer, ShieldCheck, Wifi } from 'lucide-react';

export default function QrCardView({ currentStore }) {
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const qrCanvasRef = useRef(null);
  const feedbackUrl = `${window.location.origin}/?toko=${encodeURIComponent(currentStore.id)}&mode=review`;

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
          <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Kartu QR Standee Meja</h2>
          <p className="text-slate-500 dark:text-slate-400 text-xs mt-1">Kartu QR siap cetak untuk dipajang pada meja kasir atau meja pelanggan toko Anda.</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={handleDownloadStandee} className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors">
            <Download className="w-3.5 h-3.5" />
            <span>{downloadSuccess ? 'Tersimpan!' : 'Unduh Standee (PNG)'}</span>
          </button>
          <button onClick={() => window.print()} className="flex items-center gap-2 px-4 py-2 bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors">
            <Printer className="w-3.5 h-3.5" />
            <span>Cetak Standee</span>
          </button>
        </div>
      </div>

      <div className="flex flex-col items-center justify-center pt-2">
        <div id="printable-standee" className="w-full max-w-[340px] bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden text-center">
          <div className="bg-slate-900 text-white px-6 py-5">
            <div className="flex items-center justify-center gap-2 mb-1">
              <img src="/logo.jpeg" alt="Logo REVISTA" className="w-7 h-7 rounded-md" />
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
              <QRCodeCanvas value={feedbackUrl} size={180} level="H" includeMargin={false} />
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 font-semibold text-[10px] border border-emerald-200">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>100% Anonim & Tanpa Unduh Aplikasi</span>
            </div>
            {currentStore.wifiName && <p className="text-[9px] text-slate-400 flex items-center justify-center gap-1"><Wifi className="w-3 h-3" /><span>Wi-Fi Gratis: <strong className="text-slate-600">{currentStore.wifiName}</strong></span></p>}
          </div>
        </div>
        <p className="mt-4 text-xs text-slate-400 text-center max-w-[320px]">Cetak standee ini dan pajang di meja kasir atau nomor meja. Satu QR berlaku untuk seluruh toko.</p>
      </div>
    </div>
  );
}
