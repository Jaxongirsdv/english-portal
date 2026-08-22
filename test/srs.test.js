/**
 * Проверка алгоритма интервальных повторений.
 * Запуск: node --test test/
 *
 * localStorage подменяем заглушкой — модули storage/srs больше
 * ни от чего браузерного не зависят.
 */
import test from 'node:test';
import assert from 'node:assert/strict';

const store = new Map();
globalThis.localStorage = {
  getItem: (k) => (store.has(k) ? store.get(k) : null),
  setItem: (k, v) => store.set(k, String(v)),
  removeItem: (k) => store.delete(k),
};

const {
  review,
  getCard,
  dueCardIds,
  newRecognitionIds,
  newProductionIds,
  cardId,
  parseCardId,
  wordProgress,
  stats,
  GRADE,
  DIRECTION,
  PROD_UNLOCK_AFTER,
  allowedGrades,
  newCardBudget,
  MAX_NEW_PER_SESSION,
} = await import('../src/core/srs.js');
const { resetState, today, toISODate } = await import('../src/core/storage.js');
const { VERDICT } = await import('../src/core/compare.js');

function daysFromToday(dateStr) {
  const a = new Date(today() + 'T00:00:00');
  const b = new Date(dateStr + 'T00:00:00');
  return Math.round((b - a) / 86400000);
}

test('интервалы растут по схеме 1 → 6 → ~15 дней', () => {
  resetState();
  let c = review('word', GRADE.GOOD);
  assert.equal(c.reps, 1);
  assert.equal(c.interval, 1);
  assert.equal(daysFromToday(c.due), 1, 'первый повтор — завтра');

  c = review('word', GRADE.GOOD);
  assert.equal(c.interval, 6);
  assert.equal(daysFromToday(c.due), 6);

  c = review('word', GRADE.GOOD);
  assert.equal(c.interval, 15, 'третий интервал = 6 × ease(2.5)');
  assert.equal(daysFromToday(c.due), 15);
});

test('дата повтора считается по локальному времени, а не по UTC', () => {
  resetState();
  const c = review('tz', GRADE.GOOD);
  // Наивный toISOString() в поясе UTC+5 дал бы «сегодня» вместо «завтра»
  assert.equal(c.due, toISODate(new Date(Date.now() + 86400000)));
});

test('забытое слово сбрасывает цикл и снижает лёгкость', () => {
  resetState();
  review('hard', GRADE.GOOD);
  review('hard', GRADE.GOOD);
  const before = getCard('hard').ease;

  const c = review('hard', GRADE.AGAIN);
  assert.equal(c.reps, 0, 'счётчик повторов обнуляется');
  assert.equal(c.interval, 0);
  assert.equal(c.lapses, 1);
  assert.equal(c.lastLapseAt, today(), 'ошибка помечается датой для отдельного разбора');
  assert.ok(c.ease < before, 'лёгкость падает');
  assert.equal(c.due, today(), 'слово возвращается в эту же сессию');
});

test('успешный повтор убирает актуальную ошибку, но сохраняет историю lapses', () => {
  resetState();
  review('recovery', GRADE.AGAIN);
  const c = review('recovery', GRADE.GOOD);

  assert.equal(c.lapses, 1);
  assert.equal(c.lastLapseAt, null);
});

test('лёгкость не опускается ниже 1.3', () => {
  resetState();
  for (let i = 0; i < 20; i++) review('tough', GRADE.AGAIN);
  assert.ok(getCard('tough').ease >= 1.3);
});

test('оценка «легко» даёт больший интервал, чем «трудно»', () => {
  resetState();
  review('easy', GRADE.EASY);
  review('easy', GRADE.EASY);
  review('easy', GRADE.EASY);

  review('hardish', GRADE.HARD);
  review('hardish', GRADE.HARD);
  review('hardish', GRADE.HARD);

  assert.ok(
    getCard('easy').interval > getCard('hardish').interval,
    `easy=${getCard('easy').interval} должен быть больше hard=${getCard('hardish').interval}`,
  );
});

