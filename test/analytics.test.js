/**
 * Проверка разбора прогресса.
 *
 * Опасность этого слоя в том, что неверный вывод звучит так же
 * убедительно, как верный. «Уроки обгоняют повторения» на пустом
 * прогрессе или, наоборот, молчание при реальном отставании —
 * и человек примет решение на основании выдумки.
 *
 * Поэтому проверяем не только «считает ли», но и «молчит ли,
 * когда сказать нечего».
 */
import test from 'node:test';
import assert from 'node:assert/strict';

const store = new Map();
globalThis.localStorage = {
  getItem: (k) => (store.has(k) ? store.get(k) : null),
  setItem: (k, v) => store.set(k, String(v)),
  removeItem: (k) => store.delete(k),
};

const { resetState, update, loadState } = await import('../src/core/storage.js');
const { allLessons } = await import('../src/data/curriculum.js');
const { cardId, DIRECTION } = await import('../src/core/srs.js');
const { reviewDebt, sideBalance, weakLessons, levelProgress, activity, insights } = await import(
  '../src/core/analytics.js'
);

/** Урок с непустым словарём — на нём удобно проверять долг. */
const LESSON = allLessons().find((l) => l.vocab.length >= 5);

function card(over = {}) {
  return { reps: 1, interval: 1, ease: 2.5, due: '2026-08-18', lapses: 0, ...over };
}

function withLesson(cards = {}) {
  resetState();
  update((s) => {
    s.lessons = { [LESSON.id]: { completedAt: '2026-08-16T00:00:00Z', score: 100 } };
    s.cards = cards;
  });
  return loadState();
}

/* ---------- Долг по повторениям ---------- */

test('на чистом прогрессе долга нет', () => {
  resetState();
  const debt = reviewDebt(loadState());
  assert.equal(debt.unlocked, 0);
  assert.equal(debt.waiting, 0);
  assert.equal(debt.ratio, 0, 'делить не на что — но и паниковать не о чем');
});

test('слова урока без единого повторения считаются долгом', () => {
  const state = withLesson();
  const debt = reviewDebt(state);

  assert.equal(debt.unlocked, LESSON.vocab.length);
  assert.equal(debt.started, 0);
  assert.equal(debt.waiting, LESSON.vocab.length);
  assert.ok(debt.words.length > 0, 'должно быть видно, какие именно слова ждут');
});

test('начатые слова из долга уходят', () => {
  const state = withLesson({ [LESSON.vocab[0]]: card(), [LESSON.vocab[1]]: card() });
  const debt = reviewDebt(state);

  assert.equal(debt.started, 2);
  assert.equal(debt.waiting, LESSON.vocab.length - 2);
});

test('слова из непройденных уроков в долг не попадают', () => {
  const state = withLesson();
  const debt = reviewDebt(state);
  const own = new Set(LESSON.vocab);

  assert.ok(
    debt.unlocked === own.size,
    'считаются только слова пройденного урока, иначе долг был бы выдуман',
  );
});

/* ---------- Стороны карточек ---------- */

test('обратная сторона считается отдельно от прямой', () => {
  const state = withLesson({
    hello: card({ reps: 3 }),
    [cardId('hello', DIRECTION.PROD)]: card({ reps: 1 }),
    water: card({ reps: 1 }),
  });
  const sides = sideBalance(state);

  assert.equal(sides.recognition, 2, 'прямых карточек две');
  assert.equal(sides.production, 1, 'обратная одна');
});

test('готовность к воспроизведению определяется по числу успешных узнаваний', () => {
  const state = withLesson({
    ready: card({ reps: 2 }),
    notYet: card({ reps: 1 }),
    already: card({ reps: 5 }),
    [cardId('already', DIRECTION.PROD)]: card(),
  });
  const sides = sideBalance(state);

  assert.equal(sides.readyForProduction, 1, 'только «ready»: у одного мало повторов, у другого сторона уже есть');
});

