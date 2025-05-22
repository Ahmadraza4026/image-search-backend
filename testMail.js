import transporter from './src/utils/mailer.js';

const sendTestEmail = async () => {
  try {
    const info = await transporter.sendMail({
      from: '"Test" <ayazjutt126@@gmail.com>',
      to: 'ahmadrazaj001@gmail.com',
      subject: 'Nodemailer Test',
      text: 'This is a test email from Nodemailer setup.',
    });

    console.log('Email sent:', info.messageId);
  } catch (err) {
    console.error('Email send failed:', err);
  }
};

sendTestEmail();
