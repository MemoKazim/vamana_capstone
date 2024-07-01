const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, "Username field is required!"],
  },
  password: {
    type: String,
    required: [true, "Password field is required"],
  },
  email: {
    type: String,
    required: [true, "Email field is required"],
    unique: true,
    lowecase: true,
    validate: [validator.isEmail, "Email is invalid"],
  },
  role: {
    type: String,
    enum: ["admin", "user"],
  },
});

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});
userSchema.pre("findOneAndUpdate", async function (next) {
  this._update.password = await bcrypt.hash(this._update.password, 12);
  next();
});

userSchema.methods.correctPassword = async function correctPassword(
  existPass,
  incomingPass
) {
  return await bcrypt.compare(incomingPass, existPass);
};
const User = new mongoose.model("User", userSchema);

module.exports = User;
