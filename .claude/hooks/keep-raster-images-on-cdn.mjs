#!/usr/bin/env node
// PreToolUse hook: PNG, JPEG and WebP images are not added to the repo. They are uploaded to the
// static-assets CDN (Cloudflare R2, scripts/push-static-assets.mjs) and referenced with
// staticAssetUrl() (.claude/rules/components.md → "Raster images live on the CDN"). SVGs stay
// in the repo. Rejects:
//   - Write/Edit/MultiEdit creating a new raster image inside the repo
//   - shell writes of one (redirects, tee, cp, mv, curl -o/-O, wget -O)
//   - a `git commit` whose index adds one, or a `git push` whose unpushed commits add one
// Allowed: SVGs, files already tracked (replacing them), gitignored paths (images-generated/),
// paths outside the repo, test fixtures and Next file-convention icons in src/app.
// Also run by .githooks/pre-commit with --staged, so commits made outside Claude are checked too.
import { execFileSync } from "node:child_process";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { shellWriteTargets } from "./shell-writes.mjs";

const RASTER = /\.(png|jpe?g|webp)$/i;
const FIXTURE = /(^|\/)fixtures\//;
// Next metadata file conventions must be files: src/app/**/{icon,apple-icon,opengraph-image,twitter-image}[n].{png,jpg,jpeg}
const NEXT_FILE_CONVENTION = /^src\/app\/(.+\/)?(icon|apple-icon|opengraph-image|twitter-image)\d*\.(png|jpe?g)$/i;
const SEGMENT = /;|&&|\|\||\||\n/;
const EDIT_TOOLS = new Set(["Write", "Edit", "MultiEdit", "NotebookEdit"]);

const isRasterImage = (file) => RASTER.test(file);
const isExempt = (file) => FIXTURE.test(file) || NEXT_FILE_CONVENTION.test(file);

/** The repo paths in `files` that are raster images the rule rejects (SVGs, fixtures and Next icons pass). */
export function rasterImagesToReject(files) {
  return files.filter((file) => isRasterImage(file) && !isExempt(file));
}

