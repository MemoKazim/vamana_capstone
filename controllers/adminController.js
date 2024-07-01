const User = require("../models/userModel");
const Report = require("../models/reportModel");

const multer = require("multer");
const multerStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/uploads");
  },
  filename: (req, file, cb) => {
    const ext = file.mimetype.split("/")[1];
    cb(null, `${Date.now()}-${uniqid()}.${ext}`);
  },
});
const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    cb(
      res.status(400).redirect(req.path, { message: "Only image allowed!" }),
      false
    );
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

// =================|REPORT|==================
exports.getReports = async (req, res) => {
  data = await Report.find();
  res.status(200).render(`admin/pages/reports`, {
    data: data,
  });
};
exports.getReport = async (req, res) => {
  data = await Report.findById(req.params.id);
  res.status(200).render(`admin/pages/report`, {
    data: data,
  });
};
exports.updateReport = async (req, res) => {
  const update = {
    stage: req.body.stage,
  };
  if (stage == "Resolved") {
    update["status"] = "Complated";
  }
  await Report.findByIdAndUpdate(req.params.id, update);
  res
    .status(200)
    .render("admin/pages/reports", { message: "Success", code: 0 });
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
  res.status(200).render("admin/pages/profile");
};
exports.getUser = async (req, res) => {
  const data = await User.find(req.params.id);
  res.status(200).render("admin/pages/user", { data: data });
};
exports.getUsers = async (req, res) => {
  const data = await User.find();
  res.status(200).render("admin/pages/users", { data: data });
};
exports.deleteUser = async (req, res) => {
  await User.findByIdAndRemove(req.params.id);
  res.status(200).redirect("/admin/user", {
    message: "User Successfully deleted!",
    code: 0,
  });
};
// =================|USER|==================

exports.updateUserPage = async (req, res) => {
  const singleUser = await User.findById(req.params.id);
  res.status(200).render("admin/updateUser", {
    result: singleUser,
  });
};
exports.updateUser = async (req, res) => {
  const update = {};
  await User.findByIdAndUpdate(req.params.id, update);
  res.status(202).redirect("/admin/user");
};
