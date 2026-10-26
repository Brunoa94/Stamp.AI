#!/usr/bin/env node
// PreToolUse hook: acceptance tests are the spec, so any edit to them needs
// explicit human approval. Covers file-editing tools and shell commands that write.
import { pathToFileURL } from 'node:url';

const ACCEPTANCE_PATH = /(^|[\/\s'"])tests\/acceptance\/|\.acceptance\.test\.[cm]?[jt]sx?\b|playwright\.acceptance\.config\./;

// Shell operations that modify files (reads like cat/grep/npm test are left alone).
const SHELL_WRITE =
  /(^|[;&|]\s*)(rm|mv|cp|tee|truncate|touch|unlink)\b|\bsed\s+(-[^\s]*\s+)*-i|\bperl\s+(-[^\s]*\s+)*-[^\s]*i|>{1,2}\s*\S|\bgit\s+(checkout|restore|rm|mv|apply)\b/;

const REASON = (target) =>
  `Protected acceptance test: ${target}\n` +
  'Acceptance tests define the expected behaviour of the product. Changing them can hide a real bug ' +
  'by making the test agree with broken code. Approve only if you deliberately want the spec changed; ' +
  'otherwise reject and ask Claude to fix the application code instead.';

export function decide(input) {
  const toolInput = input.tool_input ?? {};

  if (input.tool_name === 'Bash') {
    const command = toolInput.command ?? '';
    if (ACCEPTANCE_PATH.test(command) && SHELL_WRITE.test(command)) return REASON(`shell command \`${command}\``);
    return null;
  }

  const filePath = toolInput.file_path ?? toolInput.notebook_path ?? '';
  return ACCEPTANCE_PATH.test(filePath) ? REASON(filePath) : null;
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  let raw = '';
  process.stdin.on('data', (chunk) => (raw += chunk));
  process.stdin.on('end', () => {
    const reason = decide(JSON.parse(raw));
    if (!reason) process.exit(0);

    process.stdout.write(
      JSON.stringify({
        hookSpecificOutput: {
          hookEventName: 'PreToolUse',
          permissionDecision: 'ask',
          permissionDecisionReason: reason,
        },
      })
    );
  });
}
