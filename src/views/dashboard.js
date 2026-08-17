import { loadState, todayCount } from '../core/storage.js';
import { allVocabIds, getWord } from '../data/vocab.js';
import { dueCardIds, stats } from '../core/srs.js';
import { CURRICULUM, allLessons, nextLesson } from '../data/curriculum.js';
import { insights } from '../core/analytics.js';
import { esc, progressBar, plural } from '../core/ui.js';

export function renderDashboard() {
  const state = loadState();
  const ids = allVocabIds();
  const s = stats(ids);
  const due = dueCardIds(ids).length;
  const lessons = allLessons();
  const done = lessons.filter((l) => state.lessons[l.id]).length;
  const next = nextLesson(state.lessons);
  const goal = state.settings.dailyGoal;
  const doneToday = todayCount();
  const goalPct = Math.min(100, (doneToday / goal) * 100);

  return `
    <h1>Привет 👋</h1>
    <p class="subtitle">Сегодня ${plural(doneToday, 'повторение', 'повторения', 'повторений')} из ${goal}. Двадцать минут каждый день дают больше, чем пять часов раз в неделю.</p>

    <div class="grid grid-4 mb-4">
      <div class="stat">
        <div class="stat-value">${state.streak}🔥</div>
        <div class="stat-label">${plural(state.streak, 'день подряд', 'дня подряд', 'дней подряд').replace(/^\d+\s/, '')}</div>
      </div>
      <div class="stat">
        <div class="stat-value">${state.xp}</div>
        <div class="stat-label">очков опыта</div>
      </div>
      <div class="stat">
        <div class="stat-value">${s.mastered}</div>
        <div class="stat-label">слов выучено</div>
      </div>
      <div class="stat">
        <div class="stat-value" style="color:${due ? 'var(--amber)' : 'var(--text)'}">${due}</div>
        <div class="stat-label">к повторению</div>
      </div>
    </div>

    <div class="card mb-4">
      <div class="row-between mb-4">
        <div>
          <h3 style="margin:0">Цель на сегодня</h3>
          <div class="faint">${doneToday} / ${goal} повторений</div>
        </div>
        ${doneToday >= goal ? '<span class="word-status mastered">выполнено ✓</span>' : ''}
      </div>
      ${progressBar(goalPct, doneToday >= goal)}
    </div>

    ${due > 0
      ? `<div class="card mb-4" style="border-color:var(--amber)">
          <div class="row-between">
            <div>
              <h3 style="margin:0 0 2px">Пора повторить ${plural(due, 'слово', 'слова', 'слов')}</h3>
              <div class="faint">Повторение сегодня стоит десяти повторений через неделю.</div>
            </div>
            <button class="btn btn-primary" data-nav="review">Повторять</button>
          </div>
        </div>`
      : ''}

    ${(() => {
      // Главное наблюдение показываем и здесь: узкое место, о котором
      // человек не знает, не поможет ему, даже если лежит в отдельном разделе
      const [top] = insights(state);
      if (!top || top.level === 'ok') return '';
      return `<div class="card mb-4" style="border-color:var(--amber)">
          <div class="row-between">
            <div>
              <h3 style="margin:0 0 2px">${esc(top.title)}</h3>
              <div class="faint">${esc(top.text)}</div>
            </div>
            <button class="btn" data-nav="progress">Разбор</button>
          </div>
        </div>`;
    })()}

    ${next
      ? `<div class="card mb-4">
          <div class="faint" style="margin-bottom:4px">${esc(next.levelCode)} · ${esc(next.unitTitle)}</div>
          <div class="row-between">
            <div>
              <h3 style="margin:0 0 2px">Следующий урок: ${esc(next.title)}</h3>
              <div class="faint">≈ ${next.duration} мин</div>
            </div>
            <button class="btn btn-primary" data-nav="lesson:${esc(next.id)}">Начать</button>
          </div>
        </div>`
      : `<div class="card mb-4">
          <h3 style="margin:0 0 2px">Все готовые уроки пройдены 🎉</h3>
          <div class="faint">Дальше — повторения и добавление новых юнитов.</div>
        </div>`}

    <h2>Прогресс по курсу</h2>
    <div class="card">
      <div class="row-between mb-4">
        <span class="dim">Уроков пройдено</span>
        <strong>${done} / ${lessons.length}</strong>
      </div>
      ${progressBar((done / Math.max(1, lessons.length)) * 100)}
      <div class="grid grid-3 mt-6">
        ${CURRICULUM.map((lvl) => {
          const total = lvl.units.reduce((n, u) => n + u.lessons.length, 0);
          const d = lvl.units.reduce(
            (n, u) => n + u.lessons.filter((l) => state.lessons[l.id]).length,
            0,
          );
          const complete = total > 0 && d === total;
          return `<div>
            <span class="level-code${complete ? ' done' : ''}">${esc(lvl.code)}</span>
            <div class="faint mt-2">${total ? `${d} / ${total} уроков` : 'в разработке'}</div>
          </div>`;
        }).join('')}
      </div>
    </div>

    <h2>Словарь</h2>
    <div class="grid grid-3">
      <div class="stat"><div class="stat-value">${s.untouched}</div><div class="stat-label">не начато</div></div>
      <div class="stat"><div class="stat-value" style="color:var(--amber)">${s.learning}</div><div class="stat-label">в изучении</div></div>
      <div class="stat"><div class="stat-value" style="color:var(--green)">${s.mastered}</div><div class="stat-label">выучено</div></div>
    </div>
  `;
}
