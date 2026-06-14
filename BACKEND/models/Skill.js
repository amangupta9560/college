import mongoose from 'mongoose';

const skillSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    index: true
  },
  category: {
    type: String,
    enum: ['frontend', 'backend', 'mobile', 'ml', 'design', 'devops', 'other'],
    required: true,
    index: true
  },
  icon: {
    type: String,
    default: ''
  },
  usageCount: {
    type: Number,
    default: 0,
    index: true
  }
}, {
  timestamps: true
});

const Skill = mongoose.model('Skill', skillSchema);

export default Skill;
