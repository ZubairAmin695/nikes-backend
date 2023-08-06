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

module.exports = {
  SEND_EMAIL,
  SEND_EMAIL_SEND_BLUE,
  sendEmail,
};
