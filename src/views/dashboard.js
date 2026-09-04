import { loadState, todayCount } from '../core/storage.js';
import { allVocabIds } from '../data/vocab.js';
import { dueCardIds, stats } from '../core/srs.js';
import { CURRICULUM, allLessons } from '../data/curriculum.js';
import { nextCurriculumStep } from '../core/curriculum-progress.js';
import { insights } from '../core/analytics.js';
import { dailyPlan } from '../core/daily-plan.js';
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
  const [topInsight] = insights(state);
  const plan = dailyPlan(state);

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

    <section class="daily-plan mb-4" aria-label="План на сегодня">
      <div class="dashboard-section-head"><div><div class="dashboard-kicker">ПЛАН НА СЕГОДНЯ</div><h2>Три понятных шага</h2></div><span>сначала важное</span></div>
      <div class="daily-plan__list">${plan.map((item, index) => `<article class="daily-plan__item daily-plan__item--${esc(item.kind)}"><span class="daily-plan__number">0${index + 1}</span><div><div class="dashboard-kicker">${esc(item.label)}</div><h3>${esc(item.title)}</h3><p>${esc(item.text)}</p></div><button class="btn${index === 0 ? ' btn-primary' : ''}" data-nav="${esc(item.route)}">${esc(item.action)}</button></article>`).join('')}</div>
    </section>

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
