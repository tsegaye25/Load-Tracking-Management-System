const nodemailer = require('nodemailer');

class Email {
    constructor() {
      this.transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        auth: {
          user: process.env.EMAIL_USERNAME,
          pass: process.env.EMAIL_PASSWORD,
        },
      });
    }

    async send(options) {
      // Create HTML template for reset password
      const htmlTemplate = `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            .container {
              padding: 20px;
              font-family: Arial, sans-serif;
              max-width: 600px;
              margin: 0 auto;
            }
            .header {
              background-color: #1976d2;
              color: white;
              padding: 20px;
              text-align: center;
              border-radius: 5px 5px 0 0;
            }
            .content {
              padding: 20px;
              background-color: #f5f5f5;
              border: 1px solid #ddd;
            }
            .button {
              display: inline-block;
              padding: 12px 24px;
              background-color: #1976d2;
              color: white;
              text-decoration: none;
              border-radius: 4px;
              margin: 20px 0;
            }
            .footer {
              text-align: center;
              padding: 20px;
              font-size: 12px;
              color: #666;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h2>Reset Your Password</h2>
            </div>
            <div class="content">
              <p>Hello,</p>
              <p>You are receiving this email because you requested to reset your password for your LTMS account.</p>
              <p>Click the button below to reset your password. This link is valid for 10 minutes.</p>
              <div style="text-align: center;">
                <a href="${options.resetURL}" class="button" style="color: white;">Reset Password</a>
              </div>
              <p>If you didn't request a password reset, please ignore this email or contact support if you have concerns.</p>
              <p>Best regards,<br>LTMS Team</p>
            </div>
            <div class="footer">
              <p>This is an automated message, please do not reply to this email.</p>
              <p> ${new Date().getFullYear()} Load Tracking Management System - Dire Dawa University</p>
            </div>
          </div>
        </body>
        </html>
      `;

      const mailOptions = {
        from: 'Tsegsh load tracking system <tdrag301@ltms.io>',
        to: options.email,
        subject: options.subject,
        html: htmlTemplate,
        text: options.message // Keeping the text version as fallback
      };

      await this.transporter.sendMail(mailOptions);
    }

    async sendCourseApprovalNotification({ email, name, approverRole, courses }) {
      const mailOptions = {
        from: process.env.EMAIL_FROM,
        to: email,
        subject: 'Course Approval Notification',
        html: `
          <div class="container">
            <div class="header">
              <h2>Course Approval Notification</h2>
            </div>
            <div class="content">
              <p>Dear ${name},</p>
              <p>Your courses have been approved by the ${approverRole}.</p>
              <p>Approved Courses: ${courses}</p>
              <p>You can now proceed with the next steps in the course management process.</p>
              <p>Best regards,<br>LTMS Team</p>
            </div>
          </div>
        `
      };
      await this.transporter.sendMail(mailOptions);
    }

    async sendNewCourseNotification({ email, name, courseCodes, instructorName }) {
      const mailOptions = {
        from: process.env.EMAIL_FROM,
        to: email,
        subject: 'New Courses Ready for Processing',
        html: `
          <div class="container">
            <div class="header">
              <h2>New Courses for Processing</h2>
            </div>
            <div class="content">
              <p>Dear ${name},</p>
              <p>New courses have been approved and are ready for processing:</p>
              <p>Courses: ${courseCodes}</p>
              <p>Instructor: ${instructorName}</p>
              <p>Please review and process these courses at your earliest convenience.</p>
              <p>Best regards,<br>LTMS Team</p>
            </div>
          </div>
        `
      };
      await this.transporter.sendMail(mailOptions);
    }

    async sendCourseRejectionNotification({ email, name, courseCodes, instructorName, rejectedBy, reason }) {
      const mailOptions = {
        from: process.env.EMAIL_FROM,
        to: email,
        subject: 'Course Rejection Notification',
        html: `
          <div class="container">
            <div class="header">
              <h2>Course Rejection Notification</h2>
            </div>
            <div class="content">
              <p>Dear ${name},</p>
              <p>The following courses for instructor ${instructorName} have been rejected by ${rejectedBy}:</p>
              <p>Courses: ${courseCodes}</p>
              <p>Reason for rejection: ${reason}</p>
              <p>Please review and take necessary action.</p>
              <p>Best regards,<br>LTMS Team</p>
            </div>
          </div>
        `
      };
      await this.transporter.sendMail(mailOptions);
    }
}

module.exports = Email;
