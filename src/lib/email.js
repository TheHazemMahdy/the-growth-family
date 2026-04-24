import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

export const sendWelcomeEmail = async (toEmail, username, baseUrl) => {
  const siteUrl = baseUrl || process.env.NEXTAUTH_URL || 'https://thegrowthfamily.uk';

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: toEmail,
    subject: 'Welcome to The Growth Family!',
    text: `Hello ${username},\n\nWelcome to The Growth Family! We are thrilled to have you join our community.\n\nPlay games, climb the leaderboard, and connect with other members.\n\nBest,\nThe Growth Family Team`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; text-align: center;">
        <h1 style="color: #5cb85c;">Welcome to The Growth Family!</h1>
        <p>Hello <strong>${username}</strong>,</p>
        <p>We are thrilled to have you join our community. Play games, climb the leaderboard, and connect with other members.</p>
        <br/>
        <a href="${siteUrl}" style="display: inline-block; padding: 10px 20px; background-color: #5cb85c; color: white; text-decoration: none; border-radius: 5px;">Visit the Hub</a>
        <br/><br/>
        <p>Best,<br/>The Growth Family Team</p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Welcome email sent to ${toEmail}`);
  } catch (error) {
    console.error('Error sending welcome email:', error);
  }
};

