import Team from '../models/Team.js';
import User from '../models/User.js';
import Notification from '../models/Notification.js';
import { buildPaginationMeta } from '../utils/pagination.js';

export const createTeam = async (req, res, next) => {
  try {
    const currentUser = req.user;
    const { name, description, projectType, maxSize, openRoles, skills, hackathon, isPublic } = req.body;

    // Check edge case: A user can lead at most 3 simultaneous active teams
    const activeTeamsLed = await Team.countDocuments({
      leader: currentUser._id,
      status: { $in: ['forming', 'active'] }
    });

    if (activeTeamsLed >= 3) {
      return res.status(400).json({
        success: false,
        message: 'Limit exceeded. You can lead at most 3 active teams simultaneously.'
      });
    }

    const newTeam = new Team({
      name,
      description,
      projectType,
      maxSize: maxSize || 5,
      openRoles: openRoles || [],
      skills: skills || [],
      hackathon: hackathon || null,
      isPublic: isPublic !== undefined ? isPublic : true,
      leader: currentUser._id,
      members: [{
        user: currentUser._id,
        role: 'Leader',
        joinedAt: new Date()
      }],
      college: currentUser.college,
      status: 'forming'
    });

    await newTeam.save();

    return res.status(201).json({
      success: true,
      message: 'Team created successfully.',
      data: { team: newTeam }
    });
  } catch (error) {
    next(error);
  }
};

export const listTeams = async (req, res, next) => {
  try {
    const { type, skills, college, recruiting, page = 1, limit = 10 } = req.query;
    const query = { isPublic: true, status: { $ne: 'disbanded' } };

    if (type) {
      query.projectType = type;
    }
    
    if (college) {
      query.college = { $regex: college, $options: 'i' };
    }

    if (recruiting !== undefined) {
      query.isRecruiting = recruiting === 'true';
    }

    if (skills) {
      const skillsArray = skills.split(',');
      query.skills = { $in: skillsArray };
    }

    const skip = (page - 1) * limit;
    const total = await Team.countDocuments(query);
    
    const teams = await Team.find(query)
      .populate('leader', 'firstName lastName avatar college')
      .populate('members.user', 'firstName lastName avatar')
      .skip(skip)
      .limit(parseInt(limit, 10))
      .sort({ createdAt: -1 });

    const pagination = buildPaginationMeta(total, page, limit);

    return res.status(200).json({
      success: true,
      data: {
        teams,
        pagination
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getTeam = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Retrieve by ID or Slug
    const query = mongoose.isValidObjectId(id) ? { _id: id } : { slug: id };

    const team = await Team.findOne(query)
      .populate('leader', 'firstName lastName avatar college bio skills')
      .populate('members.user', 'firstName lastName avatar college');

    if (!team || team.status === 'disbanded') {
      return res.status(404).json({ success: false, message: 'Team not found or disbanded.' });
    }

    return res.status(200).json({
      success: true,
      data: { team }
    });
  } catch (error) {
    next(error);
  }
};

export const updateTeam = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, description, openRoles, skills, maxSize, isRecruiting, isPublic, status } = req.body;
    
    const team = await Team.findById(id);
    if (!team) {
      return res.status(404).json({ success: false, message: 'Team not found.' });
    }

    // Check permissions (Leader or Admin)
    if (team.leader.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Only the team leader can edit team profile.' });
    }

    if (name !== undefined) team.name = name;
    if (description !== undefined) team.description = description;
    if (openRoles !== undefined) team.openRoles = openRoles;
    if (skills !== undefined) team.skills = skills;
    if (maxSize !== undefined) team.maxSize = maxSize;
    if (isRecruiting !== undefined) team.isRecruiting = isRecruiting;
    if (isPublic !== undefined) team.isPublic = isPublic;
    if (status !== undefined) team.status = status;

    await team.save();

    return res.status(200).json({
      success: true,
      message: 'Team updated successfully.',
      data: { team }
    });
  } catch (error) {
    next(error);
  }
};

export const deleteTeam = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const team = await Team.findById(id);
    if (!team) {
      return res.status(404).json({ success: false, message: 'Team not found.' });
    }

    if (team.leader.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Only the team leader can disband the team.' });
    }

    // Disband team
    team.status = 'disbanded';
    team.isRecruiting = false;
    await team.save();

    // Trigger notification to all members except leader
    const notifications = team.members
      .filter(m => m.user.toString() !== team.leader.toString())
      .map(m => new Notification({
        recipient: m.user,
        type: 'system',
        title: `Team Disbanded`,
        body: `The team "${team.name}" has been disbanded by the leader.`,
        link: `/teams`
      }));

    if (notifications.length > 0) {
      await Notification.insertMany(notifications);
    }

    return res.status(200).json({
      success: true,
      message: 'Team disbanded and deleted successfully.'
    });
  } catch (error) {
    next(error);
  }
};

export const addMember = async (req, res, next) => {
  try {
    const { id, userId } = req.params;
    const { role } = req.body;

    const team = await Team.findById(id);
    if (!team) {
      return res.status(404).json({ success: false, message: 'Team not found.' });
    }

    // Admin-only direct addition
    if (req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Direct addition of members is restricted to Administrators.' });
    }

    // Check if user is already a member
    const alreadyMember = team.members.some(m => m.user.toString() === userId);
    if (alreadyMember) {
      return res.status(400).json({ success: false, message: 'User is already a member of this team.' });
    }

    team.members.push({
      user: userId,
      role: role || 'Member',
      joinedAt: new Date()
    });

    await team.save();

    return res.status(200).json({
      success: true,
      message: 'Member added successfully.',
      data: { team }
    });
  } catch (error) {
    next(error);
  }
};

export const removeMember = async (req, res, next) => {
  try {
    const { id, userId } = req.params;

    const team = await Team.findById(id);
    if (!team) {
      return res.status(404).json({ success: false, message: 'Team not found.' });
    }

    // Leader or Admin only
    if (team.leader.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Only the team leader or administrator can remove members.' });
    }

    // Leader cannot be removed
    if (team.leader.toString() === userId) {
      return res.status(400).json({ success: false, message: 'The team leader cannot be removed from the team.' });
    }

    // Check if user is in team
    const memberIndex = team.members.findIndex(m => m.user.toString() === userId);
    if (memberIndex === -1) {
      return res.status(404).json({ success: false, message: 'User is not a member of this team.' });
    }

    team.members.splice(memberIndex, 1);
    await team.save();

    // Send notification to the removed member
    const notif = new Notification({
      recipient: userId,
      type: 'system',
      title: 'Removed from Team',
      body: `You have been removed from the team "${team.name}".`,
      link: '/teams'
    });
    await notif.save();

    return res.status(200).json({
      success: true,
      message: 'Member removed successfully.',
      data: { team }
    });
  } catch (error) {
    next(error);
  }
};
import mongoose from 'mongoose';
