const Notification = require('../models/Notification');

// GET /api/notifications — List unread + recent
exports.getAll = async (req, res) => {
  const notifications = await Notification.find({ recipientId: req.user.id })
    .sort({ createdAt: -1 })
    .limit(50);

  res.json(notifications);
};

// POST /api/notifications/:id/read — Mark as read
exports.markAsRead = async (req, res) => {
  const notification = await Notification.findByIdAndUpdate(
    req.params.id,
    { read: true },
    { new: true }
  );

  if (!notification) return res.status(404).json({ message: 'Not found' });
  if (notification.recipientId.toString() !== req.user.id.toString()) {
    return res.status(403).json({ message: 'Not authorized' });
  }

  res.json(notification);
};