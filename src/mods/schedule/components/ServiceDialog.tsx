"use client";

import { useState, type FormEvent } from "react";
import Dialog from "@/components/ui/Dialog";
import { useCreateServiceMutation, useUpdateServiceMutation } from "@/mods/schedule/scheduleApi";
import { WEEKDAY_LABELS, toDateKey } from "@/mods/schedule/lib/availability";
import { addDays, priceRulesOverlap } from "@/mods/schedule/lib/pricing";
import type { Service, ServicePriceInput } from "@/mods/schedule/types";
import type { GraphqlError } from "@/lib/graphqlBaseQuery";

/** One editable price rule. Strings while editing; converted on save. */
interface RuleRow {
    key: string;
    /** Minutes; "" = any length */
    durationMin: string;
    /** Weekdays; none = every day */
    days: number[];
    amount: string;
    validFrom: string;
    /** "" = still current */
    validTo: string;
    /** Set on a row added with "Change price": editing its start date moves the old row's end */
    supersedes?: string;
}

let nextKey = 0;
const newKey = () => `row-${nextKey++}`;

const toRow = (p: Service["prices"][number]): RuleRow => ({
    key: newKey(),
    durationMin: p.durationMin == null ? "" : String(p.durationMin),
    days: p.days,
    amount: String(p.amount),
    validFrom: p.validFrom,
    validTo: p.validTo ?? "",
});

const toInput = (r: RuleRow): ServicePriceInput => ({
    durationMin: r.durationMin === "" ? null : Number(r.durationMin),
    days: r.days,
    amount: Number(r.amount),
    validFrom: r.validFrom,
    validTo: r.validTo || null,
});

/** Problems with one row on its own (the server checks the same rules). */
function rowProblems(r: RuleRow): string[] {
    const problems: string[] = [];
    const amount = Number(r.amount);
    if (r.amount === "" || !(amount > 0)) problems.push("Enter a price above 0.");
    else if (Math.round(amount * 100) !== amount * 100) problems.push("At most 2 decimal places.");
    if (r.durationMin !== "") {
        const m = Number(r.durationMin);
        if (!Number.isInteger(m) || m < 10 || m > 600) problems.push("Length: 10 to 600 minutes.");
    }
    if (!r.validFrom) problems.push("Choose the first day of the price.");
    else if (r.validTo && r.validTo < r.validFrom) problems.push("The end is before the start.");
    return problems;
}

/** Add a service (`target === "new"`) or edit one: name, active, and its price history. */
export default function ServiceDialog({
    target,
    onClose,
}: {
    target: Service | "new" | null;
    onClose: () => void;
}) {
    return (
        <Dialog open={target !== null} onClose={onClose} labelledBy="service-dialog-title" wide>
            {target && (
                <ServiceForm service={target === "new" ? undefined : target} onDone={onClose} />
            )}
        </Dialog>
    );
}

