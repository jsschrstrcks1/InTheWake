// Publish gate — governance floor for the auto-publish pipeline.
//
// Concept-lift from the household's Sophos governance kernel (provenance
// record: open-claw-stuff schemas/records/sophos-inthewake-publish-gate.json).
// Concepts only — no kernel code crosses into this public repo. Four
// invariants, each a deterministic check:
//
//   1. pastoral_no_auto_publish — pastoral / Scripture / grief / family-
//      history content NEVER auto-posts. Human-confirmed publication only.
//   2. sources_required — no publish without a Sources section the reader
//      can check (evidence-required).
//   3. authorship_disclosure_required — a synthesis disclosure or a dated
//      first-person attestation must be present (no false confidence about
//      what the reader is reading).
//   4. GATE_STRICT=on turns warns into blocks (stakes-aware strictness).
//
// The gate fails CLOSED on unreadable input: no parse, no publish.

import { load } from 'cheerio';

const PASTORAL_SECTIONS = /grief|pastoral|memorial|faith|scripture|sermon|family-history/i;
const PASTORAL_SLUGS = /grief|pastoral|memorial|healing-relationships|wounded-healers|widow|bereave/i;

const DISCLOSURE_RE =
  /synthesis of the published record|research synthesis|I was not aboard|I have not (?:sailed|visited|been)/i;
const DATED_ATTESTATION_RE =
  /\bI (?:sailed|cruised|visited|boarded|rode|stayed)\b[^.]{0,80}\b(?:19|20)\d{2}\b/i;

export function gatePublishDecision(html, articlePath) {
  const findings = [];
  let $;
  try {
    $ = load(html);
  } catch (e) {
    return {
      publish: false,
      blockedBy: 'parse',
      findings: [{ policy: 'unreadable_input', severity: 'block', detail: `Could not parse article HTML: ${e.message}` }],
    };
  }

  const slug = String(articlePath).split('/').pop().replace(/\.html$/, '');
  const section = $('meta[property="article:section"]').attr('content') || '';
  const bodyText = $('[itemprop="articleBody"]').text().replace(/\s+/g, ' ');

  // Invariant 1: pastoral content never auto-publishes.
  if (PASTORAL_SECTIONS.test(section) || PASTORAL_SLUGS.test(slug)) {
    findings.push({
      policy: 'pastoral_no_auto_publish',
      severity: 'block',
      detail: `Pastoral-category signal (section="${section}", slug="${slug}"). Auto-publish is forbidden for pastoral/Scripture/grief/family-history content — publish by hand, with a human decision, or not at all.`,
    });
  }

  // Invariant 2: evidence required.
  const sourceItems = $('#sources').nextAll('ul').first().find('li').length
    || $('h2#sources ~ ul li').length;
  if (!sourceItems) {
    findings.push({
      policy: 'sources_required',
      severity: 'block',
      detail: 'No Sources section found — no publish without evidence the reader can check.',
    });
  }

  // Invariant 3: authorship honesty.
  if (!DISCLOSURE_RE.test(bodyText) && !DATED_ATTESTATION_RE.test(bodyText)) {
    findings.push({
      policy: 'authorship_disclosure_required',
      severity: 'block',
      detail: 'Neither a synthesis disclosure nor a dated first-person attestation found — the reader cannot calibrate what they are reading.',
    });
  }

  // Invariant 4: strict mode promotes warns (none defined yet at this floor;
  // kept so the semantic matches the kernel when warns are added).
  const strict = process.env.GATE_STRICT === 'on';
  const blocks = findings.filter((f) => f.severity === 'block');
  const warns = findings.filter((f) => f.severity === 'warn');
  const blocked = blocks.length > 0 || (strict && warns.length > 0);

  return {
    publish: !blocked,
    blockedBy: blocks.length ? blocks[0].policy : strict && warns.length ? 'warn_strict' : null,
    findings,
  };
}
