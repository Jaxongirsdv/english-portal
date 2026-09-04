/**
 * Короткий план на день для программы «База».
 *
 * Не выдаём список всего, что можно сделать: он парализует выбор.
 * В плане всегда максимум три шага, причём сначала память и пробелы,
 * а уже затем новый материал.
 */
import { dueCardIds } from './srs.js';
import { allVocabIds } from '../data/vocab.js';
import { nextCurriculumStep } from './curriculum-progress.js';
import { reviewDebt, weakLessons } from './analytics.js';

export function dailyPlan(state) {
  const plan = [];
  const due = dueCardIds(allVocabIds()).length;
  const debt = reviewDebt(state);
  const weak = weakLessons(state)[0];
  const next = nextCurriculumStep(state);

  if (due) {
    plan.push({
      kind: 'review',
      label: 'Закрепить память',
      title: `Повторить ${due} ${due === 1 ? 'слово' : due < 5 ? 'слова' : 'слов'}`,
      text: 'Сначала закрой очередь: интервальные повторения не дают пройденному забыться.',
      route: 'review',
      action: 'Повторять',
    });
  } else if (debt.waiting) {
    plan.push({
      kind: 'review',
      label: 'Закрепить память',
      title: `Начать ${Math.min(5, debt.waiting)} ${debt.waiting === 1 ? 'новое слово' : 'новых слов'}`,
      text: `${debt.waiting} слов из пройденных уроков ещё не попали в повторение.`,
      route: 'review-quick',
      action: 'Начать',
    });
  }

  if (weak) {
    plan.push({
      kind: 'repair',
      label: 'Исправить слабое место',
      title: `Вернуться к уроку «${weak.title}»`,
      text: `Последний результат — ${weak.score}%. Укрепи основу, прежде чем идти дальше.`,
      route: `lesson:${weak.id}`,
      action: 'Повторить урок',
    });
  }

  if (next) {
    plan.push({
      kind: 'advance',
      label: 'Продвинуться дальше',
      title: next.type === 'milestone' ? `Пройти milestone ${next.level.code}` : next.lesson.title,
      text: next.type === 'milestone'
        ? 'Итоговая проверка откроет следующий уровень.'
        : `${next.lesson.unitTitle} · ${next.lesson.duration} минут.`,
      route: next.route,
      action: next.type === 'milestone' ? 'Пройти проверку' : 'Начать урок',
    });
  }

  if (!plan.length) {
    plan.push({
      kind: 'practice',
      label: 'Поддержать форму',
      title: 'Короткая практика на 5 минут',
      text: 'Очередь чистая, а курс завершён. Поддержи ритм небольшой сессией.',
      route: 'review-quick',
      action: 'Практиковаться',
    });
  }

  return plan.slice(0, 3);
}
