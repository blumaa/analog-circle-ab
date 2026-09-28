// Token contract: every var(--x) used in ui/web source must be defined somewhere.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, "../..");
const SOURCE_DIRS = ["packages/ui/src", "apps/web/src"].map((d) => join(root, d));
const SOURCE_EXT = /\.(css|tsx?)$/;

const DEFINE_CSS = /(--[a-z0-9-]+)\s*:/g;
const DEFINE_TSX = /["'](--[a-z0-9-]+)["']\s*:/g;
const USE = /var\(\s*(--[a-z0-9-]+)/g;

function walk(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = join(dir, e.name);
    if (e.isDirectory()) return walk(p);
    return SOURCE_EXT.test(e.name) ? [p] : [];
  });
}

function collect(text, re) {
  return [...text.matchAll(re)].map((m) => m[1]);
}

const tokenCss = readdirSync(join(here, "css"))
  .map((f) => readFileSync(join(here, "css", f), "utf8"))
  .join("\n");
const sources = SOURCE_DIRS.flatMap(walk).map((p) => ({ p, text: readFileSync(p, "utf8") }));

const defined = new Set([
  ...collect(tokenCss, DEFINE_CSS),
  ...sources.flatMap(({ text }) => [...collect(text, DEFINE_CSS), ...collect(text, DEFINE_TSX)]),
]);

test("every referenced token is defined", () => {
  const missing = sources.flatMap(({ p, text }) =>
    collect(text, USE)
      .filter((t) => !defined.has(t))
      .map((t) => `${p.slice(root.length + 1)}: ${t}`),
  );
  assert.deepEqual(missing, []);
});

test("token css references only defined tokens", () => {
  const missing = collect(tokenCss, USE).filter((t) => !defined.has(t));
  assert.deepEqual(missing, []);
});

test("reset strips browser list indentation and bullets from styled lists", () => {
  const reset = readFileSync(join(here, "css", "reset.css"), "utf8");
  const rule = reset.match(/ul\[class\],\s*ol\[class\]\s*\{([^}]*)\}/);
  assert.ok(rule, "reset.css has a ul[class], ol[class] rule");
  assert.match(rule[1], /padding:\s*0/);
  assert.match(rule[1], /list-style:\s*none/);
});

test("the page declares a dark colour scheme so native controls draw light icons", () => {
  const semantic = readFileSync(join(here, "css", "semantic.css"), "utf8");
  assert.match(semantic, /:root\s*\{[^}]*color-scheme:\s*dark/);
});
