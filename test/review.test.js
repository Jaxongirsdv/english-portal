/**
 * Проверка тренажёра повторений — прежде всего обратной стороны карточки.
 *
 * Здесь легко построить экран, который ВЫГЛЯДИТ как тренировка речи,
 * но ею не является: показать перевод, дать кнопку «показать ответ»
 * и четыре оценки. Человек видит слово, ставит «помню», интервал растёт —
 * и слово уходит из памяти при формально растущей статистике.
 *
 * Поэтому тесты проверяют не «работают ли кнопки», а невозможность
 * зачесть невоспроизведённое слово: ни через показ ответа, ни через
 * пустой ввод, ни кликом по устаревшей разметке. И одновременно —
 * что честная попытка с опечаткой не считается провалом.
 */
import test from 'node:test';
import assert from 'node:assert/strict';

const store = new Map();
globalThis.localStorage = {
  getItem: (k) => (store.has(k) ? store.get(k) : null),
  setItem: (k, v) => store.set(k, String(v)),
  removeItem: (k) => store.delete(k),
};

const { resetState, update, loadState, today } = await import('../src/core/storage.js');
const { allLessons, unlockedVocabIds } = await import('../src/data/curriculum.js');
const { allGrammarItems, unlockedGrammarIds } = await import('../src/data/grammar.js');
const { getWord } = await import('../src/data/vocab.js');
const { cardId, getCard, grammarCardId, GRADE, DIRECTION } = await import('../src/core/srs.js');
const Review = await import('../src/views/review.js');

const LESSON = allLessons().find((l) => l.vocab.length >= 5);
const FUTURE = '2099-01-01';
const NONSENSE = 'zzzz qqqq';

function card(over = {}) {
  return { ease: 2.5, interval: 6, reps: 1, lapses: 0, due: FUTURE, ...over };
}

/**
 * Сессия ровно с одной карточкой воспроизведения впереди.
 *
 * Всем открытым словам заводим узнавание с датой в будущем: тогда долгов
 * нет и новых карточек узнавания тоже, а обратная сторона открывается
 * только у выбранного слова.
 */
function prodSession() {
  resetState();
  update((s) => {
    s.lessons = { [LESSON.id]: { completedAt: '2026-08-16T00:00:00Z', score: 100 } };
  });

  const unlocked = unlockedVocabIds(loadState().lessons);
  // Слово от восьми букв: на нём пропуск одной буквы гарантированно
  // остаётся опечаткой, а не превращается в другое слово
  const targetId = unlocked.find((id) => getWord(id).en.length >= 8);
  assert.ok(targetId, 'в уроке нужно длинное слово, иначе опечатку не проверить');

  update((s) => {
    for (const wid of unlocked) {
      s.cards[cardId(wid, DIRECTION.REC)] = card({ reps: wid === targetId ? 2 : 1 });
    }
  });

  Review.startReview();
  return { id: targetId, word: getWord(targetId) };
}

/** Сессия с карточкой узнавания впереди: уроки пройдены, карточек нет. */
function recSession() {
  resetState();
  update((s) => {
    s.lessons = { [LESSON.id]: { completedAt: '2026-08-16T00:00:00Z', score: 100 } };
  });
  Review.startReview();
}

/** Подставной распознаватель: движок ищется через window при каждом вызове. */
function withEngine(behaviour) {
  class Fake {
    start() {
      setTimeout(() => behaviour(this), 0);
    }
    stop() {}
    abort() {}
  }
  globalThis.window = { SpeechRecognition: Fake };
}

const hears = (text) => (r) =>
  r.onresult({ results: [[{ transcript: text, confidence: 0.9 }]] });
const fails = (code) => (r) => r.onerror({ error: code });

test.afterEach(() => {
  Review.exitReview();
  delete globalThis.window;
});

/* ---------- Ответ нельзя увидеть до попытки ---------- */

