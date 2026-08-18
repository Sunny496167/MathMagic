const nodemailer = require('nodemailer');
const config = require('../config/environment');
const logger = require('./logger');

let transporter = null;

if (config.mail.user && config.mail.pass) {
  transporter = nodemailer.createTransport({
    host: config.mail.host,
    port: config.mail.port,
    secure: config.mail.secure,
    auth: {
      user: config.mail.user,
      pass: config.mail.pass,
    },
  });
} else {
  // Mock transporter for development/testing when SMTP credentials are not configured
  transporter = {
    sendMail: async (options) => {
      logger.info(
        `[MOCK EMAIL] To: ${options.to} | Subject: ${options.subject} | URL sent in body`
      );
      return { messageId: `mock-mail-${Date.now()}` };
    },
  };
}

/**
 * Send password reset email
 */
const sendPasswordResetEmail = async ({ to, resetToken, userName }) => {
  const resetUrl = `${config.clientUrl}/reset-password?token=${resetToken}`;
  const deepLinkUrl = `${config.expoAppScheme}reset-password?token=${resetToken}`;

  const message = {
    from: config.mail.from,
    to,
    subject: 'MathLearn - Password Reset Request',
    text: `Hello ${userName || 'Learner'},\n\nYou requested a password reset. Use the link below to set a new password:\n\n${resetUrl}\n\nOr on mobile: ${deepLinkUrl}\n\nThis link is valid for 1 hour. If you did not request this, please ignore this email.`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 12px;">
        <h2 style="color: #8B5CF6;">MathLearn Password Reset</h2>
        <p>Hello <strong>${userName || 'Learner'}</strong>,</p>
        <p>We received a request to reset your password. Click the button below to choose a new password:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" style="background: linear-gradient(135deg, #8B5CF6, #6366F1); color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Reset Password</a>
        </div>
        <p style="color: #666; font-size: 12px;">If you are on mobile, you can also use this app deep link: <a href="${deepLinkUrl}">${deepLinkUrl}</a></p>
        <p style="color: #999; font-size: 12px;">This link will expire in 1 hour. If you didn't request a password reset, you can safely ignore this email.</p>
      </div>
    `,
  };

  return await transporter.sendMail(message);
};

/**
 * Send email verification code / link
 */
const sendVerificationEmail = async ({ to, verifyToken, userName }) => {
  const verifyUrl = `${config.clientUrl}/verify-email?token=${verifyToken}`;
  const deepLinkUrl = `${config.expoAppScheme}verify-email?token=${verifyToken}`;

  const message = {
    from: config.mail.from,
    to,
    subject: 'MathLearn - Verify your Email Address',
    text: `Hello ${userName || 'Learner'},\n\nWelcome to MathLearn! Please verify your email by clicking the link:\n\n${verifyUrl}\n\nOr on mobile: ${deepLinkUrl}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 12px;">
        <h2 style="color: #10B981;">Welcome to MathLearn! 🎉</h2>
        <p>Hello <strong>${userName || 'Learner'}</strong>,</p>
        <p>Thank you for signing up. Please verify your email to activate all learning features:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${verifyUrl}" style="background: linear-gradient(135deg, #10B981, #059669); color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Verify Email</a>
        </div>
        <p style="color: #666; font-size: 12px;">Mobile app link: <a href="${deepLinkUrl}">${deepLinkUrl}</a></p>
      </div>
    `,
  };

  return await transporter.sendMail(message);
};

module.exports = {
  sendPasswordResetEmail,
  sendVerificationEmail,
};
