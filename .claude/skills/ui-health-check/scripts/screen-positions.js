// Run with chrome-devtools evaluate_script (sourcePath) at the top of a page.
// Returns the scroll offsets that show the whole page one screen at a time.
// Each step is a viewport minus the sticky/fixed chrome pinned to the top, so
// nothing slides under the header between two screenshots unseen.
() => {
  const vh = window.innerHeight;
  const vw = document.documentElement.clientWidth;
  const topChrome = [...document.querySelectorAll("body *")]
    .filter((el) => {
      const s = getComputedStyle(el);
      if (!["fixed", "sticky"].includes(s.position) || !el.checkVisibility({ opacityProperty: true, visibilityProperty: true })) return false;
      const r = el.getBoundingClientRect();
      return r.top <= 1 && r.width >= vw * 0.6 && r.height < vh * 0.4;
    })
    .reduce((max, el) => Math.max(max, el.getBoundingClientRect().bottom), 0);
  const step = Math.max(Math.round(vh - topChrome - 16), Math.round(vh / 2));
  const height = document.documentElement.scrollHeight;
  const last = Math.max(0, height - vh);
  const positions = [];
  for (let y = 0; y < last; y += step) positions.push(y);
  positions.push(last);
  return { viewport: `${vw}x${vh}`, documentHeight: height, topChrome: Math.round(topChrome), step, screens: positions.length, positions };
}
