const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const coreSource = fs.readFileSync(path.join(__dirname, 'translation', 'translation-core.js'), 'utf8');
const sandbox = {
  window: { location: { href: 'https://example.test/index.html' } },
  document: { currentScript: { src: 'https://example.test/translation/translation-core.js' } },
  URL, TextEncoder, Map, Set, Object, Array, String, Number, RegExp, Error, Promise
};
vm.runInNewContext(coreSource, sandbox, { filename: 'translation-core.js' });
const core = sandbox.window.SonicTranslationCore;
assert.ok(core, 'translation core should initialize');

assert.equal(core.isComplete({ missing: [], totalCount: 3, translatedCount: 3, translations: { a: '1', b: '2', c: '3' } }), true);
assert.equal(core.isComplete({ missing: ['cues.1.title'], totalCount: 3, translatedCount: 2, translations: { a: '1', b: '2' } }), false);
assert.equal(core.isComplete({ missing: [], totalCount: 3, translatedCount: 2, translations: { a: '1', b: '2' } }), false, 'count mismatch must fail closed');
assert.equal(core.isComplete({ missing: ['field'], totalCount: 1, translatedCount: 1, translations: { field: '1' } }), false, 'missing field must fail closed');
assert.equal(core.isComplete({ missing: [], totalCount: 1, translatedCount: 1, translations: {} }), false, 'translation map must contain every expected entry');
assert.equal(core.isComplete(null), false);

for (const status of ['idle', 'loading', 'incomplete', 'error']) {
  assert.equal(core.displayLocale('pt', status), 'en', `${status} must display English`);
  assert.equal(core.displayLocale('pt-BR', status), 'en', `${status} must display English`);
}
assert.equal(core.displayLocale('pt', 'ready'), 'pt');
assert.equal(core.displayLocale('pt-BR', 'native'), 'pt');
assert.equal(core.displayLocale('en', 'ready'), 'en');

const bilingual = { en: 'English source', pt: 'Adaptação aprovada' };
assert.equal(core.pick(bilingual, 'en'), 'English source');
assert.equal(core.pick(bilingual, 'pt'), 'Adaptação aprovada');
assert.equal(core.pick('Plain English', 'pt'), 'Plain English');
assert.equal(core.pick({ en: 'English only' }, 'pt'), '', 'Portuguese mode must not fall back to English per field');

// Curated Rhapsody adapter must not fabricate Portuguese by copying English.
const html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');
const builderStart = html.indexOf('function buildCuratedRhapsodyTrackGuide(item, match){');
const builderEnd = html.indexOf('\nfunction delay(ms)', builderStart);
assert.ok(builderStart >= 0 && builderEnd > builderStart, 'curated guide builder should exist');
const builderSource = html.slice(builderStart, builderEnd);
const builderSandbox = {
  window: {
    SONIC_GUIDES: {
      rhapsody: {
        intro: { en: 'English album context' },
        sections: [{
          title: { en: 'Section title' },
          listen: { en: 'English listening note' },
          why: { en: 'English rationale' },
          deep: { en: 'English emotional reading' },
          roles: { en: 'English personnel note' }
        }]
      }
    },
    SonicTranslationCore: { pick: (value, locale) => typeof value === 'string' ? value : (value?.[locale] || value?.en || '') }
  },
  Date
};
vm.createContext(builderSandbox);
vm.runInContext(builderSource, builderSandbox);
const curated = builderSandbox.buildCuratedRhapsodyTrackGuide({ name: 'Test track' }, { key: 'rhapsody', index: 0 });
for (const field of ['title', 'overview', 'form', 'personnelAndRoles', 'emotionalReading']) {
  assert.equal(Object.hasOwn(curated.guide[field], 'pt'), false, `${field} must not receive a fake pt value`);
}
for (const field of ['title', 'focus', 'listenFor', 'whyItMatters']) {
  assert.equal(Object.hasOwn(curated.guide.cues[0][field], 'pt'), false, `cue ${field} must not receive a fake pt value`);
}

console.log('PASS: atomic translation guard tests');
