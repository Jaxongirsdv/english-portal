/**
 * Опрос на понимание: несколько вопросов, у каждого один верный ответ.
 *
 * Вынесено в отдельный модуль не ради красоты. Такой опрос нужен и чтению,
 * и аудированию, а в нём есть неочевидная ловушка: в данных верный вариант
 * записан первым, и если показать варианты как есть, текст «понимается»
 * на сто процентов нажатием верхней кнопки. Один раз я на это уже наступил.
 * Скопированный во второй экран, тот же промах повторился бы там молча.
 *
 * Поэтому перемешивание живёт здесь, один раз и под тестом.
 */

import { shuffle } from './ui.js';

/**
 * Готовит опрос. Порядок вопросов и порядок вариантов внутри каждого
 * фиксируются сразу: считать их при отрисовке нельзя — она происходит
 * на каждый клик, и варианты тасовались бы прямо под пальцем.
 */
export function createQuiz(questions) {
  return {
    order: shuffle(questions.map((_, i) => i)),
    options: questions.map((q) => shuffle(q.options)),
    idx: 0,
    answers: [],
    picked: null,
  };
}

/** Индекс текущего вопроса в исходном списке. */
export function currentIndex(quiz) {
  return quiz.order[quiz.idx];
}

export function currentQuestion(quiz, questions) {
  return questions[currentIndex(quiz)];
}

/** Варианты текущего вопроса — в том порядке, в каком их видит человек. */
export function currentOptions(quiz) {
  return quiz.options[currentIndex(quiz)];
}

/** Ответ засчитывается по содержанию, а не по месту в списке. */
export function answerQuestion(quiz, questions, value) {
  if (!quiz || quiz.picked !== null) return false;
  const q = currentQuestion(quiz, questions);
  if (!q || !currentOptions(quiz).includes(value)) return false;

  quiz.picked = value;
  quiz.answers.push(value === q.answer);
  return true;
}

export function isCorrect(quiz, questions) {
  return quiz.picked !== null && quiz.picked === currentQuestion(quiz, questions).answer;
}

/**
 * Переход к следующему вопросу.
 * Возвращает { moved, finished }: без ответа не двигаемся вовсе,
 * на последнем вопросе сообщаем, что опрос закончен.
 */
export function nextQuestion(quiz) {
  if (!quiz || quiz.picked === null) return { moved: false, finished: false };
  quiz.picked = null;

  if (quiz.idx + 1 < quiz.order.length) {
    quiz.idx += 1;
    return { moved: true, finished: false };
  }
  return { moved: true, finished: true };
}

export function quizScore(quiz) {
  const total = quiz.answers.length;
  const right = quiz.answers.filter(Boolean).length;
  return { right, total, percent: total ? Math.round((right / total) * 100) : 0 };
}

/** Сколько вопросов позади — для полосы прогресса. */
export function quizProgress(quiz) {
  return quiz.order.length ? (quiz.idx / quiz.order.length) * 100 : 0;
}
