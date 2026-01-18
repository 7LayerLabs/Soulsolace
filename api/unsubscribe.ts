import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // Allow GET requests for easy unsubscribe links in emails
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { token } = req.query;

    // Validate token
    if (!token || typeof token !== 'string') {
      return res.status(400).json({ error: 'Unsubscribe token is required' });
    }

    // Validate token format (should be 64 hex characters)
    if (!/^[a-f0-9]{64}$/.test(token)) {
      return res.status(400).json({ error: 'Invalid unsubscribe token format' });
    }

    // TODO: Remove from Vercel KV or database
    // In production, you would:
    // 1. Find subscription by token: await kv.get(`unsubscribe:${token}`)
    // 2. Delete the subscription: await kv.del(`subscription:${email}`)
    // 3. Delete the token mapping: await kv.del(`unsubscribe:${token}`)

    console.log('Unsubscribe request for token:', token.substring(0, 8) + '...');

    // Return a nice HTML page for the user
    const htmlResponse = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Unsubscribed - SoulSolace</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&display=swap" rel="stylesheet">
  <style>
    body { font-family: 'Inter', sans-serif; }
  </style>
</head>
<body class="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-6">
  <div class="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
    <div class="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
      <svg class="w-8 h-8 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
      </svg>
    </div>
    <h1 class="text-2xl font-bold text-slate-900 mb-3">You've Been Unsubscribed</h1>
    <p class="text-slate-600 mb-6">
      You will no longer receive daily prayer emails from SoulSolace.
      We're sorry to see you go.
    </p>
    <a href="/" class="inline-flex items-center justify-center px-6 py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors">
      Return to SoulSolace
    </a>
    <p class="text-sm text-slate-400 mt-6">
      Changed your mind? You can always subscribe again from our homepage.
    </p>
  </div>
</body>
</html>
    `;

    res.setHeader('Content-Type', 'text/html');
    return res.status(200).send(htmlResponse);

  } catch (error) {
    console.error('Unsubscribe error:', error);

    // Return error as HTML for better UX
    const errorHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Error - SoulSolace</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&display=swap" rel="stylesheet">
  <style>
    body { font-family: 'Inter', sans-serif; }
  </style>
</head>
<body class="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-6">
  <div class="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
    <div class="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
      <svg class="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
      </svg>
    </div>
    <h1 class="text-2xl font-bold text-slate-900 mb-3">Something Went Wrong</h1>
    <p class="text-slate-600 mb-6">
      We couldn't process your unsubscribe request. Please try again or contact support.
    </p>
    <a href="/" class="inline-flex items-center justify-center px-6 py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors">
      Return to SoulSolace
    </a>
  </div>
</body>
</html>
    `;

    res.setHeader('Content-Type', 'text/html');
    return res.status(500).send(errorHtml);
  }
}
