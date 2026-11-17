#!/usr/bin/env node
// Image licence debt: the work list for every port image's licence (Tekton itw-c9-image-licence-debt; Project-Sophos
// docs/lexicon/LEXICON-PLAN-3.1.md section 6, cruise.image, licence from the source page).
//
// WHY. The census of 2026-10-23 found 1,364 port images with no attribution sidecar and 868 sidecars that say only
// "Flickr (verify license)". Nothing listed which ones, so the debt could be counted once and never worked down. This
// tool reads every committed port image and its sidecar and writes one work list, assets/data/lexicon/
// image-licence-debt.json, so a person clearing licences knows which image to open next and CI knows when the list
// is out of date.
//
// WHAT IT DECIDES, per committed ports/img/**/*.webp, from its <image>.attr.json sidecar:
//   missing      no sidecar
//   unreadable   a sidecar that is not valid JSON
//   unverified   the sidecar says "Flickr (verify license)": a source was saved, the licence was never read
//   incomplete   a licence that cannot be used as written: "CC BY-SA" with no version, a site name in place of a
//                licence ("Wikimedia Commons"), "Attribution" alone, or no licence field
//   restricted   permission or all-rights-reserved from someone other than In the Wake: usable only with the record
//                of that permission, which the sidecar does not carry
//   recorded     a licence this tool recognises, normalised (CC BY-SA 4.0 and CC-BY-SA-4.0 are one licence)
// It settles nothing. "recorded" means the sidecar names a recognisable licence, not that anyone has checked the
// source page says so. Only committed files are read (git ls-files), so the list matches what is published.
//
// This is a work list, not Lexicon statements: one entity file per image would add about 3,800 files to a public
// site, and that is the operator's decision.
//
//   node admin/lexicon/image-licence-debt.mjs           write the work list
//   node admin/lexicon/image-licence-debt.mjs --check   change nothing; exit 1 if the work list is not what the files say
//
// @exit 0 written, or --check found the work list current
// @exit 1 refused: itw_image_licence_debt_stale, the work list differs from what the committed images and sidecars say. remedy: run node admin/lexicon/image-licence-debt.mjs and commit what it writes
// @exit 2 could not look: itw_image_licence_debt_unavailable, git could not list the repository's files. remedy: run from inside the InTheWake checkout with git on PATH
// Soli Deo Gloria.
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
export const OUT_FILE = "assets/data/lexicon/image-licence-debt.json";
const IMAGE_DIR = "ports/img/";
const DEBT = ["missing", "unreadable", "unverified", "incomplete", "restricted"];

// Normalise a sidecar's licence text. Returns { state, licence } where licence is a short normalised name for
// "recorded", and the reason otherwise. Pure, so the test can hold every spelling found in the census to it.
export function classifyLicence(raw) {
  if (raw === undefined || raw === null || String(raw).trim() === "") return { state: "incomplete", reason: "no licence field" };
  const s = String(raw).trim();
  const low = s.toLowerCase();
  if (low === "flickr (verify license)" || low === "flickr (verify licence)") return { state: "unverified", reason: "Flickr source saved, licence never read" };
  const cc = low.match(/^cc[\s-]+(by(?:[\s-]+(?:sa|nd|nc))*)[\s-]*([0-9]\.[0-9])?(?:[\s-]+(igo))?$/);
  if (cc) {
    const kind = cc[1].replace(/[\s-]+/g, "-").toUpperCase();
    if (!cc[2]) return { state: "incomplete", reason: `CC ${kind.replace(/-/g, " ")} with no version` };
    return { state: "recorded", licence: `CC-${kind}-${cc[2]}${cc[3] ? "-IGO" : ""}` };
  }
  if (/^cc0\b/.test(low)) return { state: "recorded", licence: "CC0-1.0" };
  if (/^public domain\b|^no known (copyright )?restrictions\b|^no restrictions$|^pdm\b/.test(low)) return { state: "recorded", licence: "public-domain" };
  if (/^gfdl\b/.test(low)) return { state: "recorded", licence: s.toUpperCase().replace(/\s+/g, "-") };
  if (low === "free art license 1.3") return { state: "recorded", licence: "Free-Art-1.3" };
  if (low === "unsplash license") return { state: "recorded", licence: "Unsplash" };
  if (low === "pexels license") return { state: "recorded", licence: "Pexels" };
  if (/^©\s*\d{4}\s+in the wake\b/.test(low)) return { state: "recorded", licence: "In-the-Wake-own-work" };
  if (low === "used with permission") return { state: "restricted", reason: "permission claimed; no record of it in the sidecar" };
  if (low === "all rights reserved") return { state: "restricted", reason: "all rights reserved by someone other than In the Wake" };
  if (low === "wikimedia commons") return { state: "incomplete", reason: "a site, not a licence" };
  if (low === "attribution") return { state: "incomplete", reason: "'Attribution' alone does not name a licence" };
  return { state: "incomplete", reason: "licence text not recognised" };
}

