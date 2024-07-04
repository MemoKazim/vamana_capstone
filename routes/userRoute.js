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
  .get("/reports/:id", userController.getReport)
  .get("/reports/:id/all", userController.getAllPort)
  .get("/reports/:id/:port", userController.getPort)

module.exports = router;
