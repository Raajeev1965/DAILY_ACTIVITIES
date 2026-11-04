import type { Head } from "./types";

export interface ParsedTx {
  type: "expense" | "income";
  amount: number | null;
  head: Head | null;
  note: string;
}

const INCOME_RE = /\b(received|earned|salary|income|credited|deposited|refund(?:ed)?|cashback|bonus|paid me|pocket money|got paid)\b/i;

// Checked in order: the first match wins ("mobile bill" -> Communication, "electricity bill" -> Bills).
const HEAD_RULES: [Head, RegExp][] = [
  ["Fuel", /\b(petrol|diesel|fuel|cng|pump)\b/i],
  ["Communication", /\b(recharge|mobile|phone|internet|wi-?fi|broadband|data pack|sim|jio|airtel|vodafone|dth|postpaid|prepaid|telephone|calling)\b/i],
  ["Health", /\b(medicine|medicines|medical|doctor|hospital|pharmacy|clinic|tablets?|check-?up|dentist|lab test|blood test|dawai|davai|chemist|health)\b/i],
  ["Grocery", /\b(grocery|groceries|vegetables?|veggies|fruits?|milk|kirana|supermarket|rice|atta|flour|dal|bread|eggs?|sabzi|ration|bigbasket|blinkit|zepto|sugar)\b/i],
  ["Bills", /\b(bills?|electricity|rent|emi|insurance|tax|maintenance|lpg|cylinder|premium|subscription)\b/i],
];

const NUM = "(\\d+(?:\\.\\d+)?)";
const MULT = "(?:\\s*(k|thousand|hundred|lakh|lac)\\b)?";

function toAmount(n: string, mult?: string): number {
  let v = parseFloat(n);
  if (mult) {
    const m = mult.toLowerCase();
    v *= m === "k" || m === "thousand" ? 1000 : m === "hundred" ? 100 : 100000;
  }
  return Math.round(v * 100) / 100;
}

export function extractAmount(raw: string): number | null {
  let t = raw.toLowerCase();
  while (/(\d),(\d)/.test(t)) t = t.replace(/(\d),(\d)/g, "$1$2");

  const patterns = [
    new RegExp(`(?:\\b(?:rs\\.?|rupees?|inr)|₹)\\s*${NUM}${MULT}`),
    new RegExp(`${NUM}${MULT}\\s*(?:\\brs\\b|\\brupees?\\b|₹|\\binr\\b|/-)`),
    new RegExp(`\\b(?:for|of|spent|paid|pay|worth|cost|costs|was)\\s+${NUM}${MULT}`),
  ];
  for (const re of patterns) {
    const m = t.match(re);
    if (m) return toAmount(m[1], m[2]);
  }

  // Fallback: the largest number mentioned.
  const all = Array.from(t.matchAll(new RegExp(`${NUM}${MULT}`, "g"))).map((m) => toAmount(m[1], m[2]));
  return all.length ? Math.max(...all) : null;
}

export function parseTransaction(text: string): ParsedTx {
  const t = text.trim();
  const type = INCOME_RE.test(t) ? "income" : "expense";
  const head = type === "expense" ? HEAD_RULES.find(([, re]) => re.test(t))?.[0] ?? null : null;
  return { type, amount: extractAmount(t), head, note: t.charAt(0).toUpperCase() + t.slice(1) };
}
