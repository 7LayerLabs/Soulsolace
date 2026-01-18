import { Religion } from '../types';

export interface Season {
  name: string;
  description: string;
  suggestedIntentions: string[];
}

interface DateRange {
  startMonth: number;
  startDay: number;
  endMonth: number;
  endDay: number;
}

interface SeasonDefinition {
  name: string;
  description: string;
  suggestedIntentions: string[];
  dateRange: DateRange;
}

// Helper function to check if current date falls within a range
// Handles ranges that span year boundaries (e.g., Dec 25 - Jan 6)
function isWithinDateRange(date: Date, range: DateRange): boolean {
  const month = date.getMonth() + 1; // 1-indexed
  const day = date.getDate();

  const { startMonth, startDay, endMonth, endDay } = range;

  // Handle year-spanning ranges (e.g., Dec to Jan)
  if (startMonth > endMonth) {
    // Either in the end-of-year portion OR the beginning-of-year portion
    return (month > startMonth || (month === startMonth && day >= startDay)) ||
           (month < endMonth || (month === endMonth && day <= endDay));
  }

  // Normal range within the same year
  const afterStart = month > startMonth || (month === startMonth && day >= startDay);
  const beforeEnd = month < endMonth || (month === endMonth && day <= endDay);

  return afterStart && beforeEnd;
}

// Christianity seasons and holidays
const CHRISTIANITY_SEASONS: SeasonDefinition[] = [
  {
    name: "Advent",
    description: "A season of preparation and anticipation before Christmas",
    suggestedIntentions: ["hope", "preparation", "anticipation", "waiting on God", "spiritual readiness"],
    dateRange: { startMonth: 12, startDay: 1, endMonth: 12, endDay: 24 }
  },
  {
    name: "Christmas Season",
    description: "Celebration of the birth of Jesus Christ",
    suggestedIntentions: ["joy", "gratitude", "peace on earth", "family blessings", "incarnation"],
    dateRange: { startMonth: 12, startDay: 25, endMonth: 1, endDay: 6 }
  },
  {
    name: "Lent",
    description: "40 days of prayer, fasting, and repentance before Easter",
    suggestedIntentions: ["repentance", "self-examination", "spiritual discipline", "sacrifice", "renewal"],
    dateRange: { startMonth: 2, startDay: 14, endMonth: 4, endDay: 9 } // Approximate (varies)
  },
  {
    name: "Holy Week",
    description: "The week leading up to Easter, commemorating Christ's passion",
    suggestedIntentions: ["sacrifice", "redemption", "suffering", "hope in resurrection"],
    dateRange: { startMonth: 4, startDay: 10, endMonth: 4, endDay: 16 } // Approximate
  },
  {
    name: "Easter Season",
    description: "Celebration of the resurrection of Jesus Christ",
    suggestedIntentions: ["resurrection", "new life", "hope", "victory over death", "eternal life"],
    dateRange: { startMonth: 4, startDay: 17, endMonth: 6, endDay: 5 } // Through Pentecost
  }
];

// Islam seasons and holidays (approximate Gregorian dates - lunar calendar varies)
const ISLAM_SEASONS: SeasonDefinition[] = [
  {
    name: "Ramadan",
    description: "The holy month of fasting, prayer, and reflection",
    suggestedIntentions: ["fasting", "purification", "charity", "self-discipline", "closeness to Allah"],
    dateRange: { startMonth: 3, startDay: 1, endMonth: 4, endDay: 15 } // Approximate (varies yearly)
  },
  {
    name: "Eid al-Fitr",
    description: "Festival of Breaking the Fast, celebrating the end of Ramadan",
    suggestedIntentions: ["gratitude", "celebration", "community", "charity", "family blessings"],
    dateRange: { startMonth: 4, startDay: 16, endMonth: 4, endDay: 20 } // Approximate
  },
  {
    name: "Dhul Hijjah",
    description: "The sacred month of pilgrimage, culminating in Eid al-Adha",
    suggestedIntentions: ["sacrifice", "devotion", "pilgrimage", "remembrance of Ibrahim"],
    dateRange: { startMonth: 6, startDay: 1, endMonth: 6, endDay: 20 } // Approximate
  },
  {
    name: "Eid al-Adha",
    description: "Festival of Sacrifice, commemorating Ibrahim's willingness to sacrifice",
    suggestedIntentions: ["sacrifice", "obedience to Allah", "gratitude", "family", "charity"],
    dateRange: { startMonth: 6, startDay: 16, endMonth: 6, endDay: 20 } // Approximate
  },
  {
    name: "Muharram",
    description: "The first month of the Islamic calendar, a time of reflection",
    suggestedIntentions: ["new beginnings", "reflection", "remembrance", "fasting", "spiritual renewal"],
    dateRange: { startMonth: 7, startDay: 1, endMonth: 7, endDay: 30 } // Approximate
  }
];