const gitOk = (root, ...args) => {
  try {
    execFileSync("git", args, { cwd: root, stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
};
const gitLines = (root, ...args) =>
  execFileSync("git", args, { cwd: root, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).split("\n").filter(Boolean);

/** The repository as this hook sees it; tests pass a fake. */
const gitRepo = (root) => ({
  isTracked: (file) => gitOk(root, "ls-files", "--error-unmatch", "--", file),
  isIgnored: (file) => gitOk(root, "check-ignore", "-q", "--", file),
  addedInIndex: () => gitLines(root, "diff", "--cached", "--name-only", "--diff-filter=ACR"),
  addedInUnpushedCommits: () => gitLines(root, "log", "HEAD", "--not", "--remotes", "--diff-filter=ACR", "--name-only", "--format="),
});

const words = (segment) => segment.replace(/["']/g, "").trim().split(/\s+/).filter(Boolean);
const positionals = (args, valueFlags = []) => {
  const result = [];
  for (let i = 0; i < args.length; i++) {
    if (valueFlags.includes(args[i])) i++;
    else if (!args[i].startsWith("-")) result.push(args[i]);
  }
  return result;
};

/** Files a shell command writes, beyond shellWriteTargets: cp/mv into a directory, curl and wget downloads. */
function downloadAndCopyTargets(command) {
  const targets = [];
  for (const segment of command.split(SEGMENT)) {
    const [program, ...args] = words(segment);
    if (program === "cp" || program === "mv") {
      const paths = positionals(args, ["-t", "--target-directory"]);
      const destination = paths.at(-1);
      if (destination && !isRasterImage(destination)) {
        for (const source of paths.slice(0, -1).filter(isRasterImage)) targets.push(path.posix.join(destination, path.posix.basename(source)));
      }
    } else if (program === "curl") {
      for (let i = 0; i < args.length; i++) {
        if (args[i] === "-o" || args[i] === "--output") targets.push(args[++i]);
        else if (/^-o\S/.test(args[i])) targets.push(args[i].slice(2));
        else if (args[i] === "-O" || args[i] === "--remote-name") {
          const url = positionals(args, ["-o", "--output", "-H", "-d", "-X", "-u", "-A", "-e"]).find((word) => /^https?:/.test(word));
          if (url) targets.push(path.posix.basename(new URL(url).pathname));
        }
      }
    } else if (program === "wget") {
      for (let i = 0; i < args.length; i++) {
        if (args[i] === "-O" || args[i] === "--output-document") targets.push(args[++i]);
      }
    }
  }
  return targets.filter(Boolean);
}

/** The git subcommands the command runs, with quoted strings blanked. */
function gitSubcommands(command) {
  return command
    .replace(/"[^"]*"|'[^']*'/g, '""')
    .split(SEGMENT)
    .map((part) => part.trim().split(/\s+/))
    .filter((parts) => parts[0] === "git")
    .flatMap((parts) => parts.filter((word) => word === "commit" || word === "push"));
}

const reasonFor = (files, when) =>
  `${when}:\n${files.map((file) => `  - ${file}`).join("\n")}\n` +
  "PNG, JPEG and WebP images are not committed: they live on the static-assets CDN (Cloudflare R2, SVGs stay in the repo). " +
  "Put the image in the gitignored images-generated/ folder instead, shrink it with " +
  "`node scripts/optimize-static-assets.mjs images-generated/<new> images-generated/static-assets`, upload it with " +
  "`node scripts/push-static-assets.mjs --target r2 --source-dir images-generated/static-assets` (the object key is its " +
  "path relative to that folder), and reference it in code with `staticAssetUrl(\"/<key>\")` from " +
  "@/shared/helpers/staticAssetUrl. " +
  "Test fixtures and Next file-convention icons in src/app are exempt.";

/** Returns the rejection reason when the tool call adds a raster image to the repo, otherwise null. */
export function decide(input, repo, root = process.env.CLAUDE_PROJECT_DIR ?? input.cwd ?? process.cwd()) {
  repo ??= gitRepo(root);
  const cwd = input.cwd ?? root;
  const toRepoPath = (file) => {
    if (file.startsWith("~")) return null;
    const relative = path.relative(root, path.resolve(cwd, file)).split(path.sep).join("/");
    return relative.startsWith("..") || path.isAbsolute(relative) ? null : relative;
  };
  const newInRepo = (files) =>
    rasterImagesToReject([...new Set(files.map(toRepoPath).filter(Boolean))]).filter((file) => !repo.isIgnored(file) && !repo.isTracked(file));

  if (EDIT_TOOLS.has(input.tool_name)) {
    const file = input.tool_input?.file_path ?? input.tool_input?.notebook_path;
    const files = file ? newInRepo([file]) : [];
    return files.length ? reasonFor(files, "This would add a raster image to the repo") : null;
  }
  if (input.tool_name !== "Bash") return null;

  const command = input.tool_input?.command ?? "";
  const written = newInRepo([...shellWriteTargets(command), ...downloadAndCopyTargets(command)]);
  if (written.length) return reasonFor(written, "This command writes a raster image into the repo");

  const subcommands = gitSubcommands(command);
  const added = rasterImagesToReject([
    ...new Set([
      ...(subcommands.includes("commit") ? repo.addedInIndex() : []),
      ...(subcommands.includes("push") ? repo.addedInUnpushedCommits() : []),
    ]),
  ]);
  return added.length ? reasonFor(added, "These raster images would be committed or pushed") : null;
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  if (process.argv.includes("--staged")) {
    // Pre-commit mode: fail when the index adds a raster image.
    const root = gitLines(process.cwd(), "rev-parse", "--show-toplevel")[0];
    const files = rasterImagesToReject(gitRepo(root).addedInIndex());
    if (files.length) {
      process.stderr.write(`${reasonFor(files, "pre-commit: these raster images would be committed")}\n`);
      process.exit(1);
    }
    process.exit(0);
  }

  let raw = "";
  process.stdin.on("data", (chunk) => (raw += chunk));
  process.stdin.on("end", () => {
    const reason = decide(JSON.parse(raw));
    if (!reason) process.exit(0);

    process.stdout.write(
      JSON.stringify({
        hookSpecificOutput: {
          hookEventName: "PreToolUse",
          permissionDecision: "deny",
          permissionDecisionReason: reason,
        },
      })
    );
  });
}
