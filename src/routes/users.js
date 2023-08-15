var express = require("express");
var router = express.Router();
const { authenticate } = require("../middlewares/authenticate");
const {
  signup,
  login,
  resetPassword,
  verifyOtpAndUpdatePassword,
  verifyOtpForLogin,
  getBalance,
  withdraw_balance,
  send_trx,
  getComission,
  checkOut,
  customerSupport,
  redeem_points,
  my_redemtion,
} = require("../controller/User/user");

// all  post routes  in one line
router.route("/signup").post(signup);
router.route("/login").post(login);
router.route("/reset-password").post(resetPassword);
router
  .route("/verify-otp-and-update-password")
  .post(verifyOtpAndUpdatePassword);

router.route("/verify-otp-for-login").post(verifyOtpForLogin);

router.route("/get-balance").post(authenticate, getBalance);
router.route("/withdraw-balance").post(authenticate, withdraw_balance);
router.route("/send-trx").post(authenticate, send_trx);
router.route("/get-comission").post(authenticate, getComission);

router.route("/checkout").post(authenticate, checkOut);
router.route("/customer-support").post(authenticate, customerSupport);
router.route("/redeem-points").post(authenticate, redeem_points);
router.route("/my-redemtion").post(authenticate, my_redemtion);

module.exports = router;
