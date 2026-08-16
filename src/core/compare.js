/**
 * Сравнение сказанного с образцом.
 *
 * Распознаватель почти никогда не возвращает строку символ в символ:
 * он путает похожие слова, теряет артикли, дописывает пунктуацию.
 * Поэтому сравниваем не на точное совпадение, а на близость —
 * иначе тренажёр браковал бы верное произношение.
 */

/** Приводит к виду, в котором сравнение осмысленно. */
export function normalizeSpeech(str) {
  return (
    String(str ?? '')
      .toLowerCase()
      // Апостроф выкидываем без следа: don't и dont — одно слово,
      // а пробел на его месте сделал бы из них разные строки
      .replace(/['’]/g, '')
      .replace(/[.,!?;:"\-–—]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
  );
}

/** Расстояние Левенштейна: сколько правок отделяют одну строку от другой. */
export function levenshtein(a, b) {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;

  // Держим только одну строку матрицы — больше не нужно
  let prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  let curr = new Array(b.length + 1);

  for (let i = 1; i <= a.length; i++) {
    curr[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      curr[j] = Math.min(curr[j - 1] + 1, prev[j] + 1, prev[j - 1] + cost);
    }
    [prev, curr] = [curr, prev];
  }
  return prev[b.length];
}

/** Близость строк от 0 (ничего общего) до 1 (совпадение). */
export function similarity(a, b) {
  const x = normalizeSpeech(a);
  const y = normalizeSpeech(b);
  if (!x && !y) return 1;
  const longest = Math.max(x.length, y.length);
  if (!longest) return 0;
  return 1 - levenshtein(x, y) / longest;
}

export const VERDICT = {
  EXACT: 'exact', // распознано как есть
  CLOSE: 'close', // узнаваемо, но с огрехами
  WRONG: 'wrong', // услышано другое слово
};

/**
 * Порог «близости» зависит от длины образца.
 *
 * На длинной фразе одна потерянная буква — мелочь. На коротком слове это
 * почти всегда другой звук: three и tree различаются одним символом, но
 * разница между ними — тот самый /θ/, ради которого тренажёр и нужен.
 * Единый порог либо пропускал бы такие подмены, либо браковал живую речь
 * в длинных фразах, поэтому он разный.
 */
function closeThreshold(expected) {
  return normalizeSpeech(expected).length <= 6 ? 0.85 : 0.7;
}

/**
 * Оценивает попытку по списку вариантов распознавания.
 * Распознаватель возвращает несколько гипотез — засчитываем лучшую,
 * иначе верная попытка терялась бы из-за случайной первой догадки.
 */
export function scoreAttempt(expected, alternatives) {
  const list = (alternatives || []).filter(Boolean);
  if (!list.length) {
    return { verdict: VERDICT.WRONG, score: 0, heard: '' };
  }

  let best = { score: -1, heard: '' };
  for (const alt of list) {
    const text = typeof alt === 'string' ? alt : alt.transcript;
    const score = similarity(expected, text);
    if (score > best.score) best = { score, heard: text };
  }

  const verdict =
    best.score >= 0.99
      ? VERDICT.EXACT
      : best.score >= closeThreshold(expected)
        ? VERDICT.CLOSE
        : VERDICT.WRONG;

  return { verdict, score: best.score, heard: best.heard };
}
