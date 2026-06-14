import Project from '../models/Project.js';
import { uploadBuffer, deleteAsset } from '../utils/cloudinaryHelpers.js';
import { buildPaginationMeta } from '../utils/pagination.js';

export const createProject = async (req, res, next) => {
  try {
    const { 
      title, description, techStack, githubURL, demoURL, collaborators, hackathon, isPublic, status 
    } = req.body;

    const newProject = new Project({
      owner: req.user._id,
      title,
      description,
      techStack: techStack || [],
      githubURL: githubURL || '',
      demoURL: demoURL || '',
      collaborators: collaborators || [],
      hackathon: hackathon || null,
      isPublic: isPublic !== undefined ? isPublic : true,
      status: status || 'in_progress'
    });

    await newProject.save();

    return res.status(201).json({
      success: true,
      message: 'Project created successfully.',
      data: { project: newProject }
    });
  } catch (error) {
    next(error);
  }
};

export const getProjects = async (req, res, next) => {
  try {
    const { userId, techStack, status, page = 1, limit = 10 } = req.query;
    const query = {};

    // Filter by owner
    if (userId) {
      query.owner = userId;
    }

    // Filter by tech stack (comma-separated list of items)
    if (techStack) {
      const stack = techStack.split(',').map(s => s.trim());
      query.techStack = { $all: stack };
    }

    // Filter by status
    if (status) {
      query.status = status;
    }

    // If listing public ones, or if the requester is the owner
    // For general feed, we only show public projects
    if (!userId || userId !== req.user._id.toString()) {
      query.isPublic = true;
    }

    const skip = (page - 1) * limit;
    const total = await Project.countDocuments(query);

    const projects = await Project.find(query)
      .populate('owner', 'firstName lastName avatar')
      .populate('collaborators', 'firstName lastName avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit, 10));

    const pagination = buildPaginationMeta(total, page, limit);

    return res.status(200).json({
      success: true,
      data: {
        projects,
        pagination
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getProjectById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const project = await Project.findById(id)
      .populate('owner', 'firstName lastName avatar college branch')
      .populate('collaborators', 'firstName lastName avatar college branch')
      .populate('hackathon', 'title');

    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found.' });
    }

    // Check visibility
    if (!project.isPublic && project.owner._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Access denied. Private project.' });
    }

    return res.status(200).json({
      success: true,
      data: { project }
    });
  } catch (error) {
    next(error);
  }
};

export const updateProject = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { 
      title, description, techStack, githubURL, demoURL, collaborators, hackathon, isPublic, status 
    } = req.body;

    const project = await Project.findById(id);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found.' });
    }

    // Owner check
    if (project.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access denied. You can only edit your own projects.' });
    }

    if (title !== undefined) project.title = title;
    if (description !== undefined) project.description = description;
    if (techStack !== undefined) project.techStack = techStack;
    if (githubURL !== undefined) project.githubURL = githubURL;
    if (demoURL !== undefined) project.demoURL = demoURL;
    if (collaborators !== undefined) project.collaborators = collaborators;
    if (hackathon !== undefined) project.hackathon = hackathon || null;
    if (isPublic !== undefined) project.isPublic = isPublic;
    if (status !== undefined) project.status = status;

    await project.save();

    return res.status(200).json({
      success: true,
      message: 'Project updated successfully.',
      data: { project }
    });
  } catch (error) {
    next(error);
  }
};

export const deleteProject = async (req, res, next) => {
  try {
    const { id } = req.params;

    const project = await Project.findById(id);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found.' });
    }

    // Owner check
    if (project.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access denied. You can only delete your own projects.' });
    }

    // Delete thumbnail from Cloudinary if exists
    if (project.thumbnailURL) {
      try {
        await deleteAsset(project.thumbnailURL);
      } catch (err) {
        console.error('Error deleting project thumbnail:', err);
      }
    }

    await Project.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: 'Project deleted successfully.'
    });
  } catch (error) {
    next(error);
  }
};

export const uploadThumbnail = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded.' });
    }

    const project = await Project.findById(id);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found.' });
    }

    // Owner check
    if (project.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    // Delete old thumbnail if exists
    if (project.thumbnailURL) {
      try {
        await deleteAsset(project.thumbnailURL);
      } catch (err) {
        console.error('Error deleting old thumbnail:', err);
      }
    }

    // Upload new thumbnail
    const result = await uploadBuffer(req.file.buffer, 'hackmatch_project_thumbnails');
    project.thumbnailURL = result.secure_url;
    await project.save();

    return res.status(200).json({
      success: true,
      message: 'Project thumbnail uploaded successfully.',
      data: { thumbnailURL: project.thumbnailURL }
    });
  } catch (error) {
    next(error);
  }
};
