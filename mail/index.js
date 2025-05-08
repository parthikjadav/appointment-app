const { env } = require("../constants");
const nodemailer = require("nodemailer");
const template = require("./template");

const transporter = nodemailer.createTransport({
    service: "Gmail",
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
        user: env.APP_EMAIL,
        pass: env.APP_PASSWORD,
    },
});

const sendMail = async (email, subject, msg) => {
    try {
        const mailOptions = {
            from: env.APP_EMAIL,
            to: email,
            subject,
            html: template(msg),
        }

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error("Error sending email: ", error);
            } else {
                console.log("Email sent: ", info.response);
            }
        });
    } catch (error) {
        console.error("Error sending email: ", error.message);
    }
}

module.exports = sendMail;