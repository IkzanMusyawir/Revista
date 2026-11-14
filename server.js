import express from 'express';
import cors from 'cors';
import mysql from 'mysql2/promise';
import crypto from 'crypto';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { promisify } from 'util';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const scrypt = promisify(crypto.scrypt);
const sessionSecret = process.env.SESSION_SECRET || 'revista_default_secure_secret_session_2026_super_key';
const port = Number(process.env.PORT) || 3001;

const app = express();
const dbUri = process.env.MYSQL_URL || process.env.DATABASE_URL;
const pool = dbUri
  ? mysql.createPool(dbUri)
  : mysql.createPool({
      host: process.env.DB_HOST || '127.0.0.1',
      port: Number(process.env.DB_PORT) || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'revista_db',
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
    });

const origins = new Set((process.env.CORS_ORIGINS || 'http://localhost:3000,http://127.0.0.1:3000').split(',').map((x) => x.trim()).filter(Boolean));
const feedbackLimits = new Map();
const loginLimits = new Map();

app.set('trust proxy', process.env.TRUST_PROXY === 'true');
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  next();
});

app.use(cors({
  origin(origin, callback) {
    if (!origin) return callback(null, true);
    // Izinkan localhost, IP Wi-Fi lokal, atau IP Tailscale (100.64.0.0/10)
    const isLocal = /^https?:\/\/(localhost|127\.0\.0\.1|192\.168\.\d+\.\d+|10\.\d+\.\d+\.\d+|172\.(1[6-9]|2\d|3[01])\.\d+\.\d+|100\.\d+\.\d+\.\d+)(:\d+)?$/.test(origin);
    if (isLocal || origins.has(origin)) return callback(null, true);
    return callback(null, false);
  },
  methods: ['GET', 'POST', 'PUT'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json({ limit: '5mb' }));

const hashPassword = async (password, salt) => (await scrypt(password, salt, 64)).toString('hex');
const sanitize = (value, max = 500) => typeof value === 'string' ? value.replace(/[\u0000-\u001F\u007F]/g, '').trim().slice(0, max) : '';

const createToken = (claims) => {
  const body = Buffer.from(JSON.stringify({ ...claims, exp: Date.now() + 8 * 60 * 60 * 1000 })).toString('base64url');
  return `${body}.${crypto.createHmac('sha256', sessionSecret).update(body).digest('base64url')}`;
};

async function initializeDatabase() {
  // Tunggu database MySQL online (retry hingga 10 kali saat container baru menyala)
  for (let attempt = 1; attempt <= 10; attempt++) {
    try {
      await pool.query('SELECT 1');
      break;
    } catch (err) {
      if (attempt === 10) throw err;
      console.log(`Menunggu database siap... (${attempt}/10)`);
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }
  }

  // 1. Buat tabel stores otomatis jika belum ada di database online
  await pool.query(`CREATE TABLE IF NOT EXISTS \`stores\` (
    \`id\` VARCHAR(50) PRIMARY KEY,
    \`name\` VARCHAR(100) NOT NULL,
    \`category\` VARCHAR(50) NOT NULL,
    \`owner\` VARCHAR(100) NOT NULL,
    \`owner_email\` VARCHAR(100) NOT NULL UNIQUE,
    \`password_hash\` VARCHAR(255) NOT NULL,
    \`salt\` VARCHAR(64) NOT NULL,
    \`address\` VARCHAR(255) NULL,
    \`phone\` VARCHAR(30) NULL,
    \`table_count\` INT NOT NULL DEFAULT 0,
    \`wifi_name\` VARCHAR(50) NULL,
    \`trend\` VARCHAR(20) DEFAULT '0%',
    \`role\` ENUM('admin', 'owner') DEFAULT 'owner',
    \`session_version\` INT NOT NULL DEFAULT 1,
    \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    \`updated_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX \`idx_owner_email\` (\`owner_email\`)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`);

  // 2. Buat tabel feedbacks otomatis jika belum ada di database online
  await pool.query(`CREATE TABLE IF NOT EXISTS \`feedbacks\` (
    \`id\` INT AUTO_INCREMENT PRIMARY KEY,
    \`anon_id\` VARCHAR(20) NOT NULL,
    \`store_id\` VARCHAR(50) NOT NULL,
    \`rating\` INT NOT NULL CHECK (\`rating\` BETWEEN 1 AND 5),
    \`comment\` TEXT NOT NULL,
    \`sentiment\` ENUM('Positif', 'Netral', 'Negatif') NOT NULL,
    \`confidence\` INT DEFAULT 90,
    \`highlight\` TINYINT(1) DEFAULT 0,
    \`photos\` MEDIUMTEXT NULL,
    \`ip_hash\` VARCHAR(64) NULL,
    \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX \`idx_store_created\` (\`store_id\`, \`created_at\`),
    INDEX \`idx_sentiment\` (\`sentiment\`),
    FOREIGN KEY (\`store_id\`) REFERENCES \`stores\`(\`id\`) ON DELETE CASCADE
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`);

  // 3. Buat otomatis akun master admin jika belum ada
  const [[{ count }]] = await pool.query('SELECT COUNT(*) AS count FROM `stores` WHERE `role` = "admin"');
  if (Number(count) === 0) {
    const salt = '746c168f61ddf06293ae697aa1dcfcde';
    const hash = '4599642990ddb04c03a6707cb4eb4cc4dbf078246707a36bdf6228c93a397c8dd75e04068390ec24ca617349c21f6d9a882c0f3bde5ae077ad81be2bc36f81ab';
    await pool.query(
      'INSERT INTO `stores` (`id`, `name`, `category`, `owner`, `owner_email`, `password_hash`, `salt`, `role`) VALUES (?, ?, ?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE `role` = "admin"',
      ['store-admin', 'REVISTA Central Admin', 'Admin Pusat', 'Master Admin', 'admin@revista.id', hash, salt, 'admin']
    );
  }
}
const databaseReady = initializeDatabase();

async function requireAuth(req, res, next) {
  const [body, signature] = String(req.headers.authorization || '').replace(/^Bearer\s+/i, '').split('.');
  if (!body || !signature) return res.status(401).json({ error: 'Sesi tidak ditemukan.' });
  const expected = crypto.createHmac('sha256', sessionSecret).update(body).digest();
  const actual = Buffer.from(signature, 'base64url');
  if (actual.length !== expected.length || !crypto.timingSafeEqual(actual, expected)) return res.status(401).json({ error: 'Sesi tidak valid.' });
  try {
    const claims = JSON.parse(Buffer.from(body, 'base64url').toString());
    if (!claims.storeId || claims.exp <= Date.now()) return res.status(401).json({ error: 'Sesi kedaluwarsa.' });
    const [[store]] = await pool.query('SELECT `session_version`, `role` FROM `stores` WHERE `id` = ? LIMIT 1', [claims.storeId]);
    if (!store || Number(store.session_version) !== Number(claims.version)) return res.status(401).json({ error: 'Sesi dicabut.' });
    req.user = { ...claims, role: store.role || 'owner' };
    next();
  } catch {
    return res.status(401).json({ error: 'Sesi tidak valid.' });
  }
}

// ================= MULTINOMIAL NAIVE BAYES SENTIMENT CLASSIFIER =================
// Model dilatih dari 5.400 ulasan dataset PRDECT-ID + Korpus Pelayanan UMKM Indonesia
const modelPath = path.join(__dirname, 'src/data/sentimentModel.json');
const nbModel = JSON.parse(fs.readFileSync(modelPath, 'utf8'));

const nbStopwords = new Set([
  'yang', 'di', 'ke', 'dari', 'ini', 'itu', 'dan', 'atau', 'untuk', 'pada', 'dengan',
  'adalah', 'karena', 'tapi', 'pun', 'juga', 'hanya', 'saja', 'lagi', 'sudah', 'akan',
  'bisa', 'ada', 'tidak', 'bukan', 'jangan', 'belum', 'apa', 'saya', 'aku', 'kami',
  'kita', 'kamu', 'anda', 'dia', 'mereka', 'nya', 'ku', 'mu', 'ya', 'kan', 'deh',
  'dong', 'nih', 'tuh', 'sih', 'kok', 'lah'
]);

function nbTokenize(str) {
  return (str || '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 2 && !nbStopwords.has(w));
}

// Fungsi Prediksi Naive Bayes (Log-Likelihood dengan Laplace Smoothing Add-1)
function classifySentiment(text, rating = 5) {
  const tokens = nbTokenize(text);
  const knownTokens = tokens.filter((t) => nbModel.words[t]);

  // Jika teks tidak mengandung kata bersentimen (atau hanya simbol/spasi), gunakan bintang sebagai prior
  if (knownTokens.length === 0) {
    if (rating >= 4) return { sentiment: 'Positif', confidence: 95 };
    if (rating <= 2) return { sentiment: 'Negatif', confidence: 95 };
    return { sentiment: 'Netral', confidence: 85 };
  }

  // Hitung Posterior Log-Probability P(Class | Text) ∝ log P(Class) + Σ log P(word | Class)
  const classes = ['Positif', 'Negatif', 'Netral'];
  const logScores = {};

  classes.forEach((c) => {
    let logProb = Math.log(nbModel.docCounts[c] / nbModel.totalDocs);
    const key = c === 'Positif' ? 'p' : c === 'Negatif' ? 'n' : 'm';
    const totalW = nbModel.totalWords[c];

    knownTokens.forEach((t) => {
      const count = nbModel.words[t][key] || 0;
      // Laplace Smoothing Add-1
      logProb += Math.log((count + 1) / (totalW + nbModel.vocabSize));
    });
    logScores[c] = logProb;
  });

  // Argmax: Ambil kelas dengan probabilitas log-likelihood tertinggi
  let bestClass = 'Netral';
  let maxScore = -Infinity;
  classes.forEach((c) => {
    if (logScores[c] > maxScore) {
      maxScore = logScores[c];
      bestClass = c;
    }
  });

  // Softmax normalization untuk persentase confidence score
  const expScores = {};
  let expSum = 0;
  classes.forEach((c) => {
    const exp = Math.exp(logScores[c] - maxScore);
    expScores[c] = exp;
    expSum += exp;
  });

  const confidence = Math.min(99, Math.max(70, Math.round((expScores[bestClass] / expSum) * 100)));
  return { sentiment: bestClass, confidence };
}

// 1. LOGIN PEMILIK TOKO ATAU ADMIN
app.post('/api/auth/login', async (req, res) => {
  try {
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    const now = Date.now();
    const attempts = (loginLimits.get(ip) || []).filter((time) => now - time < 900000);
    if (attempts.length >= 10) return res.status(429).json({ error: 'Terlalu banyak percobaan login. Coba lagi 15 menit.' });

    const email = String(req.body.email || '').trim().toLowerCase();
    const password = String(req.body.password || '');
    if (!email || !password) return res.status(400).json({ error: 'Email dan kata sandi wajib diisi.' });

    const [[store]] = await pool.query('SELECT * FROM `stores` WHERE LOWER(`owner_email`) = ? LIMIT 1', [email]);
    if (!store?.password_hash || !store.salt) {
      attempts.push(now); loginLimits.set(ip, attempts);
      return res.status(401).json({ error: 'Email atau kata sandi tidak sesuai.' });
    }

    const actual = Buffer.from(await hashPassword(password, store.salt), 'hex');
    const expected = Buffer.from(store.password_hash, 'hex');
    if (actual.length !== expected.length || !crypto.timingSafeEqual(actual, expected)) {
      attempts.push(now); loginLimits.set(ip, attempts);
      return res.status(401).json({ error: 'Email atau kata sandi tidak sesuai.' });
    }
    loginLimits.delete(ip);

    res.json({
      ok: true,
      token: createToken({ storeId: store.id, role: store.role || 'owner', version: store.session_version || 1 }),
      store: {
        id: store.id,
        name: store.name,
        category: store.category,
        owner: store.owner,
        ownerEmail: store.owner_email,
        address: store.address,
        role: store.role || 'owner'
      }
    });
  } catch (err) {
    console.error('Login error:', err.message);
    res.status(500).json({ error: 'Login gagal karena masalah server.' });
  }
});

// 2. ADMIN DAFTARKAN TOKO KLIEN YANG SUDAH MEMBELI STAND / PRODUK
app.post('/api/admin/create-client-store', requireAuth, async (req, res) => {
  const { name, category, owner, email, password, address, phone } = req.body;
  if (!name || !owner || !email || !password) return res.status(400).json({ error: 'Nama toko, pemilik, email, dan kata sandi wajib diisi.' });
  if (password.length < 6) return res.status(400).json({ error: 'Kata sandi toko minimal 6 karakter.' });

  const cleanEmail = String(email).trim().toLowerCase();
  const [existing] = await pool.query('SELECT `id` FROM `stores` WHERE LOWER(`owner_email`) = ? LIMIT 1', [cleanEmail]);
  if (existing.length) return res.status(409).json({ error: 'Email ini sudah terdaftar.' });

  const storeId = `store-${crypto.randomBytes(6).toString('hex')}`;
  const salt = crypto.randomBytes(16).toString('hex');
  const passwordHash = await hashPassword(password, salt);

  await pool.query(
    'INSERT INTO `stores` (`id`, `name`, `category`, `owner`, `owner_email`, `password_hash`, `salt`, `address`, `phone`, `role`) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [storeId, sanitize(name, 100), sanitize(category || 'UMKM & Usaha', 50), sanitize(owner, 100), cleanEmail, passwordHash, salt, sanitize(address || '', 255), sanitize(phone || '', 30), 'owner']
  );

  res.status(201).json({
    ok: true,
    store: { id: storeId, name, owner, ownerEmail: cleanEmail }
  });
});

// 5. LIST SEMUA TOKO KLIEN (KHUSUS ADMIN)
app.get('/api/admin/stores', requireAuth, async (req, res) => {
  const [rows] = await pool.query('SELECT `id`, `name`, `category`, `owner`, `owner_email`, `phone`, `role`, `created_at` FROM `stores` ORDER BY `created_at` DESC');
  res.json(rows);
});

// 6. PUBLIC: INFORMASI TOKO SAAT SCAN QR
app.get('/api/public/stores/:id', async (req, res) => {
  const [[store]] = await pool.query('SELECT `id`, `name`, `category`, `address` FROM `stores` WHERE `id` = ? LIMIT 1', [req.params.id]);
  if (!store) return res.status(404).json({ error: 'Toko tidak ditemukan.' });
  res.json(store);
});

// 7. GET DATA DASBOR TOKO (ISOLASI DATA TENANT)
app.get('/api/store', requireAuth, async (req, res) => {
  try {
    const [[store]] = await pool.query('SELECT `id`, `name`, `category`, `owner`, `owner_email`, `address`, `phone`, `table_count`, `wifi_name`, `trend`, `role` FROM `stores` WHERE `id` = ? LIMIT 1', [req.user.storeId]);
    if (!store) return res.status(404).json({ error: 'Toko tidak ditemukan.' });

    const range = ['7d', '30d', 'all'].includes(req.query.range) ? req.query.range : '7d';
    const rangeSql = range === 'all' ? '' : ' AND `created_at` >= DATE_SUB(NOW(), INTERVAL ? DAY)';
    const params = range === 'all' ? [store.id] : [store.id, range === '7d' ? 7 : 30];
    const [rows] = await pool.query('SELECT `anon_id`, `rating`, `comment`, `sentiment`, `confidence`, `highlight`, `photos`, `created_at` FROM `feedbacks` WHERE `store_id` = ?' + rangeSql + ' ORDER BY `created_at` DESC LIMIT 500', params);

    const totalFeedback = rows.length;
    const avgRating = totalFeedback ? Number((rows.reduce((sum, f) => sum + f.rating, 0) / totalFeedback).toFixed(1)) : 0;
    const percent = (sentiment) => totalFeedback ? Math.round(rows.filter((f) => f.sentiment === sentiment).length / totalFeedback * 100) : 0;
    
    const daily = new Map();
    [...rows].reverse().forEach((f) => {
      const day = new Date(f.created_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' });
      const value = daily.get(day) || { day, sum: 0, count: 0 };
      value.sum += f.rating; value.count++; daily.set(day, value);
    });

    res.json({
      id: store.id, name: store.name, category: store.category, owner: store.owner, ownerEmail: store.owner_email,
      address: store.address || '', phone: store.phone || '', tableCount: store.table_count || 0, wifiName: store.wifi_name || '',
      role: store.role || 'owner',
      totalFeedback, avgRating, pos: percent('Positif'), net: percent('Netral'), neg: percent('Negatif'),
      trend: store.trend || '0%', ratingTrend: '0',
      dailyRatings: [...daily.values()].map(({ day, sum, count }) => ({ day, rating: Number((sum / count).toFixed(1)), count })),
      feedbacks: rows.map((f) => ({
        id: f.anon_id, rating: f.rating, comment: f.comment, sentiment: f.sentiment, confidence: f.confidence,
        highlight: Boolean(f.highlight), photos: f.photos ? JSON.parse(f.photos) : [],
        date: new Date(f.created_at).toLocaleDateString('id-ID'),
        time: new Date(f.created_at).toLocaleTimeString('id-ID')
      })),
    });
  } catch (err) {
    console.error('Dashboard error:', err.message);
    res.status(500).json({ error: 'Gagal memuat dasbor.' });
  }
});

// 8. UPDATE PENGATURAN TOKO
app.put('/api/store', requireAuth, async (req, res) => {
  try {
    const { name, category, owner, phone, address, tableCount, wifiName, password } = req.body;
    let updateQuery = 'UPDATE `stores` SET `name` = ?, `category` = ?, `owner` = ?, `phone` = ?, `address` = ?, `table_count` = ?, `wifi_name` = ?';
    const params = [sanitize(name, 100), sanitize(category, 50), sanitize(owner, 100), sanitize(phone, 30), sanitize(address, 255), Math.min(500, Math.max(0, Number(tableCount) || 0)), sanitize(wifiName, 50)];

    if (password && password.length >= 6) {
      const salt = crypto.randomBytes(16).toString('hex');
      const hash = await hashPassword(password, salt);
      updateQuery += ', `password_hash` = ?, `salt` = ?';
      params.push(hash, salt);
    }

    updateQuery += ' WHERE `id` = ?';
    params.push(req.user.storeId);

    await pool.query(updateQuery, params);
    res.json({ ok: true, message: 'Pengaturan toko berhasil disimpan.' });
  } catch {
    res.status(500).json({ error: 'Pengaturan gagal disimpan.' });
  }
});

// 9. LOGOUT
app.post('/api/auth/logout', requireAuth, async (req, res) => {
  await pool.query('UPDATE `stores` SET `session_version` = `session_version` + 1 WHERE `id` = ?', [req.user.storeId]);
  res.json({ ok: true });
});

// 10. SUBMIT ULASAN DARI PELANGGAN (PUBLIC)
app.post('/api/feedback', async (req, res) => {
  try {
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    const now = Date.now();
    // Proteksi anti-spam: jeda minimal 30 detik & maksimal 3 ulasan per 10 menit per IP
    const recent = (feedbackLimits.get(ip) || []).filter((time) => now - time < 600000);
    if (recent.length >= 3 || (recent.length && now - recent[recent.length - 1] < 30000)) {
      return res.status(429).json({ error: 'Ulasan Anda baru saja diterima. Mohon tunggu sebelum mengirim ulasan baru.' });
    }
    recent.push(now); feedbackLimits.set(ip, recent);

    const { store_id, rating, comment, photos } = req.body;
    if (typeof store_id !== 'string' || !Number.isInteger(Number(rating)) || Number(rating) < 1 || Number(rating) > 5) return res.status(400).json({ error: 'Pilih rating 1–5.' });
    
    const [[store]] = await pool.query('SELECT `id` FROM `stores` WHERE `id` = ? LIMIT 1', [store_id]);
    if (!store) return res.status(404).json({ error: 'Toko tidak ditemukan.' });

    const cleanComment = sanitize(comment || '');
    const validPhotos = Array.isArray(photos) ? photos.slice(0, 3).filter((photo) => typeof photo === 'string' && /^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/.test(photo) && photo.length <= 700000) : [];
    
    const { sentiment, confidence } = classifySentiment(cleanComment, Number(rating));
    const id = `#${crypto.randomInt(100000, 999999)}`;

    await pool.query(
      'INSERT INTO `feedbacks` (`anon_id`, `store_id`, `rating`, `comment`, `sentiment`, `confidence`, `highlight`, `photos`, `ip_hash`) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [id, store_id, Number(rating), cleanComment, sentiment, confidence, Number(rating) === 5 ? 1 : 0, validPhotos.length ? JSON.stringify(validPhotos) : null, crypto.createHash('sha256').update(ip).digest('hex')]
    );

    res.status(201).json({ ok: true, feedback: { id, store_id, rating: Number(rating), comment: cleanComment, sentiment, confidence, photos: validPhotos } });
  } catch (err) {
    console.error('Feedback save failed:', err.message);
    res.status(500).json({ error: 'Ulasan gagal disimpan.' });
  }
});

// 11. SERVE FRONTEND (DIST) UNTUK PRODUCTION / HOSTING
const distPath = path.join(__dirname, 'dist');
app.use(express.static(distPath));

app.get('/health', (_req, res) => res.json({ status: 'ok' }));

// SPA fallback kompatibel Express 5 (menggantikan wildcard app.get('*') yang deprecated)
app.use((req, res, next) => {
  if (req.method === 'GET' && !req.path.startsWith('/api')) {
    return res.sendFile(path.join(distPath, 'index.html'));
  }
  next();
});

// Jalankan server HTTP langsung agar lolos Railway port healthcheck
app.listen(port, '0.0.0.0', () => {
  console.log(`🚀 REVISTA server aktif pada port ${port}`);
});

databaseReady
  .then(() => console.log('✅ Database MySQL terhubung & tabel siap!'))
  .catch((err) => console.error('⚠️ Database initialization warning:', err.message));
