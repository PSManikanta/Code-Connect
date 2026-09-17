const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT || 587,
  secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const sendEmail = async ({ to, subject, html }) => {
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.warn('SMTP configuration is incomplete. Email not sent. Check your .env file.');
    return { success: false, error: 'Email service is not configured.' };
  }

  try {
    const info = await transporter.sendMail({
      from: `"Code Connect" <${process.env.SMTP_USER}>`,
      to,
      subject,
      html,
    });
    return { success: true, data: info };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error };
  }
};

module.exports = { sendEmail };
