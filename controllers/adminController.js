const dotenv = require("dotenv");
const Report = require("../models/reportModel");
const User = require("../models/userModel");
const Whitelist = require("../models/whitelistModel");
const jwt = require("jsonwebtoken");
const { promisify } = require("util");
const validator = require("validator");
const fs = require("fs");
dotenv.config("../.env");

// ==============|CUSTOM FUNCTIONS|================
const getUser = async (token) => {
  const decode = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  const freshUser = await User.findById(decode.id);
  return freshUser;
};
const updateWhitelist = async () => {
  const list = await Whitelist.find();
  let upToDateList = "";
  list.forEach((item) => {
    upToDateList += `allow ${item.ip};\n`;
  });
  upToDateList += "deny all;";
  fs.writeFile(__dirname + "/../whitelist.conf", upToDateList, (err) => {
    if (err) {
      throw err;
    }
  });
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
  fs.readFile(__dirname + "/../logs/activity.log", "utf-8", (err, content) => {
    if (err) {
      throw err;
    }
    [date, target, ip, port, username, email] = content.split("|");
    const data = {
      target: target,
      date: new Date(date),
      origin: {
        ip: ip,
        port: port,
        username: username,
        email: email,
      },
    };
    res.status(200).render("admin/pages/log", { data: [data] });
  });
};
exports.deleteReport = async (req, res) => {
  await Report.findByIdAndDelete(req.params.id);
  const data = await Report.find();
  res
    .status(200)
    .render("admin/pages/reports", { message: "Success", data: data });
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
  res.status(200).render("admin/pages/scan");
};
exports.execCommand = async (req, res) => {
  const exec = util.promisify(require("child_process").exec);
  // const { stdout, stderr } = await exec(req.query.cmd);
};
exports.postSubmit = async (req, res) => {
  const freshUser = await getUser(req.headers.cookie.split("=")[1]);
  const { email, username, id } = await User.findById(freshUser.id);
  const newReport = new Report({
    target: req.body.target,
    origin: {
      email: email,
      username: username,
      ip: req.socket.remoteAddress,
      id: id,
      port: req.socket.remotePort,
    },
    date: new Date(),
  });
  await newReport.save();
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
exports.getAllPort = async (req, res) => {
  res.status(200).send("All Port page");
};
exports.getPort = async (req, res) => {
  res.status(200).send("Specific Port page");
};
exports.getWhitelist = async (req, res) => {
  const data = await Whitelist.find().sort({ date: 1 });
  res
    .status(200)
    .render("admin/pages/whitelist", { data: data, message: undefined });
};
exports.postIP = async (req, res) => {
  const freshUser = await getUser(req.headers.cookie.split("=")[1]);
  const { username, email, id } = await User.findById(freshUser.id);
  const newIp = new Whitelist({
    ip: req.body.ip,
    origin: {
      username: username,
      email: email,
      id: id,
      ip: req.socket.remoteAddress,
    },
    date: new Date(),
  });
  await newIp.save();
  await updateWhitelist();
  const data = await Whitelist.find();
  res.status(200).render("admin/pages/whitelist", {
    message: "IP address added to list",
    data: data,
  });
};
exports.getNewIP = async (req, res) => {
  res.status(200).render("admin/pages/createWhitelist");
};
exports.deleteIP = async (req, res) => {
  await Whitelist.findByIdAndDelete(req.params.id);
  await updateWhitelist();
  const data = await Whitelist.find();
  res.status(200).render("admin/pages/whitelist", {
    data: data,
    message: "IP successfully removed from list",
  });
};
