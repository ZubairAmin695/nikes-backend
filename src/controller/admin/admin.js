const { User, validateUser } = require("../../models/user");
const { Withdraw } = require("../../models/withdraw");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { getBalance } = require("../../utils/wallet");
const { Redeem } = require("../../models/redeem");

exports.admin_login = async (req, res) => {
  try {
    // check if user exists

    const { email, password } = req.body;

    const user = await User.findOne({ email });
    console.log(user);
    if (!user) {
      return res.status(400).json({
        code: 400,
        message: "User does not exist",
      });
    }

    if (!user.is_admin) {
      return res.status(400).json({
        code: 400,
        message: "You are not authorized to access this page",
      });
    }

    // compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({
        code: 400,
        message: "Invalid credentials",
      });
    }

    // generate token

    const token = jwt.sign(
      {
        _id: user._id,
        full_name: user.full_name,
        email: user.email,
        is_admin: true,
      },
      process.env.JWT_SECRET || "secret"
    );

    // save token to cookie

    // send response

    return res.cookie("jwt", token).status(200).json({
      code: 200,
      message: "Login successful",
      token: token,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

// user list controller

exports.userList = async (req, res) => {
  try {
    // get all users

    var users = await User.find({ is_admin: false }).select("-password").lean();

    // send response

    var users_promise = users.map(async (user) => {
      var referal_count = await User.countDocuments({
        referral_of: user._id,
      });
      // try {
      //   var balance = await getBalance(user.walletAddress.base58);
      //   user.balance = balance;
      // } catch (error) {
      //   user.balance = 0;
      // }

      user.referal_count = referal_count;

      return user;
    });

    users = await Promise.all(users_promise);

    return res.status(200).json({
      code: 200,
      message: "Success",
      users: users,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

// approve withdraw controller

exports.approveWithdraw = async (req, res) => {
  try {
    var withdraw_ = await Withdraw.findOne({});

    if (!withdraw_) {
      withdraw_ = new Withdraw({
        is_approved: req.body.is_approved,
      });
      withdraw_ = await withdraw_.save();
    } else {
      withdraw_.is_approved = req.body.is_approved;
      withdraw_ = await withdraw_.save();
    }

    var messsage = "";

    if (req.body.is_approved == true) {
      messsage = "Withdraw approved Set to Open";
    } else {
      messsage = "Withdraw approved Set to Closed";
    }

    return res.status(200).json({
      code: 200,
      message: messsage,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

// dashboard api

exports.dashboard = async (req, res) => {
  try {
    // get all users

    const users = await User.countDocuments({ is_admin: false });
    const withdraw = await Withdraw.findOne({});

    // send response

    return res.status(200).json({
      code: 200,
      message: "Success",
      users: users,
      withdraw: withdraw,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

// specifc  user is_withdraw controller

exports.is_withdraw = async (req, res) => {
  try {
    const { is_withdraw, user_id } = req.body;
    const user = await User.findById(user_id);
    if (!user) {
      return res.status(400).json({
        code: 400,
        message: "User does not exist",
      });
    }

    user.is_withdraw = is_withdraw;
    await user.save();

    // send response

    return res.status(200).json({
      code: 200,
      message: "Withdraw status updated for user",
      user: user,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

exports.getBalance = async (req, res) => {
  try {
    var balance = await getBalance(req.body.publicKey);

    return res.status(200).json({
      code: 200,
      message: "Balance fetched successfully",
      balance: balance,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports.list_redeem = async (req, res) => {
  try {
    const redeems = await Redeem.find({}).populate("user").lean();

    return res.status(200).json({
      code: 200,
      message: "Success",
      redeems: redeems,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports.approve_redeem = async (req, res) => {
  try {
    const { redeem_id, request_status } = req.body;

    const redeem = await Redeem.findById(redeem_id);

    if (!redeem) {
      return res.status(400).json({
        code: 400,
        message: "Redeem does not exist",
      });
    }

    redeem.request_status = req.body.request_status;

    if (request_status == "rejected") {
      // foind user and add balance

      var user = await User.findById(redeem.user);
      if (!user) {
        return res.status(400).json({
          code: 400,
          message: "User does not exist",
        });
      } else {
        user.referral_commission += redeem.points;
        await user.save();
      }
    }
    await redeem.save();

    return res.status(200).json({
      code: 200,
      message: "Redeem status updated successfully",
      redeem: redeem,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
