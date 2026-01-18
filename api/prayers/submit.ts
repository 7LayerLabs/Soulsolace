import type { VercelRequest, VercelResponse } from '@vercel/node';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';

interface PrayerRequest {
  id: string;
  intention: string;
  religion: string;
  isAnonymous: boolean;
  timestamp: number;
  prayerCount: number;
}

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const DATA_FILE = '/tmp/prayers.json';
const RATE_LIMIT_FILE = '/tmp/prayer-rate-limits.json';
const MAX_REQUESTS_PER_DAY = 3;
const DAY_IN_MS = 24 * 60 * 60 * 1000;

function generateId(): string {
  return `prayer_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

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

function loadRateLimits(): Record<string, RateLimitEntry> {
  try {
    if (existsSync(RATE_LIMIT_FILE)) {
      const data = readFileSync(RATE_LIMIT_FILE, 'utf-8');
      return JSON.parse(data);
    }
  } catch (e) {
    console.error('Error loading rate limits:', e);
  }
  return {};
}

function saveRateLimits(limits: Record<string, RateLimitEntry>): void {
  try {
    writeFileSync(RATE_LIMIT_FILE, JSON.stringify(limits, null, 2));
  } catch (e) {
    console.error('Error saving rate limits:', e);
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

function checkRateLimit(ip: string): { allowed: boolean; remaining: number } {
  const limits = loadRateLimits();
  const now = Date.now();

  const entry = limits[ip];

  if (!entry || now > entry.resetTime) {
    limits[ip] = { count: 1, resetTime: now + DAY_IN_MS };
    saveRateLimits(limits);
    return { allowed: true, remaining: MAX_REQUESTS_PER_DAY - 1 };
  }

  if (entry.count >= MAX_REQUESTS_PER_DAY) {
    return { allowed: false, remaining: 0 };
  }

  limits[ip] = { count: entry.count + 1, resetTime: entry.resetTime };
  saveRateLimits(limits);
  return { allowed: true, remaining: MAX_REQUESTS_PER_DAY - entry.count - 1 };
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

  const clientIp = getClientIp(req);
  const rateLimit = checkRateLimit(clientIp);

  if (!rateLimit.allowed) {
    return res.status(429).json({
      error: 'Rate limit exceeded. You can submit up to 3 prayer requests per day.',
      remaining: 0
    });
  }

  const { intention, religion } = req.body;

  if (!intention || typeof intention !== 'string') {
    return res.status(400).json({ error: 'Intention is required' });
  }

  if (!religion || typeof religion !== 'string') {
    return res.status(400).json({ error: 'Religion is required' });
  }

  const trimmedIntention = intention.trim();
  if (trimmedIntention.length === 0) {
    return res.status(400).json({ error: 'Intention cannot be empty' });
  }

  if (trimmedIntention.length > 280) {
    return res.status(400).json({ error: 'Intention cannot exceed 280 characters' });
  }

  const prayerRequest: PrayerRequest = {
    id: generateId(),
    intention: trimmedIntention,
    religion,
    isAnonymous: true,
    timestamp: Date.now(),
    prayerCount: 0
  };

  const prayers = loadPrayers();
  prayers.unshift(prayerRequest);

  // Keep only the last 500 prayers to prevent file from growing too large
  if (prayers.length > 500) {
    prayers.length = 500;
  }

  savePrayers(prayers);

  return res.status(201).json({
    success: true,
    prayer: prayerRequest,
    remaining: rateLimit.remaining
  });
}
