const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");

router
  .get("/profile/deleteaccount", userController.deleteAccount)
  .post("/profile/changepassword", userController.changePassword)
  .get("/dashboard", userController.getDashboard)
  .get("/submit", userController.getSubmit)
  .post("/submit", userController.postSubmit)
  .get("/profile", userController.getProfile)
  .get("/reports", userController.getReports)
  .get("/report/:id", userController.getReport);

module.exports = router;
