import Review from '../models/Review.js';
import Team from '../models/Team.js';
import { buildPaginationMeta } from '../utils/pagination.js';

export const createReview = async (req, res, next) => {
  try {
    const { revieweeId, teamId, rating, comment, tags } = req.body;
    const reviewerId = req.user._id.toString();

    // 1. Validation: Self-review check
    if (reviewerId === revieweeId.toString()) {
      return res.status(400).json({ success: false, message: 'You cannot review yourself.' });
    }

    // 2. Fetch team and check membership & status
    const team = await Team.findById(teamId);
    if (!team) {
      return res.status(404).json({ success: false, message: 'Associated team not found.' });
    }

    if (team.status !== 'completed') {
      return res.status(400).json({ success: false, message: 'You can only review teammates after the project/team is marked as completed.' });
    }

    const reviewerInTeam = team.members.some(m => m.user.toString() === reviewerId);
    const revieweeInTeam = team.members.some(m => m.user.toString() === revieweeId.toString());

    if (!reviewerInTeam || !revieweeInTeam) {
      return res.status(400).json({ success: false, message: 'Both you and the reviewee must be members of the specified team.' });
    }

    // 3. Check duplicate review check
    const existingReview = await Review.findOne({
      reviewer: req.user._id,
      reviewee: revieweeId,
      team: teamId
    });

    if (existingReview) {
      return res.status(400).json({ success: false, message: 'You have already submitted a review for this teammate for this project.' });
    }

    // 4. Create review
    const newReview = new Review({
      reviewer: req.user._id,
      reviewee: revieweeId,
      team: teamId,
      rating,
      comment: comment || '',
      tags: tags || [],
      isVisible: true
    });

    await newReview.save();

    return res.status(201).json({
      success: true,
      message: 'Teammate review submitted successfully.',
      data: { review: newReview }
    });
  } catch (error) {
    next(error);
  }
};

export const getUserReviews = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const skip = (page - 1) * limit;
    const query = { reviewee: userId, isVisible: true };

    const total = await Review.countDocuments(query);

    const reviews = await Review.find(query)
      .populate('reviewer', 'firstName lastName avatar college')
      .populate('team', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit, 10));

    // Calculate average rating
    const ratingsGroup = await Review.aggregate([
      { $match: { reviewee: reviews.length > 0 ? reviews[0].reviewee : null, isVisible: true } },
      { $group: { _id: null, avgRating: { $avg: '$rating' }, count: { $sum: 1 } } }
    ]);

    const averageRating = ratingsGroup.length > 0 ? parseFloat(ratingsGroup[0].avgRating.toFixed(1)) : 0;
    const reviewCount = ratingsGroup.length > 0 ? ratingsGroup[0].count : 0;

    const pagination = buildPaginationMeta(total, page, limit);

    return res.status(200).json({
      success: true,
      data: {
        reviews,
        averageRating,
        reviewCount,
        pagination
      }
    });
  } catch (error) {
    next(error);
  }
};

export const updateReview = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { rating, comment, tags } = req.body;
    const userId = req.user._id.toString();

    const review = await Review.findById(id);
    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found.' });
    }

    // Auth check
    if (review.reviewer.toString() !== userId) {
      return res.status(403).json({ success: false, message: 'Access denied. You can only edit your own reviews.' });
    }

    // Check 30 days edit limit
    const diffMs = Date.now() - new Date(review.createdAt).getTime();
    const diffDays = diffMs / (1000 * 60 * 60 * 24);

    if (diffDays > 30) {
      return res.status(400).json({ success: false, message: 'Reviews can only be edited within 30 days of creation.' });
    }

    if (rating !== undefined) review.rating = rating;
    if (comment !== undefined) review.comment = comment;
    if (tags !== undefined) review.tags = tags;

    await review.save();

    return res.status(200).json({
      success: true,
      message: 'Review updated successfully.',
      data: { review }
    });
  } catch (error) {
    next(error);
  }
};

export const deleteReview = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user._id.toString();

    const review = await Review.findById(id);
    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found.' });
    }

    // Auth check
    if (review.reviewer.toString() !== userId && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    await Review.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: 'Review deleted successfully.'
    });
  } catch (error) {
    next(error);
  }
};
