const { ObjectId } = require("mongodb");
const mongoose = require("mongoose");

const reportShcema = new mongoose.Schema({
  target: {
    type: String,
    require: [true, "You must specify target (ip / hostname)"],
  },
  ports: [Object],
  scanned_by: {
    username: String,
    email: String,
  },
  result: {
    type: String,
  },
  connection: {
    ip: String,
    port: String,
  },
  date: {
    type: Date,
    default: new Date().getDate(),
  },
});

module.exports = new mongoose.model("Report", reportShcema);
