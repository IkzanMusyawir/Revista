import fs from 'fs';
import path from 'path';

// Stopwords umum bahasa indonesia
const stopwords = new Set([
  'yang', 'di', 'ke', 'dari', 'ini', 'itu', 'dan', 'atau', 'untuk', 'pada', 'dengan',
  'adalah', 'yaitu', 'yakni', 'sebagai', 'oleh', 'karena', 'maka', 'sehingga', 'jika',
  'kalau', 'bila', 'saat', 'ketika', 'setelah', 'sebelum', 'sampai', 'hingga', 'lalu',
  'kemudian', 'namun', 'tetapi', 'tapi', 'melainkan', 'sedangkan', 'padahal', 'pun',
  'juga', 'pula', 'hanya', 'saja', 'lagi', 'sudah', 'telah', 'sedang', 'akan', 'bisa',
  'dapat', 'ada', 'tidak', 'bukan', 'jangan', 'belum', 'apa', 'siapa', 'kapan', 'dimana',
  'kenapa', 'mengapa', 'bagaimana', 'berapa', 'saya', 'aku', 'kami', 'kita', 'kamu',
  'anda', 'dia', 'mereka', 'nya', 'ku', 'mu', 'ya', 'kan', 'deh', 'dong', 'nih', 'tuh',
  'sih', 'kok', 'lah', 'kah', 'tah'
]);

function tokenize(text) {
  return (text || '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 2 && !stopwords.has(w));
}

// 1. Read PRDECT-ID CSV
const csvPath = path.resolve('prdect-id.csv');
const csvContent = fs.readFileSync(csvPath, 'utf8');

// Robust CSV parser for customer reviews with commas & quotes
function parseCSV(content) {
  const records = [];
  const lines = content.split('\n');
  
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    // Detect sentiment label at the end: ...,Positive,Emotion or ...,Negative,Emotion
    const match = line.match(/,(Positive|Negative|Normal),([A-Za-z]+)$/i);
    if (!match) continue;

    const rawSentiment = match[1];
    const sentiment = rawSentiment.toLowerCase() === 'positive' ? 'Positif' 
      : rawSentiment.toLowerCase() === 'negative' ? 'Negatif' : 'Netral';

    // The review text is typically the field right before Sentiment
    const prefix = line.substring(0, line.length - match[0].length);
    const lastComma = prefix.lastIndexOf(',');
    let reviewText = prefix.substring(lastComma + 1).trim();
    if (reviewText.startsWith('"') && reviewText.endsWith('"')) {
      reviewText = reviewText.slice(1, -1);
    }

    records.push({ text: reviewText, sentiment });
  }
  return records;
}

const prdectRecords = parseCSV(csvContent);
console.log(`Berhasil mengekstrak ${prdectRecords.length} ulasan dari PRDECT-ID.`);

