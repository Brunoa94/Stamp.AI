import { useEffect, RefObject } from "react";

const FOCUSABLE_SELECTOR =
    "button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex='-1'])";

interface UseModalFocusTrapOptions {
    isOpen: boolean;
    containerRef: RefObject<HTMLElement | null>;
    initialFocusRef?: RefObject<HTMLElement | null>;
    onEscape?: () => void;
}

export function useModalFocusTrap({
    isOpen,
    containerRef,
    initialFocusRef,
    onEscape,
}: UseModalFocusTrapOptions) {
    useEffect(() => {
        if (!isOpen) return;

        const previousFocused = document.activeElement as HTMLElement | null;

        if (initialFocusRef?.current) {
            initialFocusRef.current.focus();
        }

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                event.preventDefault();
                onEscape?.();
                return;
            }

            if (event.key !== "Tab" || !containerRef.current) return;

            const focusables = Array.from(
                containerRef.current.querySelectorAll<HTMLElement>(
                    FOCUSABLE_SELECTOR,
                ),
            );

            if (focusables.length === 0) return;

            const first = focusables[0];
            const last = focusables[focusables.length - 1];

            if (event.shiftKey && document.activeElement === first) {
                event.preventDefault();
                last.focus();
            } else if (!event.shiftKey && document.activeElement === last) {
                event.preventDefault();
                first.focus();
            }
        };

        document.addEventListener("keydown", handleKeyDown);
        return () => {
            document.removeEventListener("keydown", handleKeyDown);
            previousFocused?.focus();
        };
    }, [isOpen, containerRef, initialFocusRef, onEscape]);
}