test('очереди: новое слово не попадает в повторение, изученное — попадает', () => {
  resetState();
  review('seen', GRADE.AGAIN); // due = сегодня
  const ids = ['seen', 'unseen'];

  assert.deepEqual(newRecognitionIds(ids), ['unseen']);
  assert.deepEqual(dueCardIds(ids), ['seen']);

  // Слово с интервалом в будущем сегодня не показывается
  resetState();
  review('future', GRADE.GOOD);
  assert.deepEqual(dueCardIds(['future']), []);
});

/* ---------- Оценки после объективной проверки ---------- */

test('после промаха выбора нет — это был бы самообман', () => {
  assert.deepEqual(
    allowedGrades(VERDICT.WRONG),
    [GRADE.AGAIN],
    'не воспроизвёл — значит оценивать нечего',
  );
});

test('«трудно» после промаха недоступно, хотя соблазнительно', () => {
  // В SM-2 «трудно» считается успехом и отодвигает повторение:
  // оставить её здесь значило бы вернуть ту же лазейку
  assert.ok(!allowedGrades(VERDICT.WRONG).includes(GRADE.HARD));
});

test('при точном ответе выбирается только длина интервала', () => {
  // Факт воспроизведения подтверждён проверкой — остаётся сказать,
  // насколько легко далось
  assert.deepEqual(allowedGrades(VERDICT.EXACT), [GRADE.HARD, GRADE.GOOD, GRADE.EASY]);
  assert.ok(
    !allowedGrades(VERDICT.EXACT).includes(GRADE.AGAIN),
    'ответ верен — обнулять карточку нечем',
  );
});

test('«почти» — это ровно «трудно», без права выбора', () => {
  // Опечатка или смазанное произношение: слово из памяти извлечено,
  // но неточно. «Помню» здесь вернуло бы самооценку туда,
  // откуда её только что убрали.
  assert.deepEqual(allowedGrades(VERDICT.CLOSE), [GRADE.HARD]);
});

test('«почти» продвигает карточку, а не обнуляет её', () => {
  resetState();
  review('w', GRADE.GOOD);
  const [grade] = allowedGrades(VERDICT.CLOSE);
  const after = review('w', grade);

  assert.equal(after.reps, 2, 'повтор засчитан: слово всё же вспомнилось');
  assert.equal(after.lapses, 0, 'но и провалом это не считается');
  assert.ok(after.ease < 2.5, 'лёгкость падает — слово далось тяжело');
});

test('любая доступная после промаха оценка возвращает слово в работу', () => {
  for (const grade of allowedGrades(VERDICT.WRONG)) {
    resetState();
    review('w', GRADE.GOOD);
    review('w', GRADE.GOOD); // интервал вырос до 6 дней
    const before = getCard('w').interval;

    const after = review('w', grade);
    assert.ok(
      after.interval < before,
      `оценка ${grade} после промаха не должна отодвигать повторение`,
    );
  }
});

/* ---------- Сколько нового брать за сессию ---------- */

test('без долгов бюджет отталкивается от дневной цели', () => {
  // Новое слово стоит примерно двух повторений знакомого, поэтому половина
  assert.equal(newCardBudget({ dueCount: 0, dailyGoal: 20 }), 10);
  assert.equal(newCardBudget({ dueCount: 0, dailyGoal: 10 }), 5);
});

test('чем больше просрочено, тем меньше нового', () => {
  const goal = 20;
  const budgets = [0, 5, 10, 15].map((dueCount) => newCardBudget({ dueCount, dailyGoal: goal }));

  for (let i = 1; i < budgets.length; i++) {
    assert.ok(budgets[i] <= budgets[i - 1], `бюджет не должен расти: ${budgets}`);
  }
  assert.ok(budgets[0] > budgets.at(-1), 'разница должна быть заметной');
});

test('когда просроченное съело дневную цель, новое не берётся вовсе', () => {
  // Иначе получается костёр, который сам себя подливает: долг растёт,
  // сессии удлиняются, человек бросает
  assert.equal(newCardBudget({ dueCount: 20, dailyGoal: 20 }), 0);
  assert.equal(newCardBudget({ dueCount: 100, dailyGoal: 20 }), 0);
});

test('бюджет не превышает потолка даже при огромной цели', () => {
  assert.equal(newCardBudget({ dueCount: 0, dailyGoal: 500 }), MAX_NEW_PER_SESSION);
});

