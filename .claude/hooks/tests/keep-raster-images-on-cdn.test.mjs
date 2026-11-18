import { test } from "node:test";
import assert from "node:assert/strict";
import { decide, rasterImagesToReject } from "../keep-raster-images-on-cdn.mjs";

const ROOT = "/repo";
/** A fake repo: tracked and gitignored files, files the index adds, files unpushed commits add. */
const repo = ({ tracked = [], ignored = [], staged = [], unpushed = [] } = {}) => ({
  isTracked: (file) => tracked.includes(file),
  isIgnored: (file) => ignored.some((prefix) => file.startsWith(prefix)),
  addedInIndex: () => staged,
  addedInUnpushedCommits: () => unpushed,
});
const bash = (command) => ({ tool_name: "Bash", cwd: ROOT, tool_input: { command } });
const write = (file_path) => ({ tool_name: "Write", cwd: ROOT, tool_input: { file_path, content: "x" } });

test("rejects writing a new PNG, JPEG or WebP into the repo and points to the CDN", () => {
  for (const file of ["public/home/hero.png", "public/a.jpg", "src/features/x/photo.jpeg", "public/b.WEBP"]) {
    const reason = decide(write(`${ROOT}/${file}`), repo(), ROOT);
    assert.match(reason, new RegExp(file.replace(/\./g, "\\.")), file);
    assert.match(reason, /push-static-assets\.mjs/);
    assert.match(reason, /staticAssetUrl/);
  }
});

test("allows SVGs: they stay in the repo", () => {
  assert.equal(decide(write(`${ROOT}/public/assets/icons/star.svg`), repo(), ROOT), null);
  assert.equal(decide(bash("cp ~/Downloads/star.svg public/assets/icons/star.svg"), repo(), ROOT), null);
});

test("allows gitignored staging folders and paths outside the repo", () => {
  const ignored = ["images-generated/"];
  assert.equal(decide(write(`${ROOT}/images-generated/home/hero.png`), repo({ ignored }), ROOT), null);
  assert.equal(decide(write("/tmp/scratch/hero.png"), repo(), ROOT), null);
  assert.equal(decide(bash("curl -s -o /tmp/x.png https://example.com/x.png"), repo(), ROOT), null);
});

test("allows replacing an image that is already tracked", () => {
  const tracked = ["src/tests/fixtures/old.png", "docs/diagram.png"];
  assert.equal(decide(write(`${ROOT}/docs/diagram.png`), repo({ tracked }), ROOT), null);
});

test("allows test fixtures and Next file-convention icons in src/app", () => {
  for (const file of [
    "src/tests/fixtures/upload.png",
    "tests/acceptance/fixtures/photo.jpg",
    "src/app/icon.png",
    "src/app/apple-icon.png",
    "src/app/opengraph-image.jpg",
    "src/app/(shop)/catalog/twitter-image.png",
    "src/app/icon1.png",
  ]) {
    assert.equal(decide(write(`${ROOT}/${file}`), repo(), ROOT), null, file);
  }
});

test("does not exempt arbitrary images that only live under src/app", () => {
  assert.notEqual(decide(write(`${ROOT}/src/app/hero.png`), repo(), ROOT), null);
});

test("rejects shell writes of raster images: redirects, cp, mv, curl and wget", () => {
  for (const command of [
    "cp ~/Downloads/hero.png public/home/hero.png",
    "cp ~/Downloads/hero.png public/home/",
    "mv /tmp/a.webp public/backdrops",
    "curl -sL https://example.com/a.jpg -o public/a.jpg",
    "curl --output public/b.png https://example.com/b.png",
    "wget -q -O public/c.jpeg https://example.com/c.jpeg",
    "base64 -d img.txt > public/d.png",
  ]) {
    assert.notEqual(decide(bash(command), repo(), ROOT), null, command);
  }
});

test("names the destination file when copying into a directory", () => {
  const reason = decide(bash("cp ~/Downloads/hero.png public/home/"), repo(), ROOT);
  assert.match(reason, /public\/home\/hero\.png/);
});

test("allows reads and shell writes of other files", () => {
  for (const command of ["ls public", "file public/x.png", "echo hi > notes.txt", "git mv public/a.svg public/b.svg"]) {
    assert.equal(decide(bash(command), repo(), ROOT), null, command);
  }
});

test("rejects a commit whose index adds a raster image, and a push whose commits add one", () => {
  const commit = decide(bash('git commit -m "Add hero"'), repo({ staged: ["src/a.ts", "public/home/hero.png"] }), ROOT);
  assert.match(commit, /public\/home\/hero\.png/);
  assert.doesNotMatch(commit, /src\/a\.ts/);
  const push = decide(bash("git push origin feat"), repo({ unpushed: ["public/x.webp"] }), ROOT);
  assert.match(push, /public\/x\.webp/);
});

test("allows commits that add SVGs, fixtures or no images", () => {
  const staged = ["public/assets/a.svg", "src/tests/fixtures/b.png", "src/a.ts"];
  assert.equal(decide(bash("git commit -m x"), repo({ staged }), ROOT), null);
});

test("ignores other tools", () => {
  assert.equal(decide({ tool_name: "Read", tool_input: { file_path: `${ROOT}/public/a.png` } }, repo(), ROOT), null);
});

test("rasterImagesToReject filters a list of repo paths for the pre-commit check", () => {
  assert.deepEqual(
    rasterImagesToReject(["public/a.png", "public/b.svg", "src/tests/fixtures/c.jpg", "src/app/icon.png", "x/d.jpeg"]),
    ["public/a.png", "x/d.jpeg"],
  );
});
