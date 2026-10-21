/**
 * Mobile numbers in one canonical form ("+639171234567"), mirrored from the server
 * (kisetsu-scheduler-server: src/shared/mobile.ts) so the dialog can look clients up as you type.
 *
 * Philippine mobiles, all -> +639XXXXXXXXX: 09171234567 · 0917 123 4567 · 0917-123-4567 ·
 * (0917) 123-4567 · 9171234567 · 639171234567 · +639171234567 · +63 917 123 4567 · 0063 917…
 * International: "+" (or "00") then 8–15 digits. Anything else (e.g. landlines) -> null.
 */
export function normalizeMobile(input: string): string | null {
    let s = input.trim().replace(/[\s\-./()]/g, "");
    if (s.startsWith("00")) s = `+${s.slice(2)}`;
    if (!/^\+?\d+$/.test(s)) return null;

    const digits = s.replace("+", "");
    const hasPlus = s.startsWith("+");

    const ph = /^(?:63|0)?(9\d{9})$/.exec(digits);
    if (ph && (!hasPlus || digits.startsWith("63"))) return `+63${ph[1]}`;
    if (digits.startsWith("63")) return null;
    if (hasPlus && /^[1-9]\d{7,14}$/.test(digits)) return `+${digits}`;
    return null;
}

export const MOBILE_HINT =
    "Enter a mobile number like 0917 123 4567 or +63 917 123 4567 (international: +<country code>…).";

/** "+639171234567" -> "0917 123 4567"; other numbers as they are */
export function formatMobile(mobile: string | null | undefined): string {
    if (!mobile) return "";
    const m = /^\+63(9\d{2})(\d{3})(\d{4})$/.exec(mobile);
    return m ? `0${m[1]} ${m[2]} ${m[3]}` : mobile;
}
