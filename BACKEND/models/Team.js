import mongoose from 'mongoose';

const teamMemberSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  role: {
    type: String,
    required: true,
    default: 'Member'
  },
  joinedAt: {
    type: Date,
    default: Date.now
  }
}, { _id: false });

const teamSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    maxlength: 80,
    trim: true,
    index: true
  },
  slug: {
    type: String,
    unique: true,
    index: true
  },
  description: {
    type: String,
    required: true,
    maxlength: 1000,
    trim: true
  },
  leader: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  members: {
    type: [teamMemberSchema],
    default: []
  },
  openRoles: {
    type: [String],
    default: []
  },
  skills: {
    type: [String],
    default: [],
    index: true
  },
  projectType: {
    type: String,
    enum: ['hackathon', 'fyp', 'startup', 'research', 'opensource'],
    required: true,
    index: true
  },
  hackathon: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hackathon',
    default: null,
    index: true
  },
  maxSize: {
    type: Number,
    required: true,
    default: 5,
    min: 2,
    max: 10
  },
  isRecruiting: {
    type: Boolean,
    required: true,
    default: true,
    index: true
  },
  isPublic: {
    type: Boolean,
    required: true,
    default: true
  },
  status: {
    type: String,
    enum: ['forming', 'active', 'completed', 'disbanded'],
    default: 'forming',
    required: true,
    index: true
  },
  college: {
    type: String,
    default: '',
    trim: true,
    index: true
  },
  tags: {
    type: [String],
    default: []
  },
  avatarURL: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

// Text index for search
teamSchema.index({ name: 'text', description: 'text' });

// Pre-save slug generator
teamSchema.pre('save', async function (next) {
  if (!this.isModified('name')) return next();

  let generatedSlug = this.name
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');

  const Team = mongoose.model('Team');
  let slugExists = await Team.findOne({ slug: generatedSlug });

  while (slugExists) {
    const randomSuffix = Math.random().toString(36).substring(2, 6);
    generatedSlug = `${generatedSlug}-${randomSuffix}`;
    slugExists = await Team.findOne({ slug: generatedSlug });
  }

  this.slug = generatedSlug;
  next();
});

const Team = mongoose.model('Team', teamSchema);

export default Team;
