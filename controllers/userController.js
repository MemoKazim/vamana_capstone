const dotenv = require("dotenv");
const Report = require("../models/reportModel");
const User = require("../models/userModel");
const jwt = require("jsonwebtoken");
const { promisify } = require("util");
dotenv.config("../.env");
const util = require("util");
const fs = require("fs");

// ==============|CUSTOM FUNCTIONS|================
const getUser = async (token) => {
  const decode = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  const freshUser = await User.findById(decode.id);
  return freshUser;
};
const humanReadableDate = (date) => {
  const givenDate = new Date(date);
  const formatter = new Intl.DateTimeFormat("en-US", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
  const formattedDate = formatter.format(date);
  return `${formattedDate} ${givenDate.getHours()}:${givenDate.getMinutes()}:${givenDate.getSeconds()}`;
};
const saveLog = async (id) => {
  const last = await Report.findById(id);
  let lastLog = `${humanReadableDate(last.date)}|${last.target}|${
    last.origin.ip
  }|${last.origin.port}|${last.origin.username}|${last.origin.email}`;
  fs.appendFile(__dirname + "/../logs/activity.log", lastLog, (err) => {
    if (err) {
      throw err;
    }
  });
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
  const { username, email, id } = await getUser(
    req.headers.cookie.split("=")[1]
  );
  const data = await Report.find({ "origin.id": id });
  const newSubmit = new Report({
    target: req.body.target,
    origin: {
      username: username,
      email: email,
      id: id,
      ip: req.socket.remoteAddress,
      port: req.socket.remotePort,
    },
    date: new Date(),
  });
  await newSubmit.save();
  saveLog(newSubmit.id);
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
  const { id } = await getUser(req.headers.cookie.split("=")[1]);
  const data = await Report.find({ "origin.id": id });
  res
    .status(200)
    .render("user/pages/reports", { data: data, message: undefined });
};
