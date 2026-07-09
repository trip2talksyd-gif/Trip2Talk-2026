import type { MatchTags, TripTemplate } from "@/lib/types/database";

export interface QuizAnswers {
  month: number;
  themes: string[];
  groupFit: MatchTags["groupFit"];
  pricePoint: MatchTags["pricePoint"];
  pace: MatchTags["pace"];
}

export interface MatchedTrip {
  template: TripTemplate;
  score: number;
  matchedLabels: string[];
}

const THEME_LABELS: Record<string, string> = {
  aurora: "แสงเหนือ/ใต้",
  milkyway: "ทางช้างเผือก",
  landscape: "ธรรมชาติ/ภูเขา",
  flowers: "ทุ่งดอกไม้",
  wildlife: "แนวสัตว์ป่า",
  history: "ประวัติศาสตร์/สถาปัตยกรรม",
  beach: "ทะเล/ชายหาด",
  mountain: "ภูเขา",
  architecture: "สถาปัตยกรรม",
  "portrait-influencer": "แนวแฟชั่น/อินฟลูเอนเซอร์",
};

const PRICE_LABELS: Record<MatchTags["pricePoint"], string> = {
  budget: "งบประหยัด",
  mid: "งบกลางๆ",
  premium: "งบพรีเมียม",
};

const PACE_LABELS: Record<MatchTags["pace"], string> = {
  "one-day": "ทริปวันเดียว",
  "multi-day-relaxed": "ทริปหลายวันสบายๆ",
  "multi-day-packed": "ทริปหลายวันจัดเต็ม",
};

const GROUP_ADJACENT: Record<MatchTags["groupFit"], MatchTags["groupFit"][]> = {
  "private-small": ["private-small", "small-group"],
  "small-group": ["private-small", "small-group", "flexible"],
  flexible: ["small-group", "flexible"],
};

const PRICE_ADJACENT: Record<MatchTags["pricePoint"], MatchTags["pricePoint"][]> = {
  budget: ["budget", "mid"],
  mid: ["budget", "mid", "premium"],
  premium: ["mid", "premium"],
};

const PACE_ADJACENT: Record<MatchTags["pace"], MatchTags["pace"][]> = {
  "one-day": ["one-day"],
  "multi-day-relaxed": ["multi-day-relaxed", "multi-day-packed"],
  "multi-day-packed": ["multi-day-relaxed", "multi-day-packed"],
};

function scoreTrip(template: TripTemplate, answers: QuizAnswers): MatchedTrip {
  const tags = template.matchTags;
  const matchedLabels: string[] = [];
  let score = 0;

  if (!tags) return { template, score: 0, matchedLabels: [] };

  if (tags.bestMonths.includes(answers.month)) {
    score += 3;
    matchedLabels.push(`เดือนที่เลือก (${answers.month})`);
  }

  const themeOverlap = answers.themes.filter((t) => tags.themes.includes(t));
  score += themeOverlap.length * 2;
  for (const theme of themeOverlap) {
    matchedLabels.push(THEME_LABELS[theme] ?? theme);
  }

  if (GROUP_ADJACENT[answers.groupFit].includes(tags.groupFit)) {
    score += answers.groupFit === tags.groupFit ? 2 : 1;
  }

  if (PRICE_ADJACENT[answers.pricePoint].includes(tags.pricePoint)) {
    score += answers.pricePoint === tags.pricePoint ? 2 : 1;
    if (answers.pricePoint === tags.pricePoint) {
      matchedLabels.push(PRICE_LABELS[tags.pricePoint]);
    }
  }

  if (PACE_ADJACENT[answers.pace].includes(tags.pace)) {
    score += answers.pace === tags.pace ? 2 : 1;
    if (answers.pace === tags.pace) {
      matchedLabels.push(PACE_LABELS[tags.pace]);
    }
  }

  return { template, score, matchedLabels: Array.from(new Set(matchedLabels)) };
}

export function matchTrips(
  templates: TripTemplate[],
  answers: QuizAnswers,
  limit = 3,
): MatchedTrip[] {
  return templates
    .filter((t) => t.active && t.matchTags)
    .map((template) => scoreTrip(template, answers))
    .filter((m) => m.score > 0)
    .sort((a, b) => b.score - a.score || a.template.basePriceAUD - b.template.basePriceAUD)
    .slice(0, limit);
}

export function formatMatchReason(matchedLabels: string[]): string {
  if (matchedLabels.length === 0) return "ทริปที่ใกล้เคียงความต้องการของคุณ";
  return `ตรงกับที่อยากได้: ${matchedLabels.slice(0, 3).join(" + ")}`;
}

export { THEME_LABELS, PRICE_LABELS, PACE_LABELS };
