/**
 * HTML Email Templates for HackMates
 */

export const getWelcomeEmailHTML = (userName: string, userEmail: string, userPassword: string): string => {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f8f9fa;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8f9fa; padding: 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #9333ea 0%, #2563eb 100%); padding: 40px 20px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 28px;">Welcome to HackMates! 🚀</h1>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px;">
              <h2 style="color: #1f2937; margin-top: 0; font-size: 24px;">Hi ${userName}! 👋</h2>
              
              <p style="color: #4b5563; line-height: 1.6; margin: 16px 0;">
                We're thrilled to have you join <strong>India's premier hackathon community platform</strong>! Your account has been successfully created.
              </p>

              <!-- Account Details -->
              <table width="100%" cellpadding="15" cellspacing="0" style="background: linear-gradient(135deg, #f3e8ff 0%, #dbeafe 100%); border-left: 4px solid #9333ea; border-radius: 8px; margin: 24px 0;">
                <tr>
                  <td>
                    <h3 style="color: #1f2937; margin: 0 0 12px 0; font-size: 18px;">📧 Your Account Details</h3>
                    <p style="margin: 8px 0; color: #374151;">
                      <strong>Email:</strong> <span style="color: #2563eb;">${userEmail}</span>
                    </p>
                    <p style="margin: 8px 0; color: #374151;">
                      <strong>Password:</strong> <code style="background: #ffffff; padding: 4px 8px; border-radius: 4px; color: #dc2626; font-family: monospace;">${userPassword}</code>
                    </p>
                    <p style="margin: 12px 0 0 0; font-size: 14px; color: #6b7280;">
                      ⚠️ <em>Please save these credentials securely and change your password after first login.</em>
                    </p>
                  </td>
                </tr>
              </table>

              <!-- Features -->
              <h3 style="color: #1f2937; margin: 24px 0 16px 0; font-size: 20px;">✨ What You Can Do:</h3>
              <ul style="color: #4b5563; line-height: 1.8; padding-left: 20px;">
                <li><strong>🤖 AI Assistant:</strong> Get personalized hackathon guidance</li>
                <li><strong>🛡️ Build Trust:</strong> Earn reliability badges</li>
                <li><strong>⚡ Smart Matching:</strong> Find teammates with perfect synergy</li>
                <li><strong>💬 Real-time Chat:</strong> Connect instantly with team members</li>
                <li><strong>📢 Stay Updated:</strong> Receive announcements and notifications</li>
              </ul>

              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin: 32px 0;">
                <tr>
                  <td align="center">
                    <a href="https://hackmates-mu.vercel.app/hackathons" style="display: inline-block; text-decoration: none; color: #ffffff; background: linear-gradient(135deg, #9333ea 0%, #2563eb 100%); padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">
                      🚀 Explore Hackathons Now
                    </a>
                  </td>
                </tr>
              </table>

              <p style="color: #4b5563; line-height: 1.6; margin: 24px 0 0 0;">
                Happy Hacking! 🎉<br>
                <strong style="color: #1f2937;">The HackMates Team</strong><br>
                <span style="font-size: 14px; color: #6b7280;">Built with ❤️ by NoobcodersIND</span>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background: #f9fafb; padding: 20px 30px; border-top: 1px solid #e5e7eb; text-align: center;">
              <p style="margin: 0; font-size: 14px; color: #6b7280;">
                This email was sent to <strong>${userEmail}</strong> because you registered on HackMates.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
};

/**
 * Welcome email for Google OAuth users (without password)
 */
