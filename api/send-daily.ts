import type { VercelRequest, VercelResponse } from '@vercel/node';

// This endpoint is triggered by Vercel Cron
// It will fetch subscribers due for their daily prayer email and send them

interface Subscription {
  email: string;
  religion: string;
  preferredTime: 'morning' | 'evening';
  timezone: string;
  subscribedAt: string;
  unsubscribeToken: string;
}

interface PrayerResponse {
  title: string;
  prayerBody: string;
  explanation: string;
  isCanonical: boolean;
  origin?: string;
}

// Generate prayer using Gemini API
async function generatePrayerForEmail(religion: string): Promise<PrayerResponse> {
  const apiKey = process.env.API_KEY;

  if (!apiKey) {
    throw new Error('Gemini API key not configured');
  }

  // Using fetch directly to call Gemini API
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `Generate a single, authentic daily prayer or blessing from the ${religion} tradition.

This prayer should be:
- Uplifting and suitable for starting/ending the day
- A real prayer from scripture, liturgy, or traditional sources when possible
- If composing new text, it must follow authentic ${religion} theological structure and language

Return ONLY a JSON object in this exact format:
{
  "title": "Name of the prayer",
  "prayerBody": "The full text of the prayer",
  "explanation": "Brief explanation of source and meaning",
  "isCanonical": true/false,
  "origin": "The specific source text or tradition"
}`
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 1024,
        }
      })
    }
  );

  if (!response.ok) {
    throw new Error(`Gemini API error: ${response.status}`);
  }

  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!text) {
    throw new Error('No response from Gemini');
  }

  // Parse the JSON from the response
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('Could not parse prayer response');
  }

  return JSON.parse(jsonMatch[0]);
}

// Generate email HTML template
function generateEmailHtml(
  prayer: PrayerResponse,
  religion: string,
  unsubscribeUrl: string
): string {
  const timeOfDay = new Date().getUTCHours() < 12 ? 'morning' : 'evening';
  const greeting = timeOfDay === 'morning' ? 'Good Morning' : 'Good Evening';

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your Daily Prayer - SoulSolace</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Georgia', serif; background-color: #f8fafc; line-height: 1.6;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">

          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); padding: 32px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 600;">SoulSolace</h1>
              <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0 0; font-size: 14px;">Your Daily ${religion} Prayer</p>
            </td>
          </tr>

          <!-- Greeting -->
          <tr>
            <td style="padding: 32px 32px 16px 32px;">
              <p style="color: #64748b; margin: 0; font-size: 16px;">${greeting},</p>
            </td>
          </tr>

          <!-- Prayer Title -->
          <tr>
            <td style="padding: 0 32px;">
              <h2 style="color: #1e293b; margin: 0 0 16px 0; font-size: 22px; font-weight: 600;">
                ${prayer.title}
              </h2>
              ${prayer.isCanonical
                ? '<span style="display: inline-block; background-color: #fef3c7; color: #92400e; padding: 4px 12px; border-radius: 9999px; font-size: 12px; font-weight: 500;">Canonical Prayer</span>'
                : '<span style="display: inline-block; background-color: #e0e7ff; color: #3730a3; padding: 4px 12px; border-radius: 9999px; font-size: 12px; font-weight: 500;">Tradition-Aligned</span>'
              }
            </td>
          </tr>

          <!-- Prayer Body -->
          <tr>
            <td style="padding: 24px 32px;">
              <div style="background-color: #fafafa; border-left: 4px solid #f59e0b; padding: 24px; border-radius: 0 8px 8px 0;">
                <p style="color: #334155; margin: 0; font-size: 18px; font-style: italic; white-space: pre-line;">
                  ${prayer.prayerBody}
                </p>
              </div>
            </td>
          </tr>

          <!-- Origin -->
          ${prayer.origin ? `
          <tr>
            <td style="padding: 0 32px 16px 32px;">
              <p style="color: #94a3b8; margin: 0; font-size: 14px;">
                <strong>Source:</strong> ${prayer.origin}
              </p>
            </td>
          </tr>
          ` : ''}

          <!-- Explanation -->
          <tr>
            <td style="padding: 0 32px 32px 32px;">
              <p style="color: #64748b; margin: 0; font-size: 14px;">
                ${prayer.explanation}
              </p>
            </td>
          </tr>

          <!-- Divider -->
          <tr>
            <td style="padding: 0 32px;">
              <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 0;">
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 24px 32px; text-align: center;">
              <p style="color: #94a3b8; margin: 0 0 16px 0; font-size: 12px;">
                You're receiving this because you subscribed to daily prayers from SoulSolace.
              </p>
              <a href="${unsubscribeUrl}" style="color: #64748b; font-size: 12px; text-decoration: underline;">
                Unsubscribe from daily prayers
              </a>
            </td>
          </tr>

        </table>

        <!-- Bottom text -->
        <p style="color: #94a3b8; font-size: 12px; margin-top: 24px; text-align: center;">
          &copy; ${new Date().getFullYear()} SoulSolace. Authentic prayers for your spiritual journey.
        </p>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}

