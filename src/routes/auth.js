const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const { getStorageMode, getStorage } = require('../config/database');
const User = require('../models/User');
const logger = require('../utils/logger');

// Register new user/assistant
router.post('/register', async (req, res) => {
  try {
    const { username, email, password, role } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ error: 'Username, email, and password are required' });
    }

    const userData = {
      username: username.toLowerCase(),
      email: email.toLowerCase(),
      password,
      role: role || 'assistant',
      apiKey: uuidv4(),
      createdAt: new Date(),
      updatedAt: new Date()
    };

    if (getStorageMode() === 'mongodb') {
      const existingUser = await User.findOne({ $or: [{ username: userData.username }, { email: userData.email }] });
      if (existingUser) {
        return res.status(409).json({ error: 'Username or email already exists' });
      }

      const user = new User(userData);
      await user.save();

      const token = jwt.sign(
        { userId: user._id.toString(), username: user.username, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
      );

      res.status(201).json({
        message: 'User registered successfully',
        token,
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          role: user.role,
          apiKey: user.apiKey
        }
      });
    } else {
      const storage = getStorage();
      const users = await storage.read('users') || [];
      
      if (users.some(u => u.username === userData.username || u.email === userData.email)) {
        return res.status(409).json({ error: 'Username or email already exists' });
      }

      const userId = uuidv4();
      const newUser = { ...userData, id: userId };
      users.push(newUser);
      await storage.write('users', users);

      const token = jwt.sign(
        { userId, username: newUser.username, role: newUser.role },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
      );

      res.status(201).json({
        message: 'User registered successfully',
        token,
        user: {
          id: userId,
          username: newUser.username,
          email: newUser.email,
          role: newUser.role,
          apiKey: newUser.apiKey
        }
      });
    }
  } catch (error) {
    logger.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    if (getStorageMode() === 'mongodb') {
      const user = await User.findOne({ username: username.toLowerCase() });
      if (!user || !(await user.comparePassword(password))) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      user.lastLogin = new Date();
      await user.save();

      const token = jwt.sign(
        { userId: user._id.toString(), username: user.username, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
      );

      res.json({
        message: 'Login successful',
        token,
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          role: user.role,
          apiKey: user.apiKey
        }
      });
    } else {
      const storage = getStorage();
      const users = await storage.read('users') || [];
      const user = users.find(u => u.username === username.toLowerCase());
      
      if (!user || user.password !== password) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const token = jwt.sign(
        { userId: user.id, username: user.username, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
      );

      res.json({
        message: 'Login successful',
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role,
          apiKey: user.apiKey
        }
      });
    }
  } catch (error) {
    logger.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

module.exports = router;