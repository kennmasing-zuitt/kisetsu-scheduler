"use client";

import { useState, type FormEvent } from "react";
import Dialog from "@/components/ui/Dialog";
import { useCreateRoomMutation, useUpdateRoomMutation } from "@/mods/schedule/scheduleApi";
import type { Room } from "@/mods/schedule/types";
import type { GraphqlError } from "@/lib/graphqlBaseQuery";

/** Quick picks that read well as calendar event backgrounds with white text */
const PRESET_COLORS = [
    "#534AB7",
    "#0F6E56",
    "#993C1D",
    "#993556",
    "#2D6A9F",
    "#6B5B1F",
    "#5F3B8C",
    "#3B6E2D",
];

const HEX = /^#[0-9a-fA-F]{6}$/;

/** Add a room (`target === "new"`) or edit one: name and calendar color. */
export default function RoomDialog({
    target,
    onClose,
}: {
    target: Room | "new" | null;
    onClose: () => void;
}) {
    return (
        <Dialog open={target !== null} onClose={onClose} labelledBy="room-dialog-title">
            {target && <RoomForm room={target === "new" ? undefined : target} onDone={onClose} />}
        </Dialog>
    );
}

function RoomForm({ room, onDone }: { room?: Room; onDone: () => void }) {
    const [name, setName] = useState(room?.name ?? "");
    const [color, setColor] = useState(room?.color ?? PRESET_COLORS[0]);

    const [createRoom, createState] = useCreateRoomMutation();
    const [updateRoom, updateState] = useUpdateRoomMutation();
    const saving = createState.isLoading || updateState.isLoading;
    const [error, setError] = useState<string | null>(null);

    const validColor = HEX.test(color);

    async function handleSubmit(e: FormEvent) {
        e.preventDefault();
        if (!name.trim() || !validColor || saving) return;
        const input = { name: name.trim(), color: color.toUpperCase() };
        setError(null);
        try {
            if (room) await updateRoom({ id: room.id, input }).unwrap();
            else await createRoom(input).unwrap();
            onDone();
        } catch (err) {
            setError((err as GraphqlError).message);
        }
    }

    return (
        <form className="dialog__form" onSubmit={handleSubmit}>
            <header className="dialog__header">
                <h2 id="room-dialog-title">{room ? "Edit room" : "Add room"}</h2>
                <button type="button" className="icon-btn" onClick={onDone} aria-label="Close">
                    ✕
                </button>
            </header>

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

            <fieldset className="field field--plain">
                <legend>Calendar color</legend>
                <div className="swatches" role="group" aria-label="Preset colors">
                    {PRESET_COLORS.map((c) => (
                        <button
                            key={c}
                            type="button"
                            className={
                                c.toUpperCase() === color.toUpperCase()
                                    ? "swatch-btn is-selected"
                                    : "swatch-btn"
                            }
                            style={{ background: c }}
                            aria-label={c}
                            aria-pressed={c.toUpperCase() === color.toUpperCase()}
                            onClick={() => setColor(c)}
                        />
                    ))}
                </div>
                <div className="inline-add">
                    <input
                        type="color"
                        value={validColor ? color : "#000000"}
                        onChange={(e) => setColor(e.target.value.toUpperCase())}
                        aria-label="Pick a custom color"
                    />
                    <input
                        value={color}
                        onChange={(e) => setColor(e.target.value)}
                        aria-label="Hex color"
                        aria-invalid={!validColor}
                        placeholder="#RRGGBB"
                        maxLength={7}
                    />
                </div>
                {!validColor && <p className="muted small">Use a hex color like #534AB7.</p>}
            </fieldset>

            <div className="room-preview" style={{ background: validColor ? color : undefined }}>
                Mr. Cruz · {name.trim() || "Room"}
            </div>

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
                    disabled={!name.trim() || !validColor || saving}
                >
                    {saving ? "Saving…" : room ? "Save changes" : "Add room"}
                </button>
            </footer>
        </form>
    );
}