// Send email via Resend API
async function sendEmail(
  to: string,
  subject: string,
  html: string
): Promise<boolean> {
  const resendApiKey = process.env.RESEND_API_KEY;

  if (!resendApiKey) {
    console.log('RESEND_API_KEY not configured, skipping email send');
    console.log(`Would send email to: ${to}`);
    console.log(`Subject: ${subject}`);
    return true; // Return true for development/testing
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'SoulSolace <prayers@soulsolace.app>', // Update with your domain
        to: [to],
        subject: subject,
        html: html,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('Resend API error:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Failed to send email:', error);
    return false;
  }
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // Verify this is a cron request (Vercel adds this header)
  const authHeader = req.headers.authorization;
  const cronSecret = process.env.CRON_SECRET;

  // In production, verify the cron secret
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const timeSlot = req.query.time as string || 'morning';

    // TODO: Fetch subscribers from Vercel KV or database
    // For now, we'll use a mock subscriber list for testing
    // In production:
    // const subscribers = await kv.smembers(`subscribers:${timeSlot}`);

    const mockSubscribers: Subscription[] = [
      // Example subscriber for testing
      // {
      //   email: 'test@example.com',
      //   religion: 'Christianity',
      //   preferredTime: 'morning',
      //   timezone: 'America/New_York',
      //   subscribedAt: new Date().toISOString(),
      //   unsubscribeToken: 'test-token-12345',
      // }
    ];

    console.log(`Processing ${timeSlot} prayer emails for ${mockSubscribers.length} subscribers`);

    const results = {
      total: mockSubscribers.length,
      sent: 0,
      failed: 0,
      errors: [] as string[],
    };

    // Group subscribers by religion for efficient prayer generation
    const subscribersByReligion = mockSubscribers.reduce((acc, sub) => {
      if (!acc[sub.religion]) {
        acc[sub.religion] = [];
      }
      acc[sub.religion].push(sub);
      return acc;
    }, {} as Record<string, Subscription[]>);

    // Generate one prayer per religion and send to all subscribers of that religion
    for (const [religion, subscribers] of Object.entries(subscribersByReligion)) {
      try {
        // Generate prayer for this religion
        const prayer = await generatePrayerForEmail(religion);

        // Send to all subscribers of this religion
        for (const subscriber of subscribers) {
          const baseUrl = process.env.VERCEL_URL
            ? `https://${process.env.VERCEL_URL}`
            : 'http://localhost:3000';
          const unsubscribeUrl = `${baseUrl}/api/unsubscribe?token=${subscriber.unsubscribeToken}`;

          const emailHtml = generateEmailHtml(prayer, religion, unsubscribeUrl);
          const timeOfDay = timeSlot === 'morning' ? 'Morning' : 'Evening';
          const subject = `Your ${timeOfDay} Prayer - ${prayer.title}`;

          const sent = await sendEmail(subscriber.email, subject, emailHtml);

          if (sent) {
            results.sent++;
          } else {
            results.failed++;
            results.errors.push(`Failed to send to ${subscriber.email}`);
          }
        }
      } catch (error) {
        console.error(`Error processing ${religion}:`, error);
        results.failed += subscribers.length;
        results.errors.push(`Failed to generate prayer for ${religion}`);
      }
    }

    console.log('Send daily results:', results);

    return res.status(200).json({
      success: true,
      timeSlot,
      results,
    });

  } catch (error) {
    console.error('Send daily error:', error);
    return res.status(500).json({
      error: 'Failed to process daily prayer emails',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
