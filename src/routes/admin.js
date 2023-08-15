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
  getBalance,
  list_redeem,
  approve_redeem,
} = require("../controller/admin/admin");
router.post("/login", admin_login);
router.post("/userList", admin_auth, userList);
router.post("/approveWithdraw", admin_auth, approveWithdraw);
router.post("/dashboard", admin_auth, dashboard);
router.post("/is_withdraw", admin_auth, is_withdraw);
router.post("/getBalance", admin_auth, getBalance);
router.post("/list_redeem", admin_auth, list_redeem);
router.post("/approve_redeem", admin_auth, approve_redeem);

module.exports = router;