export const getWelcomeEmailHTMLGoogle = (userName: string, userEmail: string): string => {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f8f9fa;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8f9fa; padding: 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #9333ea 0%, #2563eb 100%); padding: 40px 20px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 28px;">Welcome to HackMates! 🚀</h1>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px;">
              <h2 style="color: #1f2937; margin-top: 0; font-size: 24px;">Hi ${userName}! 👋</h2>
              
              <p style="color: #4b5563; line-height: 1.6; margin: 16px 0;">
                We're thrilled to have you join <strong>India's premier hackathon community platform</strong>! Your account has been successfully created with Google Sign-in.
              </p>

              <!-- Account Details -->
              <table width="100%" cellpadding="15" cellspacing="0" style="background: linear-gradient(135deg, #f3e8ff 0%, #dbeafe 100%); border-left: 4px solid #9333ea; border-radius: 8px; margin: 24px 0;">
                <tr>
                  <td>
                    <h3 style="color: #1f2937; margin: 0 0 12px 0; font-size: 18px;">📧 Account Information</h3>
                    <p style="margin: 8px 0; color: #374151;">
                      <strong>Email:</strong> <span style="color: #2563eb;">${userEmail}</span>
                    </p>
                    <p style="margin: 12px 0 0 0; font-size: 14px; color: #6b7280;">
                      ✅ <em>You're signed in with Google - no password needed!</em>
                    </p>
                  </td>
                </tr>
              </table>

              <!-- Features -->
              <h3 style="color: #1f2937; margin: 24px 0 16px 0; font-size: 20px;">✨ What You Can Do:</h3>
              <ul style="color: #4b5563; line-height: 1.8; padding-left: 20px;">
                <li><strong>🤖 AI Assistant:</strong> Get personalized hackathon guidance</li>
                <li><strong>🛡️ Build Trust:</strong> Earn reliability badges</li>
                <li><strong>⚡ Smart Matching:</strong> Find teammates with perfect synergy</li>
                <li><strong>💬 Real-time Chat:</strong> Connect instantly with team members</li>
                <li><strong>📢 Stay Updated:</strong> Receive announcements and notifications</li>
              </ul>

              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin: 32px 0;">
                <tr>
                  <td align="center">
                    <a href="https://hackmates-mu.vercel.app/hackathons" style="display: inline-block; text-decoration: none; color: #ffffff; background: linear-gradient(135deg, #9333ea 0%, #2563eb 100%); padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">
                      🚀 Explore Hackathons Now
                    </a>
                  </td>
                </tr>
              </table>

              <p style="color: #4b5563; line-height: 1.6; margin: 24px 0 0 0;">
                Happy Hacking! 🎉<br>
                <strong style="color: #1f2937;">The HackMates Team</strong><br>
                <span style="font-size: 14px; color: #6b7280;">Built with ❤️ by NoobcodersIND</span>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background: #f9fafb; padding: 20px 30px; border-top: 1px solid #e5e7eb; text-align: center;">
              <p style="margin: 0; font-size: 14px; color: #6b7280;">
                This email was sent to <strong>${userEmail}</strong> because you registered on HackMates with Google.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
};

export const getTeamAdditionEmailHTML = (
  userName: string,
  userEmail: string,
  hackathonTitle: string,
  teamName: string,
  invitedByName: string,
  hackathonUrl: string
): string => {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f8f9fa;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8f9fa; padding: 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #10b981 0%, #3b82f6 100%); padding: 40px 20px; text-align: center;">
              <div style="font-size: 60px; margin-bottom: 10px;">🎉</div>
              <h1 style="color: #ffffff; margin: 0; font-size: 28px;">You're on a Team!</h1>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px;">
              <h2 style="color: #1f2937; margin-top: 0; font-size: 24px;">Great news, ${userName}! 🚀</h2>
              
              <p style="color: #4b5563; line-height: 1.6; margin: 16px 0; font-size: 17px;">
                <strong style="color: #2563eb;">${invitedByName}</strong> has added you to their team for an exciting hackathon!
              </p>

              <!-- Hackathon Details -->
              <table width="100%" cellpadding="20" cellspacing="0" style="background: linear-gradient(135deg, #fef3c7 0%, #dbeafe 100%); border-left: 4px solid #10b981; border-radius: 8px; margin: 24px 0;">
                <tr>
                  <td>
                    <h3 style="color: #1f2937; margin: 0 0 16px 0; font-size: 20px;">📋 Hackathon Details</h3>
                    <table width="100%" cellpadding="12" cellspacing="0" style="background: #ffffff; border-radius: 6px; margin-bottom: 12px;">
                      <tr>
                        <td>
                          <p style="margin: 0; color: #6b7280; font-size: 12px; font-weight: 600; text-transform: uppercase;">Event</p>
                          <p style="margin: 4px 0 0 0; color: #1f2937; font-size: 18px; font-weight: bold;">${hackathonTitle}</p>
                        </td>
                      </tr>
                    </table>
                    <table width="100%" cellpadding="12" cellspacing="0" style="background: #ffffff; border-radius: 6px;">
                      <tr>
                        <td>
                          <p style="margin: 0; color: #6b7280; font-size: 12px; font-weight: 600; text-transform: uppercase;">Team</p>
                          <p style="margin: 4px 0 0 0; color: #1f2937; font-size: 18px; font-weight: bold;">${teamName}</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- What's Next -->
              <table width="100%" cellpadding="15" cellspacing="0" style="background: #f0fdf4; border: 2px solid #86efac; border-radius: 8px; margin: 24px 0;">
                <tr>
                  <td>
                    <h3 style="color: #166534; margin: 0 0 12px 0; font-size: 18px;">✅ What's Next?</h3>
                    <ol style="color: #15803d; line-height: 1.8; padding-left: 20px; margin: 0;">
                      <li><strong>Review hackathon details</strong> and requirements</li>
                      <li><strong>Connect with your teammates</strong> via chat</li>
                      <li><strong>Plan your project</strong> and divide tasks</li>
                      <li><strong>Check announcements</strong> for important updates</li>
                      <li><strong>Start building</strong> something amazing together!</li>
                    </ol>
                  </td>
                </tr>
              </table>

              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin: 32px 0;">
                <tr>
                  <td align="center">
                    <a href="${hackathonUrl}" style="display: inline-block; text-decoration: none; color: #ffffff; background: linear-gradient(135deg, #10b981 0%, #3b82f6 100%); padding: 16px 40px; border-radius: 8px; font-weight: 600; font-size: 18px;">
                      🎯 View Hackathon Details
                    </a>
                  </td>
                </tr>
              </table>

              <p style="color: #4b5563; line-height: 1.6; margin: 24px 0 0 0;">
                Good luck and happy hacking! 🎊<br>
                <strong style="color: #1f2937;">The HackMates Team</strong>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background: #f9fafb; padding: 20px 30px; border-top: 1px solid #e5e7eb; text-align: center;">
              <p style="margin: 0; font-size: 14px; color: #6b7280;">
                This email was sent to <strong>${userEmail}</strong> because you were added to a team on HackMates.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
};

