const mongoose = require("mongoose");

const reportShcema = new mongoose.Schema({
  description: {
    type: String,
  },
  status: {
    type: String,
  },
  stage: {
    type: String,
    enum: ["Submitted", "Reviewed", "Investigating", "Resolved"],
  },
  category: {
    type: String,
  },
  severity: {
    type: String,
  },
  reason: {
    type: Object,
  },
  potential_threat: {
    type: Object,
  },
  mitigation: {
    type: Object,
  },
  conclusion: {
    type: String,
  },
  date: {
    type: Date,
    default: new Date().getDate(),
  },
});

module.exports = new mongoose.model("Report", reportShcema);