test('лицевая сторона воспроизведения не содержит английского слова', () => {
  const { word } = prodSession();
  const html = Review.renderReview();

  assert.ok(!html.includes(word.en), `слово «${word.en}» не должно быть видно до попытки`);
  assert.ok(html.includes('data-prod-input'), 'вместо этого — поле для ввода');
});

test('на воспроизведении нечем открыть ответ без попытки', () => {
  const { word } = prodSession();
  const html = Review.renderReview();

  assert.ok(!html.includes('data-reveal'), 'кнопки «показать ответ» не должно существовать');
  assert.ok(!html.includes(word.en), 'ответ не показан');
});

test('без проверки оценку поставить нельзя', () => {
  prodSession();
  assert.equal(Review.handleGrade(GRADE.GOOD), false);
});

test('пустое поле — не ответ', () => {
  const { word } = prodSession();

  Review.syncTyped('');
  assert.equal(Review.handleCheck(), false);
  Review.syncTyped('   ');
  assert.equal(Review.handleCheck(), false, 'пробелы тоже');
  assert.ok(!Review.renderReview().includes(word.en), 'ответ не открылся');
});

/* ---------- Что считается верным ---------- */

test('регистр и знаки препинания ошибкой не считаются', () => {
  const { word } = prodSession();
  Review.syncTyped(`  ${word.en.toUpperCase()}!  `);

  assert.equal(Review.handleCheck(), true);
  assert.equal(Review.handleGrade(GRADE.GOOD), true, 'точный ответ можно оценить как «помню»');
});

test('опечатка — это «почти», а не провал', () => {
  const { id, word } = prodSession();
  Review.syncTyped(word.en.slice(0, -1)); // потеряна последняя буква
  Review.handleCheck();

  const html = Review.renderReview();
  assert.ok(html.includes('Почти'), 'разбор должен назвать это опечаткой');
  assert.equal(Review.handleGrade(GRADE.GOOD), false, 'но «помню» за опечатку не ставится');
  assert.equal(Review.handleGrade(GRADE.HARD), true, 'засчитывается как «трудно»');

  const prod = getCard(cardId(id, DIRECTION.PROD));
  assert.equal(prod.lapses, 0, 'слово вспомнилось — провалом это не считается');
  assert.notEqual(prod.due, today(), 'и повтор всё же отодвигается');
});

test('другое слово опечаткой не считается', () => {
  const { id } = prodSession();
  Review.syncTyped(NONSENSE);
  Review.handleCheck();

  assert.equal(Review.handleGrade(GRADE.HARD), false, '«трудно» отодвинуло бы повторение');
  assert.equal(Review.handleGrade(GRADE.GOOD), false);
  assert.equal(Review.handleGrade(GRADE.EASY), false);
  assert.equal(Review.handleGrade(GRADE.AGAIN), true);

  const prod = getCard(cardId(id, DIRECTION.PROD));
  assert.equal(prod.due, today(), 'слово возвращается сегодня, а не через интервал');
});

test('неверный ответ возвращает карточку в конец очереди', () => {
  const { word } = prodSession();
  Review.syncTyped(NONSENSE);
  Review.handleCheck();
  Review.handleGrade(GRADE.AGAIN);

  const html = Review.renderReview();
  assert.ok(html.includes('data-prod-input'), 'та же карточка спрашивается снова');
  assert.ok(!html.includes(word.en), 'и снова без подсказки');
  assert.ok(!html.includes(NONSENSE), 'прошлый ответ стёрт');
});

test('«не помню» открывает ответ, но не даёт зачесть слово', () => {
  const { word } = prodSession();

  assert.equal(Review.handleGiveUp(), true);
  assert.ok(Review.renderReview().includes(word.en), 'ответ показан — иначе не выучить');
  assert.equal(Review.handleGrade(GRADE.GOOD), false, 'но «помню» после сдачи невозможно');
});

/* ---------- Голосом ---------- */

