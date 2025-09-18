const Setting = require('../models/Setting');

// GET /api/admin/settings
exports.get = async (req, res) => {
  let setting = await Setting.findOne();

  if (!setting) {
    setting = new Setting();
    await setting.save();
  }

  res.json(setting);
};

// PATCH /api/admin/settings
exports.update = async (req, res) => {
  const { autoCheckNMC, autoCheckPCI, requireSecondaryApproval } = req.body;

  let setting = await Setting.findOne();

  if (!setting) {
    setting = new Setting();
  }

  if (autoCheckNMC !== undefined) setting.autoCheckNMC = autoCheckNMC;
  if (autoCheckPCI !== undefined) setting.autoCheckPCI = autoCheckPCI;
  if (requireSecondaryApproval !== undefined) setting.requireSecondaryApproval = requireSecondaryApproval;

  await setting.save();

  res.json(setting);
};