test('при крошечной цели всё же предлагается хотя бы одно слово', () => {
  // Иначе цель «1 повторение в день» означала бы «никогда ничего нового»
  assert.equal(newCardBudget({ dueCount: 0, dailyGoal: 1 }), 1);
});

test('бюджет не уходит в минус и переживает отсутствие настроек', () => {
  assert.equal(newCardBudget({ dueCount: 999, dailyGoal: 20 }), 0);
  assert.ok(newCardBudget() > 0, 'значения по умолчанию должны быть рабочими');
});

/* ---------- Две стороны карточки ---------- */

function masterSide(wordId, direction) {
  const id = cardId(wordId, direction);
  for (let i = 0; i < 4; i++) review(id, GRADE.GOOD); // 1, 6, 15, 37 дней
}

test('id карточки узнавания совпадает с id слова — старый прогресс не теряется', () => {
  assert.equal(cardId('hello', DIRECTION.REC), 'hello');
  assert.deepEqual(parseCardId('hello'), { wordId: 'hello', direction: DIRECTION.REC });

  const prodId = cardId('hello', DIRECTION.PROD);
  assert.notEqual(prodId, 'hello');
  assert.deepEqual(parseCardId(prodId), { wordId: 'hello', direction: DIRECTION.PROD });
});

test('стороны живут своими интервалами и не мешают друг другу', () => {
  resetState();
  review(cardId('w', DIRECTION.REC), GRADE.GOOD);
  review(cardId('w', DIRECTION.REC), GRADE.GOOD);

  const p = wordProgress('w');
  assert.equal(p.rec.interval, 6);
  assert.equal(p.prod, null, 'обратная сторона ещё не заведена');

  review(cardId('w', DIRECTION.PROD), GRADE.GOOD);
  assert.equal(wordProgress('w').rec.interval, 6, 'узнавание не сбилось');
  assert.equal(wordProgress('w').prod.interval, 1);
});

test('воспроизведение открывается только после закрепления узнавания', () => {
  resetState();
  const ids = ['w'];
  assert.deepEqual(newProductionIds(ids), [], 'без узнавания обратной стороны нет');

  review(cardId('w', DIRECTION.REC), GRADE.GOOD); // reps = 1
  assert.deepEqual(newProductionIds(ids), [], `нужно ${PROD_UNLOCK_AFTER} успешных узнавания`);

  review(cardId('w', DIRECTION.REC), GRADE.GOOD); // reps = 2
  assert.deepEqual(newProductionIds(ids), ['w'], 'теперь можно тренировать речь');

  review(cardId('w', DIRECTION.PROD), GRADE.GOOD);
  assert.deepEqual(newProductionIds(ids), [], 'дважды не открывается');
});

test('слово выучено только когда обе стороны дожили до 21 дня', () => {
  resetState();
  const ids = ['w'];

  masterSide('w', DIRECTION.REC);
  assert.ok(wordProgress('w').recMastered);
  assert.equal(stats(ids).mastered, 0, 'узнавания мало — говорить всё ещё нельзя');
  assert.equal(stats(ids).learning, 1);

  masterSide('w', DIRECTION.PROD);
  assert.equal(stats(ids).mastered, 1);
  assert.equal(stats(ids).learning, 0);
});

test('к повторению попадают обе стороны', () => {
  resetState();
  review(cardId('w', DIRECTION.REC), GRADE.AGAIN); // due = сегодня
  review(cardId('w', DIRECTION.PROD), GRADE.AGAIN);

  const due = dueCardIds(['w']);
  assert.equal(due.length, 2);
  assert.ok(due.includes(cardId('w', DIRECTION.REC)));
  assert.ok(due.includes(cardId('w', DIRECTION.PROD)));
});

test('newRecognitionIds не возвращает уже заведённые слова', () => {
  resetState();
  assert.deepEqual(newRecognitionIds(['a', 'b']), ['a', 'b']);
  review(cardId('a', DIRECTION.REC), GRADE.GOOD);
  assert.deepEqual(newRecognitionIds(['a', 'b']), ['b']);
});
