const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const { authenticateToken } = require('../middleware/auth');
const { getStorageMode, getStorage } = require('../config/database');
const StructuredData = require('../models/StructuredData');
const logger = require('../utils/logger');

router.use(authenticateToken);

// Create structured data
router.post('/', async (req, res) => {
  try {
    const { collection, data, schema, tags, metadata } = req.body;

    if (!collection || !data) {
      return res.status(400).json({ error: 'Collection and data are required' });
    }

    const structuredData = {
      userId: req.user.userId,
      dataId: uuidv4(),
      collection,
      data,
      schema: schema || null,
      tags: tags || [],
      metadata: metadata || {},
      createdAt: new Date(),
      updatedAt: new Date()
    };

    if (getStorageMode() === 'mongodb') {
      const doc = new StructuredData(structuredData);
      await doc.save();
      res.status(201).json({ message: 'Data created', data: doc });
    } else {
      const storage = getStorage();
      const allData = await storage.read('structured_data') || [];
      allData.push(structuredData);
      await storage.write('structured_data', allData);
      res.status(201).json({ message: 'Data created', data: structuredData });
    }
  } catch (error) {
    logger.error('Create data error:', error);
    res.status(500).json({ error: 'Failed to create data' });
  }
});

// Get data by collection
router.get('/', async (req, res) => {
  try {
    const { collection, tags, limit = 50, skip = 0 } = req.query;
    const query = { userId: req.user.userId };

    if (collection) query.collection = collection;
    if (tags) query.tags = { $in: tags.split(',') };

    if (getStorageMode() === 'mongodb') {
      const data = await StructuredData.find(query)
        .sort({ createdAt: -1 })
        .limit(parseInt(limit))
        .skip(parseInt(skip));
      res.json({ data, count: data.length });
    } else {
      const storage = getStorage();
      let allData = await storage.read('structured_data') || [];
      allData = allData.filter(d => {
        if (d.userId !== req.user.userId) return false;
        if (collection && d.collection !== collection) return false;
        if (tags && !tags.split(',').some(tag => d.tags.includes(tag))) return false;
        return true;
      });
      allData.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      const paginated = allData.slice(parseInt(skip), parseInt(skip) + parseInt(limit));
      res.json({ data: paginated, count: paginated.length });
    }
  } catch (error) {
    logger.error('Get data error:', error);
    res.status(500).json({ error: 'Failed to retrieve data' });
  }
});

// Get specific data item
router.get('/:dataId', async (req, res) => {
  try {
    if (getStorageMode() === 'mongodb') {
      const data = await StructuredData.findOne({ dataId: req.params.dataId, userId: req.user.userId });
      if (!data) return res.status(404).json({ error: 'Data not found' });
      res.json({ data });
    } else {
      const storage = getStorage();
      const allData = await storage.read('structured_data') || [];
      const data = allData.find(d => d.dataId === req.params.dataId && d.userId === req.user.userId);
      if (!data) return res.status(404).json({ error: 'Data not found' });
      res.json({ data });
    }
  } catch (error) {
    logger.error('Get data error:', error);
    res.status(500).json({ error: 'Failed to retrieve data' });
  }
});

// Update data
router.put('/:dataId', async (req, res) => {
  try {
    const { data, schema, tags, metadata } = req.body;
    const updates = { updatedAt: new Date() };
    
    if (data) updates.data = data;
    if (schema) updates.schema = schema;
    if (tags) updates.tags = tags;
    if (metadata) updates.metadata = metadata;

    if (getStorageMode() === 'mongodb') {
      const doc = await StructuredData.findOneAndUpdate(
        { dataId: req.params.dataId, userId: req.user.userId },
        updates,
        { new: true }
      );
      if (!doc) return res.status(404).json({ error: 'Data not found' });
      res.json({ message: 'Data updated', data: doc });
    } else {
      const storage = getStorage();
      const allData = await storage.read('structured_data') || [];
      const index = allData.findIndex(d => d.dataId === req.params.dataId && d.userId === req.user.userId);
      if (index === -1) return res.status(404).json({ error: 'Data not found' });
      allData[index] = { ...allData[index], ...updates };
      await storage.write('structured_data', allData);
      res.json({ message: 'Data updated', data: allData[index] });
    }
  } catch (error) {
    logger.error('Update data error:', error);
    res.status(500).json({ error: 'Failed to update data' });
  }
});

// Delete data
router.delete('/:dataId', async (req, res) => {
  try {
    if (getStorageMode() === 'mongodb') {
      const data = await StructuredData.findOneAndDelete({ dataId: req.params.dataId, userId: req.user.userId });
      if (!data) return res.status(404).json({ error: 'Data not found' });
      res.json({ message: 'Data deleted' });
    } else {
      const storage = getStorage();
      let allData = await storage.read('structured_data') || [];
      const filtered = allData.filter(d => !(d.dataId === req.params.dataId && d.userId === req.user.userId));
      if (filtered.length === allData.length) return res.status(404).json({ error: 'Data not found' });
      await storage.write('structured_data', filtered);
      res.json({ message: 'Data deleted' });
    }
  } catch (error) {
    logger.error('Delete data error:', error);
    res.status(500).json({ error: 'Failed to delete data' });
  }
});

module.exports = router;