import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema({
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  title: {
    type: String,
    required: true,
    trim: true,
    index: true
  },
  description: {
    type: String,
    required: true,
    maxlength: 2000,
    trim: true
  },
  techStack: {
    type: [String],
    required: true,
    default: [],
    index: true
  },
  githubURL: {
    type: String,
    default: ''
  },
  demoURL: {
    type: String,
    default: ''
  },
  thumbnailURL: {
    type: String,
    default: ''
  },
  collaborators: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  hackathon: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hackathon',
    default: null,
    index: true
  },
  tags: {
    type: [String],
    default: []
  },
  isPublic: {
    type: Boolean,
    required: true,
    default: true
  },
  status: {
    type: String,
    enum: ['in_progress', 'completed', 'archived'],
    required: true,
    default: 'in_progress'
  }
}, {
  timestamps: true
});

// Text index for search
projectSchema.index({ title: 'text', description: 'text' });

const Project = mongoose.model('Project', projectSchema);

export default Project;
