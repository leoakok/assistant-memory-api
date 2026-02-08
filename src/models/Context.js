const mongoose = require('mongoose');

const contextSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true
  },
  contextId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  sessionId: {
    type: String,
    index: true
  },
  content: {
    type: String,
    required: true,
    maxlength: 100000
  },
  metadata: {
    type: Map,
    of: mongoose.Schema.Types.Mixed,
    default: {}
  },
  tags: [{
    type: String,
    index: true
  }],
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  expiresAt: {
    type: Date,
    index: true
  }
}, {
  timestamps: true
});

// TTL index for automatic deletion
contextSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('Context', contextSchema);