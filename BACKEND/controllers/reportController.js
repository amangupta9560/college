import Report from '../models/Report.js';

export const createReport = async (req, res, next) => {
  try {
    const { targetType, targetId, reason, description } = req.body;

    const newReport = new Report({
      reporter: req.user._id,
      targetType,
      targetId,
      reason,
      description: description || '',
      status: 'pending'
    });

    await newReport.save();

    return res.status(201).json({
      success: true,
      message: 'Report submitted successfully. Administrators will review it shortly.',
      data: { report: newReport }
    });
  } catch (error) {
    next(error);
  }
};
