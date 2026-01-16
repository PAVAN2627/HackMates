/**
 * Email Service using Google Apps Script
 * Sends HTML emails via Google Script Web App (no rate limits!)
 */

import { getWelcomeEmailHTML, getTeamAdditionEmailHTML, getAnnouncementEmailHTML } from './emailTemplates';

// Google Apps Script Web App URL from environment variables
const GOOGLE_SCRIPT_URL = import.meta.env.VITE_GOOGLE_SCRIPT_URL;

/**
 * Send welcome email to new users with HTML template
 */
export const sendWelcomeEmail = async (
  userEmail: string,
  userName: string,
  userPassword: string
): Promise<{ success: boolean }> => {
  try {
    const htmlMessage = getWelcomeEmailHTML(userName, userEmail, userPassword);

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
        html: htmlMessage,
      }),
    });

    console.log('✅ Welcome email sent to:', userEmail);
    return { success: true };
  } catch (error) {
    console.error("❌ Failed to send welcome email:", error);
    return { success: false };
  }
};

/**
 * Send team addition notification email with HTML template
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
    const htmlMessage = getTeamAdditionEmailHTML(
      userName,
      userEmail,
      hackathonTitle,
      teamName,
      invitedByName,
      hackathonUrl
    );

    await fetch(GOOGLE_SCRIPT_URL, {
      method: "POST",
      mode: "no-cors", // Required for Google Apps Script
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: userEmail,
        name: userName,
        subject: `🎉 You've been added to ${teamName} in ${hackathonTitle}!`,
        html: htmlMessage,
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
 * Send announcement notification email with HTML template
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
    const htmlMessage = getAnnouncementEmailHTML(
      userName,
      userEmail,
      hackathonTitle,
      announcementTitle,
      announcementContent,
      hackathonUrl
    );

    await fetch(GOOGLE_SCRIPT_URL, {
      method: "POST",
      mode: "no-cors", // Required for Google Apps Script
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: userEmail,
        name: userName,
        subject: `📢 New Announcement: ${announcementTitle}`,
        html: htmlMessage,
      }),
    });

    console.log('✅ Announcement email sent to:', userEmail);
    return { success: true };
  } catch (error) {
    console.error("❌ Failed to send announcement email:", error);
    return { success: false };
  }
};
