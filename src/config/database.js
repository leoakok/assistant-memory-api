const mongoose = require('mongoose');
const logger = require('../utils/logger');
const JSONStorage = require('../utils/jsonStorage');

let storage = null;
let storageMode = null;

async function connectDatabase() {
  const mode = process.env.STORAGE_MODE || 'auto';
  
  if (mode === 'json') {
    storageMode = 'json';
    storage = new JSONStorage(process.env.JSON_STORAGE_PATH || './data');
    logger.info('✅ Using JSON file storage');
    return;
  }

  if (mode === 'mongodb' || mode === 'auto') {
    if (!process.env.MONGODB_URI) {
      if (mode === 'mongodb') {
        throw new Error('MONGODB_URI is required when STORAGE_MODE is mongodb');
      }
      // Auto mode: fall back to JSON
      storageMode = 'json';
      storage = new JSONStorage(process.env.JSON_STORAGE_PATH || './data');
      logger.info('⚠️  No MONGODB_URI found, falling back to JSON storage');
      return;
    }

    try {
      await mongoose.connect(process.env.MONGODB_URI, {
        serverSelectionTimeoutMS: 5000,
      });
      storageMode = 'mongodb';
      logger.info('✅ Connected to MongoDB');
    } catch (error) {
      if (mode === 'mongodb') {
        throw error;
      }
      // Auto mode: fall back to JSON
      logger.warn('⚠️  MongoDB connection failed, falling back to JSON storage');
      storageMode = 'json';
      storage = new JSONStorage(process.env.JSON_STORAGE_PATH || './data');
    }
  }
}

function getStorage() {
  return storage;
}

function getStorageMode() {
  return storageMode;
}

module.exports = { connectDatabase, getStorage, getStorageMode };