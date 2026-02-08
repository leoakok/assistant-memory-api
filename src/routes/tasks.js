const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const { authenticateToken } = require('../middleware/auth');
const { getStorageMode, getStorage } = require('../config/database');
const Task = require('../models/Task');
const logger = require('../utils/logger');

router.use(authenticateToken);

// Create new task
router.post('/', async (req, res) => {
  try {
    const { title, description, priority, tags, dueDate, metadata } = req.body;

    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }

    const taskData = {
      userId: req.user.userId,
      taskId: uuidv4(),
      title,
      description: description || '',
      status: 'pending',
      priority: priority || 'medium',
      progress: 0,
      tags: tags || [],
      metadata: metadata || {},
      dueDate: dueDate ? new Date(dueDate) : null,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    if (getStorageMode() === 'mongodb') {
      const task = new Task(taskData);
      await task.save();
      res.status(201).json({ message: 'Task created', task });
    } else {
      const storage = getStorage();
      const tasks = await storage.read('tasks') || [];
      tasks.push(taskData);
      await storage.write('tasks', tasks);
      res.status(201).json({ message: 'Task created', task: taskData });
    }
  } catch (error) {
    logger.error('Create task error:', error);
    res.status(500).json({ error: 'Failed to create task' });
  }
});

// Get all tasks for user
router.get('/', async (req, res) => {
  try {
    const { status, priority, tags, limit = 50, skip = 0 } = req.query;
    const query = { userId: req.user.userId };

    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (tags) query.tags = { $in: tags.split(',') };

    if (getStorageMode() === 'mongodb') {
      const tasks = await Task.find(query)
        .sort({ createdAt: -1 })
        .limit(parseInt(limit))
        .skip(parseInt(skip));
      res.json({ tasks, count: tasks.length });
    } else {
      const storage = getStorage();
      let tasks = await storage.read('tasks') || [];
      tasks = tasks.filter(t => {
        if (t.userId !== req.user.userId) return false;
        if (status && t.status !== status) return false;
        if (priority && t.priority !== priority) return false;
        if (tags && !tags.split(',').some(tag => t.tags.includes(tag))) return false;
        return true;
      });
      tasks.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      const paginated = tasks.slice(parseInt(skip), parseInt(skip) + parseInt(limit));
      res.json({ tasks: paginated, count: paginated.length });
    }
  } catch (error) {
    logger.error('Get tasks error:', error);
    res.status(500).json({ error: 'Failed to retrieve tasks' });
  }
});

// Get specific task
router.get('/:taskId', async (req, res) => {
  try {
    if (getStorageMode() === 'mongodb') {
      const task = await Task.findOne({ taskId: req.params.taskId, userId: req.user.userId });
      if (!task) return res.status(404).json({ error: 'Task not found' });
      res.json({ task });
    } else {
      const storage = getStorage();
      const tasks = await storage.read('tasks') || [];
      const task = tasks.find(t => t.taskId === req.params.taskId && t.userId === req.user.userId);
      if (!task) return res.status(404).json({ error: 'Task not found' });
      res.json({ task });
    }
  } catch (error) {
    logger.error('Get task error:', error);
    res.status(500).json({ error: 'Failed to retrieve task' });
  }
});

// Update task
router.put('/:taskId', async (req, res) => {
  try {
    const { title, description, status, priority, progress, result, error: taskError, metadata, tags } = req.body;
    const updates = { updatedAt: new Date() };
    
    if (title) updates.title = title;
    if (description) updates.description = description;
    if (status) {
      updates.status = status;
      if (status === 'in_progress' && !req.body.startedAt) updates.startedAt = new Date();
      if (['completed', 'failed', 'cancelled'].includes(status)) updates.completedAt = new Date();
    }
    if (priority) updates.priority = priority;
    if (progress !== undefined) updates.progress = progress;
    if (result) updates.result = result;
    if (taskError) updates.error = taskError;
    if (metadata) updates.metadata = metadata;
    if (tags) updates.tags = tags;

    if (getStorageMode() === 'mongodb') {
      const task = await Task.findOneAndUpdate(
        { taskId: req.params.taskId, userId: req.user.userId },
        updates,
        { new: true }
      );
      if (!task) return res.status(404).json({ error: 'Task not found' });
      res.json({ message: 'Task updated', task });
    } else {
      const storage = getStorage();
      const tasks = await storage.read('tasks') || [];
      const index = tasks.findIndex(t => t.taskId === req.params.taskId && t.userId === req.user.userId);
      if (index === -1) return res.status(404).json({ error: 'Task not found' });
      tasks[index] = { ...tasks[index], ...updates };
      await storage.write('tasks', tasks);
      res.json({ message: 'Task updated', task: tasks[index] });
    }
  } catch (error) {
    logger.error('Update task error:', error);
    res.status(500).json({ error: 'Failed to update task' });
  }
});

// Delete task
router.delete('/:taskId', async (req, res) => {
  try {
    if (getStorageMode() === 'mongodb') {
      const task = await Task.findOneAndDelete({ taskId: req.params.taskId, userId: req.user.userId });
      if (!task) return res.status(404).json({ error: 'Task not found' });
      res.json({ message: 'Task deleted' });
    } else {
      const storage = getStorage();
      let tasks = await storage.read('tasks') || [];
      const filtered = tasks.filter(t => !(t.taskId === req.params.taskId && t.userId === req.user.userId));
      if (filtered.length === tasks.length) return res.status(404).json({ error: 'Task not found' });
      await storage.write('tasks', filtered);
      res.json({ message: 'Task deleted' });
    }
  } catch (error) {
    logger.error('Delete task error:', error);
    res.status(500).json({ error: 'Failed to delete task' });
  }
});

module.exports = router;