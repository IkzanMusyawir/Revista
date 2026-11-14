import fs from 'fs';
import path from 'path';

const stopwords = new Set([
  'yang', 'di', 'ke', 'dari', 'ini', 'itu', 'dan', 'atau', 'untuk', 'pada', 'dengan',
  'adalah', 'karena', 'tapi', 'pun', 'juga', 'hanya', 'saja', 'lagi', 'sudah', 'akan',
  'bisa', 'ada', 'tidak', 'bukan', 'jangan', 'belum', 'apa', 'saya', 'aku', 'kami',
  'kita', 'kamu', 'anda', 'dia', 'mereka', 'nya', 'ku', 'mu', 'ya', 'kan', 'deh',
  'dong', 'nih', 'tuh', 'sih', 'kok', 'lah'
]);

function tokenize(text) {
  return (text || '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 2 && !stopwords.has(w));
}

// 1. Read PRDECT-ID CSV if exists, else load previous or extract
let prdectRecords = [];
const csvPath = path.resolve('prdect-id.csv');
if (fs.existsSync(csvPath)) {
  const csvContent = fs.readFileSync(csvPath, 'utf8');
  const lines = csvContent.split('\n');
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    const match = line.match(/,(Positive|Negative|Normal),([A-Za-z]+)$/i);
    if (!match) continue;
    const rawSentiment = match[1];
    const sentiment = rawSentiment.toLowerCase() === 'positive' ? 'Positif' 
      : rawSentiment.toLowerCase() === 'negative' ? 'Negatif' : 'Netral';
    const prefix = line.substring(0, line.length - match[0].length);
    const lastComma = prefix.lastIndexOf(',');
    let reviewText = prefix.substring(lastComma + 1).trim();
    if (reviewText.startsWith('"') && reviewText.endsWith('"')) {
      reviewText = reviewText.slice(1, -1);
    }
    prdectRecords.push({ text: reviewText, sentiment });
  }
}

