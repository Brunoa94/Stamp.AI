// Run with chrome-devtools evaluate_script (sourcePath) while a popup is open:
// a dialog, select listbox, menu, tooltip, popover or dropdown.
// Reports where each open layer sits, whether it is on top and fully on
// screen, where focus is, and whether the page behind is scroll-locked.
// Read-only: it inspects, it never clicks.
() => {
  const vw = document.documentElement.clientWidth;
  const vh = window.innerHeight;
  const isVisible = (el) => {
    const s = getComputedStyle(el);
    if (s.display === "none" || s.visibility === "hidden" || Number(s.opacity) === 0) return false;
    const r = el.getBoundingClientRect();
    return r.width > 1 && r.height > 1;
  };
  const sel = '[role="dialog"], [role="alertdialog"], [role="listbox"], [role="menu"], [role="tooltip"], [data-radix-popper-content-wrapper], [data-slot$="-content"][data-state="open"], details[open] > :not(summary)';
  const controlled = [...document.querySelectorAll('[aria-expanded="true"][aria-controls]')].map((t) => document.getElementById(t.getAttribute("aria-controls"))).filter(Boolean);
  const devtools = "nextjs-portal, [class*='tsqd']";
  const layers = [...new Set([...document.querySelectorAll(sel), ...controlled])].filter((el) => isVisible(el) && !el.closest(devtools));
  const outermost = layers.filter((el) => !layers.some((o) => o !== el && o.contains(el)));
  const active = document.activeElement;
  const describe = (el) => {
    if (!el || el === document.body) return "body";
    const label = el.getAttribute("aria-label") || el.innerText?.trim().slice(0, 40) || "";
    return `${el.tagName.toLowerCase()}${el.getAttribute("role") ? `[role=${el.getAttribute("role")}]` : ""}${label ? ` "${label}"` : ""}`;
  };
  const scrollable = (root) => [root, ...root.querySelectorAll("*")].some((el) => {
    const o = getComputedStyle(el).overflowY;
    return (o === "auto" || o === "scroll") && el.scrollHeight > el.clientHeight + 1;
  });

  const report = outermost.map((el) => {
    const r = el.getBoundingClientRect();
    const role = el.getAttribute("role") || el.querySelector("[role]")?.getAttribute("role") || "popover";
    const issues = [];
    const off = {
      left: Math.max(0, Math.round(-r.left)),
      right: Math.max(0, Math.round(r.right - vw)),
      top: Math.max(0, Math.round(-r.top)),
      bottom: Math.max(0, Math.round(r.bottom - vh)),
    };
    if (off.left || off.right) issues.push(`cut off horizontally (${off.left}px left, ${off.right}px right)`);
    if ((off.top || off.bottom) && !scrollable(el)) issues.push(`taller than the viewport and not scrollable (${off.top}px top, ${off.bottom}px bottom)`);
    const hit = document.elementFromPoint(Math.min(Math.max(r.left + r.width / 2, 0), vw - 1), Math.min(Math.max(r.top + r.height / 2, 0), vh - 1));
    if (hit && !el.contains(hit)) issues.push(`not on top: centre is covered by ${describe(hit)}`);
    const modal = role === "dialog" || role === "alertdialog";
    if (modal) {
      const labelled = el.getAttribute("aria-label") || (el.getAttribute("aria-labelledby") && document.getElementById(el.getAttribute("aria-labelledby"))?.textContent.trim());
      if (!labelled) issues.push("dialog has no accessible name");
      if (!el.contains(active)) issues.push(`focus is outside the dialog (on ${describe(active)})`);
      const bodyLocked = document.body.hasAttribute("data-scroll-locked") || ["hidden", "clip"].includes(getComputedStyle(document.body).overflowY) || ["hidden", "clip"].includes(getComputedStyle(document.documentElement).overflowY);
      if (!bodyLocked) issues.push("page behind the dialog can still scroll");
      if (vw < 640 && r.width < vw * 0.85) issues.push(`narrow on mobile: ${Math.round(r.width)}px of ${vw}px`);
    }
    if ((role === "listbox" || role === "menu") && !el.contains(active) && !active?.getAttribute("aria-activedescendant")) issues.push(`focus did not move into the ${role} (on ${describe(active)})`);
    const options = [...el.querySelectorAll('[role="option"], [role="menuitem"], [role="menuitemradio"], [role="menuitemcheckbox"]')].filter(isVisible);
    const smallOptions = options.filter((o) => o.getBoundingClientRect().height < 24).length;
    if (smallOptions) issues.push(`${smallOptions} option(s) under 24px tall`);
    return {
      role,
      rect: [Math.round(r.left), Math.round(r.top), Math.round(r.width), Math.round(r.height)],
      options: options.length,
      issues,
    };
  });

  return {
    viewport: `${vw}x${vh}`,
    openLayers: report.length,
    focus: describe(active),
    layers: report,
  };
}