export const getAnnouncementEmailHTML = (
  userName: string,
  userEmail: string,
  hackathonTitle: string,
  announcementTitle: string,
  announcementContent: string,
  hackathonUrl: string
): string => {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f8f9fa;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8f9fa; padding: 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #f59e0b 0%, #ef4444 100%); padding: 40px 20px; text-align: center;">
              <div style="font-size: 60px; margin-bottom: 10px;">📢</div>
              <h1 style="color: #ffffff; margin: 0; font-size: 28px;">New Announcement!</h1>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px;">
              <h2 style="color: #1f2937; margin-top: 0; font-size: 24px;">Hi ${userName}!</h2>
              
              <p style="color: #4b5563; line-height: 1.6; margin: 16px 0;">
                There's a new announcement for <strong>${hackathonTitle}</strong>:
              </p>

              <!-- Announcement Box -->
              <table width="100%" cellpadding="20" cellspacing="0" style="background: linear-gradient(135deg, #fef3c7 0%, #fee2e2 100%); border-left: 4px solid #f59e0b; border-radius: 8px; margin: 24px 0;">
                <tr>
                  <td>
                    <h3 style="color: #92400e; margin: 0 0 16px 0; font-size: 22px;">${announcementTitle}</h3>
                    <div style="background: #ffffff; padding: 16px; border-radius: 6px; color: #1f2937; line-height: 1.6;">
                      ${announcementContent.replace(/\n/g, '<br>')}
                    </div>
                  </td>
                </tr>
              </table>

              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin: 32px 0;">
                <tr>
                  <td align="center">
                    <a href="${hackathonUrl}" style="display: inline-block; text-decoration: none; color: #ffffff; background: linear-gradient(135deg, #f59e0b 0%, #ef4444 100%); padding: 16px 40px; border-radius: 8px; font-weight: 600; font-size: 18px;">
                      📋 View Full Announcement
                    </a>
                  </td>
                </tr>
              </table>

              <p style="color: #4b5563; line-height: 1.6; margin: 24px 0 0 0;">
                Stay updated with your hackathon!<br>
                <strong style="color: #1f2937;">The HackMates Team</strong>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background: #f9fafb; padding: 20px 30px; border-top: 1px solid #e5e7eb; text-align: center;">
              <p style="margin: 0; font-size: 14px; color: #6b7280;">
                This email was sent to <strong>${userEmail}</strong> because you're part of this hackathon on HackMates.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
};

