/**
 * Озвучка через Web Speech API — встроена в браузер, бесплатна
 * и не требует интернета после загрузки голосов.
 * На A0 слышать слово так же важно, как видеть его.
 */

import { loadState } from './storage.js';

let cachedVoice = null;

function pickVoice() {
  const voices = speechSynthesis.getVoices();
  if (!voices.length) return null;
  // Предпочитаем «живые» английские голоса, затем любой en-*
  const preferred = [
    /en-US.*(Natural|Online|Google|Samantha|Aria|Jenny)/i,
    /en-GB.*(Natural|Online|Google|Daniel|Libby)/i,
    /^en-US/i,
    /^en-GB/i,
    /^en/i,
  ];
  for (const rx of preferred) {
    const found = voices.find((v) => rx.test(`${v.lang} ${v.name}`));
    if (found) return found;
  }
  return null;
}

function ensureVoice() {
  if (cachedVoice) return cachedVoice;
  cachedVoice = pickVoice();
  return cachedVoice;
}

if (typeof speechSynthesis !== 'undefined') {
  speechSynthesis.addEventListener('voiceschanged', () => {
    cachedVoice = null;
    ensureVoice();
  });
  // В некоторых браузерах голоса доступны сразу
  ensureVoice();
}

export function isSupported() {
  return typeof speechSynthesis !== 'undefined';
}

export function hasEnglishVoice() {
  return !!ensureVoice();
}

/** Произносит английский текст. rate — скорость (0.5–1.5). */
export function speak(text, { rate } = {}) {
  if (!isSupported() || !text) return;
  speechSynthesis.cancel();
  const utter = new SpeechSynthesisUtterance(text);
  const voice = ensureVoice();
  if (voice) utter.voice = voice;
  utter.lang = voice?.lang || 'en-US';
  utter.rate = rate ?? loadState().settings.voiceRate ?? 0.9;
  speechSynthesis.speak(utter);
}

/** Медленное проговаривание — для разбора по звукам. */
export function speakSlow(text) {
  speak(text, { rate: 0.6 });
}
