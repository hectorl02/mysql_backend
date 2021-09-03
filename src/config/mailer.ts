const nodemailer = require("nodemailer");
// create reusable transporter object using the default SMTP transport
export const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true, // true for 465, false for other ports
  auth: {
    user: "hector840219@gmail.com", // generated ethereal user
    pass: "ikpvyoowtqsaujjf", // generated ethereal password
  },
});

transporter
  .verify()
  .then(() => {
    console.log("listo para email");
  })
  .catch((err) => {});