test('без распознавания режим остаётся письменным', () => {
  prodSession();
  Review.setAnswerMode('speak'); // движка нет — выбор не должен запирать экран

  const html = Review.renderReview();
  assert.ok(html.includes('data-prod-input'), 'поле ввода на месте');
  assert.ok(!html.includes('data-prod-speak'), 'кнопки записи быть не должно');
  assert.ok(!html.includes('data-prod-mode'), 'и переключателя тоже: выбирать не из чего');
});

test('сказанное верно засчитывается так же, как написанное', async () => {
  const { word } = prodSession();
  withEngine(hears(word.en));
  Review.setAnswerMode('speak');

  const html = Review.renderReview();
  assert.ok(html.includes('data-prod-speak'), 'появилась кнопка записи');
  assert.ok(!html.includes(word.en), 'ответ по-прежнему скрыт');

  await Review.handleSpeak(() => {});
  assert.ok(Review.renderReview().includes(word.en), 'после попытки ответ открыт');
  assert.equal(Review.handleGrade(GRADE.GOOD), true);
});

test('услышанное чужое слово не зачитывается', async () => {
  const { id } = prodSession();
  withEngine(hears(NONSENSE));
  Review.setAnswerMode('speak');

  await Review.handleSpeak(() => {});
  assert.equal(Review.handleGrade(GRADE.GOOD), false);
  assert.equal(Review.handleGrade(GRADE.AGAIN), true);
  assert.equal(getCard(cardId(id, DIRECTION.PROD)).due, today());
});

test('отказ микрофона объясняется и ничего не засчитывает', async () => {
  prodSession();
  withEngine(fails('not-allowed'));
  Review.setAnswerMode('speak');

  await Review.handleSpeak(() => {});
  const html = Review.renderReview();

  assert.ok(html.includes('Нет доступа к микрофону'), 'причина названа прямо');
  assert.ok(html.includes('data-prod-speak'), 'можно попробовать снова');
  assert.equal(Review.handleGrade(GRADE.AGAIN), false, 'попытки не было — оценивать нечего');
});

test('во время записи карточку нельзя сдать или переключить', async () => {
  const { word } = prodSession();
  let resolveEngine;
  withEngine((r) => {
    resolveEngine = () => r.onresult({ results: [[{ transcript: word.en, confidence: 0.9 }]] });
  });
  Review.setAnswerMode('speak');

  const pending = Review.handleSpeak(() => {});
  await new Promise((r) => setTimeout(r, 0)); // движок «запустился»

  assert.equal(Review.handleGiveUp(), false, 'иначе ответ открылся бы дважды');
  assert.equal(Review.setAnswerMode('write'), false);
  assert.equal(Review.handleCheck(), false);

  resolveEngine();
  await pending;
  assert.equal(Review.handleGrade(GRADE.GOOD), true, 'после записи всё работает');
});

/* ---------- Сколько нового берётся за сессию ---------- */

/**
 * Сессия с заданной дневной целью и заданным числом просроченных карточек.
 * Слова урока, оставшиеся без карточки, становятся кандидатами на новое.
 */
function budgetSession({ goal, overdue = 0 }) {
  resetState();
  const lessonWords = LESSON.vocab.map((v) => (typeof v === 'string' ? v : v.id));
  update((s) => {
    s.lessons = { [LESSON.id]: { completedAt: '2026-08-16T00:00:00Z', score: 100 } };
    s.settings.dailyGoal = goal;
    for (const wid of lessonWords.slice(0, overdue)) {
      s.cards[cardId(wid, DIRECTION.REC)] = card({ due: today() });
    }
    // Фразы урока убираем с глаз: здесь проверяется порция слов,
    // и грамматика только зашумила бы очередь
    for (const gid of unlockedGrammarIds(s.lessons)) {
      s.cards[grammarCardId(gid)] = card();
    }
  });
  Review.startReview();
}

