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
