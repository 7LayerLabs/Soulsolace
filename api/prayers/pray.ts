import type { VercelRequest, VercelResponse } from '@vercel/node';
import { readFileSync, writeFileSync, existsSync } from 'fs';

interface PrayerRequest {
  id: string;
  intention: string;
  religion: string;
  isAnonymous: boolean;
  timestamp: number;
  prayerCount: number;
}

interface PrayRateLimitEntry {
  prayedFor: Set<string> | string[];
}

const DATA_FILE = '/tmp/prayers.json';
const PRAY_RATE_LIMIT_FILE = '/tmp/pray-rate-limits.json';

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

function savePrayers(prayers: PrayerRequest[]): void {
  try {
    writeFileSync(DATA_FILE, JSON.stringify(prayers, null, 2));
  } catch (e) {
    console.error('Error saving prayers:', e);
  }
}

function loadPrayRateLimits(): Record<string, string[]> {
  try {
    if (existsSync(PRAY_RATE_LIMIT_FILE)) {
      const data = readFileSync(PRAY_RATE_LIMIT_FILE, 'utf-8');
      return JSON.parse(data);
    }
  } catch (e) {
    console.error('Error loading pray rate limits:', e);
  }
  return {};
}

function savePrayRateLimits(limits: Record<string, string[]>): void {
  try {
    writeFileSync(PRAY_RATE_LIMIT_FILE, JSON.stringify(limits, null, 2));
  } catch (e) {
    console.error('Error saving pray rate limits:', e);
  }
}

function getClientIp(req: VercelRequest): string {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string') {
    return forwarded.split(',')[0].trim();
  }
  if (Array.isArray(forwarded)) {
    return forwarded[0];
  }
  return req.socket?.remoteAddress || 'unknown';
}

function hasAlreadyPrayed(ip: string, prayerId: string): boolean {
  const limits = loadPrayRateLimits();
  const prayedFor = limits[ip] || [];
  return prayedFor.includes(prayerId);
}

function markAsPrayed(ip: string, prayerId: string): void {
  const limits = loadPrayRateLimits();
  if (!limits[ip]) {
    limits[ip] = [];
  }
  limits[ip].push(prayerId);

  // Keep only last 1000 entries per IP to prevent excessive growth
  if (limits[ip].length > 1000) {
    limits[ip] = limits[ip].slice(-1000);
  }

  savePrayRateLimits(limits);
}

export default function handler(req: VercelRequest, res: VercelResponse) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { prayerId } = req.body;

  if (!prayerId || typeof prayerId !== 'string') {
    return res.status(400).json({ error: 'Prayer ID is required' });
  }

  const clientIp = getClientIp(req);

  if (hasAlreadyPrayed(clientIp, prayerId)) {
    return res.status(429).json({
      error: 'You have already prayed for this intention',
      alreadyPrayed: true
    });
  }

  const prayers = loadPrayers();
  const prayerIndex = prayers.findIndex(p => p.id === prayerId);

  if (prayerIndex === -1) {
    return res.status(404).json({ error: 'Prayer not found' });
  }

  prayers[prayerIndex].prayerCount += 1;
  savePrayers(prayers);
  markAsPrayed(clientIp, prayerId);

  return res.status(200).json({
    success: true,
    prayerCount: prayers[prayerIndex].prayerCount
  });
}
