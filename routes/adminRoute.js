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
  .put("/reports/update/:id", adminController.updateReport)
  .get("/reports/:id", adminController.getReport)
  .post("/reports/:id", adminController.postReport)
  .delete("/reports/:id", adminController.deleteReport)
  .get("/dashboard", adminController.getDashboard)
  .post("/profile/changepassword", adminController.changePassword)
  .get("/profile", adminController.getProfile)
  .get("/users", adminController.getUsers)
  .get("/users/:id", adminController.getUser)
  .delete("/users/:id", adminController.deleteUser);

module.exports = router;
