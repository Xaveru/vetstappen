const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let memoryServer = null;

async function tryConnect(connectionUri, label) {
  await mongoose.connect(connectionUri, { serverSelectionTimeoutMS: 5000 });
  console.log(`[DB] Connected using ${label}.`);
}

async function connectDB() {
  const envUri = String(process.env.MONGODB_URI || '').trim();
  if (envUri) {
    await tryConnect(envUri, 'MONGODB_URI');
    return;
  }

  const localUri = 'mongodb://127.0.0.1:27017/vetstappen_phase3';
  try {
    await tryConnect(localUri, 'local MongoDB fallback');
    return;
  } catch (localError) {
    console.warn('[DB] Local MongoDB fallback unavailable:', localError.message);
  }

  if (String(process.env.USE_IN_MEMORY_DB || '').toLowerCase() === 'true') {
    memoryServer = await MongoMemoryServer.create();
    const memoryUri = memoryServer.getUri('vetstappen_phase3');
    await tryConnect(memoryUri, 'mongodb-memory-server');
    return;
  }

  throw new Error(
    'Database connection failed. Set MONGODB_URI in .env or start a local MongoDB server on mongodb://127.0.0.1:27017. ' +
    'If you intentionally want the temporary in-memory demo database, set USE_IN_MEMORY_DB=true and allow mongodb-memory-server to download its MongoDB binary.'
  );
}

async function closeDB() {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }

  if (memoryServer) {
    await memoryServer.stop();
    memoryServer = null;
  }
}

module.exports = { connectDB, closeDB };
