"use strict";

const nodemailer = require("nodemailer");
require("dotenv").config();

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: true,
  auth: {
    user: process.env.AWS_EMAIL_APP_USER,
    pass: process.env.AWS_EMAIL_APP_PASSWORD,
  },
});

module.exports = transporter;
