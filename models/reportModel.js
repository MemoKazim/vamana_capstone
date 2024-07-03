const { ObjectId } = require("mongodb");
const mongoose = require("mongoose");

const reportShcema = new mongoose.Schema({
  target: {
    type: String,
    require: [true, "You must specify target (ip / hostname)"],
  },
  ports: [{
    port: Number,
    service:String,
    version:String
  }],
  origin: {
    username: String,
    email: String,
    id: ObjectId,
    ip: String,
    port: String,
  },
  result: {
    type: String,
  },
  date: {
    type: Date,
    default: new Date().getDate(),
  },
});

module.exports = new mongoose.model("Report", reportShcema);
