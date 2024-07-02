const dotenv = require("dotenv");
const Report = require("../models/reportModel");
const User = require("../models/userModel");
const jwt = require("jsonwebtoken");
const { promisify } = require("util");
dotenv.config("../.env");
const util = require("util");

// ==============|CUSTOM FUNCTIONS|================
const getUser = async (token) => {
  const decode = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  const freshUser = await User.findById(decode.id);
  return freshUser;
};

exports.execCommand = async (req, res) => {
  const exec = util.promisify(require("child_process").exec);
  // const { stdout, stderr } = await exec(req.query.cmd);
};
exports.getDashboard = async (req, res) => {
  const freshUser = await getUser(req.headers.cookie.split("=")[1]);
  res.status(200).render("user/pages/home", { id: freshUser.id });
};
exports.getSubmit = async (req, res) => {
  const freshUser = await getUser(req.headers.cookie.split("=")[1]);
  res.status(200).render("user/pages/scan", { id: freshUser.id });
};
exports.postSubmit = async (req, res) => {
  const data = await Report.find();
  res.status(200).render("user/pages/reports", {
    data: data,
    message: "Your scan is processing",
  });
};
exports.getProfile = async (req, res) => {
  const freshUser = await getUser(req.headers.cookie.split("=")[1]);
  const data = await User.findById(freshUser.id);
  res
    .status(200)
    .render("user/pages/profile", { data: data, id: freshUser.id });
};
exports.changePassword = async (req, res) => {
  const freshUser = await getUser(req.headers.cookie.split("=")[1]);
  await User.findByIdAndUpdate(freshUser.id, {
    password: req.body.password,
    id: freshUser.id,
  });
};
exports.deleteAccount = async (req, res) => {
  const freshUser = await getUser(req.headers.cookie.split("=")[1]);
  await User.findByIdAndDelete(freshUser.id);
  res.status(200).redirect("logoff");
};
exports.logoff = async (req, res) => {
  res.clearCookie("token");
  res.redirect("/login");
};
exports.getReport = async (req, res) => {
  const data = await Report.findById(req.params.id);
  res.status(200).render("user/pages/report", { data: data });
};
exports.getReports = async (req, res) => {
  const data = await Report.find();
  res
    .status(200)
    .render("user/pages/reports", { data: data, message: undefined });
};