// Judaism seasons and holidays (approximate Gregorian dates)
const JUDAISM_SEASONS: SeasonDefinition[] = [
  {
    name: "High Holy Days",
    description: "Rosh Hashanah through Yom Kippur - a time of repentance and renewal",
    suggestedIntentions: ["repentance", "forgiveness", "new beginnings", "reflection", "atonement"],
    dateRange: { startMonth: 9, startDay: 15, endMonth: 10, endDay: 15 } // Approximate
  },
  {
    name: "Sukkot",
    description: "Festival of Tabernacles, celebrating harvest and God's protection",
    suggestedIntentions: ["gratitude", "hospitality", "joy", "remembrance", "God's provision"],
    dateRange: { startMonth: 10, startDay: 10, endMonth: 10, endDay: 25 } // Approximate
  },
  {
    name: "Hanukkah",
    description: "Festival of Lights, celebrating the miracle of the oil and religious freedom",
    suggestedIntentions: ["light in darkness", "miracles", "dedication", "perseverance", "faith"],
    dateRange: { startMonth: 12, startDay: 10, endMonth: 12, endDay: 26 } // Approximate
  },
  {
    name: "Passover",
    description: "Celebrating liberation from Egypt and God's deliverance",
    suggestedIntentions: ["freedom", "deliverance", "gratitude", "family", "remembrance"],
    dateRange: { startMonth: 4, startDay: 5, endMonth: 4, endDay: 20 } // Approximate
  },
  {
    name: "Shavuot",
    description: "Festival of Weeks, celebrating the giving of the Torah",
    suggestedIntentions: ["wisdom", "Torah study", "covenant", "revelation", "gratitude"],
    dateRange: { startMonth: 5, startDay: 25, endMonth: 6, endDay: 5 } // Approximate
  }
];

// Hinduism seasons and festivals
const HINDUISM_SEASONS: SeasonDefinition[] = [
  {
    name: "Diwali",
    description: "Festival of Lights, celebrating the victory of light over darkness",
    suggestedIntentions: ["prosperity", "new beginnings", "inner light", "family blessings", "victory over darkness"],
    dateRange: { startMonth: 10, startDay: 20, endMonth: 11, endDay: 15 } // Approximate (varies)
  },
  {
    name: "Holi",
    description: "Festival of Colors, celebrating spring, love, and new beginnings",
    suggestedIntentions: ["joy", "forgiveness", "new beginnings", "love", "unity"],
    dateRange: { startMonth: 3, startDay: 1, endMonth: 3, endDay: 20 } // Approximate
  },
  {
    name: "Navaratri",
    description: "Nine nights honoring the divine feminine and the goddess Durga",
    suggestedIntentions: ["divine feminine", "inner strength", "victory over evil", "devotion", "purification"],
    dateRange: { startMonth: 9, startDay: 25, endMonth: 10, endDay: 15 } // Approximate
  },
  {
    name: "Maha Shivaratri",
    description: "Great night of Shiva, a time for deep meditation and devotion",
    suggestedIntentions: ["meditation", "spiritual awakening", "overcoming darkness", "devotion to Shiva"],
    dateRange: { startMonth: 2, startDay: 18, endMonth: 3, endDay: 5 } // Approximate
  },
  {
    name: "Ganesh Chaturthi",
    description: "Celebration of Lord Ganesha, remover of obstacles",
    suggestedIntentions: ["removing obstacles", "new beginnings", "wisdom", "success", "blessings"],
    dateRange: { startMonth: 8, startDay: 25, endMonth: 9, endDay: 15 } // Approximate
  }
];

// Buddhism observances
const BUDDHISM_SEASONS: SeasonDefinition[] = [
  {
    name: "Vesak",
    description: "Buddha Day, celebrating the birth, enlightenment, and passing of the Buddha",
    suggestedIntentions: ["enlightenment", "compassion", "wisdom", "liberation", "mindfulness"],
    dateRange: { startMonth: 5, startDay: 1, endMonth: 5, endDay: 31 } // Full moon of May
  },
  {
    name: "Vassa (Rains Retreat)",
    description: "Three-month retreat period for intensive meditation and study",
    suggestedIntentions: ["meditation", "spiritual discipline", "community", "deepening practice"],
    dateRange: { startMonth: 7, startDay: 15, endMonth: 10, endDay: 15 } // Approximate
  },
  {
    name: "Kathina",
    description: "End of Vassa, a time of generosity and offering to the Sangha",
    suggestedIntentions: ["generosity", "gratitude", "community support", "merit-making"],
    dateRange: { startMonth: 10, startDay: 16, endMonth: 11, endDay: 15 } // Month after Vassa
  },
  {
    name: "Losar (Tibetan New Year)",
    description: "New Year celebration with prayers for auspiciousness",
    suggestedIntentions: ["new beginnings", "purification", "auspiciousness", "compassion"],
    dateRange: { startMonth: 2, startDay: 1, endMonth: 3, endDay: 1 } // Approximate
  }
];

// Map religions to their season definitions
const SEASON_MAP: Partial<Record<Religion, SeasonDefinition[]>> = {
  [Religion.Christianity]: CHRISTIANITY_SEASONS,
  [Religion.Islam]: ISLAM_SEASONS,
  [Religion.Judaism]: JUDAISM_SEASONS,
  [Religion.Hinduism]: HINDUISM_SEASONS,
  [Religion.Buddhism]: BUDDHISM_SEASONS,
};

/**
 * Get the current religious seasons/holidays for a given religion
 * Returns an array of matching seasons (can be multiple or empty)
 */
export function getCurrentSeasons(religion: Religion): Season[] {
  const seasonDefinitions = SEASON_MAP[religion];

  if (!seasonDefinitions) {
    return [];
  }

  const now = new Date();
  const matchingSeasons: Season[] = [];

  for (const season of seasonDefinitions) {
    if (isWithinDateRange(now, season.dateRange)) {
      matchingSeasons.push({
        name: season.name,
        description: season.description,
        suggestedIntentions: season.suggestedIntentions,
      });
    }
  }

  return matchingSeasons;
}

/**
 * Get the primary (most significant) current season for a religion
 * Returns the first matching season or null
 */
export function getPrimarySeason(religion: Religion): Season | null {
  const seasons = getCurrentSeasons(religion);
  return seasons.length > 0 ? seasons[0] : null;
}

/**
 * Check if any religious season is currently active for a religion
 */
export function hasActiveSeason(religion: Religion): boolean {
  return getCurrentSeasons(religion).length > 0;
}
