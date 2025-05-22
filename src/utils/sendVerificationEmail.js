import nodemailer from 'nodemailer';
import '../config/env.js';

const baseUrl = process.env.CLIENT_URL || 'http://localhost:5173';

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false, // Use TLS
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// Verification Email
export const sendVerificationEmail = async (to, token) => {
  try {
    const url = `${baseUrl}/verify-email?token=${token}`;
    await transporter.sendMail({
      from: process.env.SMTP_FROM || `"ImageApp Support" <${process.env.SMTP_USER}>`,
      to,
      subject: 'Verify your email',
      html: `
        <p>Hello,</p>
        <p>Thank you for registering. Please verify your email address by clicking the link below:</p>
        <a href="${url}">Verify Email</a>
        <p>This link will expire soon for your security.</p>
      `,
    });
  } catch (err) {
    console.error('❌ Error sending verification email:', err);
    throw new Error('Could not send verification email');
  }
};
