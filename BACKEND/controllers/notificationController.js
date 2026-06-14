import Notification from '../models/Notification.js';
import { buildPaginationMeta } from '../utils/pagination.js';

export const getNotifications = async (req, res, next) => {
  try {
    const { isRead, type, page = 1, limit = 10 } = req.query;
    const query = { recipient: req.user._id };

    if (isRead !== undefined) {
      query.isRead = isRead === 'true';
    }

    if (type) {
      query.type = type;
    }

    const skip = (page - 1) * limit;
    const total = await Notification.countDocuments(query);
    const unreadCount = await Notification.countDocuments({ recipient: req.user._id, isRead: false });

    const notifications = await Notification.find(query)
      .skip(skip)
      .limit(parseInt(limit, 10))
      .sort({ createdAt: -1 });

    const pagination = buildPaginationMeta(total, page, limit);

    return res.status(200).json({
      success: true,
      data: {
        notifications,
        unreadCount,
        pagination
      }
    });
  } catch (error) {
    next(error);
  }
};

export const markRead = async (req, res, next) => {
  try {
    const { id } = req.params;
    const notif = await Notification.findById(id);

    if (!notif) {
      return res.status(404).json({ success: false, message: 'Notification not found.' });
    }

    if (notif.recipient.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    notif.isRead = true;
    await notif.save();

    return res.status(200).json({
      success: true,
      message: 'Notification marked as read.',
      data: { notification: notif }
    });
  } catch (error) {
    next(error);
  }
};

export const markAllRead = async (req, res, next) => {
  try {
    await Notification.updateMany(
      { recipient: req.user._id, isRead: false },
      { isRead: true }
    );

    return res.status(200).json({
      success: true,
      message: 'All notifications marked as read.'
    });
  } catch (error) {
    next(error);
  }
};

export const deleteNotification = async (req, res, next) => {
  try {
    const { id } = req.params;
    const notif = await Notification.findById(id);

    if (!notif) {
      return res.status(404).json({ success: false, message: 'Notification not found.' });
    }

    if (notif.recipient.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    await Notification.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: 'Notification deleted successfully.'
    });
  } catch (error) {
    next(error);
  }
};
