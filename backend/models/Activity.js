const mongoose = require("mongoose");

const ActivitySchema = new mongoose.Schema({
  time: String,
  user: String,
  action: String,
  file: String,
  ip: String,
  status: String,
});

module.exports = mongoose.model("Activity", ActivitySchema);