const unesc = (s) =>
  s.replace(/&#39;/g, "'").replace(/&quot;/g, '"').replace(/&amp;/g, '&');

/** Английское слово с лицевой стороны карточки узнавания. */
function frontWord(html) {
  return unesc(html.match(/class="flash-word"[^>]*>([^<]*)/)?.[1] ?? '').trim();
}

/** Верный вариант виден в разметке после ответа — по подсветке. */
function correctOption(html) {
  return unesc(html.match(/class="option correct"[^>]*>([^<]*)</)?.[1] ?? '').trim();
}

/**
 * Проходит всю очередь до конца.
 *
 * Верный перевод заранее неизвестен, поэтому помощник ведёт себя как ученик:
 * ошибается на новом слове, запоминает подсвеченный ответ и в следующий раз
 * отвечает верно. Без этого ошибочные карточки возвращались бы бесконечно.
 */
function clearQueue() {
  const learned = new Map();

  for (let guard = 0; guard < 300; guard++) {
    let html = Review.renderReview();
    if (html.includes('empty-icon')) return;

    const options = [...html.matchAll(/data-pick="([^"]*)"/g)].map((m) => unesc(m[1]));
    assert.ok(options.length, 'в этих сессиях бывают только карточки узнавания');

    const word = frontWord(html);
    const known = learned.get(word);
    assert.ok(Review.handlePick(known ?? options[0]));

    html = Review.renderReview();
    learned.set(word, correctOption(html));
    // Оценку выбираем по тому, что предлагает экран: угадать можно
    // и с первого раза, и тогда «не помню» просто не примут
    Review.handleGrade(html.includes(`data-grade="${GRADE.GOOD}"`) ? GRADE.GOOD : GRADE.AGAIN);
  }
  assert.fail('очередь не кончилась — похоже, карточки возвращаются бесконечно');
}

test('просроченное вытесняет новое, и об этом говорится прямо', () => {
  // Цель равна долгу: места под новые слова не остаётся вовсе
  budgetSession({ goal: 1, overdue: 1 });
  clearQueue();

  const html = Review.renderReview();
  assert.ok(html.includes('Придержано'), 'новые слова были, но их не предложили');
  assert.ok(
    html.includes('Просроченные повторения занимали всю дневную цель'),
    'причина названа, иначе это выглядит как поломка',
  );
  assert.ok(!html.includes('Все открытые слова повторены'), 'а это была бы неправда');
});

test('придержанные слова предлагаются одной кнопкой, а не прячутся', () => {
  budgetSession({ goal: 4 }); // бюджет 2, слов в уроке заметно больше
  clearQueue();

  const html = Review.renderReview();
  assert.ok(html.includes('ждут') || html.includes('ждёт'), 'сказано, что слова остались');
  assert.ok(html.includes('Взять ещё слов'), 'и есть чем продолжить, не уходя с экрана');
});

test('когда придерживать нечего, лишней кнопки не появляется', () => {
  budgetSession({ goal: 40 }); // бюджета хватает на все слова урока
  clearQueue();

  const html = Review.renderReview();
  assert.ok(!html.includes('Взять ещё слов'), 'предлагать нечего');
  assert.ok(!html.includes('Придержано'));
});

test('новая сессия после разгребённого долга снова берёт слова', () => {
  budgetSession({ goal: 1, overdue: 1 });
  clearQueue();

  // Ровно то, что делает кнопка «Взять ещё слов»
  Review.startReview();
  assert.ok(
    !Review.renderReview().includes('empty-icon'),
    'долгов больше нет — бюджет освободился под новые слова',
  );
});

/* ---------- Карточка грамматики ---------- */

/**
 * Сессия, в которой впереди очереди стоит фраза из пройденного урока.
 *
 * Урок берём ровно с одной фразой: несколько фраз перемешиваются, и тест
 * проверял бы случайную из них — ошибка, на которой он уже спотыкался.
 */
function grammarSession({ reps = 0 } = {}) {
  const perLesson = {};
  for (const it of allGrammarItems()) (perLesson[it.lessonId] ||= []).push(it);
  const only = Object.values(perLesson).find((list) => list.length === 1 && list[0].en.length >= 10);
  assert.ok(only, 'нужен урок с единственной длинной фразой');
  const item = only[0];

  resetState();
  update((s) => {
    s.lessons = { [item.lessonId]: { completedAt: '2026-08-16T00:00:00Z', score: 100 } };
    // Словам этого урока даём карточки с датой в будущем: тогда в очереди
    // не окажется ничего, кроме самой фразы
    for (const wid of unlockedVocabIds(s.lessons)) {
      s.cards[cardId(wid, DIRECTION.REC)] = card();
    }
    // Зрелость фразы решает, собирать её из слов или набирать
    if (reps) s.cards[grammarCardId(item.id)] = card({ reps, due: today() });
  });
  Review.startReview();
  return item;
}

test('новая фраза собирается из слов, а не набирается', () => {
  const item = grammarSession();
  const html = Review.renderReview();

  assert.ok(html.includes('построй фразу'), 'карточка фразы, а не слова');
  assert.ok(html.includes(item.ru), 'русская сторона на месте');
  assert.ok(!html.includes(item.en), 'готового ответа нет');

  const bank = [...html.matchAll(/data-bank-pick="(\d+)"/g)];
  assert.equal(bank.length, item.en.split(' ').length, 'в банке ровно слова ответа');
  assert.ok(!html.includes('data-prod-input'), 'печатать целое предложение не нужно');
});

test('собранная фраза проверяется по порядку слов', () => {
  const item = grammarSession();
  const words = item.en.split(' ');

  // Собираем в правильном порядке, находя каждое слово в перемешанном банке
  const used = new Set();
  for (const word of words) {
    const html = Review.renderReview();
    const chip = [...html.matchAll(/data-bank-pick="(\d+)"[^>]*>([^<]*)</g)]
      .map((m) => ({ i: m[1], w: m[2].trim() }))
      .find((c) => c.w === word && !used.has(c.i));
    assert.ok(chip, `слова «${word}» нет в банке`);
    used.add(chip.i);
    assert.ok(Review.handleBankPick(chip.i));
  }

  assert.equal(Review.handleCheck(), true);
  assert.ok(Review.renderReview().includes('Верно'), 'порядок собран верно');
  assert.equal(Review.handleGrade(GRADE.GOOD), true);
});

test('слово из банка можно вернуть назад', () => {
  grammarSession();
  assert.ok(Review.handleBankPick(0));
  assert.ok(Review.renderReview().includes('data-bank-undo="0"'), 'взятое слово видно в ответе');

  assert.ok(Review.handleBankUndo(0));
  assert.ok(!Review.renderReview().includes('data-bank-undo'), 'и его можно снять');
  assert.equal(Review.handleCheck(), false, 'пустой ответ не проверяется');
});

test('окрепшую фразу уже приходится набирать целиком', () => {
  const item = grammarSession({ reps: 3 });
  const html = Review.renderReview();

  assert.ok(html.includes('data-prod-input'), 'банка слов больше нет');
  assert.ok(!html.includes('data-bank-pick'), 'подсказку убрали — спрос выше');
  assert.ok(!html.includes(item.en));
});

test('ответ на фразу нельзя открыть даром', () => {
  const item = grammarSession();
  const html = Review.renderReview();

  assert.ok(!html.includes('data-reveal'), 'открывать ответ нечем');
  assert.equal(Review.handleGrade(GRADE.GOOD), false, 'и оценка без попытки невозможна');
  assert.ok(!html.includes(item.en));
});

test('верно набранная фраза засчитывается', () => {
  const item = grammarSession({ reps: 3 }); // окрепшую набирают целиком
  Review.syncTyped(item.en.toUpperCase() + '!');

  assert.equal(Review.handleCheck(), true);
  assert.ok(Review.renderReview().includes('Верно'), 'регистр и точка роли не играют');
  assert.equal(Review.handleGrade(GRADE.GOOD), true);
  assert.ok(getCard(grammarCardId(item.id)).reps >= 1, 'прогресс записан под id фразы');
});

test('опечатка во фразе остаётся опечаткой', () => {
  const item = grammarSession({ reps: 3 });
  Review.syncTyped(item.en.slice(0, -1));
  Review.handleCheck();

  assert.ok(Review.renderReview().includes('Почти'));
  assert.equal(Review.handleGrade(GRADE.GOOD), false, '«помню» за опечатку не даётся');
  assert.equal(Review.handleGrade(GRADE.HARD), true);
});

test('перепутанный порядок слов — это ошибка, а не опечатка', () => {
  const item = grammarSession({ reps: 3 });
  Review.syncTyped(item.en.split(' ').reverse().join(' '));
  Review.handleCheck();

  const html = Review.renderReview();
  assert.ok(html.includes(item.en), 'правильный вариант показан');
  assert.equal(Review.handleGrade(GRADE.HARD), false, 'иначе повтор отодвинулся бы');
  assert.equal(Review.handleGrade(GRADE.AGAIN), true);
  assert.equal(getCard(grammarCardId(item.id)).due, today(), 'фраза вернётся сегодня');
});

test('на фразу не отвечают голосом', async () => {
  const item = grammarSession();
  withEngine(hears(item.en));
  Review.setAnswerMode('speak');

  const html = Review.renderReview();
  assert.ok(!html.includes('data-prod-speak'), 'кнопки записи на фразе быть не должно');
  assert.ok(!html.includes('data-prod-mode'), 'и переключателя способа ответа тоже');

  await Review.handleSpeak(() => {});
  assert.ok(!Review.renderReview().includes('Верно'), 'запись не должна ничего засчитать');
});

test('«не помню» на фразе открывает ответ, но не зачитывает', () => {
  const item = grammarSession({ reps: 3 });

  assert.equal(Review.handleGiveUp(), true);
  assert.ok(Review.renderReview().includes(item.en));
  assert.equal(Review.handleGrade(GRADE.GOOD), false);
});

/* ---------- Узнавание работает по-прежнему ---------- */

test('узнавание проверяется выбором, а не доверием к себе', () => {
  recSession();
  const html = Review.renderReview();

  assert.ok(!html.includes('data-reveal'), 'самооценка убрана вместе с кнопкой');
  const options = [...html.matchAll(/data-pick="([^"]*)"/g)].map((m) => unesc(m[1]));
  assert.equal(options.length, 4, 'четыре варианта');
  assert.equal(new Set(options).size, 4, 'и все разные');

  assert.equal(Review.handleCheck(), false, 'ввод здесь ни при чём');
  assert.equal(Review.handleGiveUp(), false);
  assert.equal(Review.handleGrade(GRADE.GOOD), false, 'без ответа оценки нет');
});

test('неверный выбор не даёт зачесть слово', () => {
  recSession();
  const html = Review.renderReview();
  const options = [...html.matchAll(/data-pick="([^"]*)"/g)].map((m) => unesc(m[1]));
  const right = getWord(frontWord(html).replace(/\s.*$/, '')) ?? null;

  // Берём заведомо чужой вариант: верный подсветится после ответа
  assert.ok(Review.handlePick(options[0]));
  const after = Review.renderReview();
  const correct = correctOption(after);

  if (options[0] === correct) {
    assert.equal(Review.handleGrade(GRADE.GOOD), true, 'верный выбор оценивается как обычно');
  } else {
    assert.equal(Review.handleGrade(GRADE.GOOD), false, '«помню» после промаха невозможно');
    assert.equal(Review.handleGrade(GRADE.AGAIN), true);
  }
  assert.ok(right !== undefined);
});
