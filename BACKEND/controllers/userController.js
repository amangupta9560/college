import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import Project from '../models/Project.js';
import Review from '../models/Review.js';
import Skill from '../models/Skill.js';
import { uploadBuffer, deleteAsset } from '../utils/cloudinaryHelpers.js';
import { buildPaginationMeta } from '../utils/pagination.js';

export const getProfile = async (req, res, next) => {
  try {
    const user = req.user.toObject();
    delete user.passwordHash;
    delete user.refreshTokens;

    return res.status(200).json({
      success: true,
      data: { user }
    });
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (req, res, next) => {
  try {
    const { 
      bio, college, year, interests, githubURL, linkedinURL, portfolioURL, availability, skills 
    } = req.body;

    const user = req.user;

    if (bio !== undefined) user.bio = bio;
    if (college !== undefined) user.college = college;
    if (year !== undefined) user.year = year;
    if (interests !== undefined) user.interests = interests;
    if (githubURL !== undefined) user.githubURL = githubURL;
    if (linkedinURL !== undefined) user.linkedinURL = linkedinURL;
    if (portfolioURL !== undefined) user.portfolioURL = portfolioURL;
    if (availability !== undefined) user.availability = availability;
    if (skills !== undefined) user.skills = skills; // Array of { skill: ObjectId, level: String }

    await user.save();

    const updatedUser = user.toObject();
    delete updatedUser.passwordHash;
    delete updatedUser.refreshTokens;

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully.',
      data: { user: updatedUser }
    });
  } catch (error) {
    next(error);
  }
};

export const uploadAvatar = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded.' });
    }

    const user = req.user;

    // Delete old avatar from Cloudinary if exists
    if (user.avatar) {
      try {
        await deleteAsset(user.avatar);
      } catch (err) {
        console.error('Error deleting old avatar:', err);
      }
    }

    // Upload new avatar
    const uploadResult = await uploadBuffer(req.file.buffer, 'hackmatch_avatars');
    user.avatar = uploadResult.secure_url;
    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Avatar uploaded successfully.',
      data: { avatarURL: user.avatar }
    });
  } catch (error) {
    next(error);
  }
};

export const deleteAccount = async (req, res, next) => {
  try {
    const { password } = req.body;
    const user = req.user;

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Password confirmation failed.' });
    }

    // Soft delete
    user.isActive = false;
    user.refreshTokens = [];
    await user.save();

    // Clear cookies
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');

    return res.status(200).json({
      success: true,
      message: 'Account deleted successfully (soft-deleted). Data will be purged in 30 days.'
    });
  } catch (error) {
    next(error);
  }
};

export const getUserById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id)
      .populate('skills.skill')
      .select('-passwordHash -refreshTokens -emailOTP -emailOTPExpiry');

    if (!user || !user.isActive) {
      return res.status(404).json({ success: false, message: 'User not found or inactive.' });
    }

    // Fetch user's public projects
    const projects = await Project.find({ owner: id, isPublic: true });

    // Fetch user's reviews
    const reviews = await Review.find({ reviewee: id, isVisible: true })
      .populate('reviewer', 'firstName lastName avatar');

    return res.status(200).json({
      success: true,
      data: {
        user,
        projects,
        reviews
      }
    });
  } catch (error) {
    next(error);
  }
};

export const searchUsers = async (req, res, next) => {
  try {
    const { q, skills, college, year, page = 1, limit = 10 } = req.query;
    const query = { isActive: true, isEmailVerified: true };

    // Text search or regex matching
    if (q) {
      query.$or = [
        { firstName: { $regex: q, $options: 'i' } },
        { lastName: { $regex: q, $options: 'i' } },
        { college: { $regex: q, $options: 'i' } }
      ];
    }

    if (college) {
      query.college = { $regex: college, $options: 'i' };
    }

    if (year) {
      query.year = parseInt(year, 10);
    }

    if (skills) {
      // skills can be comma-separated skill IDs
      const skillIds = skills.split(',');
      query['skills.skill'] = { $in: skillIds };
    }

    const skip = (page - 1) * limit;
    const total = await User.countDocuments(query);
    
    const users = await User.find(query)
      .populate('skills.skill')
      .select('firstName lastName avatar bio college degree branch year skills availability lastSeen matchScore')
      .skip(skip)
      .limit(parseInt(limit, 10));

    const pagination = buildPaginationMeta(total, page, limit);

    return res.status(200).json({
      success: true,
      data: {
        users,
        pagination
      }
    });
  } catch (error) {
    next(error);
  }
};
