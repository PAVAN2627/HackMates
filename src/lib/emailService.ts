/**
 * Email Service using Resend API via Serverless Function
 * Sends beautiful HTML emails for various notifications
 */

interface EmailData {
  to: string;
  subject: string;
  html: string;
  type: string;
}

async function sendEmail(data: EmailData): Promise<boolean> {
  try {
    // For localhost, call Resend API directly (for testing only)
    // In production, use serverless function
    if (window.location.origin.includes('localhost')) {
      console.log('🔧 Development mode: Calling Resend API directly');
      
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer re_DntSHpGb_FK73EPMhpHLVfHZhs4byAAED',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'HackMates <onboarding@resend.dev>',
          to: data.to,
          subject: data.subject,
          html: data.html,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        console.log('✅ Email sent successfully to:', data.to);
        return true;
      } else {
        console.error('❌ Email sending failed:', result);
        console.error('❌ Full error details:', {
          status: response.status,
          statusText: response.statusText,
          result: result
        });
        return false;
      }
    }

    // Production: Use serverless function
    const apiUrl = `${window.location.origin}/api/send-email`;

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (response.ok && result.success) {
      console.log('Email sent successfully to:', data.to);
      return true;
    } else {
      console.error('Email sending failed:', result);
      return false;
    }
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
}

/**
 * Send Welcome Email on Registration
 */
export async function sendWelcomeEmail(
  userEmail: string,
  userName: string,
  password: string
): Promise<boolean> {
  const appUrl = window.location.origin.includes('localhost') 
    ? 'https://hackmates.vercel.app' 
    : window.location.origin;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
    .credentials { background: white; padding: 20px; border-left: 4px solid #667eea; margin: 20px 0; border-radius: 5px; }
    .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
    .features { list-style: none; padding: 0; }
    .features li { padding: 10px 0; padding-left: 30px; position: relative; }
    .features li:before { content: "✅"; position: absolute; left: 0; }
    .footer { text-align: center; color: #666; font-size: 12px; margin-top: 30px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🚀 Welcome to HackMates!</h1>
      <p>India's Premier Hackathon Community Platform</p>
    </div>
    <div class="content">
      <h2>Hello ${userName}! 👋</h2>
      <p>Your account has been successfully created. Welcome to the HackMates community!</p>
      
      <div class="credentials">
        <h3>📧 Your Login Credentials</h3>
        <p><strong>Email:</strong> ${userEmail}</p>
        <p><strong>Password:</strong> ${password}</p>
        <p style="color: #e74c3c; font-size: 14px;">⚠️ Please save these credentials securely and change your password after first login.</p>
      </div>

      <h3>🎯 What's Next?</h3>
      <ul class="features">
        <li>Discover amazing hackathons across India</li>
        <li>Find perfect teammates with AI-powered matching</li>
        <li>Build winning projects with reliable teams</li>
        <li>Earn trust badges and build your reputation</li>
        <li>Get personalized guidance from AI assistant</li>
      </ul>

      <center>
        <a href="${appUrl}/hackathons" class="button">🚀 Get Started Now</a>
      </center>

      <p style="margin-top: 30px;">Happy Hacking!<br><strong>Team HackMates</strong></p>
    </div>
    <div class="footer">
      <p>This is an automated email. Please do not reply to this message.</p>
      <p>© 2025 HackMates. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
  `.trim();

  return sendEmail({
    to: userEmail,
    subject: '🚀 Welcome to HackMates - Your Account is Ready!',
    html: html,
    type: 'welcome'
  });
}

/**
 * Send Announcement Notification Email
 */
export async function sendAnnouncementEmail(
  userEmail: string,
  userName: string,
  hackathonTitle: string,
  announcementTitle: string,
  announcementContent: string,
  hackathonId: string
): Promise<boolean> {
  const appUrl = window.location.origin.includes('localhost') 
    ? 'https://hackmates.vercel.app' 
    : window.location.origin;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
    .announcement { background: white; padding: 20px; border-left: 4px solid #f5576c; margin: 20px 0; border-radius: 5px; }
    .button { display: inline-block; background: #f5576c; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
    .footer { text-align: center; color: #666; font-size: 12px; margin-top: 30px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>📢 New Announcement</h1>
      <p>${hackathonTitle}</p>
    </div>
    <div class="content">
      <h2>Hello ${userName}! 👋</h2>
      <p>There's a new announcement in your hackathon:</p>
      
      <div class="announcement">
        <h3>${announcementTitle}</h3>
        <p>${announcementContent}</p>
      </div>

      <center>
        <a href="${appUrl}/hackathons/${hackathonId}?tab=announcements" class="button">📢 View Full Announcement</a>
      </center>

      <p style="margin-top: 30px;">Stay updated!<br><strong>Team HackMates</strong></p>
    </div>
    <div class="footer">
      <p>This is an automated email. Please do not reply to this message.</p>
      <p>© 2025 HackMates. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
  `.trim();

  return sendEmail({
    to: userEmail,
    subject: `📢 New Announcement: ${hackathonTitle}`,
    html: html,
    type: 'announcement'
  });
}

/**
 * Send Team Addition Notification Email
 */
export async function sendTeamAdditionEmail(
  userEmail: string,
  userName: string,
  hackathonTitle: string,
  teamName: string,
  addedBy: string,
  hackathonId: string
): Promise<boolean> {
  const appUrl = window.location.origin.includes('localhost') 
    ? 'https://hackmates.vercel.app' 
    : window.location.origin;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
    .team-info { background: white; padding: 20px; border-left: 4px solid #4facfe; margin: 20px 0; border-radius: 5px; }
    .button { display: inline-block; background: #4facfe; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
    .features { list-style: none; padding: 0; }
    .features li { padding: 8px 0; padding-left: 30px; position: relative; }
    .features li:before { content: "✅"; position: absolute; left: 0; }
    .footer { text-align: center; color: #666; font-size: 12px; margin-top: 30px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎉 You're In a Team!</h1>
      <p>Great news from HackMates</p>
    </div>
    <div class="content">
      <h2>Hello ${userName}! 👋</h2>
      <p>Congratulations! You've been added to a team for an exciting hackathon.</p>
      
      <div class="team-info">
        <h3>📋 Team Details</h3>
        <p><strong>Hackathon:</strong> ${hackathonTitle}</p>
        <p><strong>Team Name:</strong> ${teamName}</p>
        <p><strong>Added by:</strong> ${addedBy}</p>
      </div>

      <h3>🚀 What's Next?</h3>
      <ul class="features">
        <li>View your team members and their profiles</li>
        <li>Start collaborating on your project idea</li>
        <li>Commit to the team contract to lock in</li>
        <li>Build something amazing together!</li>
      </ul>

      <center>
        <a href="${appUrl}/hackathons/${hackathonId}?tab=teams" class="button">👥 View Your Team</a>
      </center>

      <p style="margin-top: 30px;">Good luck with your hackathon!<br><strong>Team HackMates</strong></p>
    </div>
    <div class="footer">
      <p>This is an automated email. Please do not reply to this message.</p>
      <p>© 2025 HackMates. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
  `.trim();

  return sendEmail({
    to: userEmail,
    subject: `🎉 You've been added to ${teamName} in ${hackathonTitle}!`,
    html: html,
    type: 'team_addition'
  });
}
