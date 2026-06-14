import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  type: {
    type: String,
    enum: ['application', 'invitation', 'message', 'review', 'system'],
    required: true,
    index: true
  },
  title: {
    type: String,
    required: true
  },
  body: {
    type: String,
    required: true
  },
  link: {
    type: String,
    default: ''
  },
  isRead: {
    type: Boolean,
    required: true,
    default: false,
    index: true
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: '90d', // MongoDB TTL index to auto-purge notifications older than 90 days
    index: true
  }
}, {
  timestamps: { createdAt: false, updatedAt: true }
});

// Compound index for sorted queries per user
notificationSchema.index({ recipient: 1, createdAt: -1 });

const Notification = mongoose.model('Notification', notificationSchema);

export default Notification;