/* ---------- Слабые уроки ---------- */

test('слабые уроки выбираются по порогу и сортируются от худшего', () => {
  const all = allLessons();
  resetState();
  update((s) => {
    s.lessons = {
      [all[0].id]: { score: 33 },
      [all[1].id]: { score: 67 },
      [all[2].id]: { score: 100 },
    };
  });

  const weak = weakLessons(loadState());
  assert.equal(weak.length, 2, 'урок на 100% слабым не считается');
  assert.equal(weak[0].score, 33, 'худший идёт первым');
});

/* ---------- Уровни и активность ---------- */

test('продвижение по уровням не выдумывает пройденное', () => {
  const state = withLesson();
  const levels = levelProgress(state);

  const total = levels.reduce((n, l) => n + l.total, 0);
  const done = levels.reduce((n, l) => n + l.done, 0);

  assert.equal(total, allLessons().length, 'сумма по уровням равна курсу');
  assert.equal(done, 1, 'пройден ровно один урок');
});

test('дни без занятий показываются нулями, а не пропускаются', () => {
  resetState();
  update((s) => {
    s.history = { '2026-08-16': 46 };
  });

  const days = activity(loadState(), 3, new Date('2026-08-18T12:00:00'));
  assert.equal(days.length, 3, 'ряд дней должен быть сплошным');
  assert.deepEqual(days.map((d) => d.count), [46, 0, 0]);
  assert.equal(days.at(-1).date, '2026-08-18', 'последний день — сегодняшний');
});

/* ---------- Наблюдения ---------- */

test('на пустом прогрессе выводов не делается', () => {
  resetState();
  assert.deepEqual(insights(loadState()), [], 'не о чем говорить — значит молчим');
});

test('отставание повторений называется первым', () => {
  const all = allLessons();
  resetState();
  update((s) => {
    // Много уроков, одно начатое слово — то самое отставание
    s.lessons = Object.fromEntries(all.slice(0, 11).map((l) => [l.id, { score: 100 }]));
    s.cards = { hello: card() };
  });

  const found = insights(loadState());
  assert.ok(found.length > 0);
  assert.match(found[0].title, /обгоняют/i, 'это главное узкое место, оно идёт первым');
  assert.equal(found[0].level, 'warn');
});

test('о неначатом воспроизведении сообщается, когда оно уже доступно', () => {
  const state = withLesson({
    [LESSON.vocab[0]]: card({ reps: 3 }),
    [LESSON.vocab[1]]: card({ reps: 3 }),
  });
  update((s) => {
    s.cards = state.cards;
  });

  const found = insights(loadState());
  assert.ok(
    found.some((i) => /воспроизведение/i.test(i.title)),
    'слова готовы к обратной стороне — об этом надо сказать',
  );
});

test('при начатом воспроизведении о нём не напоминают', () => {
  const state = withLesson({
    [LESSON.vocab[0]]: card({ reps: 3 }),
    [cardId(LESSON.vocab[0], DIRECTION.PROD)]: card(),
  });
  update((s) => {
    s.cards = state.cards;
  });

  const found = insights(loadState());
  assert.ok(
    !found.some((i) => /воспроизведение/i.test(i.title)),
    'повторять уже сделанное — шум',
  );
});

test('ровный прогресс получает подтверждение, а не выдуманную проблему', () => {
  const state = withLesson(
    Object.fromEntries(
      LESSON.vocab.flatMap((id) => [
        [id, card({ reps: 3 })],
        [cardId(id, DIRECTION.PROD), card({ reps: 2 })],
      ]),
    ),
  );
  update((s) => {
    s.cards = state.cards;
    s.history = { [new Date().toISOString().slice(0, 10)]: 20 };
  });

  const found = insights(loadState());
  assert.equal(found.length, 1);
  assert.equal(found[0].level, 'ok', 'когда всё в порядке, проблему выдумывать нельзя');
});
