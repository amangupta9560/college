import mongoose from 'mongoose';

const prizeTierSchema = new mongoose.Schema({
  rank: {
    type: String,
    required: true
  },
  prize: {
    type: String,
    required: true
  }
}, { _id: false });

const hackathonSchema = new mongoose.Schema({
  organizer: {
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
    trim: true
  },
  mode: {
    type: String,
    enum: ['online', 'offline', 'hybrid'],
    required: true
  },
  startDate: {
    type: Date,
    required: true,
    index: true
  },
  endDate: {
    type: Date,
    required: true
  },
  registrationDeadline: {
    type: Date,
    required: true,
    index: true
  },
  venue: {
    type: String,
    default: ''
  },
  websiteURL: {
    type: String,
    default: ''
  },
  bannerURL: {
    type: String,
    default: ''
  },
  teamSizeMin: {
    type: Number,
    required: true,
    default: 1
  },
  teamSizeMax: {
    type: Number,
    required: true,
    default: 5
  },
  prizes: {
    type: [prizeTierSchema],
    default: []
  },
  tags: {
    type: [String],
    default: []
  },
  registeredTeams: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team'
  }],
  isActive: {
    type: Boolean,
    required: true,
    default: true
  }
}, {
  timestamps: true
});

// Text index for search
hackathonSchema.index({ title: 'text', description: 'text' });

const Hackathon = mongoose.model('Hackathon', hackathonSchema);

export default Hackathon;
