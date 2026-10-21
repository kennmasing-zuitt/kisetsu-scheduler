import type { Promo } from "@/mods/schedule/types";

/**
 * Promo rules, mirrored from the server (src/mods/schedule/service/impl/assertPromoApplies.ts
 * and promoDiscount.ts) to preview the discount in the booking dialog. The server checks again.
 */

const round2 = (n: number) => Math.round(n * 100) / 100;

/** value% off, or value pesos off (never more than the price), in centavos */
export const promoDiscount = (promo: Pick<Promo, "discountType" | "value">, price: number) =>
    promo.discountType === "percent"
        ? round2((price * promo.value) / 100)
        : round2(Math.min(promo.value, price));

/** "10% off" or "₱200 off" */
export const describeDiscount = (promo: Pick<Promo, "discountType" | "value">) =>
    promo.discountType === "percent"
        ? `${promo.value}% off`
        : `₱${promo.value.toLocaleString(undefined, { maximumFractionDigits: 2 })} off`;

/** Why the code can't be used on this booking, or null when it can. */
export function promoProblem(
    promo: Promo | undefined,
    code: string,
    booking: { dateKey?: string; serviceId?: string; serviceName?: string; keepsCode: boolean },
): string | null {
    if (!promo) return `Promo code "${code}" doesn't exist.`;
    // A booking that already had the code keeps it even if it was archived since
    if (!promo.isActive && !booking.keepsCode) return `${promo.code} is not active.`;
    if (booking.dateKey && booking.dateKey < promo.validFrom)
        return `${promo.code} can be used from ${promo.validFrom}.`;
    if (booking.dateKey && promo.validTo && booking.dateKey > promo.validTo)
        return `${promo.code} ended on ${promo.validTo}.`;
    if (
        promo.serviceIds.length &&
        (!booking.serviceId || !promo.serviceIds.includes(booking.serviceId))
    )
        return `${promo.code} doesn't apply to ${booking.serviceName ?? "this service"}.`;
    return null;
}
