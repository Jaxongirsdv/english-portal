/**
 * Проверка упражнений урока — прежде всего того, что считается ошибкой.
 *
 * Оценка урока не остаётся внутри урока: по ней разбор прогресса решает,
 * к каким темам стоит вернуться. Если опечатка занижает оценку, разбор
 * начинает уверенно советовать перечитать материал, который на самом
 * деле усвоен, — а это хуже, чем молчание.
 */
import test from 'node:test';
import assert from 'node:assert/strict';

const store = new Map();
globalThis.localStorage = {
  getItem: (k) => (store.has(k) ? store.get(k) : null),
  setItem: (k, v) => store.set(k, String(v)),
  removeItem: (k) => store.delete(k),
};

const { resetState, loadState } = await import('../src/core/storage.js');
const { allLessons } = await import('../src/data/curriculum.js');
const Lesson = await import('../src/views/lesson.js');

/** Урок, в котором есть свободный ввод достаточной длины для опечатки. */
const LESSON = allLessons().find((l) =>
  l.exercises.some((e) => e.type === 'translate' && e.answer.length >= 8),
);
assert.ok(LESSON, 'нужен урок с длинным переводом, иначе опечатку не отличить от другого слова');

const TRANSLATE_IDX = LESSON.exercises.findIndex(
  (e) => e.type === 'translate' && e.answer.length >= 8,
);

/**
 * Отвечает на упражнение верно.
 * Слова для «собери предложение» берём из разметки: банк перемешан,
 * и его порядок известен только самому уроку.
 */
function answerCorrectly(ex) {
  if (ex.type === 'choice') return Lesson.handleAnswerClick(ex.answer);
  if (ex.type === 'listen') return Lesson.handleAnswerClick(ex.word);

  if (ex.type === 'order') {
    const html = Lesson.renderLesson();
    const bank = [...html.matchAll(/data-choose="(\d+)"[^>]*>([^<]+)</g)].map((m) => ({
      index: Number(m[1]),
      word: m[2].trim(),
    }));
    const used = new Set();
    for (const word of ex.answer.split(' ')) {
      const chip = bank.find((b) => b.word === word && !used.has(b.index));
      assert.ok(chip, `слова «${word}» нет в банке`);
      used.add(chip.index);
      Lesson.handleChoose(String(chip.index));
    }
  } else if (ex.type === 'translate') {
    Lesson.syncTyped(ex.answer);
  }
  return Lesson.handleLessonAction('check');
}

/** Доводит урок до упражнения с переводом и оставляет его неотвеченным. */
function upToTranslate() {
  resetState();
  Lesson.startLesson(LESSON.id);
  Lesson.handleLessonAction('to-exercises');
  for (let i = 0; i < TRANSLATE_IDX; i++) {
    answerCorrectly(LESSON.exercises[i]);
    Lesson.handleLessonAction('next');
  }
  return LESSON.exercises[TRANSLATE_IDX];
}

const xp = () => loadState().xp;

test.afterEach(() => Lesson.exitLesson());

test('теория проходится короткими шагами', () => {
  resetState();
  Lesson.startLesson(LESSON.id);
  const first = Lesson.renderLesson();
  assert.ok(first.includes('ТЕОРИЯ · ШАГ 1'), 'виден номер текущего шага');

  if (LESSON.theory.length > 1) {
    Lesson.handleLessonAction('next-theory');
    assert.ok(Lesson.renderLesson().includes('ТЕОРИЯ · ШАГ 2'), 'открывается следующий блок, а не вся теория сразу');
  }
});

test('точный перевод засчитывается', () => {
  const ex = upToTranslate();
  const before = xp();

  Lesson.syncTyped(ex.answer);
  Lesson.handleLessonAction('check');

  const html = Lesson.renderLesson();
  assert.ok(html.includes('Верно'), 'ответ признан верным');
  assert.equal(xp() - before, 10, 'полные очки');
});

test('регистр и знаки препинания ошибкой не считаются', () => {
  const ex = upToTranslate();
  const before = xp();

  Lesson.syncTyped(`  ${ex.answer.toUpperCase()}!  `);
  Lesson.handleLessonAction('check');

  assert.ok(Lesson.renderLesson().includes('Верно'));
  assert.equal(xp() - before, 10, 'это тот же самый ответ, а не опечатка');
});

