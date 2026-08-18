/**
 * Проверка текстов для чтения.
 *
 * Главная проверка одна: каждое слово текста должно быть либо знакомо
 * человеку на этом уровне, либо переведено в глоссарии рядом с текстом.
 * Правило простое, но удержать его вручную нельзя: при любой правке легко
 * вставить слово из следующего уровня, и текст молча превратится
 * в расшифровку со словарём.
 *
 * Первая версия этой проверки держала список «разрешённых сверх словаря»
 * прямо здесь, в тесте. Это была ровно та лазейка, от которой сам же
 * тест и предостерегал: туда можно свалить что угодно, и проверка уровня
 * перестаёт значить хоть что-то. Теперь такие слова живут в глоссарии —
 * то есть на виду у читателя, а не у автора теста.
 */
import test from 'node:test';
import assert from 'node:assert/strict';

const { VOCAB } = await import('../src/data/vocab.js');
const { TEXTS, getText, textsFor, plainText, wordCount } = await import('../src/data/reading.js');

const LEVELS = ['A0', 'A1', 'A2', 'B1', 'B2', 'C1'];

/**
 * Служебные слова: артикли, местоимения, вспомогательные глаголы, базовые
 * предлоги, союзы и кванторы. Карточек у них нет — они разбираются
 * в теории уроков, — но без них не построить ни одного предложения.
 *
 * Список строго грамматический. Содержательным словам здесь не место:
 * их дорога — в глоссарий.
 */
const FUNCTION_WORDS = `a an the of his her its our their them him us me
  do does did don't doesn't didn't isn't aren't wasn't weren't cannot can't won't has
  for about without until during near over
  something nothing anything everything somebody nobody anybody everybody
  someone anyone everyone myself yourself himself herself themselves
  all each every other others another both either neither
  first second third somewhere else
  more most less least only just even still again
  there here as so too if then than that this these those
  who whom whose which what when where why how not no yes and or but`
  .split(/\s+/)
  .filter(Boolean);

/** Множество допустимых слов для уровня: свой словарь и все предыдущие. */
function deckFor(level) {
  const limit = LEVELS.indexOf(level);
  const set = new Set(FUNCTION_WORDS);
  for (const w of VOCAB) {
    if (LEVELS.indexOf(w.level) > limit) continue;
    // Многословные статьи вроде «nice to meet you» дают каждое слово отдельно
    for (const part of w.en.toLowerCase().split(/\s+/)) set.add(part);
  }
  return set;
}