// 2. Dataset Tambahan Spesifik F&B, Kafe, Resto & Layanan Fisik UMKM
const umkmDomainCorpus = [
  // POSITIF SPESIFIK LAYANAN
  { sentiment: 'Positif', text: 'pelayanan sangat ramah cepat cekatan sopan barista kasir baik' },
  { sentiment: 'Positif', text: 'tempat bersih rapi wangi sejuk adem nyaman banget nongkrong nugas' },
  { sentiment: 'Positif', text: 'makanan enak lezat gurih nikmat mantap segar hangat empuk juara porsi kenyang' },
  { sentiment: 'Positif', text: 'kopinya enak mantul aroma wangi gula aren creamy pas' },
  { sentiment: 'Positif', text: 'meja bersih higienis tertata rapi piring sendok bersih' },
  { sentiment: 'Positif', text: 'harga murah terjangkau bersahabat sepadan kualitas hemat' },
  { sentiment: 'Positif', text: 'barista ramah memberikan rekomendasi menu terbaik' },
  { sentiment: 'Positif', text: 'potongan rambut rapi kapster berpengalaman teliti bersih' },
  { sentiment: 'Positif', text: 'pelayanan cepat tanpa antre panjang proses saji kilat' },
  { sentiment: 'Positif', text: 'suasana estetik pencahayaan bagus playlist lagu enak santai' },
  { sentiment: 'Positif', text: 'toilet bersih wangi ada sabun cuci tangan tisu lengkap' },
  { sentiment: 'Positif', text: 'wifi kencang stabil colokan listrik banyak nyaman laptopan' },
  { sentiment: 'Positif', text: 'suka sekali puas belanja di sini langganan pasti balik lagi' },
  { sentiment: 'Positif', text: 'kasir menyapa dengan senyum ramah menyambut sopan' },
  { sentiment: 'Positif', text: 'tempat parkir luas aman ada juru parkir ramah' },
  { sentiment: 'Positif', text: 'pelayanan profesional mantap memuaskan luar biasa recommended' },

  // NEGATIF SPESIFIK LAYANAN
  { sentiment: 'Negatif', text: 'meja kotor berminyak banyak piring kotor belum dilap bau sisa makanan jorok' },
  { sentiment: 'Negatif', text: 'kasir jutek judes ketus cuek muka masam sinis sombong galak tidak ramah' },
  { sentiment: 'Negatif', text: 'pelayanan lambat lelet parah pesanan lama keluar nunggu berjam jam' },
  { sentiment: 'Negatif', text: 'makanan dingin hambar asin keasinan amis basi bau tengik gosong' },
  { sentiment: 'Negatif', text: 'antrean panjang tidak tertib staf malas tidak peduli lamban' },
  { sentiment: 'Negatif', text: 'tempat sempit panas gerah pengap berisik bising kumuh tidak nyaman' },
  { sentiment: 'Negatif', text: 'toilet bau pesing kotor becek tidak ada air jorok sekali' },
  { sentiment: 'Negatif', text: 'wifi lemot mati putus terus colokan tidak berfungsi' },
  { sentiment: 'Negatif', text: 'kecewa parah jelek buruk kapok nyesel rugi buang uang mengecewakan' },
  { sentiment: 'Negatif', text: 'porsi sedikit pelit harga kemahalan tidak sebanding kualitas' },
  { sentiment: 'Negatif', text: 'staf kasar kurang ajar tidak profesional pelayanan sangat mengecewakan' },
  { sentiment: 'Negatif', text: 'potongan rambut asal asalan tidak sesuai permintaan kependekan' },
  { sentiment: 'Negatif', text: 'pesanan salah tertukar dan pelayan tidak mau minta maaf' },
  { sentiment: 'Negatif', text: 'kasir salah hitung kembalian kurang pelayanan buruk parah' },
  { sentiment: 'Negatif', text: 'lantai licin kotor meja berdebu banyak lalat mengganggu' },

  // NETRAL SPESIFIK LAYANAN (Diberikan bobot representasi yang cukup)
  { sentiment: 'Netral', text: 'rasa biasa saja standar seperti tempat lain umumnya lumayan rasa standar biasa' },
  { sentiment: 'Netral', text: 'pelayanan cukup standar wajar tidak ada yang istimewa biasa saja cukup' },
  { sentiment: 'Netral', text: 'tempat lumayan untuk nongkrong sebentar duduk rehat lumayan biasa' },
  { sentiment: 'Netral', text: 'harga standar umum pasaran sesuai lokasi porsi sedang standar sedang' },
  { sentiment: 'Netral', text: 'tidak terlalu enak tapi tidak terlalu buruk sedang saja lumayan cukup' },
  { sentiment: 'Netral', text: 'menu lumayan lengkap pilihan variasi cukup memadai biasa lumayan' },
  { sentiment: 'Netral', text: 'standar pelayanan biasa saja porsi standar harga biasa lumayan cukup' },
  { sentiment: 'Netral', text: 'kopi standar tempat lumayan biasa saja tidak terlalu istimewa' },
];

// Gabungkan semua data training
const allTrainingData = [...prdectRecords, ...umkmDomainCorpus];

// 3. Hitung Frekuensi Kata & Probabilitas Naive Bayes
const wordCounts = { Positif: {}, Negatif: {}, Netral: {} };
const docCounts = { Positif: 0, Negatif: 0, Netral: 0 };
const totalWords = { Positif: 0, Negatif: 0, Netral: 0 };
const vocabSet = new Set();

allTrainingData.forEach(({ text, sentiment }) => {
  if (!wordCounts[sentiment]) return;
  docCounts[sentiment]++;

  const tokens = tokenize(text);
  tokens.forEach((w) => {
    wordCounts[sentiment][w] = (wordCounts[sentiment][w] || 0) + 1;
    totalWords[sentiment]++;
    vocabSet.add(w);
  });
});

// Filter kata langka (frekuensi total < 2) agar model ringan (<50 KB) dan tahan noise
const filteredVocabulary = {};
for (const word of vocabSet) {
  const pCount = wordCounts.Positif[word] || 0;
  const nCount = wordCounts.Negatif[word] || 0;
  const mCount = wordCounts.Netral[word] || 0;
  const totalOccur = pCount + nCount + mCount;

  if (totalOccur >= 2) {
    filteredVocabulary[word] = {
      p: pCount,
      n: nCount,
      m: mCount
    };
  }
}

const trainedModel = {
  version: '2.0.0',
  dataset: 'PRDECT-ID (5.400 ulasan) + Indonesian UMKM Service Corpus',
  totalDocs: allTrainingData.length,
  docCounts,
  totalWords,
  vocabSize: Object.keys(filteredVocabulary).length,
  words: filteredVocabulary
};

const outputPath = path.resolve('src/data/sentimentModel.json');
fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, JSON.stringify(trainedModel));

const fileSizeKB = (fs.statSync(outputPath).size / 1024).toFixed(1);
console.log(`✅ Model Naive Bayes berhasil dilatih dan disimpan ke: src/data/sentimentModel.json (${fileSizeKB} KB)`);
console.log(`📊 Ukuran Kosakata (Vocabulary Size): ${trainedModel.vocabSize} kata unik.`);
