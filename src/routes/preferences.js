const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { getStorageMode, getStorage } = require('../config/database');
const Preference = require('../models/Preference');
const logger = require('../utils/logger');

router.use(authenticateToken);

// Get user preferences
router.get('/', async (req, res) => {
  try {
    if (getStorageMode() === 'mongodb') {
      let preferences = await Preference.findOne({ userId: req.user.userId });
      if (!preferences) {
        preferences = new Preference({ userId: req.user.userId });
        await preferences.save();
      }
      res.json({ preferences });
    } else {
      const storage = getStorage();
      const allPreferences = await storage.read('preferences') || [];
      let preferences = allPreferences.find(p => p.userId === req.user.userId);
      if (!preferences) {
        preferences = {
          userId: req.user.userId,
          preferences: {},
          theme: 'auto',
          language: 'en',
          timezone: 'UTC',
          notificationSettings: { email: true, push: false, sms: false },
          createdAt: new Date(),
          updatedAt: new Date()
        };
        allPreferences.push(preferences);
        await storage.write('preferences', allPreferences);
      }
      res.json({ preferences });
    }
  } catch (error) {
    logger.error('Get preferences error:', error);
    res.status(500).json({ error: 'Failed to retrieve preferences' });
  }
});

// Update preferences
router.put('/', async (req, res) => {
  try {
    const { preferences, theme, language, timezone, notificationSettings } = req.body;
    const updates = { updatedAt: new Date() };
    
    if (preferences) updates.preferences = preferences;
    if (theme) updates.theme = theme;
    if (language) updates.language = language;
    if (timezone) updates.timezone = timezone;
    if (notificationSettings) updates.notificationSettings = notificationSettings;

    if (getStorageMode() === 'mongodb') {
      const prefs = await Preference.findOneAndUpdate(
        { userId: req.user.userId },
        updates,
        { new: true, upsert: true }
      );
      res.json({ message: 'Preferences updated', preferences: prefs });
    } else {
      const storage = getStorage();
      const allPreferences = await storage.read('preferences') || [];
      const index = allPreferences.findIndex(p => p.userId === req.user.userId);
      
      if (index === -1) {
        const newPrefs = {
          userId: req.user.userId,
          preferences: {},
          theme: 'auto',
          language: 'en',
          timezone: 'UTC',
          notificationSettings: { email: true, push: false, sms: false },
          createdAt: new Date(),
          ...updates
        };
        allPreferences.push(newPrefs);
        await storage.write('preferences', allPreferences);
        res.json({ message: 'Preferences created', preferences: newPrefs });
      } else {
        allPreferences[index] = { ...allPreferences[index], ...updates };
        await storage.write('preferences', allPreferences);
        res.json({ message: 'Preferences updated', preferences: allPreferences[index] });
      }
    }
  } catch (error) {
    logger.error('Update preferences error:', error);
    res.status(500).json({ error: 'Failed to update preferences' });
  }
});

// Get specific preference value
router.get('/:key', async (req, res) => {
  try {
    if (getStorageMode() === 'mongodb') {
      const prefs = await Preference.findOne({ userId: req.user.userId });
      if (!prefs) return res.status(404).json({ error: 'Preferences not found' });
      
      const value = prefs.preferences?.get(req.params.key) || prefs[req.params.key];
      if (value === undefined) return res.status(404).json({ error: 'Preference key not found' });
      
      res.json({ key: req.params.key, value });
    } else {
      const storage = getStorage();
      const allPreferences = await storage.read('preferences') || [];
      const prefs = allPreferences.find(p => p.userId === req.user.userId);
      
      if (!prefs) return res.status(404).json({ error: 'Preferences not found' });
      
      const value = prefs.preferences?.[req.params.key] || prefs[req.params.key];
      if (value === undefined) return res.status(404).json({ error: 'Preference key not found' });
      
      res.json({ key: req.params.key, value });
    }
  } catch (error) {
    logger.error('Get preference error:', error);
    res.status(500).json({ error: 'Failed to retrieve preference' });
  }
});

module.exports = router;