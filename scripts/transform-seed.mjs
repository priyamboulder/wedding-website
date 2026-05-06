#!/usr/bin/env node
/* One-time transform: strips `fields: [f(...)]` and `template: "..."` from
 * every item() call in lib/checklist-seed.ts, and folds non-redundant field
 * labels (and helper_text) into the task description so context is preserved.
 *
 * Run with: node scripts/transform-seed.mjs
 */
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const SEED_PATH = join(__dirname, "..", "lib", "checklist-seed.ts");

const src = readFileSync(SEED_PATH, "utf8");

// Match a balanced bracket region starting at idx (which points at "[").
function findClose(s, openIdx, open, close) {
  let depth = 0;
  for (let i = openIdx; i < s.length; i++) {
    const c = s[i];
    if (c === open) depth++;
    else if (c === close) {
      depth--;
      if (depth === 0) return i;
    } else if (c === '"' || c === "'") {
      const quote = c;
      i++;
      while (i < s.length && s[i] !== quote) {
        if (s[i] === "\\") i++;
        i++;
      }
    }
  }
  return -1;
}

// Parse f("id", "Label", "type", { ... }) calls inside a fields array body.
function parseFieldCalls(arrayBody) {
  const fields = [];
  let i = 0;
  while (i < arrayBody.length) {
    const fIdx = arrayBody.indexOf("f(", i);
    if (fIdx === -1) break;
    const open = arrayBody.indexOf("(", fIdx + 1);
    const close = findClose(arrayBody, open, "(", ")");
    if (close === -1) break;
    const args = arrayBody.slice(open + 1, close);
    // Pull first 3 string args via regex (id, label, type) and the optional
    // 4th object-arg's helper text.
    const stringMatches = [...args.matchAll(/"([^"\\]*(?:\\.[^"\\]*)*)"/g)];
    const id = stringMatches[0]?.[1];
    const label = stringMatches[1]?.[1];
    const type = stringMatches[2]?.[1];
    let helper;
    const helperMatch = args.match(/helper:\s*"([^"\\]*(?:\\.[^"\\]*)*)"/);
    if (helperMatch) helper = helperMatch[1];
    if (label) fields.push({ id, label, type, helper });
    i = close + 1;
  }
  return fields;
}

// Build the augmenting sentence to append to a description. Returns "" if
// nothing useful to add.
function buildAugment(desc, fields) {
  const descLower = desc.toLowerCase();
  const tokens = [];
  for (const f of fields) {
    if (!f.label) continue;
    const labelLower = f.label.toLowerCase();
    // Skip if the label (or its meaningful core) is already covered.
    const core = labelLower
      .replace(/\b(the|and|or|of|for|to|a|an|per|by)\b/g, "")
      .replace(/[^a-z0-9 ]/g, "")
      .trim();
    if (core && descLower.includes(core)) continue;
    // Skip generic non-informative labels.
    if (
      /^(name|date|cost|fee|budget|total|amount|notes?|contact|link|location|venue|details?|status|type|notes?|files?|upload|document|portfolio|review notes?|research notes?)$/.test(
        labelLower,
      )
    )
      continue;
    if (f.helper) tokens.push(`${f.label} (${f.helper})`);
    else tokens.push(f.label);
  }
  if (tokens.length === 0) return "";
  // Cap at 6 to keep descriptions readable.
  const trimmed = tokens.slice(0, 6);
  return ` Capture: ${trimmed.join(", ")}.`;
}

// Walk through the file line-by-line. Each item() call is on a single line.
const lines = src.split(/\r?\n/);
let templateRemoved = 0;
let fieldsRemoved = 0;
let descsAugmented = 0;

const itemLineRe = /^(\s*)item\(\s*"([^"]+)",\s*"([^"]+)",\s*"((?:[^"\\]|\\.)*)",\s*"((?:[^"\\]|\\.)*)",\s*\{(.*)\}\s*\),?\s*$/;

for (let li = 0; li < lines.length; li++) {
  const line = lines[li];
  const m = line.match(itemLineRe);
  if (!m) continue;
  const [, indent, id, phase, title, descRaw, optsBody] = m;

  // Find and capture fields array (balanced brackets) inside optsBody.
  let opts = optsBody;
  let fields = [];
  const fIdx = opts.indexOf("fields:");
  if (fIdx !== -1) {
    const arrStart = opts.indexOf("[", fIdx);
    if (arrStart !== -1) {
      const arrEnd = findClose(opts, arrStart, "[", "]");
      if (arrEnd !== -1) {
        const arrBody = opts.slice(arrStart + 1, arrEnd);
        fields = parseFieldCalls(arrBody);
        // Remove "fields: [...]" plus a leading/trailing comma+space.
        let removeStart = fIdx;
        let removeEnd = arrEnd + 1;
        // Eat preceding comma+space
        const before = opts.slice(0, removeStart).replace(/[,\s]+$/, "");
        const after = opts.slice(removeEnd).replace(/^[,\s]+/, "");
        // Reassemble: if both before & after are non-empty, join with ", ".
        if (before.trim() && after.trim()) {
          opts = before + ", " + after;
        } else {
          opts = before + after;
        }
        fieldsRemoved++;
      }
    }
  }

  // Remove template: "..."
  const templateBefore = opts;
  opts = opts.replace(/\btemplate:\s*"[^"]+"\s*,?\s*/g, "");
  // Clean up leftover ", ," or trailing/leading commas.
  opts = opts
    .replace(/,\s*,/g, ",")
    .replace(/^\s*,\s*/, "")
    .replace(/,\s*$/, "")
    .trim();
  if (opts !== templateBefore.trim()) templateRemoved++;

  // Augment description.
  let desc = descRaw;
  if (fields.length > 0) {
    const augment = buildAugment(desc, fields);
    if (augment) {
      // Ensure the description ends with a period before appending.
      if (!/[.!?]$/.test(desc.trim())) desc = desc.trim() + ".";
      desc = desc + augment.trimStart();
      // Re-prepend a space between the period and "Capture:".
      desc = desc.replace(/\.Capture:/, ". Capture:");
      descsAugmented++;
    }
  }

  // Reconstruct the line.
  let newLine;
  if (opts) {
    newLine = `${indent}item("${id}", "${phase}", "${title}", "${desc}", { ${opts} }),`;
  } else {
    newLine = `${indent}item("${id}", "${phase}", "${title}", "${desc}"),`;
  }
  // Preserve trailing comment/comma style: if original line ended w/o comma, drop ours.
  if (!line.trimEnd().endsWith(",")) newLine = newLine.replace(/,$/, "");
  lines[li] = newLine;
}

// Drop the now-unused f() helper and DecisionField imports.
let out = lines.join("\n");

// Remove unused type imports & helper.
out = out.replace(
  /^\s*DecisionField,\n/m,
  "",
);
out = out.replace(
  /^\s*DecisionFieldType,\n/m,
  "",
);
out = out.replace(
  /^\s*DecisionTemplateName,\n/m,
  "",
);

// Remove the f() helper definition (between `function f(` and the matching `}`).
const fHelperStart = out.indexOf("function f(");
if (fHelperStart !== -1) {
  // The helper ends with the next `}\n\n` after a balanced brace.
  let depth = 0;
  let i = out.indexOf("{", fHelperStart);
  for (; i < out.length; i++) {
    if (out[i] === "{") depth++;
    else if (out[i] === "}") {
      depth--;
      if (depth === 0) break;
    }
  }
  // Move past the closing brace and any trailing newline.
  let end = i + 1;
  while (end < out.length && (out[end] === "\n" || out[end] === " ")) end++;
  out = out.slice(0, fHelperStart) + out.slice(end);
}

writeFileSync(SEED_PATH, out, "utf8");

console.log(`✓ template: removed from ${templateRemoved} items`);
console.log(`✓ fields: removed from ${fieldsRemoved} items`);
console.log(`✓ descriptions augmented: ${descsAugmented}`);
