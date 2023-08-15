const SEND_EMAIL = async (receiver, subject, email_body) => {
  const sg_mail = require("@sendgrid/mail");
  var EMAIL_API_KEY =
    process.env.EMAIL_API_KEY ||
    "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";
  sg_mail.setApiKey(EMAIL_API_KEY);
  const message = {
    to: receiver,
    from: "Secure <ding32394@gmail.com>",
    fromname: "Secure",
    subject: subject,
    text: email_body,
    html: email_body,
  };
  const result = await sg_mail
    .send(message)
    .then((res) => {
      console.log("Email Sent");
      return res;
    })
    .catch((err) => {
      console.log("Email did not  Send", err);
      return err;
    });
  return result;
};

// send email using sendblue

const SEND_EMAIL_SEND_BLUE = async (
  receiver,
  subject,
  email_body,
  receiver_name
) => {
  const SibApiV3Sdk = require("sib-api-v3-sdk");
  let defaultClient = SibApiV3Sdk.ApiClient.instance;

  let apiKey = defaultClient.authentications["api-key"];
  apiKey.apiKey = process.env.API_KEY;

  let apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();

  let sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();

  sendSmtpEmail.subject = subject;
  sendSmtpEmail.htmlContent = email_body;

  sendSmtpEmail.sender = {
    name: "Crypt Waulet",
    email: "ghulammohiodin321@gmil.com",
  };
  sendSmtpEmail.to = [{ email: receiver, name: receiver_name }];

  apiInstance.sendTransacEmail(sendSmtpEmail).then(
    function (data) {
      console.log(
        "API called successfully. Returned data: " + JSON.stringify(data)
      );
    },
    function (error) {
      console.error(error);
    }
  );
};

const nodemailer = require("nodemailer");

const sendEmail = async (receiver, subject, email_body) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "Gmail",
      auth: {
        user: process.env.NM_USER,
        pass: process.env.NM_PASSWORD,
      },
    });

    transporter.sendMail({
      from: `Crypto  <${process.env.NM_USER}>`,
      to: receiver,
      subject: subject,
      html: email_body,
    });
  } catch (error) {}
};

const { User, validateUser } = require("../models/user");
const {
  setupTron,
  createWallet,
  getBalance,
  withdraw,
  sendTrx,
} = require("./wallet");
const UPDATE_USER_COMMISSION = async () => {
  try {
    // var balance = await getBalance(address.base58);

    var user_list = await User.find({
      is_admin: false,
    });

    for (let i = 0; i < user_list.length; i++) {
      var current_user = user_list[i];
      var user_commission = current_user.product_commission;

      var last_closing_balance = current_user.last_closing_balance;
      var users_address = current_user.publicKey;
      // get users balance from blockchain
      var user_balance = await getBalance(users_address);
      if (!user_balance) continue;

      // check if user balance is greater than 0 and last closing balance is less than user balance then add commission

      var current_user_deposit = user_balance - last_closing_balance;
      if (
        (current_user_deposit > 0 && current_user_deposit == 30) ||
        current_user_deposit == 50 ||
        current_user_deposit == 100
      ) {
        // get  10% of user deposit as commission
        var commission = (current_user_deposit * 10) / 100;

        // update user balanc
        current_user.last_closing_balance = user_balance;
        current_user.product_commission = user_commission + commission;

        // find  referrer of current user and update his commission

        await current_user.save();

        // find referrer of current user

        if (!!current_user.referral_of) {
          var referrer = await User.findOne({
            _id: current_user.referral_of,
          });
          if (!!referrer) {
            var referrer_commission = referrer.product_commission;
            referrer.product_commission = referrer_commission + commission;
            await referrer.save();
          }
        }
      }
    }
    console.log("User Commission Updated");
  } catch (error) {}
};

module.exports = {
  SEND_EMAIL,
  SEND_EMAIL_SEND_BLUE,
  sendEmail,
  UPDATE_USER_COMMISSION,
};
