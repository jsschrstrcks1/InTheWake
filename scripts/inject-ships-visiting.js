#!/usr/bin/env node
/**
 * inject-ships-visiting.js
 *
 * Kept so the old command still works. The "Ships That Visit Here" blocks on port pages are now rendered by
 * admin/lexicon/deployments.mjs (Tekton itw-c5-deployments-one-direction), which this script runs.
 *
 * Why it changed: this script baked a block into each port page once and never refreshed it, and its folder
 * map pointed Norwegian, Holland America and Virgin ships at folders that do not exist. The new tool renders
 * every generated block from ship-deployments.json between markers, re-renders them when the data changes,
 * links only to pages that exist, and leaves hand-written blocks alone.
 *
 * Usage: node scripts/inject-ships-visiting.js [--dry-run]
 *   --dry-run runs the tool's --check (reports, writes nothing; exit codes are the tool's).
 *
 * Soli Deo Gloria
 */

const path = require('path');
const { spawnSync } = require('child_process');

const tool = path.join(__dirname, '..', 'admin', 'lexicon', 'deployments.mjs');
const args = process.argv.includes('--dry-run') ? ['--check'] : [];
const run = spawnSync(process.execPath, [tool, ...args], { stdio: 'inherit' });
process.exit(run.status === null ? 2 : run.status);
