import type { VercelRequest, VercelResponse } from '@vercel/node';
import { readFileSync, existsSync } from 'fs';

interface PrayerRequest {
  id: string;
  intention: string;
  religion: string;
  isAnonymous: boolean;
  timestamp: number;
  prayerCount: number;
}

const DATA_FILE = '/tmp/prayers.json';

function loadPrayers(): PrayerRequest[] {
  try {
    if (existsSync(DATA_FILE)) {
      const data = readFileSync(DATA_FILE, 'utf-8');
      return JSON.parse(data);
    }
  } catch (e) {
    console.error('Error loading prayers:', e);
  }
  return [];
}

export default function handler(req: VercelRequest, res: VercelResponse) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const prayers = loadPrayers();

  // Return last 50 prayers, already sorted by newest (insertion order)
  const recentPrayers = prayers.slice(0, 50);

  return res.status(200).json({
    success: true,
    prayers: recentPrayers,
    total: prayers.length
  });
}
