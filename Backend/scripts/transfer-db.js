// ============================================================
// Migration de la base locale vers MongoDB Atlas (ou l'inverse)
// ------------------------------------------------------------
//   npm run db:export              -> crée db-export.json (gitignoré)
//   npm run db:import -- <URI>     -> importe db-export.json dans <URI>
//
// Le transfert est idempotent : les documents sont remplacés par _id
// (relancer l'import ne crée pas de doublons).
// ============================================================
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
require('dotenv').config();

let EJSON;
try {
  ({ EJSON } = require('bson'));
} catch {
  EJSON = null;
}

const FILE = path.join(__dirname, '..', 'db-export.json');

function serialize(dump) {
  if (EJSON) return EJSON.stringify(dump, { relaxed: false });
  return JSON.stringify(dump);
}

function deserialize(text) {
  if (EJSON) return EJSON.parse(text, { relaxed: false });
  return JSON.parse(text);
}

async function exportDb() {
  const uri = process.env.DATABASE_CLOUD;
  if (!uri) throw new Error('DATABASE_CLOUD manquant dans Backend/.env');
  if (/localhost|127\.0\.0\.1/.test(uri)) {
    console.log('Source : MongoDB local');
  }

  await mongoose.connect(uri, { serverSelectionTimeoutMS: 10000 });
  const db = mongoose.connection.db;
  const collections = await db.listCollections().toArray();
  const dump = {};
  let total = 0;

  for (const { name } of collections) {
    if (name.startsWith('system.')) continue;
    const docs = await db.collection(name).find({}).toArray();
    dump[name] = docs;
    total += docs.length;
    console.log(`  ${name}: ${docs.length} document(s)`);
  }

  fs.writeFileSync(FILE, serialize(dump));
  console.log(`\nExport terminé : ${Object.keys(dump).length} collection(s), ${total} document(s)`);
  console.log(`Fichier : ${FILE}`);
  console.log('ATTENTION : ce fichier contient des données (dont les comptes) — ne pas committer.');
  await mongoose.disconnect();
}

async function importDb(target) {
  if (!target) {
    throw new Error('URI cible manquante : npm run db:import -- "mongodb+srv://..."');
  }
  if (!fs.existsSync(FILE)) {
    throw new Error('db-export.json introuvable : lancez d\'abord npm run db:export');
  }

  const dump = deserialize(fs.readFileSync(FILE, 'utf8'));
  await mongoose.connect(target, { serverSelectionTimeoutMS: 15000 });
  const db = mongoose.connection.db;

  for (const [name, docs] of Object.entries(dump)) {
    if (!docs.length) continue;
    const ops = docs.map((doc) => ({
      replaceOne: { filter: { _id: doc._id }, replacement: doc, upsert: true },
    }));
    await db.collection(name).bulkWrite(ops, { ordered: false });
    console.log(`  ${name}: ${docs.length} document(s) importé(s)`);
  }

  console.log('\nImport terminé.');
  await mongoose.disconnect();
}

const [action, ...args] = process.argv.slice(2);
const run = action === 'export' ? exportDb : action === 'import' ? () => importDb(args[0]) : null;

if (!run) {
  console.log('Usage : node scripts/transfer-db.js export|import [uri]');
  process.exit(1);
}

run().catch(async (err) => {
  console.error('ECHEC :', err.message);
  await mongoose.disconnect().catch(() => {});
  process.exit(1);
});
