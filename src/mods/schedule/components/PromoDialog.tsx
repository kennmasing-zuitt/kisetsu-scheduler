"use client";

import { useState, type FormEvent } from "react";
import Dialog from "@/components/ui/Dialog";
import {
    useCreatePromoMutation,
    useGetServicesQuery,
    useUpdatePromoMutation,
} from "@/mods/schedule/scheduleApi";
import { toDateKey } from "@/mods/schedule/lib/availability";
import type { Promo } from "@/mods/schedule/types";
import type { GraphqlError } from "@/lib/graphqlBaseQuery";

/** What the dialog edits: an existing promo, a new one, or a copy of a locked one */
export type PromoTarget = { promo: Promo } | { copyOf?: Promo } | null;

const CODE = /^[A-Z0-9][A-Z0-9_-]{2,29}$/;

/** Add, edit or duplicate a promo code. A used promo's code, discount and services are locked. */
export default function PromoDialog({
    target,
    onClose,
}: {
    target: PromoTarget;
    onClose: () => void;
}) {
    return (
        <Dialog open={target !== null} onClose={onClose} labelledBy="promo-dialog-title">
            {target && (
                <PromoForm
                    promo={"promo" in target ? target.promo : undefined}
                    copyOf={"copyOf" in target ? target.copyOf : undefined}
                    onDone={onClose}
                />
            )}
        </Dialog>
    );
}

