const { User, validateUser } = require("../../models/user");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const {
  SEND_EMAIL,
  SEND_EMAIL_SEND_BLUE,
  sendEmail,
} = require("../../utils/utils");
const { Withdraw } = require("../../models/withdraw");
const {
  setupTron,
  createWallet,
  getBalance,
  withdraw,
  sendTrx,
} = require("../../utils/wallet");
// signup controller

exports.signup = async (req, res) => {
  try {
    console.log(req.body);
    const { error } = validateUser(req.body);
    if (error)
      return res.status(400).json({
        code: 400,
        message: error.details[0].message.replace(/"/g, ""),
      });

    const { full_name, email, password, referral_of } = req.body;
    var existing_user = await User.findOne({ email });
    if (existing_user) {
      return res.status(400).json({
        code: 400,
        message: "User already exists",
      });
    }

    // haskpass
    const salt = await bcrypt.genSalt(10);
    var hashedPassword = await bcrypt.hash(password, salt);

    const wallet = await createWallet();
    console.log(wallet);

    // generate 6 digit otp and send to user email

    var otp = Math.floor(100000 + Math.random() * 900000);

    // write email body here html and css design

    var subject = "One Time Password (OTP)";
    var email_body = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Reset Password</title>
          <style>
            body {
              margin: 0;
              padding: 0;
              font-family: Arial, sans-serif;
              background-color: #f2f2f2;
            }
            .container {
              max-width: 500px;
              margin: 0 auto;
              padding: 20px;
              border-radius: 10px;
              background-color: white;
              box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
            }
            h1 {
              text-align: center;
              color: #ff4d4d;
            }
            h2 {
              text-align: center;
              color: #ff4d4d;
              margin-top: 10px;
            }
            p {
              text-align: center;
              margin-top: 20px;
            }
            .otp {
              font-weight: bold;
              color: #ff4d4d;
              font-size: 18px;
            }
            .user{
                font-weight: bold;
                font-size: 20px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>Hello</h1><span class="user">${full_name}</span>
            <h2>Use This To Login</h2>
            <p>Your One-Time Password (OTP) is: <span class="otp">${otp}</span></p>
          </div>
        </body>
        </html>
        `;

    await sendEmail(email, subject, email_body, full_name);

    // create new user
    var user = new User({
      full_name,
      email,
      password: hashedPassword,
      walletAddress: wallet.address ? wallet.address : {},
      privateKey: wallet.privateKey ? wallet.privateKey : "",
      publicKey: wallet.address.base58 ? wallet.address.base58 : "",
      login_otp: otp,
    });

    // save user to database
    user = await user.save();
    if (!!referral_of) {
      user.referral_of = referral_of;
      await user.save();
    }
    const token = jwt.sign(
      {
        _id: user._id,
        full_name: user.full_name,
        email: user.email,
        is_admin: false,
        public_key: user.publicKey,
      },
      process.env.JWT_SECRET || "secret"
    );

    // save token to cookie

    // send response

    return res
      .cookie("jwt", token, { httpOnly: true, secure: true, maxAge: 3600000 })
      .status(200)
      .json({
        code: 200,
        message: "Please Check your Email for Account Activation",
      });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

// login controller

exports.login = async (req, res) => {
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

    // compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({
        code: 400,
        message: "Invalid credentials",
      });
    }

    if (user.is_verified == false) {
      return res.status(400).json({
        code: 400,
        message: "Please Activate Your Account First",
      });
    }

    // generate token

    const token = jwt.sign(
      {
        _id: user._id,
        full_name: user.full_name,
        email: user.email,
        is_admin: false,
        public_key: user.publicKey,
      },
      process.env.JWT_SECRET || "secret"
    );

    // store token in cookie

    // send response

    // generate 6 digit otp and send to user email

    // var otp = Math.floor(100000 + Math.random() * 900000);

    // user.login_otp = otp;
    // await user.save();

    // write email body here html and css design

    // var subject = "One Time Password (OTP)";
    // var email_body = `
    //     <!DOCTYPE html>
    //     <html>
    //     <head>
    //       <title>Reset Password</title>
    //       <style>
    //         body {
    //           margin: 0;
    //           padding: 0;
    //           font-family: Arial, sans-serif;
    //           background-color: #f2f2f2;
    //         }
    //         .container {
    //           max-width: 500px;
    //           margin: 0 auto;
    //           padding: 20px;
    //           border-radius: 10px;
    //           background-color: white;
    //           box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
    //         }
    //         h1 {
    //           text-align: center;
    //           color: #ff4d4d;
    //         }
    //         h2 {
    //           text-align: center;
    //           color: #ff4d4d;
    //           margin-top: 10px;
    //         }
    //         p {
    //           text-align: center;
    //           margin-top: 20px;
    //         }
    //         .otp {
    //           font-weight: bold;
    //           color: #ff4d4d;
    //           font-size: 18px;
    //         }
    //         .user{
    //             font-weight: bold;
    //             font-size: 20px;
    //         }
    //       </style>
    //     </head>
    //     <body>
    //       <div class="container">
    //         <h1>Hello</h1><span class="user">${user.full_name}</span>
    //         <h2>Use This To Login</h2>
    //         <p>Your One-Time Password (OTP) is: <span class="otp">${otp}</span></p>
    //       </div>
    //     </body>
    //     </html>
    //     `;

    // await sendEmail(email, subject, email_body, user.full_name);

    return res
      .cookie("jwt", token, { httpOnly: true, secure: true, maxAge: 3600000 })
      .status(200)
      .json({
        code: 200,
        message: "Login successful",
        token,
        user,
      });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

// reset password controller

exports.resetPassword = async (req, res) => {
  try {
    var { email } = req.body;
    var user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({
        code: 400,
        message: "User does not exist",
      });
    }

    // generate 6 digit otp and send to user email

    var otp = Math.floor(100000 + Math.random() * 900000);

    user.otp = otp;
    await user.save();

    // write email body here html and css design

    var subject = "Reset Password";
    var email_body = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Reset Password</title>
      <style>
        body {
          margin: 0;
          padding: 0;
          font-family: Arial, sans-serif;
          background-color: #f2f2f2;
        }
        .container {
          max-width: 500px;
          margin: 0 auto;
          padding: 20px;
          border-radius: 10px;
          background-color: white;
          box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        }
        h1 {
          text-align: center;
          color: #ff4d4d;
        }
        h2 {
          text-align: center;
          color: #ff4d4d;
          margin-top: 10px;
        }
        p {
          text-align: center;
          margin-top: 20px;
        }
        .otp {
          font-weight: bold;
          color: #ff4d4d;
          font-size: 18px;
        }
        .user{
            font-weight: bold;
            font-size: 20px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>Hello</h1><span class="user">${user.full_name}</span>
        <h2>Reset Password</h2>
        <p>Your One-Time Password (OTP) is: <span class="otp">${otp}</span></p>
        <p>Use this OTP to reset your password on this page or click the button below</p>
      </div>
    </body>
    </html>
    `;

    await sendEmail(email, subject, email_body, user.full_name);

    return res.status(200).json({
      code: 200,
      message: "OTP sent to email",
    });

    // save otp to database
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

// verify otp and update password controller

exports.verifyOtpAndUpdatePassword = async (req, res) => {
  try {
    var { email, otp, password, confirm_password } = req.body;

    if (!password || !confirm_password || !otp || !email) {
      return res.status(400).json({
        code: 400,
        message: "All fields are required",
      });
    }

    if (password !== confirm_password) {
      return res.status(400).json({
        code: 400,
        message: "Passwords do not match",
      });
    }

    var user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({
        code: 400,
        message: "User does not exist",
      });
    }

    if (user.otp.toString() !== otp.toString()) {
      return res.status(400).json({
        code: 400,
        message: "Invalid OTP",
      });
    }

    // hash password

    const salt = await bcrypt.genSalt(10);
    var hashedPassword = await bcrypt.hash(password, salt);
    user.password = hashedPassword;
    user.otp = 0;
    await user.save();

    return res.status(200).json({
      code: 200,
      message: "Reset password successful - login to continue",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
// chnage passwod

exports.verifyOtpForLogin = async (req, res) => {
  try {
    var { email, otp } = req.body;

    var user = await User.findOne({ email }).select("-password -privateKey");
    if (!user) {
      return res.status(400).json({
        code: 400,
        message: "User does not exist",
      });
    }

    if (user.login_otp.toString() !== otp.toString()) {
      return res.status(400).json({
        code: 400,
        message: "Invalid OTP",
      });
    }

    const token = jwt.sign(
      {
        _id: user._id,
        full_name: user.full_name,
        email: user.email,
        is_admin: false,
      },
      process.env.JWT_SECRET || "secret"
    );

    user.login_otp = 0;
    user.is_verified = true;
    await user.save();

    return res.status(200).json({
      code: 200,
      message: "Login successful",
      user: user,
      token: token,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

// get balance

exports.getBalance = async (req, res) => {
  try {
    var user = await User.findById(req.user._id);

    if (!user) {
      return res.status(400).json({
        code: 400,
        message: "User does not exist",
      });
    }

    var address = user.walletAddress;

    var balance = await getBalance(address.base58);
    const product_comission = user.product_commission;

    return res.status(200).json({
      code: 200,
      message: "Balance fetched successfully",
      balance: balance + product_comission,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

// withdraw  balnce

exports.withdraw_balance = async (req, res) => {
  try {
    var user = await User.findById(req.user._id);

    if (!user) {
      return res.status(400).json({
        code: 400,
        message: "User does not exist",
      });
    }

    // check if withdrw is open

    var withdraw_avail = await Withdraw.findOne();
    if (!withdraw_avail.is_approved) {
      return res.status(400).json({
        code: 400,
        message: "Withdraw is Not Availble yet",
      });
    }

    var address = user.walletAddress;
    var private_key = user.privateKey;
    var { code, message } = await withdraw(
      req.body.address,
      req.body.amount,
      private_key
    );

    if (code !== 200) {
      return res.status(code).json({
        code: code,
        message: message,
      });
    }

    user.product_commission = 0;
    await user.save();

    return res.status(200).json({
      code: 200,
      message: "Withdraw successful",
    });
  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

// send trx

exports.send_trx = async (req, res) => {
  try {
    var user = await User.findById(req.user._id);

    if (!user) {
      return res.status(400).json({
        code: 400,
        message: "User does not exist",
      });
    }

    // check if withdrw is open

    var withdraw_avail = await Withdraw.findOne();
    if (!withdraw_avail.is_approved && !user.is_withdraw) {
      return res.status(400).json({
        code: 400,
        message: "Withdraw is Not Availble yet",
      });
    }

    var address = user.walletAddress;
    var private_key = user.privateKey;
    var toAdress = req.body.toAdress;

    var response = await sendTrx(toAdress, address.base58, private_key);
    return res.status(200).json({
      code: 200,
      message: response,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

exports.getComission = async (req, res) => {
  try {
    var user = await User.findById(req.user._id);

    var existing_referral = await User.find({ referral_of: user._id });
    console.log(existing_referral);

    // send response

    return res.status(200).json({
      code: 200,
      message: "Successfully Fetched",
      comission: existing_referral.length,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

// check out
exports.checkOut = async (req, res) => {
  try {
    var user = await User.findById(req.user._id);

    // if user has already checked out in 24 hours then dont allow
    if (user.last_checkout_date) {
      const lastCheckoutDate = user.last_checkout_date;
      const currentTime = new Date();

      const hoursDifference = Math.abs(currentTime - lastCheckoutDate) / 36e5;
      if (hoursDifference < 24) {
        return res.status(400).json({
          code: 400,
          message: `Last checkout was ${(
            Math.abs(currentTime - lastCheckoutDate) / 3600000
          ).toFixed(1)} hours agos`,
        });
      }
    }

    // check if user has enough balance
    const balance = await getBalance(user.walletAddress.base58);
    if (balance < req.body.amount) {
      return res
        .status(400)
        .json({ code: 400, message: "Insufficient balance" });
    }

    const profit = req.body.amount * 0.1;
    user.product_commission += profit;

    user.last_checkout_date = new Date();
    await user.save();

    // Send the response
    return res.status(200).json({ code: 200, message: "Checkout successful" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

exports.customerSupport = async (req, res) => {
  try {
    var user = await User.findById(req.user._id);

    const subject = req.body.subject;
    const content = req.body.content;

    var email_body = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Reset Password</title>
      <style>
        body {
          margin: 0;
          padding: 0;
          font-family: Arial, sans-serif;
          background-color: #f2f2f2;
        }
        .container {
          max-width: 500px;
          margin: 0 auto;
          padding: 20px;
          border-radius: 10px;
          background-color: white;
          box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        }
        h1 {
          text-align: center;
          color: #ff4d4d;
        }
        h2 {
          text-align: center;
          color: #ff4d4d;
          margin-top: 10px;
        }
        p {
          text-align: center;
          margin-top: 20px;
        }
        .otp {
          font-weight: bold;
          color: #ff4d4d;
          font-size: 18px;
        }
        .user{
            font-weight: bold;
            font-size: 20px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div><h1>This mail was sent from</h1><span class="user">${user.full_name}</span></div>
        <div><h2>His Email is: ${user.email}</h2></div>
        <div><h2>${subject}</h2></div>
        <div><p>${content}</p></div>
      </div>
    </body>
    </html>
    `;

    await sendEmail("diyuswag52@gmail.com", subject, email_body);

    // Send the response
    return res
      .status(200)
      .json({ code: 200, message: "Mail sent successfully" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
