export interface PrayerResponse {
  title: string;
  prayerBody: string;
  explanation: string;
  isCanonical: boolean;
  origin?: string;
}

export enum Religion {
  Christianity = "Christianity",
  Islam = "Islam",
  Judaism = "Judaism",
  Hinduism = "Hinduism",
  Buddhism = "Buddhism",
  Sikhism = "Sikhism",
  Bahai = "Baha'i Faith",
  Spiritual = "General Spirituality",
  Secular = "Secular / Mindfulness",
}

export interface ReligionOption {
  id: Religion;
  name: string;
  description: string;
  icon: string;
  color: string;
}

export type AppState = 'SELECTION' | 'INPUT' | 'LOADING' | 'RESULT';

export interface GroundingSource {
  title: string;
  uri: string;
}

export type LoadingPhase = 'searching' | 'generating' | 'finalizing';

export interface LoadingState {
  phase: LoadingPhase;
  progress: number; // 0-100
  message: string;
}

export const LOADING_PHASES: Record<LoadingPhase, { message: string; progress: number }> = {
  searching: {
    message: 'Searching scriptural records...',
    progress: 33
  },
  generating: {
    message: 'Finding authentic prayers...',
    progress: 66
  },
  finalizing: {
    message: 'Verifying theological sources...',
    progress: 90
  }
};
