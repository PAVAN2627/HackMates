// Vercel Serverless Function for sending emails via Resend
// This keeps your API key secure on the server

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { to, subject, html, type } = req.body;

    // Validate required fields
    if (!to || !subject || !html) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Send email using Resend API
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'HackMates <onboarding@resend.dev>', // Use your verified domain later
        to: to,
        subject: subject,
        html: html,
      }),
    });

    const data = await response.json();

    if (response.ok) {
      console.log(`✅ Email sent successfully to ${to} (${type})`);
      return res.status(200).json({ success: true, id: data.id });
    } else {
      console.error('❌ Resend API error:', {
        status: response.status,
        statusText: response.statusText,
        data: data,
        apiKeyPresent: !!process.env.RESEND_API_KEY,
        apiKeyPrefix: process.env.RESEND_API_KEY?.substring(0, 8)
      });
      return res.status(response.status).json({ 
        error: data.message || 'Failed to send email',
        details: data
      });
    }
  } catch (error) {
    console.error('Email sending error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
