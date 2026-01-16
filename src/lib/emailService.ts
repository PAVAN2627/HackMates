/**
 * Email Service using Google Apps Script
 * Sends emails via Google Script Web App (no rate limits!)
 */

// Google Apps Script Web App URL
const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbz06S2VLFwootzyy-TBr27Tz2y7riuZSiEG9YAVLRm6pf4RiKj3OzfSfbqfMF3xLvDe/exec";

/**
 * Send welcome email to new users
 */
export const sendWelcomeEmail = async (
  userEmail: string,
  userName: string,
  userPassword: string
): Promise<{ success: boolean }> => {
  try {
    const message = `
Welcome to HackMates, ${userName}!

We're excited to have you join India's premier hackathon community platform!

Your Account Details:
━━━━━━━━━━━━━━━━━━━━
Email: ${userEmail}
Password: ${userPassword}
━━━━━━━━━━━━━━━━━━━━

⚠️ Please save these credentials securely and change your password after first login.

What You Can Do:
✨ Discover amazing hackathons across India
🤖 Get AI-powered guidance from our assistant
🛡️ Build trust with reliability badges
⚡ Find teammates with smart synergy matching
💬 Connect via real-time chat
📢 Stay updated with announcements

Get Started: https://hackmates-mu.vercel.app/hackathons

Need help? Reply to this email or contact us at support@hackmates.com

Happy Hacking! 🚀
The HackMates Team
Built with ❤️ by NoobcodersIND
    `.trim();

    await fetch(GOOGLE_SCRIPT_URL, {
      method: "POST",
      mode: "no-cors", // Required for Google Apps Script
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: userEmail,
        name: userName,
        subject: "🚀 Welcome to HackMates - Your Account is Ready!",
        message: message,
      }),
    });

    // Note: no-cors mode means we can't read the response
    // But if no error was thrown, the request was sent successfully
    console.log('✅ Welcome email sent to:', userEmail);
    return { success: true };
  } catch (error) {
    console.error("❌ Failed to send welcome email:", error);
    return { success: false };
  }
};

/**
 * Send team addition notification email
 */
export const sendTeamAdditionEmail = async (
  userEmail: string,
  userName: string,
  hackathonTitle: string,
  teamName: string,
  invitedByName: string,
  hackathonId: string
): Promise<{ success: boolean }> => {
  try {
    const hackathonUrl = `https://hackmates-mu.vercel.app/hackathons/${hackathonId}`;
    
    const message = `
Great news, ${userName}! 🎉

${invitedByName} has added you to their team for an exciting hackathon!

Hackathon Details:
━━━━━━━━━━━━━━━━━━━━
Event: ${hackathonTitle}
Team: ${teamName}
Added by: ${invitedByName}
━━━━━━━━━━━━━━━━━━━━

What's Next?
✅ Review hackathon details and requirements
✅ Connect with your teammates via chat
✅ Plan your project and divide tasks
✅ Check announcements for important updates
✅ Start building something amazing together!

View Hackathon: ${hackathonUrl}

Team Success Tips:
💡 Communicate early - introduce yourself and share your skills
💡 Set clear goals - define what you want to achieve together
💡 Divide & conquer - assign roles based on strengths
💡 Stay synced - regular check-ins keep everyone aligned
💡 Have fun - enjoy the journey and learn together!

Good luck and happy hacking! 🎊
The HackMates Team
    `.trim();

    await fetch(GOOGLE_SCRIPT_URL, {
      method: "POST",
      mode: "no-cors",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: userEmail,
        name: userName,
        subject: `🎉 You've been added to ${teamName} in ${hackathonTitle}!`,
        message: message,
      }),
    });

    console.log('✅ Team addition email sent to:', userEmail);
    return { success: true };
  } catch (error) {
    console.error("❌ Failed to send team addition email:", error);
    return { success: false };
  }
};

/**
 * Send announcement notification email
 */
export const sendAnnouncementEmail = async (
  userEmail: string,
  userName: string,
  hackathonTitle: string,
  announcementTitle: string,
  announcementContent: string,
  hackathonId: string
): Promise<{ success: boolean }> => {
  try {
    const hackathonUrl = `https://hackmates-mu.vercel.app/hackathons/${hackathonId}`;
    
    const message = `
Hi ${userName},

There's a new announcement for ${hackathonTitle}:

━━━━━━━━━━━━━━━━━━━━
${announcementTitle}
━━━━━━━━━━━━━━━━━━━━

${announcementContent}

View Full Announcement: ${hackathonUrl}

Stay updated with your hackathon!
The HackMates Team
    `.trim();

    await fetch(GOOGLE_SCRIPT_URL, {
      method: "POST",
      mode: "no-cors",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: userEmail,
        name: userName,
        subject: `📢 New Announcement: ${announcementTitle}`,
        message: message,
      }),
    });

    console.log('✅ Announcement email sent to:', userEmail);
    return { success: true };
  } catch (error) {
    console.error("❌ Failed to send announcement email:", error);
    return { success: false };
  }
};
