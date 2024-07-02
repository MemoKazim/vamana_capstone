const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");
const authController = require("../controllers/authController");

router
  .route("/?*")
  .all(authController.isAuthenticated)
  .all(authController.isAdmin);

router
  .get("/reports", adminController.getReports)
  .get("/reports/delete/:id", adminController.deleteReport)
  .get("/reports/:id", adminController.getReport)
  .post("/reports/:id", adminController.postReport)
  .get("/dashboard", adminController.getDashboard)
  .post("/profile/changepassword", adminController.changePassword)
  .get("/profile", adminController.getProfile)
  .get("/submit", adminController.getSubmit)
  .post("/submit", adminController.postSubmit)
  .get("/log", adminController.getLog)
  .get("/users", adminController.getUsers)
  .post("/users/update/:id", adminController.updateUser)
  .get("/users/update/:id", adminController.updateUserPage)
  .get("/users/delete/:id", adminController.deleteUser)
  .get("/users/:id", adminController.getUser);

module.exports = router;
