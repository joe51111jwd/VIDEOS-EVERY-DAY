// Pre-highlights the rig's real source files into token JSON for the film (no async at render time).
// node tools/highlight.mjs
import {createHighlighter} from 'shiki';
import fs from 'fs';
const rig = new URL('../../rig/', import.meta.url);
const hl = await createHighlighter({themes: ['github-dark-default'], langs: ['ts', 'rust']});
const files = {
  messy: ['checkout.messy.ts', 'ts'],
  clean: ['checkout.clean.ts', 'ts'],
  rust: ['checkout.rs', 'rust'],
};
const out = {};
for (const [k, [f, lang]] of Object.entries(files)) {
  const code = fs.readFileSync(new URL(f, rig), 'utf8').replace(/\n$/, '');
  const {tokens} = hl.codeToTokens(code, {lang, theme: 'github-dark-default'});
  out[k] = tokens.map((line) => line.map((t) => [t.content, t.color]));
}
fs.writeFileSync('src/data/code.json', JSON.stringify(out));
console.log(Object.fromEntries(Object.entries(out).map(([k, v]) => [k, v.length])));
