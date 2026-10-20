"use client";

import { useEffect, useRef } from "react";

/**
 * A native <dialog> shown as a modal while `open` is true. Esc, the backdrop and the
 * parent's close button all end in `onClose`. Children only render while open, so a form
 * inside starts fresh each time.
 */
export default function Dialog({
    open,
    onClose,
    labelledBy,
    wide = false,
    children,
}: {
    open: boolean;
    onClose: () => void;
    /** id of the heading inside, for screen readers */
    labelledBy: string;
    /** Wider dialog for forms with tables or repeated rows */
    wide?: boolean;
    children: React.ReactNode;
}) {
    const ref = useRef<HTMLDialogElement>(null);

    useEffect(() => {
        const dialog = ref.current;
        if (!dialog) return;
        if (open && !dialog.open) dialog.showModal();
        if (!open && dialog.open) dialog.close();
    }, [open]);

    return (
        <dialog
            ref={ref}
            className={wide ? "dialog dialog--wide" : "dialog"}
            onClose={onClose}
            onClick={(e) => e.target === ref.current && ref.current?.close()} // click on backdrop
            aria-labelledby={labelledBy}
        >
            {open && children}
        </dialog>
    );
}