// 2. High-Impact UMKM, F&B, dan Service Corpus
const umkmDomainCorpus = [
  // POSITIF
  { sentiment: 'Positif', text: 'pelayanan sangat ramah ramah cepat cekatan sopan barista kasir baik baik senyum menyambut' },
  { sentiment: 'Positif', text: 'tempat bersih bersih rapi wangi sejuk adem nyaman banget nongkrong nugas santai' },
  { sentiment: 'Positif', text: 'makanan enak lezat gurih nikmat mantap segar empuk hangat juara porsi kenyang kenyang' },
  { sentiment: 'Positif', text: 'kopi enak nikmat mantap mantul aroma wangi gula aren creamy pas nikmat' },
  { sentiment: 'Positif', text: 'meja bersih higienis tertata rapi piring sendok garpu bersih kinclong' },
  { sentiment: 'Positif', text: 'harga murah terjangkau bersahabat sepadan kualitas hemat worth recommended rekomen' },
  { sentiment: 'Positif', text: 'barista ramah sopan informatif memberikan rekomendasi terbaik mantap' },
  { sentiment: 'Positif', text: 'potongan rambut rapi kapster berpengalaman teliti bersih wangi' },
  { sentiment: 'Positif', text: 'pelayanan cepat tanpa antre kilat sigap tanggap profesional memuaskan' },
  { sentiment: 'Positif', text: 'suasana estetik aesthetic pencahayaan bagus playlist lagu enak nyaman betah' },
  { sentiment: 'Positif', text: 'toilet bersih wangi sabun tisu lengkap wastafel bersih' },
  { sentiment: 'Positif', text: 'wifi kencang stabil ngebut colokan banyak nyaman laptopan nugas' },
  { sentiment: 'Positif', text: 'suka sekali puas puas banget belanja langganan pasti balik lagi' },
  { sentiment: 'Positif', text: 'kasir senyum ramah menyapa menyambut hangat sopan menyenangkan' },
  { sentiment: 'Positif', text: 'pelayanan memuaskan luar biasa top markotop terbaik the best mantul' },

  // NEGATIF (Kata-kata komplain umum di kafe/toko)
  { sentiment: 'Negatif', text: 'jutek jutek judes judes ketus ketus cuek cuek masam sinis sombong galak songong tidak ramah' },
  { sentiment: 'Negatif', text: 'kasir jutek kasir judes kasir galak kasir cuek kasir sinis kasir tidak sopan kasar' },
  { sentiment: 'Negatif', text: 'meja kotor meja kotor berminyak banyak piring kotor belum dilap bau sisa makanan jorok dekil' },
  { sentiment: 'Negatif', text: 'pelayanan lambat lelet parah pesanan lama keluar nunggu antri berjam jam lelet parah' },
  { sentiment: 'Negatif', text: 'makanan dingin hambar asin keasinan amis basi basi bau tengik gosong mentah' },
  { sentiment: 'Negatif', text: 'antrean panjang tidak tertib staf malas tidak peduli lamban lemot mengecewakan' },
  { sentiment: 'Negatif', text: 'tempat sempit panas gerah pengap berisik bising kumuh tidak nyaman pengap' },
  { sentiment: 'Negatif', text: 'toilet bau pesing kotor becek tidak ada air jorok sekali bau apek' },
  { sentiment: 'Negatif', text: 'wifi lemot mati putus terus colokan tidak berfungsi rusak mati' },
  { sentiment: 'Negatif', text: 'kecewa parah jelek jelek buruk buruk kapok nyesel rugi buang uang mengecewakan' },
  { sentiment: 'Negatif', text: 'porsi sedikit pelit harga kemahalan mahal mahal tidak sebanding rugi' },
  { sentiment: 'Negatif', text: 'staf kasar kurang ajar tidak profesional pelayanan sangat mengecewakan kasar sombong' },
  { sentiment: 'Negatif', text: 'pesanan salah tertukar pelayan tidak mau minta maaf cuek' },
  { sentiment: 'Negatif', text: 'lantai licin kotor meja berdebu banyak lalat kecoa mengganggu jorok' },

  // NETRAL
  { sentiment: 'Netral', text: 'rasa biasa saja standar seperti tempat lain umumnya lumayan biasa standar' },
  { sentiment: 'Netral', text: 'pelayanan cukup standar wajar tidak ada yang istimewa biasa saja cukup' },
  { sentiment: 'Netral', text: 'tempat lumayan untuk nongkrong sebentar duduk rehat lumayan biasa' },
  { sentiment: 'Netral', text: 'harga standar umum pasaran sesuai lokasi porsi sedang standar sedang' },
  { sentiment: 'Netral', text: 'tidak terlalu enak tapi tidak terlalu buruk sedang saja lumayan cukup' },
  { sentiment: 'Netral', text: 'menu lumayan lengkap pilihan variasi cukup memadai biasa lumayan' },
  { sentiment: 'Netral', text: 'kopi standar tempat lumayan biasa saja tidak terlalu istimewa biasa' },
];

const allTrainingData = [...prdectRecords, ...umkmDomainCorpus];

const wordCounts = { Positif: {}, Negatif: {}, Netral: {} };
const docCounts = { Positif: 0, Negatif: 0, Netral: 0 };
const totalWords = { Positif: 0, Negatif: 0, Netral: 0 };
const vocabSet = new Set();
const domainVocab = new Set();

umkmDomainCorpus.forEach(({ text }) => {
  tokenize(text).forEach(w => domainVocab.add(w));
});

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

const filteredVocabulary = {};
for (const word of vocabSet) {
  const pCount = wordCounts.Positif[word] || 0;
  const nCount = wordCounts.Negatif[word] || 0;
  const mCount = wordCounts.Netral[word] || 0;
  const totalOccur = pCount + nCount + mCount;

  // Pertahankan semua kata domain UMKM atau kata yang muncul >= 2 kali di dataset PRDECT
  if (domainVocab.has(word) || totalOccur >= 2) {
    filteredVocabulary[word] = {
      p: pCount,
      n: nCount,
      m: mCount
    };
  }
}

const trainedModel = {
  version: '2.1.0',
  dataset: 'PRDECT-ID (5.400 ulasan) + Indonesian UMKM Service Corpus',
  totalDocs: allTrainingData.length,
  docCounts,
  totalWords,
  vocabSize: Object.keys(filteredVocabulary).length,
  words: filteredVocabulary
};

const outputPath = path.resolve('src/data/sentimentModel.json');
fs.writeFileSync(outputPath, JSON.stringify(trainedModel));
console.log(`✅ Model berhasil disimpan: ${trainedModel.vocabSize} kata.`);
