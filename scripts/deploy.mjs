#!/usr/bin/env node
// Deploy after a merge on main (run by the shared mcp-post-merge hook, so `mpgd` ships it).
// Claude Desktop runs this server through mcp-compat, which starts a fresh server process when
// the one it fronts has exited. So: install if the lockfile changed, rebuild into build/, then
// stop the running server process (not the compat proxy); the next tool call runs the new code.
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync, statSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const repo = join(dirname(fileURLToPath(import.meta.url)), '..');
const run = (cmd, args) =>
  execFileSync(cmd, args, { cwd: repo, stdio: 'inherit' });
const log = (msg) => console.error(`[spotify-mcp-server deploy] ${msg}`);

const lock = join(repo, 'package-lock.json');
const installed = join(repo, 'node_modules', '.package-lock.json');
if (
  !existsSync(installed) ||
  statSync(lock).mtimeMs > statSync(installed).mtimeMs
) {
  log('package-lock.json changed: npm ci');
  run('npm', ['ci']);
}
run('npm', ['run', 'build']);

const entry = join(repo, 'build', 'index.js');
try {
  execFileSync('pkill', ['-f', `node ${entry}`]);
  log('stopped the running server; the next tool call starts the new build');
} catch (error) {
  // pkill exits 1 when nothing matched: no server running, nothing to stop.
  if (error.status !== 1) throw error;
  log('no running server to stop');
}

const config = join(
  process.env.HOME ?? '',
  'Library',
  'Application Support',
  'Claude',
  'claude_desktop_config.json',
);
if (existsSync(config) && !readFileSync(config, 'utf8').includes(entry)) {
  log(`warning: ${config} has no entry running ${entry}`);
}
