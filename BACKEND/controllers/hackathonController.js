import Hackathon from '../models/Hackathon.js';
import Team from '../models/Team.js';
import { uploadBuffer, deleteAsset } from '../utils/cloudinaryHelpers.js';
import { buildPaginationMeta } from '../utils/pagination.js';

export const createHackathon = async (req, res, next) => {
  try {
    const { 
      title, description, mode, startDate, endDate, registrationDeadline, venue, 
      teamSizeMin, teamSizeMax, prizes, tags 
    } = req.body;

    const newHackathon = new Hackathon({
      organizer: req.user._id,
      title,
      description,
      mode,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      registrationDeadline: new Date(registrationDeadline),
      venue: venue || '',
      teamSizeMin: teamSizeMin || 1,
      teamSizeMax: teamSizeMax || 5,
      prizes: prizes || [],
      tags: tags || []
    });

    await newHackathon.save();

    return res.status(201).json({
      success: true,
      message: 'Hackathon created successfully.',
      data: { hackathon: newHackathon }
    });
  } catch (error) {
    next(error);
  }
};

export const getHackathons = async (req, res, next) => {
  try {
    const { mode, tags, coming, page = 1, limit = 10 } = req.query;
    const query = { isActive: true };

    if (mode) {
      query.mode = mode;
    }

    if (tags) {
      const tagList = tags.split(',').map(t => t.trim());
      query.tags = { $in: tagList };
    }

    const now = new Date();
    if (coming === 'upcoming') {
      query.startDate = { $gt: now };
    } else if (coming === 'ongoing') {
      query.startDate = { $lte: now };
      query.endDate = { $gte: now };
    } else if (coming === 'past') {
      query.endDate = { $lt: now };
    }

    const skip = (page - 1) * limit;
    const total = await Hackathon.countDocuments(query);

    const hackathons = await Hackathon.find(query)
      .populate('organizer', 'firstName lastName avatar')
      .sort({ startDate: 1 })
      .skip(skip)
      .limit(parseInt(limit, 10));

    const pagination = buildPaginationMeta(total, page, limit);

    return res.status(200).json({
      success: true,
      data: {
        hackathons,
        pagination
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getHackathonById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const hackathon = await Hackathon.findById(id)
      .populate('organizer', 'firstName lastName avatar college')
      .populate({
        path: 'registeredTeams',
        select: 'name slug members leader avatarURL',
        populate: {
          path: 'leader',
          select: 'firstName lastName avatar'
        }
      });

    if (!hackathon || !hackathon.isActive) {
      return res.status(404).json({ success: false, message: 'Hackathon not found.' });
    }

    return res.status(200).json({
      success: true,
      data: { hackathon }
    });
  } catch (error) {
    next(error);
  }
};

export const updateHackathon = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { 
      title, description, mode, startDate, endDate, registrationDeadline, venue, 
      teamSizeMin, teamSizeMax, prizes, tags, isActive 
    } = req.body;

    const hackathon = await Hackathon.findById(id);
    if (!hackathon) {
      return res.status(404).json({ success: false, message: 'Hackathon not found.' });
    }

    // Auth check: organizer or admin
    if (hackathon.organizer.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    if (title !== undefined) hackathon.title = title;
    if (description !== undefined) hackathon.description = description;
    if (mode !== undefined) hackathon.mode = mode;
    if (startDate !== undefined) hackathon.startDate = new Date(startDate);
    if (endDate !== undefined) hackathon.endDate = new Date(endDate);
    if (registrationDeadline !== undefined) hackathon.registrationDeadline = new Date(registrationDeadline);
    if (venue !== undefined) hackathon.venue = venue;
    if (teamSizeMin !== undefined) hackathon.teamSizeMin = teamSizeMin;
    if (teamSizeMax !== undefined) hackathon.teamSizeMax = teamSizeMax;
    if (prizes !== undefined) hackathon.prizes = prizes;
    if (tags !== undefined) hackathon.tags = tags;
    if (isActive !== undefined) hackathon.isActive = isActive;

    await hackathon.save();

    return res.status(200).json({
      success: true,
      message: 'Hackathon updated successfully.',
      data: { hackathon }
    });
  } catch (error) {
    next(error);
  }
};

export const deleteHackathon = async (req, res, next) => {
  try {
    const { id } = req.params;

    const hackathon = await Hackathon.findById(id);
    if (!hackathon) {
      return res.status(404).json({ success: false, message: 'Hackathon not found.' });
    }

    if (hackathon.organizer.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    if (hackathon.bannerURL) {
      try {
        await deleteAsset(hackathon.bannerURL);
      } catch (err) {
        console.error('Error deleting hackathon banner:', err);
      }
    }

    await Hackathon.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: 'Hackathon deleted successfully.'
    });
  } catch (error) {
    next(error);
  }
};

export const registerTeamToHackathon = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { teamId } = req.body;

    const hackathon = await Hackathon.findById(id);
    if (!hackathon || !hackathon.isActive) {
      return res.status(404).json({ success: false, message: 'Hackathon not found.' });
    }

    // Check deadline
    if (new Date() > new Date(hackathon.registrationDeadline)) {
      return res.status(400).json({ success: false, message: 'Registration deadline has passed.' });
    }

    const team = await Team.findById(teamId);
    if (!team) {
      return res.status(404).json({ success: false, message: 'Team not found.' });
    }

    // Verify leader
    if (team.leader.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Access denied. Only the team leader can register the team.' });
    }

    // Check if team is already registered to this hackathon
    if (hackathon.registeredTeams.includes(team._id)) {
      return res.status(400).json({ success: false, message: 'Team is already registered for this hackathon.' });
    }

    // Check if team already registered for another hackathon
    if (team.hackathon) {
      return res.status(400).json({ success: false, message: 'Team is already registered to a hackathon.' });
    }

    // Verify team size limits
    const memberCount = team.members.length;
    if (memberCount < hackathon.teamSizeMin || memberCount > hackathon.teamSizeMax) {
      return res.status(400).json({ 
        success: false, 
        message: `Team size (${memberCount}) must be between ${hackathon.teamSizeMin} and ${hackathon.teamSizeMax} for this hackathon.` 
      });
    }

    // Register team
    team.hackathon = hackathon._id;
    team.projectType = 'hackathon'; // Enforce projectType is hackathon
    await team.save();

    hackathon.registeredTeams.push(team._id);
    await hackathon.save();

    return res.status(200).json({
      success: true,
      message: 'Team registered for hackathon successfully.',
      data: { hackathon }
    });
  } catch (error) {
    next(error);
  }
};

export const uploadBanner = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded.' });
    }

    const hackathon = await Hackathon.findById(id);
    if (!hackathon) {
      return res.status(404).json({ success: false, message: 'Hackathon not found.' });
    }

    if (hackathon.organizer.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    if (hackathon.bannerURL) {
      try {
        await deleteAsset(hackathon.bannerURL);
      } catch (err) {
        console.error('Error deleting old banner:', err);
      }
    }

    const result = await uploadBuffer(req.file.buffer, 'hackmatch_hackathon_banners');
    hackathon.bannerURL = result.secure_url;
    await hackathon.save();

    return res.status(200).json({
      success: true,
      message: 'Hackathon banner uploaded successfully.',
      data: { bannerURL: hackathon.bannerURL }
    });
  } catch (error) {
    next(error);
  }
};
