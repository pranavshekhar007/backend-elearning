const nodemailer = require("nodemailer");
exports.sendResponse = (res, code, message, data) => {
    if (data) {
      data = data;
    }
    return res.status(code).json(data);
  };
exports.generateOTP = () => {
    const min = 1000;
    const max = 9999;
    return Math.floor(Math.random() * (max - min + 1)) + min;
};
exports.sendMail = async (Email, subject) => {
  let transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true, // true for 465, false for other ports
    auth: {
      user: "tpaunikar92@gmail.com", // generated ethereal user
      pass: "yapnmzshchqbvnwy", // generated ethereal password
    },
  });
  const info = await transporter.sendMail({
    from: `"DST Learning" <"tpaunikar92@gmail.com">`,
    to: Email,
    subject:subject,
    text: subject
  });
  return info;
};