test('опечатка названа опечаткой, а не ошибкой', () => {
  const ex = upToTranslate();
  const before = xp();

  Lesson.syncTyped(ex.answer.slice(0, -1)); // потеряна последняя буква
  Lesson.handleLessonAction('check');

  const html = Lesson.renderLesson();
  assert.ok(html.includes('Почти — опечатка'), 'разбор должен отличать промах пальцем от незнания');
  assert.ok(html.includes(ex.answer), 'и показывать правильное написание');
  assert.ok(!html.includes('Не совсем'), 'но не называть это ошибкой');
  assert.equal(xp() - before, 7, 'очков меньше, чем за точный ответ, но больше, чем за ошибку');
});

test('другое слово опечаткой не считается', () => {
  upToTranslate();
  const before = xp();

  Lesson.syncTyped('zzzz qqqq');
  Lesson.handleLessonAction('check');

  const html = Lesson.renderLesson();
  assert.ok(html.includes('Не совсем'), 'это ошибка, а не опечатка');
  assert.ok(!html.includes('Почти'), '«почти» здесь было бы поблажкой');
  assert.equal(xp() - before, 3);
});

test('пустой ответ ошибкой и остаётся', () => {
  upToTranslate();
  Lesson.syncTyped('');
  Lesson.handleLessonAction('check');

  assert.ok(Lesson.renderLesson().includes('Не совсем'));
});

test('опечатки не занижают оценку урока', () => {
  resetState();
  Lesson.startLesson(LESSON.id);
  Lesson.handleLessonAction('to-exercises');

  for (const ex of LESSON.exercises) {
    if (ex.type === 'translate') {
      Lesson.syncTyped(ex.answer.slice(0, -1)); // всюду промахиваемся на букву
      Lesson.handleLessonAction('check');
    } else {
      answerCorrectly(ex);
    }
    Lesson.handleLessonAction('next');
  }

  const saved = loadState().lessons[LESSON.id];
  assert.ok(saved, 'урок засчитан пройденным');
  assert.equal(saved.score, 100, 'материал усвоен — оценка не должна страдать из-за опечаток');
});

test('в «собери предложение» опечаток не бывает: неверный порядок — ошибка', () => {
  const orderIdx = LESSON.exercises.findIndex((e) => e.type === 'order');
  if (orderIdx < 0) return; // в этом уроке такого упражнения нет

  resetState();
  Lesson.startLesson(LESSON.id);
  Lesson.handleLessonAction('to-exercises');
  for (let i = 0; i < orderIdx; i++) {
    answerCorrectly(LESSON.exercises[i]);
    Lesson.handleLessonAction('next');
  }

  // Слова те же, но собраны задом наперёд — «почти» тут было бы бессмыслицей:
  // из банка нельзя опечататься, можно только выбрать не тот порядок
  const html = Lesson.renderLesson();
  const bank = [...html.matchAll(/data-choose="(\d+)"/g)].map((m) => Number(m[1]));
  for (const i of [...bank].reverse()) Lesson.handleChoose(String(i));
  Lesson.handleLessonAction('check');

  const after = Lesson.renderLesson();
  assert.ok(!after.includes('Почти'), 'порядок слов — это выбор, а не опечатка');
});

test('после слабой попытки можно повторить только ошибки', () => {
  resetState();
  Lesson.startLesson(LESSON.id);
  Lesson.handleLessonAction('to-exercises');

  for (const ex of LESSON.exercises) {
    if (ex.type === 'choice' || ex.type === 'listen') Lesson.handleAnswerClick('__wrong__');
    else Lesson.handleLessonAction('check');
    Lesson.handleLessonAction('next');
  }

  const result = Lesson.renderLesson();
  assert.ok(result.includes('Повторить ошибки'));
  assert.ok(result.includes('Следующий урок пока закрыт'));
  assert.ok(!result.includes('Продолжить курс'), 'нельзя обойти порог освоения');
  assert.equal(Lesson.handleLessonAction('retry-mistakes'), true);
  assert.ok(Lesson.renderLesson().includes(`1 ИЗ ${LESSON.exercises.length}`));
});

test('повторное прохождение не начисляет второй бонус за урок', () => {
  const complete = () => {
    Lesson.startLesson(LESSON.id);
    Lesson.handleLessonAction('to-exercises');
    for (const ex of LESSON.exercises) {
      answerCorrectly(ex);
      Lesson.handleLessonAction('next');
    }
    Lesson.exitLesson();
  };

  resetState();
  complete();
  const afterFirst = xp();
  complete();
  assert.equal(xp() - afterFirst, LESSON.exercises.length * 10, 'за ответы XP остаётся, бонус +25 выдаётся один раз');
});
