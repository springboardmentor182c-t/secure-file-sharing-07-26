const Activity = require("../models/Activity");

const getActivities = async (req, res) => {
  const data = await Activity.find().sort({ _id: -1 });

  res.json(data);
};

module.exports = {
  getActivities,
};