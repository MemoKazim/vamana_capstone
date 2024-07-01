// =============================| PREDEFINE |=============================
require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const authController = require("./controllers/authController");
const admin = require("./routes/adminRoute");
const user = require("./routes/userRoute");

// =============================| SETTINGS |=============================
const app = express();
app.use(express.static(__dirname + "/assets"));
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);
app.set("view engine", "ejs");
app.use("/admin", admin);
app.use("/user", user);

app.get("/", (req, res) => {
  res.redirect("/login");
});

app.route("/login").get(authController.getLogin).post(authController.postLogin);

app
  .route("/signup")
  .get(authController.getSignup)
  .post(authController.postSignup);

app.route("/logoff").get(authController.logoff);

app.get("*", (req, res) => {
  res.sendFile(__dirname + "/views/error/404.html");
});

module.exports = app;
