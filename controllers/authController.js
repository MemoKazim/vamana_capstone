const User = require("./../models/userModel");
const jwt = require("jsonwebtoken");
const validator = require("validator");
const { promisify } = require("util");

exports.getSignup = (req, res, next) => {
  res.render("user/pages/signup");
};
exports.postSignup = (req, res, next) => {
  const newUser = new User({
    username: validator.escape(req.body.username),
    password: validator.escape(req.body.password),
    email: validator.escape(req.body.email),
    role: "user",
  });
  newUser.save();
  res.status(200).redirect("/login");
};

exports.getLogin = async (req, res, next) => {
  res.render("user/pages/login", { message: undefined });
};

exports.postLogin = async (req, res, next) => {
  const { email, password } = req.body;
  const cookieOptions = {
    expires: new Date(Date.now() + 60 * 60 * 1000),
    httpOnly: true,
  };
  if (!email || !password) {
    return res.status(401).render("user/pages/login", {
      message: "Incorrect email or password",
    });
  }
  const user = await User.find({ email: email }).select("+password");
  const result = await user[0].correctPassword(user[0].password, password);
  if (!result || !user) {
    return res.status(401).render("user/pages/login", {
      message: "Incorrect email or password",
    });
  }
  const token = jwt.sign({ id: user[0]._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES,
  });
  if (user[0].role == "admin") {
    return res
      .status(200)
      .cookie("jwt", token, cookieOptions)
      .redirect("/admin/dashboard");
  } else {
    return res
      .status(200)
      .cookie("jwt", token, cookieOptions)
      .redirect("/user/dashboard");
  }
};
exports.forgotPassword = async (req, res) => {
  //
};
exports.isAuthenticated = async (req, res, next) => {
  if (!req.headers.cookie || req.headers.cookie === undefined) {
    return res.sendFile(__dirname + "/../views/error/401");
  }
  let token = req.headers.cookie.split("=")[1];

  const decode = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  const freshUser = await User.findById(decode.id);
  if (!freshUser) {
    return res.status(401).render("user/pages/login", {
      message: "This user with this token is no longer exists",
    });
  }
  next();
};

exports.isAdmin = async (req, res, next) => {
  if (!req.headers.cookie || req.headers.cookie === undefined) {
    return res.sendFile(__dirname + "/../views/error/401");
  }
  let token = req.headers.cookie.split("=")[1];

  const decode = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  const freshUser = await User.findById(decode.id);
  if (!freshUser) {
    return res.status(401).render("user/pages/login", {
      message: "This user with this token is no longer exists",
    });
  }
  if (freshUser.role == "user") {
    return res.status(401).render("error/401.ejs");
  }
  next();
};

exports.logoff = async (req, res, next) => {
  res.clearCookie("jwt");
  res.status(200).redirect("/");
};
