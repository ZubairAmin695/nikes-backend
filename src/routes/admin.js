const { admin_auth } = require("../middlewares/admin_auth");
const { authenticate } = require("../middlewares/authenticate");
const express = require("express");
const router = express.Router();

const {
  admin_login,
  userList,
  approveWithdraw,
  dashboard,
  is_withdraw,
} = require("../controller/admin/admin");
router.post("/login", admin_login);
router.post("/userList", admin_auth, userList);
router.post("/approveWithdraw", admin_auth, approveWithdraw);
router.post("/dashboard", admin_auth, dashboard);
router.post("/is_withdraw", admin_auth, is_withdraw);

module.exports = router;