function PromoForm({
    promo,
    copyOf,
    onDone,
}: {
    promo?: Promo;
    copyOf?: Promo;
    onDone: () => void;
}) {
    const base = promo ?? copyOf;
    const locked = Boolean(promo?.isLocked);
    const today = toDateKey(new Date());
    const { data: services = [] } = useGetServicesQuery(true);

    const [code, setCode] = useState(promo?.code ?? (copyOf ? `${copyOf.code}-2` : ""));
    const [description, setDescription] = useState(base?.description ?? "");
    const [discountType, setDiscountType] = useState<Promo["discountType"]>(
        base?.discountType ?? "percent",
    );
    const [value, setValue] = useState(base ? String(base.value) : "");
    const [validFrom, setValidFrom] = useState(copyOf ? today : (promo?.validFrom ?? today));
    const [validTo, setValidTo] = useState(copyOf ? "" : (promo?.validTo ?? ""));
    const [serviceIds, setServiceIds] = useState<string[]>(base?.serviceIds ?? []);
    const [isActive, setIsActive] = useState(promo?.isActive ?? true);

    const [createPromo, createState] = useCreatePromoMutation();
    const [updatePromo, updateState] = useUpdatePromoMutation();
    const saving = createState.isLoading || updateState.isLoading;
    const [error, setError] = useState<string | null>(null);

    const amount = Number(value);
    const problems: string[] = [];
    if (!CODE.test(code)) problems.push("Code: 3–30 letters, digits, - or _ (e.g. KISETSU10).");
    if (value === "" || !(amount > 0)) problems.push("Enter a discount above 0.");
    else if (Math.round(amount * 100) !== amount * 100) problems.push("At most 2 decimal places.");
    else if (discountType === "percent" && amount > 100)
        problems.push("A percent discount is at most 100.");
    if (!validFrom) problems.push("Choose the first day it can be used.");
    else if (validTo && validTo < validFrom) problems.push("The end is before the start.");

    const toggleService = (id: string) =>
        setServiceIds((ids) => (ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id]));

    async function handleSubmit(e: FormEvent) {
        e.preventDefault();
        if (problems.length || saving) return;
        setError(null);
        // Locked promos only send what may still change
        const open = {
            description: description.trim(),
            validFrom,
            validTo: validTo || null,
            isActive,
        };
        const terms = { code, discountType, value: amount, serviceIds };
        try {
            if (promo)
                await updatePromo({
                    id: promo.id,
                    input: locked ? open : { ...open, ...terms },
                }).unwrap();
            else await createPromo({ ...open, ...terms }).unwrap();
            onDone();
        } catch (err) {
            setError((err as GraphqlError).message);
        }
    }

    return (
        <form className="dialog__form" onSubmit={handleSubmit}>
            <header className="dialog__header">
                <h2 id="promo-dialog-title">
                    {promo ? "Edit promo" : copyOf ? `New promo from ${copyOf.code}` : "Add promo"}
                </h2>
                <button type="button" className="icon-btn" onClick={onDone} aria-label="Close">
                    ✕
                </button>
            </header>

            {locked && (
                <p className="notice small">
                    Used by {promo!.timesUsed} booking{promo!.timesUsed === 1 ? "" : "s"}, so the
                    code, discount and services are fixed (past reports stay correct). Use{" "}
                    <strong>Duplicate</strong> to offer different terms.
                </p>
            )}

            <div className="field-row">
                <label className="field">
                    <span>Code</span>
                    <input
                        value={code}
                        onChange={(e) => setCode(e.target.value.toUpperCase().replace(/\s/g, ""))}
                        disabled={locked}
                        maxLength={30}
                        required
                        autoFocus={!locked}
                    />
                </label>
                <label className="field">
                    <span>Description</span>
                    <input
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Optional"
                        maxLength={300}
                    />
                </label>
            </div>

            <div className="field-row">
                <label className="field">
                    <span>Discount</span>
                    <select
                        value={discountType}
                        onChange={(e) => setDiscountType(e.target.value as Promo["discountType"])}
                        disabled={locked}
                    >
                        <option value="percent">Percent off</option>
                        <option value="amount">Pesos off</option>
                    </select>
                </label>
                <label className="field">
                    <span>{discountType === "percent" ? "Percent (%)" : "Amount (₱)"}</span>
                    <input
                        type="number"
                        min={0}
                        max={discountType === "percent" ? 100 : undefined}
                        step="0.01"
                        value={value}
                        onChange={(e) => setValue(e.target.value)}
                        disabled={locked}
                        required
                    />
                </label>
            </div>

            <div className="field-row">
                <label className="field">
                    <span>Valid from</span>
                    <input
                        type="date"
                        value={validFrom}
                        onChange={(e) => setValidFrom(e.target.value)}
                        required
                    />
                </label>
                <label className="field">
                    <span>Until</span>
                    <input
                        type="date"
                        value={validTo}
                        min={validFrom}
                        onChange={(e) => setValidTo(e.target.value)}
                    />
                    <small className="muted small">Empty = no end date</small>
                </label>
            </div>

            <fieldset className="field field--plain">
                <legend>Services</legend>
                <div className="chip-toggles" role="group" aria-label="Services">
                    {services.map((s) => {
                        const on = serviceIds.includes(s.id);
                        return (
                            <button
                                key={s.id}
                                type="button"
                                className={on ? "chip-toggle is-on" : "chip-toggle"}
                                aria-pressed={on}
                                onClick={() => toggleService(s.id)}
                                disabled={locked}
                            >
                                {s.name}
                            </button>
                        );
                    })}
                </div>
                <small className="muted small">
                    {serviceIds.length ? "Only the ticked services" : "None ticked = every service"}
                </small>
            </fieldset>

            <label className="check">
                <input
                    type="checkbox"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                />
                Active (can be applied to new bookings)
            </label>

            {(problems.length > 0 || error) && (
                <ul className="alert dialog__problems" role="alert">
                    {problems.map((p) => (
                        <li key={p}>{p}</li>
                    ))}
                    {error && <li>{error}</li>}
                </ul>
            )}

            <footer className="dialog__footer">
                <span className="dialog__spacer" />
                <button type="button" className="btn btn--ghost" onClick={onDone}>
                    Cancel
                </button>
                <button className="btn btn--primary" disabled={problems.length > 0 || saving}>
                    {saving ? "Saving…" : promo ? "Save changes" : "Add promo"}
                </button>
            </footer>
        </form>
    );
}
