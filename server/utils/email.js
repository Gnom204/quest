const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "74.125.200.109",
  port: process.env.SMTP_PORT,
  secure: process.env.SMTP_PORT == 465, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  tls: {
    rejectUnauthorized: false,
    servername: "smtp.gmail.com",
  },
  family: 4,

  connectionTimeout: 60000, // 1 minute
  greetingTimeout: 30000,
  socketTimeout: 60000,
  debug: true,
  logger: true,
});

const sendEmail = async (to, subject, text) => {
  try {
    const mailOptions = {
      from: process.env.SMTP_USER,
      to,
      subject,
      text,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent:", info.messageId);
  } catch (error) {
    console.error("Error sending email:", error);
  }
};

module.exports = { sendEmail };
