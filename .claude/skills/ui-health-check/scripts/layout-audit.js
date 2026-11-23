// Run with chrome-devtools evaluate_script (sourcePath) after the page has
// loaded and scroll-through.js has run, so lazy content is in the DOM.
// Read-only: it inspects the DOM and returns findings, it never clicks.
async () => {
  const vw = document.documentElement.clientWidth;
  const vh = window.innerHeight;
  const CAP = 8;
  const findings = {};

  const describe = (el) => {
    if (!el) return null;
    const r = el.getBoundingClientRect();
    const cls = typeof el.className === "string" ? el.className.trim().split(/\s+/).slice(0, 3).join(".") : "";
    const text = (el.innerText || el.getAttribute("aria-label") || el.getAttribute("alt") || "").trim().replace(/\s+/g, " ").slice(0, 50);
    return {
      el: `${el.tagName.toLowerCase()}${el.id ? `#${el.id}` : ""}${cls ? `.${cls}` : ""}`,
      text,
      rect: [Math.round(r.left), Math.round(r.top + window.scrollY), Math.round(r.width), Math.round(r.height)],
    };
  };
  const add = (check, el, detail) => {
    findings[check] ??= { count: 0, items: [] };
    findings[check].count += 1;
    if (findings[check].items.length < CAP) findings[check].items.push({ ...describe(el), detail });
  };
  // Visible means rendered (ancestors included), not inert or aria-hidden, and not
  // fully clipped away by an overflow ancestor (e.g. a collapsed mobile menu).
  const isVisible = (el) => {
    if (!el.checkVisibility({ opacityProperty: true, visibilityProperty: true })) return false;
    if (el.closest("[inert], [aria-hidden='true']")) return false;
    const r = el.getBoundingClientRect();
    if (r.width <= 1 || r.height <= 1) return false;
    let [left, top, right, bottom] = [r.left, r.top, r.right, r.bottom];
    for (let p = el.parentElement; p && p !== document.body; p = p.parentElement) {
      const s = getComputedStyle(p);
      if (s.overflowX === "visible" && s.overflowY === "visible") continue;
      const pr = p.getBoundingClientRect();
      if (s.overflowX !== "visible") { left = Math.max(left, pr.left); right = Math.min(right, pr.right); }
      if (s.overflowY !== "visible") { top = Math.max(top, pr.top); bottom = Math.min(bottom, pr.bottom); }
      if (right - left <= 1 || bottom - top <= 1) return false;
    }
    return true;
  };
  const isSrOnly = (el) => {
    const s = getComputedStyle(el);
    return s.position === "absolute" && (s.clip === "rect(0px, 0px, 0px, 0px)" || s.clipPath === "inset(50%)");
  };
  const all = [...document.body.querySelectorAll("*")].filter((el) => !el.closest("nextjs-portal, script, style, noscript, template, [class*='tsqd']"));
  const visible = all.filter(isVisible);
  const ownText = (el) => [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim());

  // Page-level horizontal scroll
  const sw = document.documentElement.scrollWidth;
  if (sw > vw + 1) add("page-horizontal-scroll", null, `document is ${sw}px wide in a ${vw}px viewport`);

  // Elements sticking out of the viewport that no ancestor clips (outermost offender only)
  const clippedByAncestor = (el) => {
    for (let p = el.parentElement; p && p !== document.body; p = p.parentElement) {
      const o = getComputedStyle(p).overflowX;
      if (o !== "visible") return true;
    }
    return false;
  };
  const outside = visible.filter((el) => {
    const r = el.getBoundingClientRect();
    return (r.right > vw + 1 || r.left < -1) && !isSrOnly(el) && !clippedByAncestor(el);
  });
  outside
    .filter((el) => !outside.some((o) => o !== el && o.contains(el)))
    .forEach((el) => {
      const r = el.getBoundingClientRect();
      add("element-outside-viewport", el, `spans ${Math.round(r.left)}..${Math.round(r.right)} of 0..${vw}`);
    });

  // Text that is clipped, truncated, or spills out of its box
  visible.filter(ownText).forEach((el) => {
    const s = getComputedStyle(el);
    if (s.display.startsWith("inline") && s.display !== "inline-block" && s.display !== "inline-flex") return;
    const overX = el.scrollWidth > el.clientWidth + 1;
    const overY = el.scrollHeight > el.clientHeight + 2;
    const clipsX = s.overflowX !== "visible";
    const clipsY = s.overflowY !== "visible";
    if (overX && clipsX && s.textOverflow !== "ellipsis" && s.overflowX !== "auto" && s.overflowX !== "scroll") add("text-clipped", el, "text cut off horizontally");
    else if (overX && clipsX && s.textOverflow === "ellipsis") add("text-truncated", el, "ellipsis: check the full text is reachable (title/tooltip/expand)");
    else if (overX && !clipsX) add("text-overflows-box", el, `content ${el.scrollWidth}px in a ${el.clientWidth}px box`);
    if (overY && clipsY && s.webkitLineClamp === "none" && s.overflowY !== "auto" && s.overflowY !== "scroll") add("text-clipped-vertical", el, "lines cut off at the bottom");
    const size = parseFloat(s.fontSize);
    if (size < 12 && !isSrOnly(el)) add("tiny-text", el, `${size}px`);
  });

  // Untranslated message keys and unfilled ICU placeholders
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  for (let n = walker.nextNode(); n; n = walker.nextNode()) {
    const t = n.textContent.trim();
    const parent = n.parentElement;
    if (!t || !parent || parent.closest("script, style, nextjs-portal, code, pre") || !isVisible(parent)) continue;
    if (/^[a-z][a-zA-Z0-9]*(\.[a-zA-Z0-9_]+){1,}$/.test(t) && !/^\d/.test(t) && !/\.(com|nl|pt|io|png|jpg|svg)$/i.test(t)) add("untranslated-key", parent, t);
    if (/\{[a-zA-Z_]+\}/.test(t)) add("unfilled-placeholder", parent, t.slice(0, 60));
  }

  // Images: broken, still loading, distorted, upscaled, missing alt.
  // A failed image is reloaded once in a detached Image: the dev server's
  // optimizer can fail on a cold first request, which is not a real break.
  const reloads = [];
  [...document.images].forEach((img) => {
    if (!img.hasAttribute("alt")) add("img-missing-alt", img, img.currentSrc || img.src);
    if (!isVisible(img)) return;
    if (img.complete && img.naturalWidth === 0) {
      const src = img.currentSrc || img.src;
      const probe = new Image();
      probe.src = src;
      reloads.push(probe.decode().then(() => add("img-failed-then-loaded", img, `${src} (reload them and re-check; transient on a cold dev server)`), () => add("img-broken", img, src)));
      return;
    }
    if (!img.complete) return add("img-not-loaded", img, img.currentSrc || img.src);
    if (/\.svg(\?|$)/.test(img.currentSrc)) return;
    const r = img.getBoundingClientRect();
    // naturalWidth is density-corrected for srcset candidates (a 128w file can read as 64),
    // so the real file width comes from a detached Image of the chosen source
    const fileWidth = new Promise((resolve) => {
      const probe = new Image();
      probe.onload = () => resolve(probe.naturalWidth);
      probe.onerror = () => resolve(null);
      probe.src = img.currentSrc;
    });
    const fit = getComputedStyle(img).objectFit;
    const natural = img.naturalWidth / img.naturalHeight;
    const shown = r.width / r.height;
    if (fit === "fill" && Math.abs(natural - shown) / natural > 0.03) add("img-distorted", img, `natural ${natural.toFixed(2)} vs shown ${shown.toFixed(2)}, object-fit: fill`);
    reloads.push(fileWidth.then((w) => {
      if (w && r.width * devicePixelRatio > w * 1.5) add("img-upscaled", img, `${w}px file shown at ${Math.round(r.width * devicePixelRatio)} device px`);
    }));
  });

  // Interactive targets: size, accessible name, covered at the current scroll position
  const interactiveSel = 'a[href], button, input:not([type="hidden"]), select, textarea, summary, [role="button"], [role="tab"], [role="menuitem"], [role="checkbox"], [role="switch"], [role="radio"], [role="combobox"], [role="slider"], [tabindex="0"]';
  const interactive = [...document.querySelectorAll(interactiveSel)].filter((el) => isVisible(el) && !el.closest("nextjs-portal, [class*='tsqd']"));
  const inlineInText = (el) => el.tagName === "A" && el.parentElement && ownText(el.parentElement);
  const nameOf = (el) => {
    if (el.getAttribute("aria-label")?.trim()) return true;
    const by = el.getAttribute("aria-labelledby");
    if (by && by.split(/\s+/).some((id) => document.getElementById(id)?.textContent.trim())) return true;
    if (el.innerText?.trim() || el.getAttribute("title")?.trim()) return true;
    if (el.querySelector("img[alt]:not([alt=''])") || el.querySelector("svg title")) return true;
    if (el.closest("label")?.innerText.trim()) return true;
    if (el.id && document.querySelector(`label[for="${CSS.escape(el.id)}"]`)?.innerText.trim()) return true;
    if (["INPUT", "SELECT", "TEXTAREA"].includes(el.tagName)) return Boolean(el.labels?.length || el.getAttribute("placeholder"));
    return false;
  };
  interactive.forEach((el) => {
    const r = el.getBoundingClientRect();
    if (!nameOf(el)) add("control-no-name", el, "no accessible name");
    if (inlineInText(el) || el.type === "checkbox" || el.type === "radio") return;
    if (r.width < 24 || r.height < 24) add("target-under-24px", el, `${Math.round(r.width)}x${Math.round(r.height)} (WCAG 2.5.8)`);
    else if (vw < 768 && (r.width < 44 || r.height < 44)) add("target-under-44px-touch", el, `${Math.round(r.width)}x${Math.round(r.height)} on a touch viewport`);
    const cx = r.left + r.width / 2;
    const cy = r.top + r.height / 2;
    if (cx < 0 || cy < 0 || cx > vw || cy > vh) return;
    const hit = document.elementFromPoint(cx, cy);
    if (hit && hit !== el && !el.contains(hit) && !hit.contains(el)) add("target-covered", el, `covered by ${describe(hit).el}`);
  });

  // Headings, landmarks, ids, document metadata
  const headings = [...document.querySelectorAll("h1, h2, h3, h4, h5, h6")].filter(isVisible);
  const h1s = headings.filter((h) => h.tagName === "H1");
  if (h1s.length !== 1) add("h1-count", h1s[0] ?? null, `${h1s.length} visible h1`);
  headings.reduce((prev, h) => {
    const level = Number(h.tagName[1]);
    if (prev && level > prev + 1) add("heading-level-skip", h, `h${prev} → h${level}`);
    return level;
  }, 0);
  const ids = {};
  document.querySelectorAll("[id]").forEach((el) => { ids[el.id] = (ids[el.id] ?? 0) + 1; });
  Object.entries(ids).filter(([, c]) => c > 1).forEach(([id, c]) => add("duplicate-id", document.getElementById(id), `#${id} x${c}`));
  const main = document.querySelector("main");
  if (!main) add("no-main-landmark", null, "no <main>");
  else if (main.getBoundingClientRect().height < 120) add("main-nearly-empty", main, `main is ${Math.round(main.getBoundingClientRect().height)}px tall`);
  if (!document.documentElement.lang) add("html-lang-missing", null, "<html> has no lang");
  if (!document.querySelector('meta[name="viewport"]')) add("viewport-meta-missing", null, "no viewport meta");

  // Approximate contrast for text on a solid background (Lighthouse confirms).
  // The background is whatever is painted under the text's centre; text over an
  // image, video, canvas or CSS background image is skipped (can't be computed).
  // Computed colors can be lab()/oklch() (Tailwind v4); a canvas converts any CSS color to sRGB
  const ctx = Object.assign(document.createElement("canvas"), { width: 1, height: 1 }).getContext("2d", { willReadFrequently: true });
  const parse = (c) => {
    if (!c || c === "transparent") return null;
    ctx.clearRect(0, 0, 1, 1);
    ctx.fillStyle = "rgba(0,0,0,0)";
    ctx.fillStyle = c;
    ctx.fillRect(0, 0, 1, 1);
    const [r, g, b, a] = ctx.getImageData(0, 0, 1, 1).data;
    return { r, g, b, a: a / 255 };
  };
  const overlaps = (a, b) => a.left < b.right && b.left < a.right && a.top < b.bottom && b.top < a.bottom;
  const lum = ({ r, g, b }) => [r, g, b].map((v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; }).reduce((s, v, i) => s + v * [0.2126, 0.7152, 0.0722][i], 0);
  const bgOf = (el) => {
    const r = el.getBoundingClientRect();
    const x = Math.min(Math.max(r.left + r.width / 2, 0), vw - 1);
    const y = r.top + r.height / 2;
    if (y < 0 || y >= vh) return null;
    // Decorative backdrops are often pointer-events: none, so hit testing misses them:
    // look for media under the text among the ancestors' descendants too
    for (let p = el.parentElement, depth = 0; p && p !== document.body && depth < 8; p = p.parentElement, depth += 1) {
      const media = [...p.querySelectorAll("img, video, canvas, picture")].some((m) => !el.contains(m) && m.checkVisibility({ opacityProperty: true, visibilityProperty: true }) && overlaps(m.getBoundingClientRect(), r));
      if (media) return null;
      const c = parse(getComputedStyle(p).backgroundColor);
      if (getComputedStyle(p).backgroundImage !== "none") return null;
      if (c && c.a >= 0.95) break;
    }
    const stack = document.elementsFromPoint(x, y);
    for (const layer of stack.slice(Math.max(0, stack.indexOf(el)))) {
      if (["IMG", "VIDEO", "CANVAS", "PICTURE", "svg"].includes(layer.tagName)) return null;
      const s = getComputedStyle(layer);
      if (s.backgroundImage !== "none") return null;
      const c = parse(s.backgroundColor);
      if (c && c.a >= 0.95) return c;
    }
    return { r: 255, g: 255, b: 255, a: 1 };
  };
  // Only text in the current viewport can be hit-tested; run this at several scroll positions if needed.
  visible.filter(ownText).slice(0, 600).forEach((el) => {
    // Disabled controls are exempt from contrast (WCAG 1.4.3), and pointer-events: none hides them from hit testing
    if (el.closest(":disabled, [aria-disabled='true']")) return;
    const s = getComputedStyle(el);
    const fg = parse(s.color);
    const bg = bgOf(el);
    if (!fg || !bg || fg.a < 0.95) return;
    const [l1, l2] = [lum(fg), lum(bg)].sort((a, b) => b - a);
    const ratio = (l1 + 0.05) / (l2 + 0.05);
    const size = parseFloat(s.fontSize);
    const large = size >= 24 || (size >= 18.66 && Number(s.fontWeight) >= 700);
    if (ratio < (large ? 3 : 4.5)) add("low-contrast", el, `${ratio.toFixed(2)}:1 (${large ? "large" : "normal"} text)`);
  });

  // Next.js dev overlay reporting runtime/hydration issues
  const portal = document.querySelector("nextjs-portal");
  const overlayText = portal?.shadowRoot
    ? [...portal.shadowRoot.querySelectorAll("*")].filter((n) => !["STYLE", "SCRIPT"].includes(n.tagName) && n.children.length === 0).map((n) => n.textContent.trim()).filter(Boolean).join(" ")
    : "";
  if (/\d+\s+issues?/i.test(overlayText) || /Unhandled Runtime Error|Hydration/i.test(overlayText)) add("next-dev-issues", null, overlayText.replace(/\s+/g, " ").slice(0, 160));

  await Promise.all(reloads);
  return {
    url: location.pathname + location.search,
    lang: document.documentElement.lang,
    viewport: `${vw}x${vh}@${devicePixelRatio}`,
    documentHeight: document.documentElement.scrollHeight,
    findings,
  };
}
