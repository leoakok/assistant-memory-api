const fs = require('fs').promises;
const path = require('path');
const logger = require('./logger');

class JSONStorage {
  constructor(dataDir = './data') {
    this.dataDir = dataDir;
    this.ensureDataDir();
  }

  async ensureDataDir() {
    try {
      await fs.mkdir(this.dataDir, { recursive: true });
    } catch (error) {
      logger.error('Failed to create data directory:', error);
    }
  }

  getFilePath(collection) {
    return path.join(this.dataDir, `${collection}.json`);
  }

  async read(collection) {
    try {
      const filePath = this.getFilePath(collection);
      const data = await fs.readFile(filePath, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      if (error.code === 'ENOENT') {
        return null;
      }
      logger.error(`Failed to read ${collection}:`, error);
      throw error;
    }
  }

  async write(collection, data) {
    try {
      const filePath = this.getFilePath(collection);
      await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf8');
      return true;
    } catch (error) {
      logger.error(`Failed to write ${collection}:`, error);
      throw error;
    }
  }

  async delete(collection) {
    try {
      const filePath = this.getFilePath(collection);
      await fs.unlink(filePath);
      return true;
    } catch (error) {
      if (error.code === 'ENOENT') {
        return true;
      }
      logger.error(`Failed to delete ${collection}:`, error);
      throw error;
    }
  }
}

module.exports = JSONStorage;