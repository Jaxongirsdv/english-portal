import { loadState, todayCount } from '../core/storage.js';
import { allVocabIds } from '../data/vocab.js';
import { dueCardIds, stats } from '../core/srs.js';
import { CURRICULUM, allLessons } from '../data/curriculum.js';
import { nextCurriculumStep } from '../core/curriculum-progress.js';
import { insights } from '../core/analytics.js';
import { b2Sprint } from '../core/b2-sprint.js';
import { esc, progressBar, plural } from '../core/ui.js';

export function renderDashboard() {
  const state = loadState();
  const ids = allVocabIds();
  const s = stats(ids);
  const due = dueCardIds(ids).length;
  const mistakes = Object.values(state.cards || {}).filter((card) => card.lastLapseAt).length;
  const lessons = allLessons();
  const done = lessons.filter((l) => state.lessons[l.id]).length;
  const next = nextCurriculumStep(state);
  const goal = state.settings.dailyGoal;
  const doneToday = todayCount();
  const goalPct = Math.min(100, (doneToday / goal) * 100);
  const sprint = b2Sprint();
  const [topInsight] = insights(state);

  if (state.onboardingDone !== true) {
    return `
      <section class="onboarding card">
        <div class="onboarding__eyebrow">ENGLISH PORTAL · ТВОЙ ЛИЧНЫЙ ТРЕНЕР</div>
        <h1>Английский без перегруза</h1>
        <p class="subtitle">Короткие уроки, умные повторения и практика каждый день. Начнём с первого шага и постепенно дойдём до уверенного общения.</p>
        <div class="onboarding__steps">
          <div><strong>01</strong><span>Изучай уроки по уровням</span></div>
          <div><strong>02</strong><span>Закрепляй слова повторениями</span></div>
          <div><strong>03</strong><span>Тренируй слух, речь и письмо</span></div>
        </div>
        <button class="btn btn-primary btn-lg" data-onboarding-start>Начать обучение <span aria-hidden="true">→</span></button>
      </section>`;
  }

  return `
    <header class="dashboard-welcome">
      <div>
        <div class="dashboard-kicker">ТВОЙ УЧЕБНЫЙ ДЕНЬ</div>
        <h1>Продолжаем движение</h1>
        <p class="subtitle">Один главный шаг, немного повторения и стабильный ритм.</p>
      </div>
      <div class="dashboard-streak"><strong>${state.streak}</strong><span>${plural(state.streak, 'день', 'дня', 'дней').replace(/^\d+\s/, '')} подряд</span></div>
    </header>

    <section class="learning-tracks mb-4" aria-label="Выбор маршрута">
      <article class="learning-track learning-track--base">
        <div class="learning-track__icon">A→B2</div>
        <div><span>ТЕКУЩИЙ МАРШРУТ</span><h2>Укрепить базу</h2><p>Уроки по уровням, грамматика, словарь и интервальные повторения.</p></div>
        <button class="btn btn-primary" data-nav="roadmap">Продолжить курс</button>
      </article>
      <article class="learning-track learning-track--exam">
        <div class="learning-track__icon">B2</div>
        <div><span>ОТДЕЛЬНЫЙ МАРШРУТ</span><h2>Подготовка к экзамену</h2><p>${sprint.examPassed ? 'Диагностика, четыре навыка и история результатов.' : `${sprint.daysLeft} дней: план, диагностика и практика по времени.`}</p></div>
        <button class="btn" data-nav="exam">Открыть экзамен B2</button>
      </article>
    </section>

    ${next
      ? `<section class="dashboard-next dashboard-next--hero mb-4">
          <div class="dashboard-next__content">
            <div class="dashboard-kicker">СЛЕДУЮЩИЙ ШАГ · ${esc(next.level.code)}</div>
            <h2>${next.type === 'milestone' ? `Milestone уровня ${esc(next.level.code)}` : esc(next.lesson.title)}</h2>
            <p>${next.type === 'milestone' ? 'Итоговая проверка откроет следующий уровень.' : `${esc(next.lesson.unitTitle)} · ${next.lesson.duration} минут`}</p>
          </div>
          <button class="btn btn-primary btn-lg dashboard-next__action" data-nav="${esc(next.route)}">${next.type === 'milestone' ? 'Пройти milestone' : 'Начать урок'} <span aria-hidden="true">→</span></button>
        </section>`
      : `<section class="card dashboard-next mb-4"><div><div class="dashboard-kicker">ПРОГРАММА ЗАВЕРШЕНА</div><h2>Все доступные уровни пройдены</h2></div><button class="btn" data-nav="review">Перейти к повторению</button></section>`}

    <div class="dashboard-section-head"><div><div class="dashboard-kicker">СЕГОДНЯ</div><h2>Закрепить результат</h2></div><span>${doneToday} из ${goal} повторений</span></div>
    <div class="dashboard-today-grid mb-4">
      <section class="card dashboard-review-card${due ? ' dashboard-review-card--due' : ''}">
        <div class="dashboard-card-icon">${due || '✓'}</div>
        <div><h3>${due ? `К повторению ${plural(due, 'слово', 'слова', 'слов')}` : 'Повторения выполнены'}</h3><p class="faint">${mistakes ? `${mistakes} сложных карточек требуют особого внимания.` : 'Очередь чистая — можно двигаться дальше.'}</p></div>
        <div class="dashboard-card-actions">
          <button class="btn${due ? ' btn-primary' : ''}" data-nav="${due ? 'review' : 'review-quick'}">${due ? 'Повторять' : '5 минут практики'}</button>
          ${mistakes ? '<button class="btn btn-ghost" data-nav="review-mistakes">Только ошибки</button>' : ''}
        </div>
      </section>
      <section class="card dashboard-goal">
        <div class="row-between"><div><div class="dashboard-kicker">ДНЕВНАЯ ЦЕЛЬ</div><h3>${doneToday >= goal ? 'Цель выполнена' : `Осталось ${Math.max(0, goal - doneToday)}`}</h3></div><strong>${Math.round(goalPct)}%</strong></div>
        ${progressBar(goalPct, doneToday >= goal)}
        <p class="faint">${doneToday >= goal ? 'Отличный ритм. Завтра продолжим.' : 'Короткие сессии тоже считаются.'}</p>
      </section>
    </div>

    <div class="dashboard-section-head"><div><div class="dashboard-kicker">ОБЩАЯ КАРТИНА</div><h2>Твой прогресс</h2></div><button class="btn btn-ghost" data-nav="progress">Подробнее</button></div>
    <div class="grid grid-4 dashboard-stats mb-4">
      <div class="stat"><div class="stat-value">${state.xp}</div><div class="stat-label">XP</div></div>
      <div class="stat"><div class="stat-value">${done}<small>/${lessons.length}</small></div><div class="stat-label">уроков</div></div>
      <div class="stat"><div class="stat-value">${s.mastered}</div><div class="stat-label">слов выучено</div></div>
      <div class="stat"><div class="stat-value">${s.learning}</div><div class="stat-label">слов в работе</div></div>
    </div>

    <section class="card dashboard-course">
      <div class="row-between mb-4"><span class="dim">Программа курса</span><strong>${Math.round((done / Math.max(1, lessons.length)) * 100)}%</strong></div>
      ${progressBar((done / Math.max(1, lessons.length)) * 100)}
      <div class="dashboard-levels mt-6">${CURRICULUM.map((lvl) => {
        const total = lvl.units.reduce((count, unit) => count + unit.lessons.length, 0);
        const completed = lvl.units.reduce((count, unit) => count + unit.lessons.filter((lesson) => state.lessons[lesson.id]).length, 0);
        const passed = !!state.milestones?.[lvl.id]?.passed;
        return `<div class="dashboard-level${passed ? ' dashboard-level--done' : completed ? ' dashboard-level--active' : ''}"><span>${esc(lvl.code)}</span><small>${completed}/${total}</small></div>`;
      }).join('')}</div>
      ${topInsight && topInsight.level !== 'ok' ? `<div class="dashboard-insight mt-6"><div><strong>${esc(topInsight.title)}</strong><p>${esc(topInsight.text)}</p></div><button class="btn btn-ghost" data-nav="progress">Разобрать</button></div>` : ''}
    </section>`;
}
