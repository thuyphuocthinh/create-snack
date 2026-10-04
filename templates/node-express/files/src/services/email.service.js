"use strict";

const OtpService = require("./otp.service");
const TemplateService = require("./template.service");
const transporter = require("../config/config.nodemailer");
const { replacePlaceholder } = require("../utils/template.html");
const { NotFoundError, BadRequestError } = require("../core/error.response");

class EmailService {
  static sendEmailUsingThirdParty({
    toEmail = null,
    html = null,
    subject = "Xác thực tài khoản email của bạn",
  }) {
    try {
      // send email using nodemailer
      transporter.sendMail(
        {
          from: "ShopDEV <thuyphuocthinhtpt1@gmail.com>",
          to: toEmail,
          subject,
          html,
        },
        (error, info) => {
          if (error) {
            throw new BadRequestError("Failed to send email");
          }
          console.log("Message sent: %s", info.messageId);
        }
      );
    } catch (error) {
      throw new BadRequestError("Failed to send email");
    }
  }

  static async sendEmail({ email = null }) {
    try {
      // get token from otp
      const otp = await OtpService.newOtp({ email });

      // get template
      const template = await TemplateService.getTemplate({
        template_name: "HTML_EMAIL_TOKEN",
      });

      if (!template) {
        throw new NotFoundError("Template not found");
      }

      // replace placeholder
      const html = replacePlaceholder(template.template_html, {
        verify_link: `http://localhost:3000/api/v1/user/verify-email?email=${email}&token=${otp.otp_token}`,
      });

      // send email
      EmailService.sendEmailUsingThirdParty({
        toEmail: email,
        html: html,
        subject: "Xác thực tài khoản email của bạn",
      });

      return {
        message: "Email sent successfully, please check your email",
      };
    } catch (error) {
      throw new BadRequestError("Failed to send email");
    }
  }
}

module.exports = EmailService;
