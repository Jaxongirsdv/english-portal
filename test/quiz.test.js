/**
 * Проверка опроса на понимание.
 *
 * Опрос кажется тривиальным, и именно поэтому в нём легко спрятать обман.
 * В данных верный вариант записан первым; показанный как есть, он даёт
 * сто процентов понимания за три нажатия верхней кнопки. Так и вышло
 * при первой проверке чтения вживую — а тест, написанный на эту ошибку,
 * поначалу проходил и на сломанном коде.
 *
 * Поэтому здесь проверяется не «работают ли кнопки», а невозможность
 * набрать очки, не читая: позиция ответа гуляет, чужой вариант не
 * засчитывается, повторный ответ на тот же вопрос не проходит.
 */
import test from 'node:test';
import assert from 'node:assert/strict';

const {
  createQuiz,
  currentQuestion,
  currentOptions,
  answerQuestion,
  isCorrect,
  nextQuestion,
  quizScore,
  quizProgress,
} = await import('../src/core/quiz.js');

/** Верный ответ у всех вопросов записан первым — как в реальных данных. */
const QUESTIONS = [
  { q: 'Первый?', options: ['да-1', 'нет-1', 'мимо-1'], answer: 'да-1' },
  { q: 'Второй?', options: ['да-2', 'нет-2', 'мимо-2'], answer: 'да-2' },
  { q: 'Третий?', options: ['да-3', 'нет-3', 'мимо-3'], answer: 'да-3' },
];

/* ---------- Позицию ответа угадать нельзя ---------- */

test('верный ответ не стоит всегда на одном месте', () => {
  const positions = new Set();
  for (let i = 0; i < 60; i++) {
    const quiz = createQuiz(QUESTIONS);
    const q = currentQuestion(quiz, QUESTIONS);
    positions.add(currentOptions(quiz).indexOf(q.answer));
  }
  assert.ok(!positions.has(-1), 'верного ответа не оказалось среди вариантов');
  assert.ok(positions.size > 1, `ответ всегда на позиции ${[...positions]}`);
});

test('порядок вопросов тоже меняется', () => {
  const firsts = new Set();
  for (let i = 0; i < 60; i++) firsts.add(currentQuestion(createQuiz(QUESTIONS), QUESTIONS).q);
  assert.ok(firsts.size > 1, 'со второго раза запоминалась бы позиция, а не содержание');
});

test('перемешивание не теряет и не дублирует варианты', () => {
  for (let i = 0; i < 20; i++) {
    const quiz = createQuiz(QUESTIONS);
    for (let k = 0; k < QUESTIONS.length; k++) {
      const shown = quiz.options[k];
      assert.deepEqual([...shown].sort(), [...QUESTIONS[k].options].sort());
    }
  }
});

/* ---------- Ответы ---------- */

test('ответ засчитывается по содержанию, а не по месту', () => {
  const quiz = createQuiz(QUESTIONS);
  const q = currentQuestion(quiz, QUESTIONS);

  assert.ok(answerQuestion(quiz, QUESTIONS, q.answer));
  assert.ok(isCorrect(quiz, QUESTIONS));
  assert.deepEqual(quiz.answers, [true]);
});

test('неверный ответ так и остаётся неверным', () => {
  const quiz = createQuiz(QUESTIONS);
  const q = currentQuestion(quiz, QUESTIONS);
  const wrong = currentOptions(quiz).find((o) => o !== q.answer);

  assert.ok(answerQuestion(quiz, QUESTIONS, wrong));
  assert.ok(!isCorrect(quiz, QUESTIONS));
});

test('на один вопрос отвечают один раз', () => {
  const quiz = createQuiz(QUESTIONS);
  const q = currentQuestion(quiz, QUESTIONS);
  const wrong = currentOptions(quiz).find((o) => o !== q.answer);

  assert.ok(answerQuestion(quiz, QUESTIONS, wrong));
  // Иначе достаточно перебрать варианты до верного
  assert.equal(answerQuestion(quiz, QUESTIONS, q.answer), false, 'вторая попытка не принимается');
  assert.deepEqual(quiz.answers, [false]);
});

test('чужой вариант не принимается', () => {
  const quiz = createQuiz(QUESTIONS);
  assert.equal(answerQuestion(quiz, QUESTIONS, 'ответ из другого вопроса'), false);
  assert.deepEqual(quiz.answers, []);
});

/* ---------- Движение по опросу ---------- */

test('без ответа опрос не двигается', () => {
  const quiz = createQuiz(QUESTIONS);
  assert.deepEqual(nextQuestion(quiz), { moved: false, finished: false });
  assert.equal(quiz.idx, 0);
});

test('последний вопрос завершает опрос', () => {
  const quiz = createQuiz(QUESTIONS);
  const results = [];
  for (let i = 0; i < QUESTIONS.length; i++) {
    answerQuestion(quiz, QUESTIONS, currentQuestion(quiz, QUESTIONS).answer);
    results.push(nextQuestion(quiz));
  }
  assert.deepEqual(results.at(-1), { moved: true, finished: true });
  assert.ok(results.slice(0, -1).every((r) => !r.finished));
});

test('каждый вопрос спрашивается ровно один раз', () => {
  const quiz = createQuiz(QUESTIONS);
  const asked = [];
  for (let i = 0; i < QUESTIONS.length; i++) {
    asked.push(currentQuestion(quiz, QUESTIONS).q);
    answerQuestion(quiz, QUESTIONS, currentQuestion(quiz, QUESTIONS).answer);
    nextQuestion(quiz);
  }
  assert.equal(new Set(asked).size, QUESTIONS.length);
});

/* ---------- Итог ---------- */

test('счёт считает верные ответы, а не попытки', () => {
  const quiz = createQuiz(QUESTIONS);
  const q1 = currentQuestion(quiz, QUESTIONS);
  answerQuestion(quiz, QUESTIONS, currentOptions(quiz).find((o) => o !== q1.answer));
  nextQuestion(quiz);
  answerQuestion(quiz, QUESTIONS, currentQuestion(quiz, QUESTIONS).answer);
  nextQuestion(quiz);
  answerQuestion(quiz, QUESTIONS, currentQuestion(quiz, QUESTIONS).answer);

  assert.deepEqual(quizScore(quiz), { right: 2, total: 3, percent: 67 });
});

test('пустой опрос не делит на ноль', () => {
  const quiz = createQuiz([]);
  assert.deepEqual(quizScore(quiz), { right: 0, total: 0, percent: 0 });
  assert.equal(quizProgress(quiz), 0);
});

test('прогресс растёт от нуля', () => {
  const quiz = createQuiz(QUESTIONS);
  assert.equal(quizProgress(quiz), 0);
  answerQuestion(quiz, QUESTIONS, currentQuestion(quiz, QUESTIONS).answer);
  nextQuestion(quiz);
  assert.ok(quizProgress(quiz) > 0);
});
