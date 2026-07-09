const Activity = require("../models/Activity");

const logActivity = async ({
  user,
  action,
  file,
  ip,
  status,
}) => {
  await Activity.create({
    time: new Date().toLocaleString(),
    user,
    action,
    file,
    ip,
    status,
  });
};

module.exports = logActivity;