// Which files a shell command writes to, as written in the command (not resolved).
// Covers redirections (>, >>, heredocs), sed/perl -i, tee, cp, and mv from outside src/.
// Interpreters writing files themselves (node -e, python -c) are not detected.

const SEGMENT = /;|&&|\|\||\||\n/;
const REDIRECT = /\d*&?>{1,2}\s*(\S+)/g;
const PREFIXES = new Set(["sudo", "env", "command", "exec", "time"]);
const SHELLS = new Set(["bash", "sh", "zsh"]);

const unquote = (word) => word.replace(/["']/g, "");

/** Words of one segment, without quotes, env assignments, sudo-like prefixes or a `bash -c` wrapper. */
function commandWords(segment) {
  let words = unquote(segment).trim().split(/\s+/).filter(Boolean);
  let start = 0;
  while (start < words.length && (/^[A-Za-z_][A-Za-z0-9_]*=/.test(words[start]) || PREFIXES.has(words[start]))) start++;
  words = words.slice(start);
  return SHELLS.has(words[0]) && words[1] === "-c" ? words.slice(2) : words;
}

/** Positional arguments, skipping flags and the values of the given value-taking flags. */
function positionals(args, valueFlags = []) {
  const result = [];
  for (let i = 0; i < args.length; i++) {
    if (valueFlags.includes(args[i])) i++;
    else if (!args[i].startsWith("-")) result.push(args[i]);
  }
  return result;
}

function inPlaceTargets(program, args) {
  if (program === "sed" && args.some((arg) => /^-i/.test(arg) || arg === "--in-place")) {
    const files = positionals(args, ["-e", "-f"]);
    // Without -e/-f, the first positional is the sed script.
    return args.includes("-e") || args.includes("-f") ? files : files.slice(1);
  }
  if (program === "perl" && args.some((arg) => /^-\w*i/.test(arg))) return positionals(args, ["-e", "-E"]);
  return [];
}

function programTargets(words) {
  const [program, ...args] = words;
  if (program === "tee") return positionals(args);
  if (program === "cp") return positionals(args).slice(-1);
  if (program === "mv") {
    const paths = positionals(args);
    const sources = paths.slice(0, -1);
    // A rename inside src/ moves existing code; moving a file in from elsewhere writes new code.
    return sources.some((source) => !/(^|\/)src\//.test(source)) ? paths.slice(-1) : [];
  }
  return inPlaceTargets(program, args);
}

export function shellWriteTargets(command) {
  const targets = new Set();
  for (const segment of command.split(SEGMENT)) {
    for (const [, target] of segment.matchAll(REDIRECT)) {
      if (!target.startsWith("&")) targets.add(unquote(target));
    }
    for (const target of programTargets(commandWords(segment))) targets.add(target);
  }
  return [...targets].filter(Boolean);
}
