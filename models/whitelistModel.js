const { ObjectId } = require("mongodb");
const mongoose = require("mongoose");

const whitelistShcema = new mongoose.Schema({
  ip: String,
  origin: {
    username: String,
    email: String,
    id: ObjectId,
    ip: String,
  },
  date: Date,
});

module.exports = new mongoose.model("Whitelist", whitelistShcema);
