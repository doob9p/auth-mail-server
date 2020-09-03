import nodemailer from "nodemailer";

function sendMail({ from, to, subject, text }) {
  return new Promise(async (resolve, reject) => {
    try {
      if (!to) {
        return reject("Required to");
      }

      if (!subject) {
        return reject("Required subject");
      }

      if (!text) {
        return reject("Required text");
      }

      const transporter = nodemailer.createTransport({
        service: "gmail",
        port: 465,
        secure: true,
        auth: {
          user: process.env.MAIL_USER,
          pass: process.env.MAIL_PASS,
        },
      });

      const info = await transporter.sendMail({
        from: from || `"Brook🥳" <mail@abc.com>`,
        to,
        subject,
        text: `${text}`,
      });

      resolve(info);
    } catch (e) {
      console.log(e);
    }
  });
}

export default { sendMail };
