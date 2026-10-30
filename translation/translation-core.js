/*
 * Sonic Companion — offline musical translation memory
 * Runtime policy: deterministic lookup only. No AI model, no external translation API,
 * no per-track translation cache, and no word-by-word fallback.
 */
(function (root) {
  'use strict';

  const VERSION = 'SONIC-OFFLINE-PTBR-1.0.0';
  const LOCALE = 'pt-BR';
  const TOP_FIELDS = [
    'title', 'overview', 'context', 'form', 'personnelAndRoles',
    'emotionalReading', 'listenerReception', 'balancedNote'
  ];
  const CUE_FIELDS = [
    'title', 'focus', 'listenFor', 'whyItMatters',
    'musicianMoment', 'historicalNote', 'question'
  ];

  const scriptUrl = document.currentScript && document.currentScript.src
    ? document.currentScript.src
    : new URL('translation/translation-core.js', root.location.href).href;
  const memoryUrl = new URL('pt-BR.memory.json?v=sonic-mie-ptbr-1.0.0', scriptUrl).href;
  let memoryPromise = null;
  let memoryMetadata = null;
  const digestCache = new Map();

  function sourceText(value) {
    if (typeof value === 'string') return value.trim();
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      return String(value.en || '').trim();
    }
    return '';
  }

  function hasLocale(value, locale) {
    return !!(
      value && typeof value === 'object' && !Array.isArray(value) &&
      typeof value[locale] === 'string' && value[locale].trim()
    );
  }

  function collect(guide, track) {
    const items = [];
    const meta = [
      track && track.name,
      track && track.album && track.album.name,
      track && Array.isArray(track.artists)
        ? track.artists.map((artist) => artist && artist.name).filter(Boolean).join(', ')
        : ''
    ].filter(Boolean).join(' — ');

    for (const field of TOP_FIELDS) {
      const value = guide && guide[field];
      const text = sourceText(value);
      if (!text || hasLocale(value, 'pt')) continue;
      items.push({
        id: field,
        text,
        context: `Album/track context: ${meta}. Editorial section: ${field}.`
      });
    }

    (Array.isArray(guide && guide.cues) ? guide.cues : []).forEach((cue, index) => {
      for (const field of CUE_FIELDS) {
        const value = cue && cue[field];
        const text = sourceText(value);
        if (!text || hasLocale(value, 'pt')) continue;
        const cueTitle = sourceText(cue && cue.title) || `moment ${index + 1}`;
        items.push({
          id: `cues.${index}.${field}`,
          text,
          context: `Album/track context: ${meta}. Listening moment ${index + 1}; title: ${cueTitle}; field: ${field}.`
        });
      }
    });
    return items;
  }

  function loadMemory() {
    if (!memoryPromise) {
      memoryPromise = (async () => {
        if (!root.crypto || !root.crypto.subtle) {
          throw new Error('Secure SHA-256 is unavailable. Open the app over HTTPS.');
        }
        const response = await root.fetch(memoryUrl, {
          method: 'GET',
          credentials: 'same-origin',
          cache: 'force-cache',
          headers: { Accept: 'application/json' }
        });
        if (!response.ok) throw new Error(`Translation memory could not be loaded (HTTP ${response.status}).`);
        const memory = await response.json();
        if (!memory || memory.schemaVersion !== 1 || memory.locale !== LOCALE ||
            memory.sourceLocale !== 'en' || !memory.translations ||
            typeof memory.translations !== 'object' || Array.isArray(memory.translations)) {
          throw new Error('Translation memory has an unsupported or invalid schema.');
        }
        const actualCount = Object.keys(memory.translations).length;
        if (actualCount !== memory.entryCount) {
          throw new Error('Translation memory entry count does not match its manifest.');
        }
        for (const [hash, text] of Object.entries(memory.translations)) {
          if (!/^[a-f0-9]{32}$/.test(hash) || typeof text !== 'string' || !text.trim()) {
            throw new Error('Translation memory contains an invalid entry.');
          }
        }
        memoryMetadata = Object.freeze({
          version: memory.translationMemoryVersion || 'unknown',
          locale: memory.locale,
          entryCount: actualCount,
          keyAlgorithm: memory.keyAlgorithm || 'SHA-256'
        });
        return memory.translations;
      })().catch((error) => {
        // Permit a retry after a transient static-asset/network failure.
        memoryPromise = null;
        throw error;
      });
    }
    return memoryPromise;
  }

  async function digest(text) {
    if (digestCache.has(text)) return digestCache.get(text);
    const pending = (async () => {
      const bytes = new TextEncoder().encode(text);
      const value = await root.crypto.subtle.digest('SHA-256', bytes);
      return Array.from(new Uint8Array(value).slice(0, 16), (byte) => byte.toString(16).padStart(2, '0')).join('');
    })();
    digestCache.set(text, pending);
    return pending;
  }

  async function translate(items, locale) {
    const targetLocale = locale || LOCALE;
    if (targetLocale !== LOCALE) throw new Error(`Offline translation memory does not support ${targetLocale}.`);
    if (!Array.isArray(items)) throw new Error('Translation input must be an array.');

    const dictionary = await loadMemory();
    const translations = Object.create(null);
    const missing = [];
    const seenIds = new Set();

    // Hash unique source strings once, even when the same copy appears in many cues.
    const uniqueTexts = Array.from(new Set(items.map((item) => sourceText(item && item.text)).filter(Boolean)));
    const hashes = new Map(await Promise.all(uniqueTexts.map(async (text) => [text, await digest(text)])));

    for (const item of items) {
      if (!item || typeof item.id !== 'string' || !item.id || seenIds.has(item.id)) {
        throw new Error('Translation input contains an invalid or duplicate field ID.');
      }
      seenIds.add(item.id);
      const text = sourceText(item.text);
      if (!text) {
        missing.push(item.id);
        continue;
      }
      const translated = dictionary[hashes.get(text)];
      if (typeof translated === 'string' && translated.trim()) translations[item.id] = translated;
      else missing.push(item.id);
    }

    return {
      locale: targetLocale,
      translations,
      missing,
      translatedCount: Object.keys(translations).length,
      totalCount: items.length,
      coverage: items.length ? Object.keys(translations).length / items.length : 1,
      memory: memoryMetadata
    };
  }

  function validate(items, payload, options) {
    const allowPartial = !!(options && options.allowPartial);
    const arr = Array.isArray(payload) ? payload : payload && payload.translations;
    if (!Array.isArray(arr)) throw new Error('Translation response did not contain a translations array.');
    const expected = new Set(items.map((item) => item.id));
    const map = Object.create(null);
    for (const item of arr) {
      if (!item || typeof item.id !== 'string' || !expected.has(item.id)) {
        throw new Error('Translation response contains an unexpected field.');
      }
      if (Object.prototype.hasOwnProperty.call(map, item.id)) {
        throw new Error('Translation response contains a duplicate field.');
      }
      if (typeof item.text !== 'string' || !item.text.trim() || item.text.length > 5000) {
        throw new Error('Translation response contains an empty or oversized field.');
      }
      map[item.id] = item.text.trim();
    }
    if (!allowPartial && Object.keys(map).length !== expected.size) {
      throw new Error('Translation response is incomplete.');
    }
    return map;
  }

  function apply(guide, map) {
    const copy = JSON.parse(JSON.stringify(guide));
    for (const [id, text] of Object.entries(map || {})) {
      const parts = id.split('.');
      let target = copy;
      for (let i = 0; i < parts.length - 1; i += 1) {
        const part = parts[i];
        if (!target || !(part in target)) throw new Error(`Translation path does not exist: ${id}`);
        target = target[part];
      }
      const key = parts[parts.length - 1];
      if (!target || !(key in target)) throw new Error(`Translation path does not exist: ${id}`);
      const current = target[key];
      if (current && typeof current === 'object' && !Array.isArray(current)) {
        target[key] = { ...current, pt: text };
      } else {
        target[key] = { en: String(current == null ? '' : current), pt: text };
      }
    }
    return copy;
  }

  root.SonicTranslationCore = Object.freeze({
    version: VERSION,
    locale: LOCALE,
    collect,
    loadMemory,
    translate,
    validate,
    apply,
    sourceText,
    hasLocale,
    get memoryMetadata() { return memoryMetadata; }
  });
})(window);
