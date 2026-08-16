/**
 * Пословное сравнение диктанта с оригиналом.
 *
 * Просто сказать «неверно» бесполезно: учит именно то, КАКОЕ слово
 * потерялось. Обычно это служебные слова — артикли, предлоги,
 * вспомогательные глаголы, — которые в беглой речи проглатываются
 * и которых русскоязычное ухо не ждёт.
 *
 * Выравниваем через наибольшую общую подпоследовательность, иначе одно
 * пропущенное слово сдвигало бы всё остальное и весь хвост помечался бы
 * ошибочным.
 */

export function normalizeWord(word) {
  return String(word ?? '')
    .toLowerCase()
    .replace(/['’]/g, '')
    .replace(/[.,!?;:"—–-]/g, '')
    .trim();
}

export function splitWords(text) {
  return String(text ?? '')
    .split(/\s+/)
    .map((w) => w.trim())
    .filter(Boolean);
}

export const WORD = {
  OK: 'ok', // услышано верно
  WRONG: 'wrong', // на этом месте другое слово
  MISSING: 'missing', // слово потеряно
  EXTRA: 'extra', // лишнее слово
};

/**
 * Возвращает список шагов сравнения:
 *   { type, expected?, actual? }
 * Порядок соответствует оригиналу, лишние слова вставлены на своих местах.
 */
export function diffWords(expected, actual) {
  const exp = splitWords(expected);
  const act = splitWords(actual);
  const e = exp.map(normalizeWord);
  const a = act.map(normalizeWord);

  // Таблица длин наибольшей общей подпоследовательности
  const lcs = Array.from({ length: e.length + 1 }, () => new Array(a.length + 1).fill(0));
  for (let i = e.length - 1; i >= 0; i--) {
    for (let j = a.length - 1; j >= 0; j--) {
      lcs[i][j] = e[i] === a[j] ? lcs[i + 1][j + 1] + 1 : Math.max(lcs[i + 1][j], lcs[i][j + 1]);
    }
  }

  const steps = [];
  let i = 0;
  let j = 0;
  while (i < e.length && j < a.length) {
    if (e[i] === a[j]) {
      steps.push({ type: WORD.OK, expected: exp[i], actual: act[j] });
      i += 1;
      j += 1;
    } else if (lcs[i + 1][j] >= lcs[i][j + 1]) {
      steps.push({ type: WORD.MISSING, expected: exp[i] });
      i += 1;
    } else {
      steps.push({ type: WORD.EXTRA, actual: act[j] });
      j += 1;
    }
  }
  while (i < e.length) steps.push({ type: WORD.MISSING, expected: exp[i++] });
  while (j < a.length) steps.push({ type: WORD.EXTRA, actual: act[j++] });

  return mergeSubstitutions(steps);
}

/**
 * Насколько слова похожи, чтобы считать их подменой друг друга.
 * think/sink — явно одно вместо другого; student/hello — просто
 * два разных слова, и склеивать их в «замену» значит запутать.
 */
const SUBSTITUTION_SIMILARITY = 0.3;

function looksLikeSubstitution(expected, actual) {
  const a = normalizeWord(expected);
  const b = normalizeWord(actual);
  if (!a || !b) return false;

  // Расстояние Левенштейна на словах, без матрицы целиком
  let prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  let curr = new Array(b.length + 1);
  for (let i = 1; i <= a.length; i++) {
    curr[0] = i;
    for (let j = 1; j <= b.length; j++) {
      curr[j] = Math.min(curr[j - 1] + 1, prev[j] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    }
    [prev, curr] = [curr, prev];
  }
  const similarity = 1 - prev[b.length] / Math.max(a.length, b.length);
  return similarity >= SUBSTITUTION_SIMILARITY;
}

/**
 * Пропуск, за которым сразу идёт лишнее слово, — обычно замена:
 * человек услышал слово, но не то. Показывать это одной строкой
 * понятнее, чем двумя — но только если слова действительно похожи.
 */
function mergeSubstitutions(steps) {
  const out = [];
  for (let k = 0; k < steps.length; k++) {
    const cur = steps[k];
    const next = steps[k + 1];

    const pair =
      cur.type === WORD.MISSING && next?.type === WORD.EXTRA
        ? { expected: cur.expected, actual: next.actual }
        : cur.type === WORD.EXTRA && next?.type === WORD.MISSING
          ? { expected: next.expected, actual: cur.actual }
          : null;

    if (pair && looksLikeSubstitution(pair.expected, pair.actual)) {
      out.push({ type: WORD.WRONG, ...pair });
      k += 1;
    } else {
      out.push(cur);
    }
  }
  return out;
}

/** Доля верно услышанных слов от общего числа в оригинале. */
export function accuracy(steps) {
  const total = steps.filter((s) => s.type !== WORD.EXTRA).length;
  if (!total) return 0;
  const ok = steps.filter((s) => s.type === WORD.OK).length;
  return ok / total;
}

export function isPerfect(steps) {
  return steps.every((s) => s.type === WORD.OK);
}
