import mongoose from 'mongoose';

const readReceiptSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  readAt: {
    type: Date,
    default: Date.now
  }
}, { _id: false });

const messageSchema = new mongoose.Schema({
  conversationId: {
    type: String,
    required: true,
    index: true
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  type: {
    type: String,
    enum: ['text', 'image', 'file', 'system'],
    required: true,
    default: 'text'
  },
  content: {
    type: String,
    maxlength: 2000,
    default: ''
  },
  mediaURL: {
    type: String,
    default: ''
  },
  readBy: {
    type: [readReceiptSchema],
    default: []
  },
  isDeleted: {
    type: Boolean,
    required: true,
    default: false
  }
}, {
  timestamps: true
});

// Compound index for sorted desc pagination
messageSchema.index({ conversationId: 1, createdAt: -1 });

const Message = mongoose.model('Message', messageSchema);

export default Message;
