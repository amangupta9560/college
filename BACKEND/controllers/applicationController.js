import TeamApplication from '../models/TeamApplication.js';
import Team from '../models/Team.js';
import Notification from '../models/Notification.js';
import { buildPaginationMeta } from '../utils/pagination.js';

export const applyToTeam = async (req, res, next) => {
  try {
    const currentUser = req.user;
    const { teamId, role, coverMessage } = req.body;

    const team = await Team.findById(teamId);
    if (!team || team.status === 'disbanded') {
      return res.status(404).json({ success: false, message: 'Team not found or disbanded.' });
    }

    if (!team.isRecruiting) {
      return res.status(400).json({ success: false, message: 'Team is not currently recruiting.' });
    }

    // 1. Check if user is already leader or member
    if (team.leader.toString() === currentUser._id.toString()) {
      return res.status(400).json({ success: false, message: 'You are the leader of this team.' });
    }
    const isMember = team.members.some(m => m.user.toString() === currentUser._id.toString());
    if (isMember) {
      return res.status(400).json({ success: false, message: 'You are already a member of this team.' });
    }

    // 2. Check max 10 pending applications per student
    const pendingAppsCount = await TeamApplication.countDocuments({
      applicant: currentUser._id,
      status: 'pending'
    });
    if (pendingAppsCount >= 10) {
      return res.status(400).json({
        success: false,
        message: 'Application limit exceeded. You can have at most 10 pending applications.'
      });
    }

    // 3. Check duplicate pending application
    const duplicateApp = await TeamApplication.findOne({
      team: teamId,
      applicant: currentUser._id,
      status: 'pending'
    });
    if (duplicateApp) {
      return res.status(400).json({ success: false, message: 'You already have a pending application for this team.' });
    }

    // 4. Edge Case: Student banned from applying if previously rejected twice by the same team
    const rejectionCount = await TeamApplication.countDocuments({
      team: teamId,
      applicant: currentUser._id,
      status: 'rejected'
    });
    if (rejectionCount >= 2) {
      return res.status(403).json({
        success: false,
        message: 'You are restricted from applying to this team because your applications have been rejected twice.'
      });
    }

    const newApp = new TeamApplication({
      team: teamId,
      applicant: currentUser._id,
      role,
      coverMessage: coverMessage || '',
      status: 'pending'
    });

    await newApp.save();

    // Create notification for team leader
    const notif = new Notification({
      recipient: team.leader,
      type: 'application',
      title: 'New Team Application',
      body: `${currentUser.firstName} ${currentUser.lastName} applied for the "${role}" role in your team.`,
      link: `/teams/manage/${team._id}`,
      metadata: { teamId: team._id, applicationId: newApp._id }
    });
    await notif.save();

    return res.status(201).json({
      success: true,
      message: 'Application submitted successfully.',
      data: { application: newApp }
    });
  } catch (error) {
    next(error);
  }
};

export const listApplications = async (req, res, next) => {
  try {
    const currentUser = req.user;
    const { teamId, status, page = 1, limit = 10 } = req.query;

    const query = {};

    if (teamId) {
      const team = await Team.findById(teamId);
      if (!team) {
        return res.status(404).json({ success: false, message: 'Team not found.' });
      }

      // Only Team Leader or Admin can view applications submitted to a team
      if (team.leader.toString() !== currentUser._id.toString() && currentUser.role !== 'admin') {
        return res.status(403).json({ success: false, message: 'Access denied.' });
      }
      query.team = teamId;
    } else {
      // Students view their own applications
      query.applicant = currentUser._id;
    }

    if (status) {
      query.status = status;
    }

    const skip = (page - 1) * limit;
    const total = await TeamApplication.countDocuments(query);
    
    const applications = await TeamApplication.find(query)
      .populate('applicant', 'firstName lastName avatar college degree year skills bio')
      .populate('team', 'name slug description leader')
      .skip(skip)
      .limit(parseInt(limit, 10))
      .sort({ createdAt: -1 });

    const pagination = buildPaginationMeta(total, page, limit);

    return res.status(200).json({
      success: true,
      data: {
        applications,
        pagination
      }
    });
  } catch (error) {
    next(error);
  }
};

export const withdrawApplication = async (req, res, next) => {
  try {
    const { id } = req.params;
    const app = await TeamApplication.findById(id);
    if (!app) {
      return res.status(404).json({ success: false, message: 'Application not found.' });
    }

    // Only applicant can withdraw
    if (app.applicant.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'You can only withdraw your own applications.' });
    }

    if (app.status !== 'pending') {
      return res.status(400).json({ success: false, message: `Cannot withdraw application. Current status is: ${app.status}` });
    }

    app.status = 'withdrawn';
    await app.save();

    return res.status(200).json({
      success: true,
      message: 'Application withdrawn successfully.',
      data: { application: app }
    });
  } catch (error) {
    next(error);
  }
};

export const acceptApplication = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const app = await TeamApplication.findById(id).populate('team');
    if (!app) {
      return res.status(404).json({ success: false, message: 'Application not found.' });
    }

    const team = app.team;
    if (team.leader.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Only the team leader can accept applications.' });
    }

    if (app.status !== 'pending') {
      return res.status(400).json({ success: false, message: 'Application is no longer pending.' });
    }

    // Check if team is full
    if (team.members.length >= team.maxSize) {
      return res.status(400).json({ success: false, message: 'Team is already full.' });
    }

    // Add to roster
    team.members.push({
      user: app.applicant,
      role: app.role,
      joinedAt: new Date()
    });

    // Toggle recruitment off if team is full
    if (team.members.length >= team.maxSize) {
      team.isRecruiting = false;
    }

    await team.save();

    app.status = 'accepted';
    app.reviewedBy = req.user._id;
    app.reviewedAt = new Date();
    await app.save();

    // Notify applicant
    const notif = new Notification({
      recipient: app.applicant,
      type: 'application',
      title: 'Application Accepted!',
      body: `Your application to join "${team.name}" as "${app.role}" has been accepted.`,
      link: `/teams/${team.slug}`
    });
    await notif.save();

    return res.status(200).json({
      success: true,
      message: 'Application accepted successfully.',
      data: { application: app, team }
    });
  } catch (error) {
    next(error);
  }
};

export const rejectApplication = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { message } = req.body;
    
    const app = await TeamApplication.findById(id).populate('team');
    if (!app) {
      return res.status(404).json({ success: false, message: 'Application not found.' });
    }

    const team = app.team;
    if (team.leader.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Only the team leader can reject applications.' });
    }

    if (app.status !== 'pending') {
      return res.status(400).json({ success: false, message: 'Application is no longer pending.' });
    }

    app.status = 'rejected';
    app.reviewedBy = req.user._id;
    app.reviewedAt = new Date();
    await app.save();

    // Notify applicant
    const bodyText = message ? `Your application to join "${team.name}" was rejected. Message: ${message}` : `Your application to join "${team.name}" has been rejected.`;
    const notif = new Notification({
      recipient: app.applicant,
      type: 'application',
      title: 'Application Update',
      body: bodyText,
      link: `/teams`
    });
    await notif.save();

    return res.status(200).json({
      success: true,
      message: 'Application rejected successfully.',
      data: { application: app }
    });
  } catch (error) {
    next(error);
  }
};
