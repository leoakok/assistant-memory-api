const mongoose = require('mongoose');

const structuredDataSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true
  },
  dataId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  collection: {
    type: String,
    required: true,
    index: true
  },
  data: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  schema: {
    type: mongoose.Schema.Types.Mixed
  },
  tags: [{
    type: String,
    index: true
  }],
  metadata: {
    type: Map,
    of: mongoose.Schema.Types.Mixed,
    default: {}
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Compound index for efficient queries
structuredDataSchema.index({ userId: 1, collection: 1 });

module.exports = mongoose.model('StructuredData', structuredDataSchema);