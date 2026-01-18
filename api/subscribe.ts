import type { VercelRequest, VercelResponse } from '@vercel/node';

// Subscription types
export interface Subscription {
  email: string;
  religion: string;
  preferredTime: 'morning' | 'evening';
  timezone: string;
  subscribedAt: string;
  unsubscribeToken: string;
}

// Simple email validation regex
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Valid religions (matching the frontend Religion enum)
const VALID_RELIGIONS = [
  'Christianity',
  'Islam',
  'Judaism',
  'Hinduism',
  'Buddhism',
  'Sikhism',
  "Baha'i Faith",
  'General Spirituality',
  'Secular / Mindfulness',
];

// Generate a simple unsubscribe token
function generateToken(): string {
  return Array.from(crypto.getRandomValues(new Uint8Array(32)))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email, religion, preferredTime, timezone } = req.body;

    // Validate email
    if (!email || typeof email !== 'string') {
      return res.status(400).json({ error: 'Email is required' });
    }

    if (!EMAIL_REGEX.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    // Validate religion
    if (!religion || !VALID_RELIGIONS.includes(religion)) {
      return res.status(400).json({
        error: 'Invalid religion. Must be one of: ' + VALID_RELIGIONS.join(', ')
      });
    }

    // Validate preferred time
    if (!preferredTime || !['morning', 'evening'].includes(preferredTime)) {
      return res.status(400).json({
        error: 'Invalid preferred time. Must be "morning" or "evening"'
      });
    }

    // Validate timezone
    if (!timezone || typeof timezone !== 'string') {
      return res.status(400).json({ error: 'Timezone is required' });
    }

    // Create subscription object
    const subscription: Subscription = {
      email: email.toLowerCase().trim(),
      religion,
      preferredTime,
      timezone,
      subscribedAt: new Date().toISOString(),
      unsubscribeToken: generateToken(),
    };

    // TODO: Store in Vercel KV or database
    // For now, we'll just log and return success
    // In production, you would:
    // 1. Check if email already exists
    // 2. Store in Vercel KV: await kv.set(`subscription:${email}`, subscription)
    // 3. Send confirmation email via Resend

    console.log('New subscription:', {
      email: subscription.email,
      religion: subscription.religion,
      preferredTime: subscription.preferredTime,
      timezone: subscription.timezone,
    });

    // Return success with unsubscribe token (in production, this would be sent via email)
    return res.status(200).json({
      success: true,
      message: 'Successfully subscribed to daily prayers',
      // In production, don't expose the token - send it via email instead
      unsubscribeToken: subscription.unsubscribeToken,
    });

  } catch (error) {
    console.error('Subscription error:', error);
    return res.status(500).json({
      error: 'An error occurred while processing your subscription'
    });
  }
}
