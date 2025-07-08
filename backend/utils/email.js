const nodemailer = require('nodemailer');

// Create transporter for sending emails
const createTransporter = () => {
  return nodemailer.createTransporter({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: process.env.EMAIL_PORT || 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

// Send login notification email
const sendLoginNotification = async (userEmail, userAgent, ipAddress) => {
  try {
    // Only send if email configuration is set up
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS || !process.env.EMAIL_TO) {
      console.log('Email configuration not set up. Skipping login notification.');
      return;
    }

    const transporter = createTransporter();
    
    const mailOptions = {
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to: process.env.EMAIL_TO,
      subject: 'New Login to DTC-IBS System',
      html: `
        <h2>New Login Detected</h2>
        <p><strong>User Email:</strong> ${userEmail}</p>
        <p><strong>Login Time:</strong> ${new Date().toLocaleString()}</p>
        <p><strong>IP Address:</strong> ${ipAddress || 'Unknown'}</p>
        <p><strong>User Agent:</strong> ${userAgent || 'Unknown'}</p>
        <hr>
        <p><em>This is an automated notification from the DTC-IBS system.</em></p>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log('Login notification email sent successfully');
  } catch (error) {
    console.error('Failed to send login notification email:', error);
    // Don't throw error to avoid breaking the login process
  }
};

module.exports = {
  sendLoginNotification
}; 