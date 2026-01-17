/**
 * Analytics Event Names for SoulSolace
 */
export enum EventName {
  // Core Events
  TRADITION_SELECTED = 'tradition_selected',
  PRAYER_GENERATED = 'prayer_generated',
  PRAYER_SAVED = 'prayer_saved',
  PRAYER_SHARED = 'prayer_shared',

  // Navigation
  PAGE_VIEW = 'page_view',

  // Errors
  ERROR_OCCURRED = 'error_occurred',
  API_ERROR = 'api_error',
}

/**
 * Event Properties
 */
export interface EventProperties {
  tradition?: string;
  prayer_type?: string;
  prayer_length?: number;
  error_message?: string;
  error_type?: string;
  page_url?: string;
  timestamp?: number;
}

/**
 * User Properties
 */
export interface UserProperties {
  preferred_tradition?: string;
  prayers_generated?: number;
  first_seen?: string;
  last_seen?: string;
}