export const getTeamRemovalEmailHTML = (
  userName: string,
  userEmail: string,
  hackathonTitle: string,
  teamName: string,
  removedByName: string,
  hackathonUrl: string
): string => {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f8f9fa;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8f9fa; padding: 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">

          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #ef4444 0%, #b91c1c 100%); padding: 40px 20px; text-align: center;">
              <div style="font-size: 60px; margin-bottom: 10px;">📋</div>
              <h1 style="color: #ffffff; margin: 0; font-size: 28px;">Team Update</h1>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px;">
              <h2 style="color: #1f2937; margin-top: 0; font-size: 24px;">Hi ${userName},</h2>

              <p style="color: #4b5563; line-height: 1.6; font-size: 16px; margin: 16px 0;">
                We're sorry to inform you that <strong style="color: #dc2626;">${removedByName}</strong> has removed you from the team. We regret any inconvenience this may have caused.
              </p>

              <!-- Details Box -->
              <table width="100%" cellpadding="20" cellspacing="0" style="background: linear-gradient(135deg, #fef2f2 0%, #fff7ed 100%); border-left: 4px solid #ef4444; border-radius: 8px; margin: 24px 0;">
                <tr>
                  <td>
                    <h3 style="color: #991b1b; margin: 0 0 16px 0; font-size: 18px;">📌 Removal Details</h3>
                    <table width="100%" cellpadding="10" cellspacing="0" style="background: #ffffff; border-radius: 6px; margin-bottom: 10px;">
                      <tr>
                        <td>
                          <p style="margin: 0; color: #6b7280; font-size: 12px; font-weight: 600; text-transform: uppercase;">Team</p>
                          <p style="margin: 4px 0 0 0; color: #1f2937; font-size: 17px; font-weight: bold;">${teamName}</p>
                        </td>
                      </tr>
                    </table>
                    ${hackathonTitle ? `
                    <table width="100%" cellpadding="10" cellspacing="0" style="background: #ffffff; border-radius: 6px; margin-bottom: 10px;">
                      <tr>
                        <td>
                          <p style="margin: 0; color: #6b7280; font-size: 12px; font-weight: 600; text-transform: uppercase;">Hackathon</p>
                          <p style="margin: 4px 0 0 0; color: #1f2937; font-size: 17px; font-weight: bold;">${hackathonTitle}</p>
                        </td>
                      </tr>
                    </table>` : ''}
                    <table width="100%" cellpadding="10" cellspacing="0" style="background: #ffffff; border-radius: 6px;">
                      <tr>
                        <td>
                          <p style="margin: 0; color: #6b7280; font-size: 12px; font-weight: 600; text-transform: uppercase;">Removed By</p>
                          <p style="margin: 4px 0 0 0; color: #1f2937; font-size: 17px; font-weight: bold;">${removedByName}</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- What's Next -->
              <table width="100%" cellpadding="15" cellspacing="0" style="background: #f0f9ff; border: 2px solid #bae6fd; border-radius: 8px; margin: 24px 0;">
                <tr>
                  <td>
                    <h3 style="color: #0369a1; margin: 0 0 12px 0; font-size: 18px;">💡 What You Can Do Next</h3>
                    <ul style="color: #0284c7; line-height: 1.8; padding-left: 20px; margin: 0;">
                      <li>Browse the hackathon's General Chat to find a new team</li>
                      <li>Create your own team and invite members</li>
                      <li>Explore other hackathons on the platform</li>
                    </ul>
                  </td>
                </tr>
              </table>

              ${hackathonUrl ? `
              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin: 32px 0;">
                <tr>
                  <td align="center">
                    <a href="${hackathonUrl}" style="display: inline-block; text-decoration: none; color: #ffffff; background: linear-gradient(135deg, #9333ea 0%, #2563eb 100%); padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">
                      🔍 Find a New Team
                    </a>
                  </td>
                </tr>
              </table>` : ''}

              <p style="color: #4b5563; line-height: 1.6; margin: 24px 0 0 0;">
                We hope to see you back in action soon! 💪<br>
                <strong style="color: #1f2937;">The HackMates Team</strong><br>
                <span style="font-size: 13px; color: #9ca3af;">Built with ❤️ by NoobcodersIND</span>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background: #f9fafb; padding: 20px 30px; border-top: 1px solid #e5e7eb; text-align: center;">
              <p style="margin: 0; font-size: 14px; color: #6b7280;">
                This email was sent to <strong>${userEmail}</strong> regarding your team membership on HackMates.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
};
