import posthog from 'posthog-js';
import { EventName, EventProperties, UserProperties } from './types';

export { EventName } from './types';
export type { EventProperties, UserProperties } from './types';

const POSTHOG_KEY = import.meta.env.VITE_POSTHOG_KEY;
const POSTHOG_HOST = import.meta.env.VITE_POSTHOG_HOST || 'https://us.i.posthog.com';

let isInitialized = false;

/**
 * Initialize PostHog analytics
 */
export function initAnalytics(): void {
  if (isInitialized) return;

  if (!POSTHOG_KEY) {
    console.log('[Analytics] PostHog key not configured - analytics disabled');
    return;
  }

  try {
    posthog.init(POSTHOG_KEY, {
      api_host: POSTHOG_HOST,
      loaded: () => {
        console.log('[Analytics] PostHog initialized');
      },
      autocapture: true,
      capture_pageview: true,
      capture_pageleave: true,
      persistence: 'localStorage+cookie',
    });

    isInitialized = true;
  } catch (error) {
    console.error('[Analytics] Failed to initialize PostHog:', error);
  }
}

/**
 * Check if analytics is enabled
 */
export function isAnalyticsEnabled(): boolean {
  return isInitialized && !!POSTHOG_KEY;
}

/**
 * Track an event
 */
export function track(eventName: EventName, properties?: EventProperties): void {
  if (!isAnalyticsEnabled()) return;

  try {
    posthog.capture(eventName, {
      ...properties,
      timestamp: Date.now(),
      page_url: window.location.href,
    });
  } catch (error) {
    console.error('[Analytics] Failed to track event:', error);
  }
}

/**
 * Identify a user
 */
export function identify(userId: string, properties?: UserProperties): void {
  if (!isAnalyticsEnabled()) return;

  try {
    posthog.identify(userId, {
      ...properties,
      last_seen: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[Analytics] Failed to identify user:', error);
  }
}

/**
 * Reset user identity
 */
export function reset(): void {
  if (!isAnalyticsEnabled()) return;

  try {
    posthog.reset();
  } catch (error) {
    console.error('[Analytics] Failed to reset:', error);
  }
}

/**
 * Track page view
 */
export function trackPageView(pageName?: string): void {
  if (!isAnalyticsEnabled()) return;

  try {
    posthog.capture('$pageview', {
      page_name: pageName,
      page_url: window.location.href,
    });
  } catch (error) {
    console.error('[Analytics] Failed to track page view:', error);
  }
}

export default {
  init: initAnalytics,
  track,
  identify,
  reset,
  trackPageView,
  isEnabled: isAnalyticsEnabled,
};