const strip = (s) =>
  s
    .toLowerCase()
    .replace(/[.,!?;:"«»()]/g, '')
    .replace(/[’']s$/, '')
    .trim();

/**
 * Слово знакомо, если оно есть в списке само по себе или отличается простым
 * окончанием. Послабление намеренное: заводить карточку на каждую форму
 * бессмысленно — читатель узнаёт books, зная book, и easier, зная easy.
 */
function known(word, allowed) {
  if (!word || allowed.has(word)) return true;
  const forms = [
    word.replace(/s$/, ''),
    word.replace(/es$/, ''),
    word.replace(/ed$/, ''),
    word.replace(/ing$/, ''),
    word.replace(/ies$/, 'y'),
    word.replace(/ied$/, 'y'),
    word.replace(/ing$/, 'e'),
    word.replace(/ed$/, 'e'),
    word.replace(/er$/, ''),
    word.replace(/est$/, ''),
    word.replace(/ier$/, 'y'),
    word.replace(/iest$/, 'y'),
    word.replace(/er$/, 'e'),
    word.replace(/est$/, 'e'),
  ];
  return forms.some((f) => f && allowed.has(f));
}

function words(text) {
  return plainText(text)
    .split(/[\s—–-]+/)
    .map(strip)
    .filter(Boolean);
}

function unknownWords(text) {
  const allowed = deckFor(text.level);
  for (const g of text.glossary || []) allowed.add(g.en.toLowerCase());
  const names = new Set((text.names || []).map((n) => n.toLowerCase()));

  return [...new Set(words(text).filter((w) => !names.has(w) && !known(w, allowed)))];
}

/* ---------- Словарь ---------- */

test('в тексте нет слов, которых читателю негде было встретить', () => {
  const problems = [];
  for (const t of TEXTS) {
    const unknown = unknownWords(t);
    if (unknown.length) problems.push(`${t.id} (${t.level}): ${unknown.join(', ')}`);
  }
  assert.deepEqual(problems, [], 'эти слова надо либо убрать, либо внести в глоссарий');
});

test('глоссарий остаётся глоссарием, а не страницей словаря', () => {
  // Больше горстки новых слов на текст — и чтение превращается в перевод
  for (const t of TEXTS) {
    assert.ok(
      (t.glossary || []).length <= 6,
      `${t.id}: незнакомых слов ${t.glossary.length} — текст стоит упростить`,
    );
  }
});

test('каждое слово глоссария правда встречается в тексте', () => {
  for (const t of TEXTS) {
    const body = words(t);
    for (const g of t.glossary || []) {
      const w = g.en.toLowerCase();
      assert.ok(
        body.some((b) => b === w || known(b, new Set([w]))),
        `${t.id}: «${w}» переведено, но в тексте его нет`,
      );
      assert.ok(g.ru?.trim(), `${t.id}: «${w}» без перевода бесполезно`);
    }
  }
});

test('список служебных слов не разросся в лазейку', () => {
  assert.ok(FUNCTION_WORDS.length <= 110, `служебных слов слишком много: ${FUNCTION_WORDS.length}`);
  assert.equal(new Set(FUNCTION_WORDS).size, FUNCTION_WORDS.length, 'есть повторы');
});

/* ---------- Содержание ---------- */

test('на каждом уровне есть что читать', () => {
  for (const level of LEVELS) {
    const own = TEXTS.filter((t) => t.level === level);
    assert.ok(own.length >= 2, `${level}: текстов всего ${own.length}`);
  }
});

test('тексты растут вместе с уровнем', () => {
  const avg = (level) => {
    const own = TEXTS.filter((t) => t.level === level);
    return own.reduce((n, t) => n + wordCount(t), 0) / own.length;
  };
  assert.ok(avg('A0') < avg('A1'), 'на A0 длинный текст прочесть нечем');
  assert.ok(avg('A1') < avg('B1'));
  assert.ok(avg('A0') >= 20, 'слишком короткий текст не читают, а просматривают');
});

test('у каждого текста есть перевод названия и вопросы', () => {
  for (const t of TEXTS) {
    assert.ok(t.titleRu?.trim(), `${t.id}: без перевода названия непонятно, о чём текст`);
    assert.ok(t.paragraphs.length >= 2, `${t.id}: текст в один абзац читать неудобно`);
    assert.ok(t.questions.length >= 3, `${t.id}: вопросов мало для проверки понимания`);
  }
});

test('id текстов уникальны — иначе прогресс склеится', () => {
  const ids = TEXTS.map((t) => t.id);
  assert.equal(new Set(ids).size, ids.length);
  assert.equal(getText('нет такого'), null);
});

/* ---------- Вопросы ---------- */

test('верный ответ всегда среди вариантов и всегда один', () => {
  for (const t of TEXTS) {
    for (const q of t.questions) {
      assert.ok(q.options.includes(q.answer), `${t.id}: «${q.q}» — верного варианта нет в списке`);
      assert.equal(
        q.options.filter((o) => o === q.answer).length,
        1,
        `${t.id}: «${q.q}» — верный вариант повторяется`,
      );
      assert.ok(q.options.length >= 3, `${t.id}: «${q.q}» — вариантов слишком мало`);
      assert.equal(new Set(q.options).size, q.options.length, `${t.id}: повтор среди вариантов`);
    }
  }
});

test('ответ содержится в тексте, а не додуман', () => {
  // Вопрос, ответ на который нельзя найти в тексте, проверяет фантазию
  const norm = (s) => s.toLowerCase().replace(/[.,!?"«»]/g, '');
  for (const t of TEXTS) {
    const body = norm(plainText(t));
    for (const q of t.questions) {
      const parts = norm(q.answer)
        .split(/\s+/)
        .filter((w) => w.length > 3);
      const found = parts.filter((w) => body.includes(w)).length;
      assert.ok(
        !parts.length || found >= Math.ceil(parts.length / 2),
        `${t.id}: ответа «${q.answer}» в тексте не найти`,
      );
    }
  }
});

/* ---------- Доступность по уровням ---------- */

test('на уровне доступны свои тексты и все прежние', () => {
  assert.ok(
    textsFor('A0').every((t) => t.level === 'A0'),
    'на A0 тексты старших уровней читать нечем',
  );
  assert.ok(textsFor('B1').length > textsFor('A1').length);
  assert.equal(textsFor('C1').length, TEXTS.length, 'к C1 доступно всё');
});

test('неизвестный уровень оставляет хотя бы начальные тексты', () => {
  assert.ok(textsFor(undefined).length >= 2);
  assert.ok(textsFor('ерунда').length >= 2);
});

/* ---------- Экран: варианты нельзя угадать по позиции ---------- */

const Reading = await import('../src/views/reading.js');

test('верный ответ не всегда стоит первым на экране', () => {
  // В данных верный вариант записан первым. Если экран покажет их в этом же
  // порядке, текст «понимается» на сто процентов нажатием верхней кнопки —
  // ровно так и вышло при первой проверке вживую.
  //
  // Позицию ищем строго у текущего вопроса: первая версия проверки сверяла
  // ответы всех вопросов подряд и «находила» разброс там, где у двух вопросов
  // просто совпадали варианты. Она проходила и на неперемешанных данных.
  const store = new Map();
  globalThis.localStorage = {
    getItem: (k) => (store.has(k) ? store.get(k) : null),
    setItem: (k, v) => store.set(k, String(v)),
    removeItem: (k) => store.delete(k),
  };

  const target = TEXTS.find((t) => t.questions.length >= 3);
  const positions = new Set();

  for (let i = 0; i < 40; i++) {
    Reading.openText(target.id);
    Reading.startQuestions();
    const html = Reading.renderReading();

    const prompt = html.match(/class="ex-prompt">([^<]*)</)?.[1] ?? '';
    const current = target.questions.find((q) => q.q === prompt);
    assert.ok(current, `не удалось понять, какой вопрос показан: «${prompt}»`);

    const shown = [...html.matchAll(/data-reading-answer="([^"]*)"/g)].map((m) => m[1]);
    positions.add(shown.indexOf(current.answer));
    Reading.exitReading();
  }

  assert.ok(!positions.has(-1), 'верного ответа нет среди показанных вариантов');
  assert.ok(positions.size > 1, `верный ответ всегда на позиции ${[...positions]}`);
});

test('ответ засчитывается по содержанию, а не по месту в списке', () => {
  const target = TEXTS.find((t) => t.questions.length >= 3);
  Reading.openText(target.id);
  Reading.startQuestions();

  const html = Reading.renderReading();
  const shown = [...html.matchAll(/data-reading-answer="([^"]*)"/g)].map((m) => m[1]);
  const right = target.questions.find((q) => shown.includes(q.answer)).answer;

  assert.ok(Reading.answerQuestion(right));
  assert.ok(Reading.renderReading().includes('Верно'), 'верный ответ должен приниматься с любого места');
  Reading.exitReading();
});
