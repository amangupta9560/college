import mongoose from 'mongoose';

const userSkillSchema = new mongoose.Schema({
  skill: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Skill',
    required: true
  },
  level: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    default: 'intermediate'
  }
}, { _id: false });

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    index: true
  },
  passwordHash: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['student', 'teamLeader', 'organizer', 'admin'],
    default: 'student',
    required: true,
    index: true
  },
  isEmailVerified: {
    type: Boolean,
    default: false,
    required: true
  },
  emailOTP: {
    type: String,
    default: null
  },
  emailOTPExpiry: {
    type: Date,
    default: null
  },
  refreshTokens: {
    type: [String],
    default: []
  },
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  avatar: {
    type: String,
    default: ''
  },
  bio: {
    type: String,
    maxlength: 500,
    default: ''
  },
  college: {
    type: String,
    required: true,
    trim: true,
    index: true
  },
  degree: {
    type: String,
    required: true,
    trim: true
  },
  branch: {
    type: String,
    required: true,
    trim: true
  },
  year: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
    index: true
  },
  skills: {
    type: [userSkillSchema],
    default: []
  },
  interests: {
    type: [String],
    default: []
  },
  githubURL: {
    type: String,
    default: ''
  },
  linkedinURL: {
    type: String,
    default: ''
  },
  portfolioURL: {
    type: String,
    default: ''
  },
  hackathonsAttended: {
    type: Number,
    default: 0
  },
  availability: {
    type: String,
    enum: ['available', 'busy', 'not_looking'],
    default: 'available',
    index: true
  },
  matchScore: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true,
    required: true,
    index: true
  },
  lastSeen: {
    type: Date,
    default: Date.now,
    index: true
  }
}, {
  timestamps: true
});

// Create text index for search
userSchema.index({ firstName: 'text', lastName: 'text', college: 'text' });

const User = mongoose.model('User', userSchema);

export default User;
