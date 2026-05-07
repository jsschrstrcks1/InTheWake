#!/usr/bin/env node
/**
 * v3 X2 — Per-line lock file CLI.
 *
 * Coordinates parallel Track A / Track B agents so two branches don't edit
 * the same fleet line simultaneously. See:
 *   admin/SHIP_STANDARDIZATION_PLAN_V3.md § 11
 *
 * Usage:
 *   node admin/ship-lock.cjs acquire <line> [--ttl-minutes=720] [--agent=<name>]
 *   node admin/ship-lock.cjs release <line>
 *   node admin/ship-lock.cjs status [<line>]
 *   node admin/ship-lock.cjs check-paths <path1> <path2> ...    # for pre-commit
 *
 * Exit codes:
 *   0  ok / acquired / released / no conflict
 *   1  conflict — line locked by another branch
 *   2  bad usage
 */

'use strict';

const fs = require('node:fs');
const path = require('node:path');
const { execSync } = require('node:child_process');

const LOCK_DIR = path.join(__dirname, '..', 'audit-reports', '_locks');
const DEFAULT_TTL_MINUTES = 720; // 12h

function currentBranch() {
  try {
    return execSync('git rev-parse --abbrev-ref HEAD', { stdio: ['ignore', 'pipe', 'ignore'] })
      .toString().trim();
  } catch (_) {
    return 'unknown';
  }
}

function lockPath(line) {
  return path.join(LOCK_DIR, `${line}.lock`);
}

function readLock(line) {
  const p = lockPath(line);
  if (!fs.existsSync(p)) return null;
  try {
    return JSON.parse(fs.readFileSync(p, 'utf8'));
  } catch (_) {
    return null;
  }
}

function isStale(lock) {
  if (!lock || !lock.started_at) return true;
  const startedMs = Date.parse(lock.started_at);
  if (!Number.isFinite(startedMs)) return true;
  const ttlMs = (lock.ttl_minutes || DEFAULT_TTL_MINUTES) * 60_000;
  return (Date.now() - startedMs) > ttlMs;
}

function lineFromPath(p) {
  // ships/<line>/<slug>.html → <line>
  const m = p.match(/^ships\/([^/]+)\//);
  return m ? m[1] : null;
}

function ensureDir() {
  if (!fs.existsSync(LOCK_DIR)) fs.mkdirSync(LOCK_DIR, { recursive: true });
}

function cmdAcquire(line, opts) {
  ensureDir();
  const branch = currentBranch();
  const existing = readLock(line);
  if (existing && !isStale(existing) && existing.branch !== branch) {
    console.error(`[lock] ${line} already locked by branch ${existing.branch} (since ${existing.started_at})`);
    process.exit(1);
  }
  const lock = {
    branch,
    agent: opts.agent || process.env.USER || 'unknown',
    started_at: new Date().toISOString(),
    ttl_minutes: opts.ttlMinutes || DEFAULT_TTL_MINUTES,
  };
  fs.writeFileSync(lockPath(line), JSON.stringify(lock, null, 2) + '\n');
  console.log(`[lock] acquired ${line} on branch ${branch}`);
}

function cmdRelease(line) {
  const p = lockPath(line);
  if (!fs.existsSync(p)) { console.log(`[lock] ${line} not held`); return; }
  const lock = readLock(line);
  const branch = currentBranch();
  if (lock && lock.branch !== branch && !isStale(lock)) {
    console.error(`[lock] refusing to release ${line}: held by ${lock.branch}, you are ${branch}`);
    process.exit(1);
  }
  fs.unlinkSync(p);
  console.log(`[lock] released ${line}`);
}

function cmdStatus(line) {
  ensureDir();
  const lines = line ? [line] : fs.readdirSync(LOCK_DIR)
    .filter(f => f.endsWith('.lock'))
    .map(f => f.replace(/\.lock$/, ''));
  if (lines.length === 0) { console.log('[lock] no locks held'); return; }
  for (const ln of lines) {
    const lock = readLock(ln);
    if (!lock) { console.log(`${ln.padEnd(28)} (no lock)`); continue; }
    const stale = isStale(lock) ? ' STALE' : '';
    console.log(`${ln.padEnd(28)} ${lock.branch} @ ${lock.started_at} ttl=${lock.ttl_minutes}m${stale}`);
  }
}

function cmdCheckPaths(paths) {
  // Pre-commit hook entry point. Inputs: list of files about to be committed.
  // Exits non-zero if any path is under a foreign-locked line.
  const branch = currentBranch();
  const conflicts = new Map();
  for (const p of paths) {
    const ln = lineFromPath(p);
    if (!ln) continue;
    const lock = readLock(ln);
    if (!lock || isStale(lock)) continue;
    if (lock.branch !== branch) {
      if (!conflicts.has(ln)) conflicts.set(ln, lock);
    }
  }
  if (conflicts.size === 0) process.exit(0);
  console.error('[lock] commit blocked — these lines are locked by another branch:');
  for (const [ln, lock] of conflicts) {
    console.error(`  ${ln} held by ${lock.branch} since ${lock.started_at}`);
  }
  console.error('Wait for the other branch to release, or run:');
  console.error(`  node admin/ship-lock.cjs status`);
  process.exit(1);
}

function parseOpts(argv) {
  const opts = {};
  for (const a of argv) {
    const m = a.match(/^--([^=]+)=(.*)$/);
    if (m) {
      const key = m[1].replace(/-([a-z])/g, (_, c) => c.toUpperCase());
      const val = m[2];
      opts[key] = /^\d+$/.test(val) ? Number(val) : val;
    }
  }
  return opts;
}

function main() {
  const [cmd, ...rest] = process.argv.slice(2);
  if (!cmd) { console.error('usage: ship-lock.cjs <acquire|release|status|check-paths> ...'); process.exit(2); }
  const opts = parseOpts(rest);
  const positional = rest.filter(a => !a.startsWith('--'));
  switch (cmd) {
    case 'acquire':       if (!positional[0]) process.exit(2); return cmdAcquire(positional[0], opts);
    case 'release':       if (!positional[0]) process.exit(2); return cmdRelease(positional[0]);
    case 'status':        return cmdStatus(positional[0]);
    case 'check-paths':   return cmdCheckPaths(positional);
    default:              console.error(`unknown command: ${cmd}`); process.exit(2);
  }
}

main();
