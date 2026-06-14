import User from '../models/User.js';
import Team from '../models/Team.js';
import { computeMatchScore } from '../utils/matchingEngine.js';
import { buildPaginationMeta } from '../utils/pagination.js';

export const getRecommendations = async (req, res, next) => {
  try {
    const currentUser = req.user;
    const { skills, college, year, availability, page = 1, limit = 10 } = req.query;

    const query = {
      _id: { $ne: currentUser._id },
      isActive: true,
      isEmailVerified: true,
      availability: { $ne: 'not_looking' }
    };

    // Pre-filtering pool to optimize calculations
    if (college) {
      query.college = { $regex: college, $options: 'i' };
    }
    if (year) {
      query.year = parseInt(year, 10);
    }
    if (availability) {
      query.availability = availability;
    }
    if (skills) {
      const skillIds = skills.split(',');
      query['skills.skill'] = { $in: skillIds };
    }

    // Populate skills to compute score
    const candidates = await User.find(query)
      .populate('skills.skill')
      .select('-passwordHash -refreshTokens -emailOTP -emailOTPExpiry');

    // Compute pairwise match scores
    const scoredPool = candidates.map(candidate => {
      const { score, breakdown } = computeMatchScore(currentUser, candidate);
      return {
        user: candidate,
        matchScore: score,
        breakdown
      };
    });

    // Sort by score desc
    scoredPool.sort((a, b) => b.matchScore - a.matchScore);

    // Apply pagination
    const total = scoredPool.length;
    const currentPage = parseInt(page, 10) || 1;
    const currentLimit = parseInt(limit, 10) || 10;
    const startIndex = (currentPage - 1) * currentLimit;
    const paginatedItems = scoredPool.slice(startIndex, startIndex + currentLimit);

    const pagination = buildPaginationMeta(total, currentPage, currentLimit);

    return res.status(200).json({
      success: true,
      data: {
        candidates: paginatedItems,
        pagination
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getTeamRecommendations = async (req, res, next) => {
  try {
    const currentUser = req.user;
    const { teamId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const team = await Team.findById(teamId);
    if (!team) {
      return res.status(404).json({ success: false, message: 'Team not found.' });
    }

    // Check if requesting user is the Leader
    if (team.leader.toString() !== currentUser._id.toString()) {
      return res.status(403).json({ success: false, message: 'Only the team leader can get team recommendations.' });
    }

    // Get all candidate users except members
    const memberIds = team.members.map(m => m.user.toString());
    memberIds.push(team.leader.toString());

    const query = {
      _id: { $not: { $in: memberIds } },
      isActive: true,
      isEmailVerified: true,
      availability: { $ne: 'not_looking' }
    };

    const candidates = await User.find(query)
      .populate('skills.skill')
      .select('-passwordHash -refreshTokens -emailOTP -emailOTPExpiry');

    // Compute scores matching against team's context
    const scoredPool = candidates.map(candidate => {
      const { score, breakdown } = computeMatchScore(currentUser, candidate, team);
      return {
        user: candidate,
        matchScore: score,
        breakdown
      };
    });

    // Sort by score desc
    scoredPool.sort((a, b) => b.matchScore - a.matchScore);

    // Pagination
    const total = scoredPool.length;
    const currentPage = parseInt(page, 10) || 1;
    const currentLimit = parseInt(limit, 10) || 10;
    const startIndex = (currentPage - 1) * currentLimit;
    const paginatedItems = scoredPool.slice(startIndex, startIndex + currentLimit);

    const pagination = buildPaginationMeta(total, currentPage, currentLimit);

    return res.status(200).json({
      success: true,
      data: {
        candidates: paginatedItems,
        pagination
      }
    });
  } catch (error) {
    next(error);
  }
};