function ServiceForm({ service, onDone }: { service?: Service; onDone: () => void }) {
    const today = toDateKey(new Date());
    const [name, setName] = useState(service?.name ?? "");
    const [description, setDescription] = useState(service?.description ?? "");
    const [isActive, setIsActive] = useState(service?.isActive ?? true);
    const [rows, setRows] = useState<RuleRow[]>(() =>
        service?.prices.length
            ? [...service.prices].sort((a, b) => a.validFrom.localeCompare(b.validFrom)).map(toRow)
            : [
                  {
                      key: newKey(),
                      durationMin: "60",
                      days: [],
                      amount: "",
                      validFrom: today,
                      validTo: "",
                  },
              ],
    );

    const [createService, createState] = useCreateServiceMutation();
    const [updateService, updateState] = useUpdateServiceMutation();
    const saving = createState.isLoading || updateState.isLoading;
    const [error, setError] = useState<string | null>(null);

    // Per-row problems, plus overlaps between rows (one booking must match one price)
    const problemsByKey = new Map(rows.map((r) => [r.key, rowProblems(r)]));
    rows.forEach((a, i) =>
        rows.slice(i + 1).forEach((b, k) => {
            if (problemsByKey.get(a.key)!.length || problemsByKey.get(b.key)!.length) return;
            if (priceRulesOverlap(toInput(a), toInput(b))) {
                problemsByKey
                    .get(b.key)!
                    .push(
                        `Overlaps price ${i + 1}: same length and days in the same period. ` +
                            `End price ${i + 1} the day before this one starts.`,
                    );
            }
            void k;
        }),
    );
    const hasProblems = [...problemsByKey.values()].some((p) => p.length);

    const update = (key: string, patch: Partial<RuleRow>) =>
        setRows((list) => {
            let next = list.map((r) => (r.key === key ? { ...r, ...patch } : r));
            // A new price's start moves the end of the price it replaces
            const row = next.find((r) => r.key === key);
            if (patch.validFrom && row?.supersedes) {
                next = next.map((r) =>
                    r.key === row.supersedes ? { ...r, validTo: addDays(patch.validFrom!, -1) } : r,
                );
            }
            return next;
        });

    /** End this price yesterday and continue with a new amount from today (dates editable). */
    function changePrice(row: RuleRow) {
        const from = row.validFrom > today ? addDays(row.validFrom, 1) : today;
        const replacement: RuleRow = {
            ...row,
            key: newKey(),
            validFrom: from,
            validTo: "",
            supersedes: row.key,
        };
        setRows((list) => {
            const i = list.findIndex((r) => r.key === row.key);
            const next = list.map((r) =>
                r.key === row.key ? { ...r, validTo: addDays(from, -1) } : r,
            );
            next.splice(i + 1, 0, replacement);
            return next;
        });
    }

    function toggleDay(row: RuleRow, day: number) {
        const days = row.days.includes(day)
            ? row.days.filter((d) => d !== day)
            : [...row.days, day].sort((a, b) => a - b);
        update(row.key, { days });
    }

    async function handleSubmit(e: FormEvent) {
        e.preventDefault();
        if (!name.trim() || hasProblems || saving) return;
        const input = {
            name: name.trim(),
            description: description.trim(),
            isActive,
            prices: rows.map(toInput),
        };
        setError(null);
        try {
            if (service) await updateService({ id: service.id, input }).unwrap();
            else await createService(input).unwrap();
            onDone();
        } catch (err) {
            setError((err as GraphqlError).message);
        }
    }

    return (
        <form className="dialog__form" onSubmit={handleSubmit}>
            <header className="dialog__header">
                <h2 id="service-dialog-title">{service ? "Edit service" : "Add service"}</h2>
                <button type="button" className="icon-btn" onClick={onDone} aria-label="Close">
                    ✕
                </button>
            </header>

            <div className="field-row">
                <label className="field">
                    <span>Name</span>
                    <input
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        maxLength={100}
                        required
                        autoFocus
                    />
                </label>
                <label className="field">
                    <span>Description</span>
                    <input
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        maxLength={500}
                        placeholder="Optional"
                    />
                </label>
            </div>

            <label className="check">
                <input
                    type="checkbox"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                />
                Offered for new bookings
                {!isActive && <span className="muted small"> (archived: kept for reports)</span>}
            </label>

            <fieldset className="field field--plain">
                <legend>Prices</legend>
                <p className="muted small">
                    Each booking is charged the price whose dates, days and length match it. To
                    change a price, use <strong>Change price</strong>: the old one ends the day
                    before, so past bookings and reports keep their old price.
                </p>

                <ol className="price-rules">
                    {rows.map((r, i) => {
                        const problems = problemsByKey.get(r.key) ?? [];
                        const current = r.validFrom <= today && (!r.validTo || today <= r.validTo);
                        return (
                            <li key={r.key} className="price-rule">
                                <div className="price-rule__head">
                                    <strong>Price {i + 1}</strong>
                                    {current && <span className="badge badge--on">Current</span>}
                                    {r.validFrom > today && <span className="badge">Upcoming</span>}
                                    {r.validTo && r.validTo < today && (
                                        <span className="badge">Past</span>
                                    )}
                                    <span className="dialog__spacer" />
                                    {!r.validTo && (
                                        <button
                                            type="button"
                                            className="btn btn--ghost btn--sm"
                                            onClick={() => changePrice(r)}
                                        >
                                            Change price
                                        </button>
                                    )}
                                    <button
                                        type="button"
                                        className="icon-btn"
                                        aria-label={`Remove price ${i + 1}`}
                                        onClick={() =>
                                            setRows((list) => list.filter((x) => x.key !== r.key))
                                        }
                                    >
                                        ✕
                                    </button>
                                </div>

                                <div className="price-rule__grid">
                                    <label className="field">
                                        <span>Length (min)</span>
                                        <input
                                            type="number"
                                            min={10}
                                            max={600}
                                            step={5}
                                            value={r.durationMin}
                                            placeholder="Any"
                                            onChange={(e) =>
                                                update(r.key, { durationMin: e.target.value })
                                            }
                                        />
                                    </label>
                                    <label className="field">
                                        <span>Price (₱)</span>
                                        <input
                                            type="number"
                                            min={0}
                                            step="0.01"
                                            value={r.amount}
                                            onChange={(e) =>
                                                update(r.key, { amount: e.target.value })
                                            }
                                            required
                                        />
                                    </label>
                                    <label className="field">
                                        <span>From</span>
                                        <input
                                            type="date"
                                            value={r.validFrom}
                                            onChange={(e) =>
                                                update(r.key, { validFrom: e.target.value })
                                            }
                                            required
                                        />
                                    </label>
                                    <label className="field">
                                        <span>Until</span>
                                        <input
                                            type="date"
                                            value={r.validTo}
                                            min={r.validFrom}
                                            onChange={(e) =>
                                                update(r.key, { validTo: e.target.value })
                                            }
                                            aria-describedby={`${r.key}-until`}
                                        />
                                        <small id={`${r.key}-until`} className="muted small">
                                            Empty = no end date
                                        </small>
                                    </label>
                                </div>

                                <div className="price-rule__days">
                                    <span className="muted small">Days</span>
                                    <div className="weekdays" role="group" aria-label="Days">
                                        {WEEKDAY_LABELS.map((label, d) => {
                                            const on = r.days.includes(d);
                                            return (
                                                <button
                                                    key={label}
                                                    type="button"
                                                    className={on ? "weekday is-on" : "weekday"}
                                                    aria-pressed={on}
                                                    title={label}
                                                    onClick={() => toggleDay(r, d)}
                                                >
                                                    {label.charAt(0)}
                                                </button>
                                            );
                                        })}
                                    </div>
                                    <span className="muted small">
                                        {r.days.length ? "" : "None ticked = every day"}
                                    </span>
                                </div>

                                {problems.length > 0 && (
                                    <ul className="alert price-rule__problems">
                                        {problems.map((p) => (
                                            <li key={p}>{p}</li>
                                        ))}
                                    </ul>
                                )}
                            </li>
                        );
                    })}
                </ol>

                <button
                    type="button"
                    className="btn btn--ghost"
                    onClick={() =>
                        setRows((list) => [
                            ...list,
                            {
                                key: newKey(),
                                durationMin: "",
                                days: [],
                                amount: "",
                                validFrom: today,
                                validTo: "",
                            },
                        ])
                    }
                >
                    + Add price
                </button>
            </fieldset>

            {error && (
                <p className="alert" role="alert">
                    {error}
                </p>
            )}

            <footer className="dialog__footer">
                <span className="dialog__spacer" />
                <button type="button" className="btn btn--ghost" onClick={onDone}>
                    Cancel
                </button>
                <button
                    className="btn btn--primary"
                    disabled={!name.trim() || hasProblems || saving}
                >
                    {saving ? "Saving…" : service ? "Save changes" : "Add service"}
                </button>
            </footer>
        </form>
    );
}
