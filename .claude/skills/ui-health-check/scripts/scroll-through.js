// Run with chrome-devtools evaluate_script (sourcePath) right after a page loads.
// Scrolls to the bottom in viewport-sized steps the way a reader would, so
// lazy images, in-view animations and sticky elements all get exercised, then
// reports layout shifts, scroll locks and fixed elements covering content.
// Read-only: it scrolls, it never clicks.
async () => {
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  const vh = window.innerHeight;
  const vw = document.documentElement.clientWidth;
  const shifts = [];
  const observer = new PerformanceObserver((list) => {
    list.getEntries().forEach((e) => {
      if (e.hadRecentInput) return;
      shifts.push({
        value: Number(e.value.toFixed(4)),
        at: Math.round(window.scrollY),
        sources: (e.sources ?? []).slice(0, 3).map((s) => {
          const n = s.node;
          if (!n || n.nodeType !== 1) return "#text";
          const cls = typeof n.className === "string" ? n.className.trim().split(/\s+/).slice(0, 2).join(".") : "";
          return `${n.tagName.toLowerCase()}${cls ? `.${cls}` : ""}`;
        }),
      });
    });
  });
  observer.observe({ type: "layout-shift", buffered: true });

  const startHeight = document.documentElement.scrollHeight;
  let steps = 0;
  let stuck = 0;
  while (steps < 80) {
    const before = window.scrollY;
    // "instant": globals.css sets scroll-behavior: smooth, which would leave later checks mid-scroll
    window.scrollBy({ top: Math.round(vh * 0.8), behavior: "instant" });
    await wait(300);
    steps += 1;
    if (window.scrollY === before) {
      stuck += 1;
      if (stuck >= 2) break;
    } else stuck = 0;
  }
  await wait(600);
  const endHeight = document.documentElement.scrollHeight;
  const reachedBottom = Math.ceil(window.scrollY + vh) >= endHeight - 2;
  const scrollable = startHeight > vh + 4;

  // At the bottom, a fixed/sticky element covering the last controls cannot be scrolled past
  const coveredAtBottom = [];
  document.querySelectorAll('a[href], button, input:not([type="hidden"]), select, textarea, [role="button"]').forEach((el) => {
    const r = el.getBoundingClientRect();
    if (r.width < 2 || r.height < 2 || r.bottom < 0 || r.top > vh) return;
    const hit = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
    if (!hit || hit === el || el.contains(hit) || hit.contains(el)) return;
    // Only bottom-anchored layers matter: content under a top header can be scrolled back into view
    for (let p = hit; p; p = p.parentElement) {
      const pos = getComputedStyle(p).position;
      if ((pos === "fixed" || pos === "sticky") && p.getBoundingClientRect().top > vh / 2) {
        coveredAtBottom.push({ target: (el.innerText || el.getAttribute("aria-label") || el.tagName).trim().slice(0, 40), coveredBy: `${p.tagName.toLowerCase()}${p.id ? `#${p.id}` : ""}` });
        break;
      }
    }
  });

  // A sticky element only covers the screen page-wide when its parent spans most of the
  // document (the header); one that sticks inside a column (an order summary) scrolls away.
  const docHeight = document.documentElement.scrollHeight;
  const fixedLayers = [...document.querySelectorAll("body *")]
    .filter((el) => {
      const s = getComputedStyle(el);
      if (s.pointerEvents === "none" || el.getAttribute("aria-hidden") === "true" || !el.checkVisibility({ opacityProperty: true, visibilityProperty: true })) return false;
      if (s.position === "fixed") return true;
      return s.position === "sticky" && el.parentElement && el.parentElement.getBoundingClientRect().height >= docHeight * 0.9;
    })
    .map((el) => {
      const r = el.getBoundingClientRect();
      return { el: `${el.tagName.toLowerCase()}${el.id ? `#${el.id}` : ""}`, position: getComputedStyle(el).position, heightPct: Math.round((r.height / vh) * 100), widthPct: Math.round((r.width / vw) * 100) };
    })
    .filter((l) => l.heightPct > 0 && l.widthPct > 0 && !(l.heightPct >= 95 && l.widthPct >= 95));
  const fixedCoverPct = fixedLayers.filter((l) => l.widthPct > 60).reduce((s, l) => s + l.heightPct, 0);

  observer.disconnect();
  window.scrollTo({ top: 0, behavior: "instant" });
  await wait(300);

  const cls = Number(shifts.reduce((s, e) => s + e.value, 0).toFixed(4));
  return {
    url: location.pathname + location.search,
    steps,
    reachedBottom,
    scrollLocked: scrollable && steps <= 2 && !reachedBottom,
    heightGrowth: endHeight - startHeight,
    cls,
    clsVerdict: cls <= 0.1 ? "good" : cls <= 0.25 ? "needs-improvement" : "poor",
    worstShifts: shifts.sort((a, b) => b.value - a.value).slice(0, 5),
    fixedLayers,
    fixedCoverPct,
    coveredAtBottom: coveredAtBottom.slice(0, 8),
  };
}
