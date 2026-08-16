/** Мелкие помощники для рендера. Никакого фреймворка — только строки и DOM. */

export function esc(str) {
  return String(str ?? '').replace(
    /[&<>"']/g,
    (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c],
  );
}

/** Кнопка озвучки. Текст кладём в data-атрибут, обработчик — делегированный. */
export function speakBtn(text, label = '🔊') {
  return `<button class="btn-speak" data-speak="${esc(text)}" title="Произнести">${label}</button>`;
}

export function progressBar(percent, green = false) {
  const p = Math.max(0, Math.min(100, Math.round(percent)));
  return `<div class="progress"><div class="progress-bar${green ? ' green' : ''}" style="width:${p}%"></div></div>`;
}

/** Перемешивает копию массива (алгоритм Фишера — Йетса). */
export function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Нормализация ответа: регистр, лишние пробелы и знаки препинания не считаются ошибкой. */
export function normalize(str) {
  return String(str ?? '')
    .toLowerCase()
    .replace(/[.,!?;:'"’]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export function plural(n, one, few, many) {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return `${n} ${one}`;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return `${n} ${few}`;
  return `${n} ${many}`;
}