export function gitFiles(root = ROOT) {
  return execFileSync("git", ["ls-files", "-z", IMAGE_DIR], { cwd: root, encoding: "utf8", maxBuffer: 64 * 1024 * 1024 })
    .split("\0").filter(Boolean);
}

// Build the work list from a file listing and a reader, so the test can run it on a fixture.
export function buildWorkList(files, readText) {
  const have = new Set(files);
  const images = files.filter((f) => f.endsWith(".webp")).sort();
  const counts = { images: images.length, recorded: 0 };
  for (const d of DEBT) counts[d] = 0;
  const licences = {}, unrecognised = {}, byPort = {};
  for (const img of images) {
    const port = img.slice(IMAGE_DIR.length).split("/")[0];
    const side = `${img}.attr.json`;
    let result;
    if (!have.has(side)) result = { state: "missing" };
    else {
      let doc = null;
      try { doc = JSON.parse(readText(side)); } catch { doc = null; }
      if (!doc || typeof doc !== "object") result = { state: "unreadable" };
      else {
        const raw = doc.license ?? doc.licence;
        result = classifyLicence(raw);
        if (result.state === "incomplete" && result.reason === "licence text not recognised") unrecognised[String(raw)] = (unrecognised[String(raw)] || 0) + 1;
      }
    }
    counts[result.state] += 1;
    if (result.state === "recorded") { licences[result.licence] = (licences[result.licence] || 0) + 1; continue; }
    const p = (byPort[port] ||= { images: 0, debt: {} });
    (p.debt[result.state] ||= []).push(img.slice(IMAGE_DIR.length + port.length + 1));
  }
  for (const img of images) byPort[img.slice(IMAGE_DIR.length).split("/")[0]] && (byPort[img.slice(IMAGE_DIR.length).split("/")[0]].images += 1);
  const sortObj = (o) => Object.fromEntries(Object.entries(o).sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0)));
  return {
    _about: "Generated by admin/lexicon/image-licence-debt.mjs from committed files; do not edit by hand. A work list, not a verdict: "
      + "'recorded' means the sidecar names a recognisable licence, not that its source page was checked. Each port lists only its "
      + "images in debt, by state: missing (no sidecar), unreadable (sidecar not JSON), unverified (Flickr, licence never read), "
      + "incomplete (no version, a site name, or not recognised), restricted (permission or all rights reserved by others, no record).",
    scope: "ports/img/**/*.webp",
    counts,
    licences: sortObj(licences),
    unrecognised: sortObj(unrecognised),
    by_port: sortObj(byPort),
  };
}

export function render(root = ROOT) {
  const files = gitFiles(root);
  const list = buildWorkList(files, (f) => fs.readFileSync(path.join(root, f), "utf8"));
  return `${JSON.stringify(list, null, 1)}\n`;
}

function main(argv) {
  let text;
  try { text = render(); }
  catch (e) {
    console.error(`image-licence-debt: itw_image_licence_debt_unavailable: git could not list ${IMAGE_DIR} (${String(e?.message || e).split("\n")[0]}). remedy: run from inside the InTheWake checkout with git on PATH`);
    return 2;
  }
  const out = path.join(ROOT, OUT_FILE);
  const current = fs.existsSync(out) ? fs.readFileSync(out, "utf8") : null;
  if (argv.includes("--check")) {
    if (current === text) { console.log(`image-licence-debt: current (${OUT_FILE})`); return 0; }
    console.error(`image-licence-debt: itw_image_licence_debt_stale: ${OUT_FILE} is not what the committed images and sidecars say. remedy: run node admin/lexicon/image-licence-debt.mjs and commit what it writes`);
    return 1;
  }
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, text);
  const c = JSON.parse(text).counts;
  console.log(`image-licence-debt: wrote ${OUT_FILE}: ${c.images} images; recorded ${c.recorded}, missing ${c.missing}, unverified ${c.unverified}, incomplete ${c.incomplete}, restricted ${c.restricted}, unreadable ${c.unreadable}`);
  return 0;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) process.exit(main(process.argv.slice(2)));
