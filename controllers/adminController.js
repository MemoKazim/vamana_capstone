const dotenv = require("dotenv");
const Report = require("../models/reportModel");
const User = require("../models/userModel");
const jwt = require("jsonwebtoken");
const { promisify } = require("util");
dotenv.config("../.env");
const validator = require("validator");
const util = require("util");

// ==============|CUSTOM FUNCTIONS|================
const getUser = async (token) => {
  const decode = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  const freshUser = await User.findById(decode.id);
  return freshUser;
};
exports.getReports = async (req, res) => {
  data = await Report.find();
  res.status(200).render(`admin/pages/reports`, {
    data: data,
    message: undefined,
  });
};
exports.getReport = async (req, res) => {
  data = await Report.findById(req.params.id);
  res.status(200).render(`admin/pages/report`, {
    data: data,
  });
};
exports.getLog = async (req, res) => {
  const data = await Report.find();
  res.status(200).render("admin/pages/log", { data: data });
};
exports.postReport = async (req, res) => {
  const report = {
    desciprtion: req.body.desciprtion,
    status: "In Progress",
    stage: "Submitted",
  };
  const newReport = new Report(report);
  await newReport.save();
  res
    .status(200)
    .render("admin/pages/reports", { message: "Success", code: 0 });
};
exports.deleteReport = async (req, res) => {
  await Report.findByIdAndRemove(req.params.id);
  res
    .status(200)
    .render("admin/pages/reports", { message: "Success", code: 0 });
};
exports.getDashboard = async (req, res) => {
  res.status(200).render("admin/pages/home", {
    title: "Dashboard",
  });
};
exports.changePassword = async (req, res) => {
  await User.findOneAndUpdate(
    { role: "admin" },
    { password: req.body.newPassword }
  );
  res.status(200).render("admin/pages/profile", {
    message: "Password Changed Successfully!",
    code: 0,
  });
};
exports.getProfile = async (req, res) => {
  const freshUser = await getUser(req.headers.cookie.split("=")[1]);
  const data = await User.findById(freshUser.id);
  res.status(200).render("admin/pages/profile", { data: data });
};
exports.getUser = async (req, res) => {
  const data = await User.findById(req.params.id);
  res.status(200).render("admin/pages/user", { data: data });
};
exports.getUsers = async (req, res) => {
  const data = await User.find().sort({ role: 1 });
  res
    .status(200)
    .render("admin/pages/users", { data: data, message: undefined });
};
exports.deleteUser = async (req, res) => {
  await User.findByIdAndDelete(req.params.id);
  const data = await User.find();
  res.status(200).render("admin/pages/users", {
    data: data,
    message: "User successfully deleted!",
    code: 0,
  });
};
exports.getSubmit = async (req, res) => {
  const freshUser = await getUser(req.headers.cookie.split("=")[1]);
  res.status(200).render("admin/pages/scan", { id: freshUser.id });
};
exports.postSubmit = async (req, res) => {
  const data = await Report.find();
  res.status(200).render("admin/pages/reports", {
    data: data,
    message: "Your scan is processing",
  });
};
exports.updateUserPage = async (req, res) => {
  const singleUser = await User.findById(req.params.id);
  res.status(200).render("admin/pages/updateUser", {
    data: singleUser,
  });
};
exports.updateUser = async (req, res) => {
  const update = {
    username: validator.escape(req.body.username),
    email: validator.escape(req.body.email),
    role: validator.escape(req.body.role),
  };
  await User.findByIdAndUpdate(req.params.id, update);
  data = await User.find().sort({ role: 1 });
  res
    .status(200)
    .render("admin/pages/users", { message: "User successfully updated!" });
};
