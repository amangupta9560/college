import TeamInvitation from '../models/TeamInvitation.js';
import Team from '../models/Team.js';
import Notification from '../models/Notification.js';
import { buildPaginationMeta } from '../utils/pagination.js';

export const sendInvitation = async (req, res, next) => {
  try {
    const currentUser = req.user;
    const { teamId, inviteeId, role, message } = req.body;

    const team = await Team.findById(teamId);
    if (!team || team.status === 'disbanded') {
      return res.status(404).json({ success: false, message: 'Team not found.' });
    }

    // Check if requesting user is the Leader
    if (team.leader.toString() !== currentUser._id.toString() && currentUser.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Only the team leader can send invitations.' });
    }

    // 1. Check if invitee is already leader or member
    if (team.leader.toString() === inviteeId) {
      return res.status(400).json({ success: false, message: 'User is the leader of this team.' });
    }
    const isMember = team.members.some(m => m.user.toString() === inviteeId);
    if (isMember) {
      return res.status(400).json({ success: false, message: 'User is already a member of this team.' });
    }

    // 2. Check if there is already a duplicate pending invitation
    const duplicateInvite = await TeamInvitation.findOne({
      team: teamId,
      invitee: inviteeId,
      status: 'pending'
    });
    if (duplicateInvite) {
      return res.status(400).json({ success: false, message: 'A pending invitation already exists for this user.' });
    }

    const newInvite = new TeamInvitation({
      team: teamId,
      invitedBy: currentUser._id,
      invitee: inviteeId,
      role: role || '',
      message: message || '',
      status: 'pending'
    });

    await newInvite.save();

    // Notify invitee
    const notif = new Notification({
      recipient: inviteeId,
      type: 'invitation',
      title: 'New Team Invitation',
      body: `You have been invited by ${currentUser.firstName} to join the team "${team.name}" as "${role || 'Member'}".`,
      link: `/invitations`,
      metadata: { teamId: team._id, invitationId: newInvite._id }
    });
    await notif.save();

    return res.status(201).json({
      success: true,
      message: 'Invitation sent successfully.',
      data: { invitation: newInvite }
    });
  } catch (error) {
    next(error);
  }
};

export const listReceivedInvitations = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const query = { invitee: req.user._id };

    const skip = (page - 1) * limit;
    const total = await TeamInvitation.countDocuments(query);

    const invitations = await TeamInvitation.find(query)
      .populate('team', 'name slug description leader')
      .populate('invitedBy', 'firstName lastName avatar college')
      .skip(skip)
      .limit(parseInt(limit, 10))
      .sort({ createdAt: -1 });

    const pagination = buildPaginationMeta(total, page, limit);

    return res.status(200).json({
      success: true,
      data: {
        invitations,
        pagination
      }
    });
  } catch (error) {
    next(error);
  }
};

export const listSentInvitations = async (req, res, next) => {
  try {
    const { teamId, page = 1, limit = 10 } = req.query;
    const query = {};

    if (teamId) {
      const team = await Team.findById(teamId);
      if (!team) {
        return res.status(404).json({ success: false, message: 'Team not found.' });
      }

      // Permissions
      if (team.leader.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
        return res.status(403).json({ success: false, message: 'Access denied.' });
      }
      query.team = teamId;
    } else {
      query.invitedBy = req.user._id;
    }

    const skip = (page - 1) * limit;
    const total = await TeamInvitation.countDocuments(query);

    const invitations = await TeamInvitation.find(query)
      .populate('invitee', 'firstName lastName avatar college degree year skills')
      .populate('team', 'name slug')
      .skip(skip)
      .limit(parseInt(limit, 10))
      .sort({ createdAt: -1 });

    const pagination = buildPaginationMeta(total, page, limit);

    return res.status(200).json({
      success: true,
      data: {
        invitations,
        pagination
      }
    });
  } catch (error) {
    next(error);
  }
};

export const acceptInvitation = async (req, res, next) => {
  try {
    const { id } = req.params;
    const invite = await TeamInvitation.findById(id).populate('team');
    if (!invite) {
      return res.status(404).json({ success: false, message: 'Invitation not found.' });
    }

    // Perm check
    if (invite.invitee.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'This invitation is not addressed to you.' });
    }

    if (invite.status !== 'pending') {
      return res.status(400).json({ success: false, message: 'Invitation is no longer pending.' });
    }

    // Check expiry
    if (invite.expiresAt < new Date()) {
      invite.status = 'expired';
      await invite.save();
      return res.status(400).json({ success: false, message: 'Invitation has expired.' });
    }

    const team = invite.team;
    if (team.members.length >= team.maxSize) {
      return res.status(400).json({ success: false, message: 'Team is already full.' });
    }

    // Join team
    team.members.push({
      user: req.user._id,
      role: invite.role || 'Member',
      joinedAt: new Date()
    });

    if (team.members.length >= team.maxSize) {
      team.isRecruiting = false;
    }
    await team.save();

    invite.status = 'accepted';
    await invite.save();

    // Notify team leader
    const notif = new Notification({
      recipient: team.leader,
      type: 'invitation',
      title: 'Invitation Accepted!',
      body: `${req.user.firstName} ${req.user.lastName} accepted your invitation to join "${team.name}".`,
      link: `/teams/manage/${team._id}`
    });
    await notif.save();

    return res.status(200).json({
      success: true,
      message: 'Invitation accepted successfully. You have joined the team.',
      data: { invitation: invite, team }
    });
  } catch (error) {
    next(error);
  }
};

export const rejectInvitation = async (req, res, next) => {
  try {
    const { id } = req.params;
    const invite = await TeamInvitation.findById(id).populate('team');
    if (!invite) {
      return res.status(404).json({ success: false, message: 'Invitation not found.' });
    }

    if (invite.invitee.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    if (invite.status !== 'pending') {
      return res.status(400).json({ success: false, message: 'Invitation is no longer pending.' });
    }

    invite.status = 'rejected';
    await invite.save();

    // Notify leader
    const notif = new Notification({
      recipient: invite.team.leader,
      type: 'invitation',
      title: 'Invitation Rejected',
      body: `${req.user.firstName} ${req.user.lastName} rejected your invitation to join "${invite.team.name}".`,
      link: `/teams/manage/${invite.team._id}`
    });
    await notif.save();

    return res.status(200).json({
      success: true,
      message: 'Invitation rejected successfully.',
      data: { invitation: invite }
    });
  } catch (error) {
    next(error);
  }
};

export const cancelInvitation = async (req, res, next) => {
  try {
    const { id } = req.params;
    const invite = await TeamInvitation.findById(id).populate('team');
    if (!invite) {
      return res.status(404).json({ success: false, message: 'Invitation not found.' });
    }

    if (invite.team.leader.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Only the team leader can cancel sent invitations.' });
    }

    if (invite.status !== 'pending') {
      return res.status(400).json({ success: false, message: 'Invitation is no longer pending.' });
    }

    await TeamInvitation.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: 'Invitation canceled successfully.'
    });
  } catch (error) {
    next(error);
  }
};
