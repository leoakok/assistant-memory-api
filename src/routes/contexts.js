const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const { authenticateToken } = require('../middleware/auth');
const { getStorageMode, getStorage } = require('../config/database');
const Context = require('../models/Context');
const logger = require('../utils/logger');

router.use(authenticateToken);

// Create new context
router.post('/', async (req, res) => {
  try {
    const { sessionId, content, metadata, tags, expiresAt } = req.body;

    if (!content) {
      return res.status(400).json({ error: 'Content is required' });
    }

    const contextData = {
      userId: req.user.userId,
      contextId: uuidv4(),
      sessionId: sessionId || uuidv4(),
      content,
      metadata: metadata || {},
      tags: tags || [],
      expiresAt: expiresAt ? new Date(expiresAt) : null,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    if (getStorageMode() === 'mongodb') {
      const context = new Context(contextData);
      await context.save();
      res.status(201).json({ message: 'Context created', context });
    } else {
      const storage = getStorage();
      const contexts = await storage.read('contexts') || [];
      contexts.push(contextData);
      await storage.write('contexts', contexts);
      res.status(201).json({ message: 'Context created', context: contextData });
    }
  } catch (error) {
    logger.error('Create context error:', error);
    res.status(500).json({ error: 'Failed to create context' });
  }
});

// Get all contexts for user
router.get('/', async (req, res) => {
  try {
    const { sessionId, tags, limit = 50, skip = 0 } = req.query;
    const query = { userId: req.user.userId };

    if (sessionId) query.sessionId = sessionId;
    if (tags) query.tags = { $in: tags.split(',') };

    if (getStorageMode() === 'mongodb') {
      const contexts = await Context.find(query)
        .sort({ createdAt: -1 })
        .limit(parseInt(limit))
        .skip(parseInt(skip));
      res.json({ contexts, count: contexts.length });
    } else {
      const storage = getStorage();
      let contexts = await storage.read('contexts') || [];
      contexts = contexts.filter(c => {
        if (c.userId !== req.user.userId) return false;
        if (sessionId && c.sessionId !== sessionId) return false;
        if (tags && !tags.split(',').some(tag => c.tags.includes(tag))) return false;
        return true;
      });
      contexts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      const paginated = contexts.slice(parseInt(skip), parseInt(skip) + parseInt(limit));
      res.json({ contexts: paginated, count: paginated.length });
    }
  } catch (error) {
    logger.error('Get contexts error:', error);
    res.status(500).json({ error: 'Failed to retrieve contexts' });
  }
});

// Get specific context
router.get('/:contextId', async (req, res) => {
  try {
    if (getStorageMode() === 'mongodb') {
      const context = await Context.findOne({ contextId: req.params.contextId, userId: req.user.userId });
      if (!context) return res.status(404).json({ error: 'Context not found' });
      res.json({ context });
    } else {
      const storage = getStorage();
      const contexts = await storage.read('contexts') || [];
      const context = contexts.find(c => c.contextId === req.params.contextId && c.userId === req.user.userId);
      if (!context) return res.status(404).json({ error: 'Context not found' });
      res.json({ context });
    }
  } catch (error) {
    logger.error('Get context error:', error);
    res.status(500).json({ error: 'Failed to retrieve context' });
  }
});

// Update context
router.put('/:contextId', async (req, res) => {
  try {
    const { content, metadata, tags } = req.body;
    const updates = { updatedAt: new Date() };
    if (content) updates.content = content;
    if (metadata) updates.metadata = metadata;
    if (tags) updates.tags = tags;

    if (getStorageMode() === 'mongodb') {
      const context = await Context.findOneAndUpdate(
        { contextId: req.params.contextId, userId: req.user.userId },
        updates,
        { new: true }
      );
      if (!context) return res.status(404).json({ error: 'Context not found' });
      res.json({ message: 'Context updated', context });
    } else {
      const storage = getStorage();
      const contexts = await storage.read('contexts') || [];
      const index = contexts.findIndex(c => c.contextId === req.params.contextId && c.userId === req.user.userId);
      if (index === -1) return res.status(404).json({ error: 'Context not found' });
      contexts[index] = { ...contexts[index], ...updates };
      await storage.write('contexts', contexts);
      res.json({ message: 'Context updated', context: contexts[index] });
    }
  } catch (error) {
    logger.error('Update context error:', error);
    res.status(500).json({ error: 'Failed to update context' });
  }
});

// Delete context
router.delete('/:contextId', async (req, res) => {
  try {
    if (getStorageMode() === 'mongodb') {
      const context = await Context.findOneAndDelete({ contextId: req.params.contextId, userId: req.user.userId });
      if (!context) return res.status(404).json({ error: 'Context not found' });
      res.json({ message: 'Context deleted' });
    } else {
      const storage = getStorage();
      let contexts = await storage.read('contexts') || [];
      const filtered = contexts.filter(c => !(c.contextId === req.params.contextId && c.userId === req.user.userId));
      if (filtered.length === contexts.length) return res.status(404).json({ error: 'Context not found' });
      await storage.write('contexts', filtered);
      res.json({ message: 'Context deleted' });
    }
  } catch (error) {
    logger.error('Delete context error:', error);
    res.status(500).json({ error: 'Failed to delete context' });
  }
});

module.exports = router;