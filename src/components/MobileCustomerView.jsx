import React, { useState, useRef } from 'react';
import { API_BASE } from '../api';
import { 
  Star, 
  ShieldCheck, 
  Send, 
  CheckCircle2, 
  MapPin,
  Camera,
  X,
  ImagePlus
} from 'lucide-react';

// Compress gambar ke max 800px dan kualitas 0.7 — native canvas, nol library tambahan
// ponytail: base64 ~80-120KB per foto, cukup untuk bukti teks. Upgrade ke object storage jika perlu attachment >1MB
function compressImage(file) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const MAX = 800;
        let { width, height } = img;
        if (width > MAX || height > MAX) {
          const ratio = Math.min(MAX / width, MAX / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        canvas.getContext('2d').drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.7));
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
}

export default function MobileCustomerView({ currentStore, onFeedbackSubmitted }) {
  const storageKey = `revista_reviewed_${currentStore?.id || 'default'}`;
  const [alreadyReviewed, setAlreadyReviewed] = useState(() => {
    try {
      const last = localStorage.getItem(storageKey);
      if (!last) return false;
      // Batasi 1 ulasan per 2 jam per perangkat untuk mencegah spam
      return Date.now() - Number(last) < 2 * 60 * 60 * 1000;
    } catch {
      return false;
    }
  });

  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [photos, setPhotos] = useState([]); // array of { preview: dataURL, compressed: dataURL }
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [resultData, setResultData] = useState(null);
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);

  const starLabels = { 1: 'Sangat Buruk', 2: 'Kurang Puas', 3: 'Cukup', 4: 'Puas', 5: 'Sangat Puas' };

  const presetComments = [
    { label: 'Pelayanan Cepat & Ramah', rating: 5, text: 'Pelayanannya sangat ramah dan cepat, tempatnya bersih dan nyaman.' },
    { label: 'Waktu Tunggu / Antrean', rating: 2, text: 'Waktu tunggu pesanan agak lama dan staf kasir kurang ramah.' },
    { label: 'Kualitas Rasa & Produk', rating: 4, text: 'Rasa mantap dan suasana nyaman, hanya saja tempat parkir agak sempit.' },
  ];

  const handlePhotoAdd = async (e) => {
    const files = Array.from(e.target.files || []);
    if (photos.length + files.length > 3) {
      alert('Maksimal 3 foto bukti per ulasan.');
      return;
    }
    const newPhotos = await Promise.all(
      files.slice(0, 3 - photos.length).map(async (file) => {
        const compressed = await compressImage(file);
        return { preview: compressed, compressed };
      })
    );
    setPhotos((prev) => [...prev, ...newPhotos]);
    e.target.value = '';
  };

  const removePhoto = (idx) => {
    setPhotos((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (rating === 0) return;

    setIsSubmitting(true);
    setSubmitError('');
    const feedbackPayload = {
      store_id: currentStore.id,
      rating,
      comment: comment.trim() || 'Pelayanan memuaskan dan recommended.',
      photos: photos.map((p) => p.compressed), // array base64 sudah terkompresi
    };

    try {
      const res = await fetch(`${API_BASE}/api/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(feedbackPayload),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.ok || !data.feedback) {
        throw new Error(data.error || 'Ulasan gagal disimpan. Silakan coba lagi.');
      }
      setResultData(data.feedback);
      setSubmitted(true);
      try {
        localStorage.setItem(storageKey, String(Date.now()));
      } catch {}
      onFeedbackSubmitted?.();
    } catch (err) {
      setSubmitError(err.message || 'Server tidak dapat dihubungi. Ulasan belum tersimpan.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[100dvh] bg-[#F8FAFC] text-slate-800 flex flex-col justify-between p-4 sm:p-6 font-sans">
      <div className="max-w-md w-full mx-auto space-y-4">
        {/* Header */}
        <div className="text-center pt-3">
          <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2.5 py-1 rounded-md border border-blue-200">
            REVISTA • Feedback Pelanggan
          </span>

          <h1 className="text-xl font-bold text-slate-900 mt-3 tracking-tight">
            {currentStore.name}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5 flex items-center justify-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span>{currentStore.address}</span>
          </p>

          <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Ulasan Bersifat 100% Anonim</span>
          </div>
        </div>

        {/* Form / Thank You */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-4">
          {alreadyReviewed && !submitted ? (
            /* Sudah Pernah Mengirim Ulasan (Anti-Spam) */
            <div className="text-center py-6 space-y-3 animate-in fade-in">
              <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 mx-auto flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6 stroke-[2.5]" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Ulasan Sudah Terkirim</h3>
              <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
                Anda sudah mengirimkan ulasan untuk kunjungan ini. Terima kasih banyak atas partisipasi Anda dalam membantu kami meningkatkan kualitas pelayanan!
              </p>
              <div className="pt-2 text-[10px] text-slate-400">
                Sistem REVISTA membatasi 1 ulasan per kunjungan meja.
              </div>
            </div>
          ) : !submitted ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Preset Cepat */}
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  Pilih Template Cepat:
                </p>
                <div className="flex flex-col gap-1">
                  {presetComments.map((p, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => { setRating(p.rating); setComment(p.text); }}
                      className="text-xs px-3 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-slate-700 transition-colors text-left min-h-[40px]"
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Penilaian Bintang */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 text-center space-y-1.5">
                <label className="block text-xs font-semibold text-slate-700">
                  Bagaimana Pelayanan Kami Hari Ini?
                </label>

                <div className="flex items-center justify-center gap-2 py-1">
                  {[1, 2, 3, 4, 5].map((star) => {
                    const active = star <= (hoverRating || rating);
                    return (
                      <button
                        key={star}
                        type="button"
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        onClick={() => setRating(star)}
                        className="p-1 focus:outline-hidden transition-transform active:scale-95 min-w-[44px] min-h-[44px] flex items-center justify-center"
                      >
                        <Star className={`w-8 h-8 transition-colors ${active ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}`} />
                      </button>
                    );
                  })}
                </div>

                <p className="text-xs font-semibold text-slate-700 min-h-[16px]">
                  {starLabels[hoverRating || rating]}
                </p>
              </div>

              {/* Komentar Teks */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                  <label>Komentar / Saran Pelayanan:</label>
                  <span className="text-[10px] text-slate-400 font-normal">{comment.length}/250</span>
                </div>
                <textarea
                  rows={3}
                  maxLength={250}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Ceritakan pengalaman Anda, keramahan staf, atau kecepatan pelayanan..."
                  className="w-full text-xs text-slate-800 p-3 rounded-xl border border-slate-200 focus:outline-hidden focus:border-blue-500 transition-colors resize-none bg-slate-50/50"
                />
              </div>

              {/* Upload Foto Bukti */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                    <Camera className="w-3.5 h-3.5 text-slate-500" />
                    Foto Bukti <span className="font-normal text-slate-400">(opsional, maks. 3 foto)</span>
                  </label>
                  {photos.length < 3 && (
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => cameraInputRef.current?.click()}
                        className="flex items-center gap-1 text-[11px] font-semibold text-white px-2 py-1 rounded-lg bg-blue-600 border border-blue-700 transition-colors min-h-[32px]"
                      >
                        <Camera className="w-3.5 h-3.5" />
                        Ambil Foto
                      </button>
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="flex items-center gap-1 text-[11px] font-semibold text-blue-600 hover:text-blue-700 px-2 py-1 rounded-lg bg-blue-50 border border-blue-200 transition-colors min-h-[32px]"
                      >
                        <ImagePlus className="w-3.5 h-3.5" />
                        Galeri
                      </button>
                    </div>
                  )}
                  <input
                    ref={cameraInputRef}
                    type="file"
                    accept="image/*"
                    capture="environment"
                    className="hidden"
                    onChange={handlePhotoAdd}
                  />
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={handlePhotoAdd}
                  />
                </div>

                {photos.length > 0 && (
                  <div className="flex gap-2 flex-wrap">
                    {photos.map((ph, idx) => (
                      <div key={idx} className="relative group w-20 h-20 rounded-xl overflow-hidden border border-slate-200 bg-slate-100 shrink-0">
                        <img
                          src={ph.preview}
                          alt={`Foto bukti ${idx + 1}`}
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => removePhoto(idx)}
                          className="absolute top-1 right-1 w-5 h-5 bg-slate-900/80 rounded-full flex items-center justify-center text-white hover:bg-rose-600 transition-colors"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {photos.length === 0 && (
                  <div className="w-full border-2 border-dashed border-slate-200 rounded-xl flex flex-col items-center gap-2 p-3 bg-slate-50/50">
                    <button
                      type="button"
                      onClick={() => cameraInputRef.current?.click()}
                      className="w-full h-11 rounded-lg bg-blue-600 text-white text-xs font-semibold flex items-center justify-center gap-2 transition-colors hover:bg-blue-700 min-h-[44px]"
                    >
                      <Camera className="w-4 h-4" />
                      Ambil Foto dengan Kamera
                    </button>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="text-[11px] text-blue-600 hover:text-blue-700 font-medium"
                    >
                      atau pilih dari galeri
                    </button>
                  </div>
                )}
              </div>

              {submitError && (
                <p role="alert" className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700">{submitError}</p>
              )}

              {/* Tombol Kirim */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-xs flex items-center justify-center gap-2 transition-all disabled:opacity-50 min-h-[48px]"
              >
                {isSubmitting ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>Kirim Ulasan Anonim</span>
                  </>
                )}
              </button>
            </form>
          ) : (
            /* Kartu Terima Kasih */
            <div className="text-center py-5 space-y-4 animate-in fade-in">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6 stroke-[2.5]" />
              </div>

              <div>
                <h3 className="text-lg font-bold text-slate-900">Terima Kasih!</h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Ulasan Anda telah dikirimkan secara anonim dan langsung tersimpan di sistem evaluasi pemilik usaha.
                </p>
              </div>

              {resultData && (
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-left space-y-2 text-xs">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-1.5">
                    <span className="text-slate-500">ID Tiket:</span>
                    <span className="font-mono font-bold text-slate-800">{resultData.id}</span>
                  </div>
                  <div className="flex items-center justify-between border-b border-slate-200 pb-1.5">
                    <span className="text-slate-500">Rating:</span>
                    <span className="font-bold text-amber-600">{resultData.rating} ★</span>
                  </div>
                  <div className="flex items-center justify-between border-b border-slate-200 pb-1.5">
                    <span className="text-slate-500">Sentimen (Naive Bayes):</span>
                    <span className={`font-semibold ${
                      resultData.sentiment === 'Positif' ? 'text-emerald-600'
                        : resultData.sentiment === 'Negatif' ? 'text-rose-600'
                        : 'text-amber-600'
                    }`}>{resultData.sentiment}</span>
                  </div>
                  {photos.length > 0 && (
                    <div className="flex items-center justify-between pt-1">
                      <span className="text-slate-500">Foto Bukti:</span>
                      <span className="font-semibold text-blue-600">{photos.length} foto terlampir</span>
                    </div>
                  )}
                </div>
              )}

              <div className="pt-2 text-center">
                <p className="text-xs font-semibold text-slate-700">Terima kasih atas partisipasi Anda!</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Ulasan telah diverifikasi dan masuk ke sistem pemilik usaha.</p>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="text-center text-slate-400 text-[10px] py-4">
        <span>REVISTA — Sistem Evaluasi Pelayanan UMKM</span>
      </div>
    </div>
  );
}
