import { Religion, ReligionOption } from './types';

export const RELIGIONS: ReligionOption[] = [
  {
    id: Religion.Christianity,
    name: "Christianity",
    description: "Prayers rooted in the Bible and Christian tradition.",
    icon: "Cross",
    color: "bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-200"
  },
  {
    id: Religion.Islam,
    name: "Islam",
    description: "Duas and supplications from the Quran and Sunnah.",
    icon: "MoonStar",
    color: "bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-200"
  },
  {
    id: Religion.Judaism,
    name: "Judaism",
    description: "Prayers from the Siddur, Psalms, and Jewish wisdom.",
    icon: "Star",
    color: "bg-indigo-100 text-indigo-700 border-indigo-200 hover:bg-indigo-200"
  },
  {
    id: Religion.Hinduism,
    name: "Hinduism",
    description: "Mantras and slokas connecting to the divine.",
    icon: "Om",
    color: "bg-orange-100 text-orange-700 border-orange-200 hover:bg-orange-200"
  },
  {
    id: Religion.Buddhism,
    name: "Buddhism",
    description: "Reflections and aspirations for peace and enlightenment.",
    icon: "Flower2", // Lotus representation
    color: "bg-amber-100 text-amber-700 border-amber-200 hover:bg-amber-200"
  },
  {
    id: Religion.Spiritual,
    name: "Spiritual",
    description: "Universal connection to the universe and inner self.",
    icon: "Sparkles",
    color: "bg-purple-100 text-purple-700 border-purple-200 hover:bg-purple-200"
  },
];

export const MOCK_PRAYER = {
  title: "A Prayer for Peace",
  prayerBody: "Grant us peace, your most precious gift, O Lord...",
  explanation: "Based on traditional liturgy."
};
