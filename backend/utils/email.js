const nodemailer = require('nodemailer');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config({ path: './config.env' });

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
      try {
        // Validate required options
        if (!options.email || !options.subject) {
          throw new Error('Email and subject are required for sending emails');
        }

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

        // Configure email options
        const mailOptions = {
          from: process.env.EMAIL_FROM || 'Tsegsh load tracking system <tdrag301@ltms.io>',
          to: options.email,
          subject: options.subject,
          html: htmlTemplate,
          text: options.message || 'Please use an HTML-compatible email client to view this message.' // Fallback text
        };

        // Send the email
        const info = await this.transporter.sendMail(mailOptions);
        return info;
      } catch (error) {
        console.error('Error sending email:', error);
        throw new Error(`Failed to send email: ${error.message}`);
      }
    }

    async sendPaymentNotification(options) {
      const { email, name, totalLoad, paymentAmount, totalPayment, academicYear, semester, date, isUpdate } = options;
      
      const mailOptions = {
        from: process.env.EMAIL_FROM,
        to: email,
        subject: options.subject || 'Payment Calculation Notification',
        html: `
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
              .payment-details {
                background-color: white;
                border: 1px solid #ddd;
                padding: 15px;
                margin: 15px 0;
                border-radius: 4px;
              }
              .payment-amount {
                font-size: 24px;
                font-weight: bold;
                color: #2e7d32;
                text-align: center;
                margin: 15px 0;
              }
              .info-row {
                display: flex;
                justify-content: space-between;
                margin-bottom: 10px;
                border-bottom: 1px solid #eee;
                padding-bottom: 10px;
              }
              .info-label {
                font-weight: bold;
                color: #555;
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
                <h2>Payment ${isUpdate ? 'Update' : 'Calculation'} Notification</h2>
              </div>
              <div class="content">
                <p>Hello ${name},</p>
                <p>This is to inform you that your payment has been ${isUpdate ? 'updated' : 'calculated'} in the Load Tracking Management System.</p>
                
                <div class="payment-details">
                  <div class="payment-amount">ETB ${totalPayment.toLocaleString()}</div>
                  
                  <div class="info-row">
                    <span class="info-label">Academic Year:</span>
                    <span>${academicYear}</span>
                  </div>
                  
                  <div class="info-row">
                    <span class="info-label">Semester:</span>
                    <span>${semester}</span>
                  </div>
                  
                  <div class="info-row">
                    <span class="info-label">Total Load:</span>
                    <span>${totalLoad}</span>
                  </div>
                  
                  <div class="info-row">
                    <span class="info-label">Rate per Load:</span>
                    <span>ETB ${paymentAmount}</span>
                  </div>
                  
                  <div class="info-row">
                    <span class="info-label">Calculation Date:</span>
                    <span>${date}</span>
                  </div>
                </div>
                
                <p>You can view more details by logging into your LTMS account and checking your dashboard.</p>
                
                <div style="text-align: center;">
                  <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard" class="button" style="color: white;">View Dashboard</a>
                </div>
                
                <p>Best regards,<br>LTMS Finance Team</p>
              </div>
              <div class="footer">
                <p>This is an automated message, please do not reply to this email.</p>
                <p>© ${new Date().getFullYear()} Load Tracking Management System - Dire Dawa University</p>
              </div>
            </div>
          </body>
          </html>
        `
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
