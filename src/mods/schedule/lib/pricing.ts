import { WEEKDAY_LABELS, toDateKey } from "@/mods/schedule/lib/availability";
import type { Service, ServicePrice } from "@/mods/schedule/types";

/**
 * Price rules, mirrored from the server (src/mods/schedule/service/impl/findServicePrice.ts and
 * db/service.zod.ts) for instant feedback. The server is the source of truth: it rejects
 * unpriced bookings and overlapping rules, and prices reports with the same lookup.
 */

type Rule = Pick<ServicePrice, "durationMin" | "days" | "validFrom" | "validTo">;

export interface PriceDay {
    /** Local date "YYYY-MM-DD" */
    dateKey: string;
    /** 0 = Sunday … 6 = Saturday */
    weekday: number;
}

export const priceDayOf = (date: Date): PriceDay => ({
    dateKey: toDateKey(date),
    weekday: date.getDay(),
});

/** True when the rule applies on that day (any length). */
export const ruleAppliesOn = (rule: Rule, { dateKey, weekday }: PriceDay) =>
    rule.validFrom <= dateKey &&
    (!rule.validTo || dateKey <= rule.validTo) &&
    (!rule.days.length || rule.days.includes(weekday));

/** The prevailing rule for a booking of `durationMin` minutes on that day, if any. */
export const findServicePrice = <T extends Rule>(
    prices: readonly T[],
    day: PriceDay,
    durationMin: number,
): T | undefined =>
    prices.find(
        (rule) =>
            ruleAppliesOn(rule, day) &&
            (rule.durationMin == null || rule.durationMin === durationMin),
    );

/** Fixed lengths with a price that day, shortest first ("any length" rules left out). */
export const pricedDurationsOn = (prices: readonly Rule[], day: PriceDay): number[] =>
    [
        ...new Set(
            prices
                .filter((r) => r.durationMin != null && ruleAppliesOn(r, day))
                .map((r) => r.durationMin as number),
        ),
    ].sort((a, b) => a - b);

/** True when the service has an "any length" price that day (e.g. Aki). */
export const hasAnyLengthPrice = (prices: readonly Rule[], day: PriceDay) =>
    prices.some((r) => r.durationMin == null && ruleAppliesOn(r, day));

/** The rules in force today: what the service costs now. */
export const currentPrices = (service: Service, today = priceDayOf(new Date())) =>
    service.prices.filter(
        (p) => p.validFrom <= today.dateKey && (!p.validTo || today.dateKey <= p.validTo),
    );

const END_OF_TIME = "9999-12-31";

/** A rule as edited (input fields may be left out) */
interface LooseRule {
    durationMin?: number | null;
    days?: readonly number[] | null;
    validFrom: string;
    validTo?: string | null;
}

/** True when one booking could match both rules (same as the server's check). */
export function priceRulesOverlap(a: LooseRule, b: LooseRule): boolean {
    const aDays = a.days ?? [];
    const bDays = b.days ?? [];
    const dates =
        a.validFrom <= (b.validTo || END_OF_TIME) && b.validFrom <= (a.validTo || END_OF_TIME);
    const days = !aDays.length || !bDays.length || aDays.some((d) => bDays.includes(d));
    const lengths =
        a.durationMin == null || b.durationMin == null || a.durationMin === b.durationMin;
    return dates && days && lengths;
}

const peso = new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
});

/** ₱1,099 (₱1,099.50 when there are centavos) */
export const formatPeso = (amount: number) => peso.format(amount);

/** "Every day", "Mon–Thu", "Fri–Sun", "Mon, Wed" */
export function describeDays(days: readonly number[]): string {
    if (!days.length || days.length === 7) return "Every day";
    // Write runs like Fri, Sat, Sun as Fri–Sun (Sunday counts after Saturday)
    const order = [...days].map((d) => (d === 0 ? 7 : d)).sort((a, b) => a - b);
    const label = (d: number) => WEEKDAY_LABELS[d % 7];
    const runs: string[] = [];
    for (let i = 0; i < order.length;) {
        let j = i;
        while (j + 1 < order.length && order[j + 1] === order[j] + 1) j++;
        runs.push(
            j - i >= 2
                ? `${label(order[i])}–${label(order[j])}`
                : order
                      .slice(i, j + 1)
                      .map(label)
                      .join(", "),
        );
        i = j + 1;
    }
    return runs.join(", ");
}

/** "60 min", "Any length" */
export const describeLength = (durationMin: number | null | undefined) =>
    durationMin == null ? "Any length" : `${durationMin} min`;

/** "60 min · ₱1,099" or "Mon–Thu · ₱699" for one rule */
export function describeRule(rule: Pick<ServicePrice, "durationMin" | "days" | "amount">) {
    const parts = [];
    if (rule.durationMin != null) parts.push(describeLength(rule.durationMin));
    if (rule.days.length) parts.push(describeDays(rule.days));
    parts.push(formatPeso(rule.amount));
    return parts.join(" · ");
}

/** "YYYY-MM-DD" plus `days` (negative to go back). */
export function addDays(dateKey: string, days: number): string {
    const d = new Date(`${dateKey}T00:00:00Z`);
    d.setUTCDate(d.getUTCDate() + days);
    return d.toISOString().slice(0, 10);
}
