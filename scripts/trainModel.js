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

function parseCsv(content) {
  const rows = [];
  let row = [];
  let field = '';
  let quoted = false;
  for (let i = 0; i < content.length; i++) {
    const ch = content[i];
    if (quoted) {
      if (ch === '"') {
        if (content[i + 1] === '"') { field += '"'; i++; }
        else quoted = false;
      } else field += ch;
    } else if (ch === '"') quoted = true;
    else if (ch === ',') { row.push(field); field = ''; }
    else if (ch === '\n') { row.push(field); rows.push(row); row = []; field = ''; }
    else if (ch !== '\r') field += ch;
  }
  if (field || row.length) { row.push(field); rows.push(row); }
  return rows;
}

function loadRecords(filename, mapper) {
  const filePath = path.resolve('datasets', filename);
  if (!fs.existsSync(filePath)) return [];
  const rows = parseCsv(fs.readFileSync(filePath, 'utf8'));
  return rows.slice(1).map(mapper).filter(Boolean);
}

const mapSentiment = (value) => {
  const v = (value || '').trim().toLowerCase();
  if (v === 'positive' || v === 'positif' || v === '1') return 'Positif';
  if (v === 'negative' || v === 'negatif' || v === '2') return 'Negatif';
  if (v === 'normal' || v === 'neutral' || v === 'netral' || v === '3') return 'Netral';
  return null;
};

const legacyRecords = fs.existsSync(path.resolve('prdect-id.csv'))
  ? parseCsv(fs.readFileSync(path.resolve('prdect-id.csv'), 'utf8')).slice(1).map((cols) => {
      const sentiment = mapSentiment(cols[cols.length - 1]);
      return sentiment ? { text: cols.slice(0, -1).join(' '), sentiment } : null;
    }).filter(Boolean)
  : [];

const mendeleyRecords = loadRecords('mendeley_tagged_id.csv', (cols) => {
  const sentiment = mapSentiment(cols[1]);
  return sentiment && cols[0] ? { text: cols[0], sentiment } : null;
});

const abusiveRecords = loadRecords('id_abusive_three_labels.csv', (cols) => {
  const label = (cols[0] || '').trim();
  if (label !== '2' && label !== '3') return null;
  return cols[1] ? { text: cols[1], sentiment: 'Negatif', weight: 0.15 } : null;
});

const umkmDomainCorpus = [
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
  { sentiment: 'Netral', text: 'rasa biasa saja standar seperti tempat lain umumnya lumayan biasa standar' },
  { sentiment: 'Netral', text: 'pelayanan cukup standar wajar tidak ada yang istimewa biasa saja cukup' },
  { sentiment: 'Netral', text: 'tempat lumayan untuk nongkrong sebentar duduk rehat lumayan biasa' },
  { sentiment: 'Netral', text: 'harga standar umum pasaran sesuai lokasi porsi sedang standar sedang' },
  { sentiment: 'Netral', text: 'tidak terlalu enak tapi tidak terlalu buruk sedang saja lumayan cukup' },
  { sentiment: 'Netral', text: 'menu lumayan lengkap pilihan variasi cukup memadai biasa lumayan' },
  { sentiment: 'Netral', text: 'kopi standar tempat lumayan biasa saja tidak terlalu istimewa biasa' },
];

const seen = new Set();
const allTrainingData = [];
[
  ...umkmDomainCorpus,
  ...legacyRecords,
  ...mendeleyRecords,
  ...abusiveRecords,
].forEach((record) => {
  if (!record.text || !record.sentiment) return;
  const key = `${record.sentiment}:${record.text.trim().toLowerCase()}`;
  if (seen.has(key)) return;
  seen.add(key);
  allTrainingData.push({ ...record, weight: record.weight ?? 1 });
});

const wordCounts = { Positif: {}, Negatif: {}, Netral: {} };
const docCounts = { Positif: 0, Negatif: 0, Netral: 0 };
const totalWords = { Positif: 0, Negatif: 0, Netral: 0 };
const vocabSet = new Set();
const domainVocab = new Set();

umkmDomainCorpus.forEach(({ text }) => {
  tokenize(text).forEach((w) => domainVocab.add(w));
});

allTrainingData.forEach(({ text, sentiment, weight }) => {
  if (!wordCounts[sentiment]) return;
  docCounts[sentiment] += weight;
  tokenize(text).forEach((w) => {
    wordCounts[sentiment][w] = (wordCounts[sentiment][w] || 0) + weight;
    totalWords[sentiment] += weight;
    vocabSet.add(w);
  });
});

const filteredVocabulary = {};
for (const word of vocabSet) {
  const pCount = wordCounts.Positif[word] || 0;
  const nCount = wordCounts.Negatif[word] || 0;
  const mCount = wordCounts.Netral[word] || 0;
  if (domainVocab.has(word) || pCount + nCount + mCount >= 2) {
    filteredVocabulary[word] = { p: pCount, n: nCount, m: mCount };
  }
}

const trainedModel = {
  version: '3.0.0',
  dataset: 'Indonesian UMKM Service Corpus + Mendeley 10.17632/rk8pjbghct.2 + SEACrowd/id_abusive (bobot 0.15 untuk kata kasar)',
  sources: {
    umkm: umkmDomainCorpus.length,
    prdect: legacyRecords.length,
    mendeley: mendeleyRecords.length,
    idAbusive: abusiveRecords.length,
  },
  totalDocs: allTrainingData.reduce((sum, r) => sum + r.weight, 0),
  docCounts,
  totalWords,
  vocabSize: Object.keys(filteredVocabulary).length,
  words: filteredVocabulary,
};

fs.writeFileSync(path.resolve('src/data/sentimentModel.json'), JSON.stringify(trainedModel));
console.log(`Model v${trainedModel.version}: ${trainedModel.sources.umkm} UMKM, ${trainedModel.sources.mendeley} Mendeley, ${trainedModel.sources.idAbusive} id_abusive, ${trainedModel.vocabSize} kata.`);
