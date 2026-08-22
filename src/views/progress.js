import { loadState } from '../core/storage.js';
import {
  reviewDebt,
  sideBalance,
  grammarProgress,
  weakLessons,
  levelProgress,
  activity,
  vocabSummary,
  insights,
} from '../core/analytics.js';
import { esc, progressBar, plural } from '../core/ui.js';

/**
 * Экран разбора прогресса.
 *
 * Главное здесь не цифры, а вывод: счётчики вроде «11 уроков, 912 очков»
 * ничего не говорят о том, идёт ли учёба. Поэтому наблюдения стоят
 * первыми, а таблицы — под ними, для тех, кто хочет проверить.
 */

const LEVEL_CLASS = { warn: 'warn', info: 'tip', ok: 'tip' };
const LEVEL_LABEL = { warn: 'Узкое место', info: 'Стоит учесть', ok: 'В порядке' };

function renderInsights(state) {
  const found = insights(state);
  if (!found.length) {
    return `
      <div class="callout tip">
        <span class="callout-label">Пока рано</span>
        Пройди первый урок и загляни в повторения — после этого здесь
        появится разбор.
      </div>`;
  }

  return found
    .map(
      (i) => `
      <div class="callout ${LEVEL_CLASS[i.level]}">
        <span class="callout-label">${esc(LEVEL_LABEL[i.level])}</span>
        <strong>${esc(i.title)}</strong><br />${esc(i.text)}
      </div>`,
    )
    .join('');
}

function renderDebt(state) {
  const d = reviewDebt(state);
  if (!d.unlocked) return '';

  const percent = (d.started / d.unlocked) * 100;
  const preview = d.words.slice(0, 12);

  return `
    <h2>Слова в работе</h2>
    <div class="card">
      <div class="row-between mb-4">
        <span class="dim">Заведено в память</span>
        <strong>${d.started} из ${d.unlocked}</strong>
      </div>
      ${progressBar(percent, d.waiting === 0)}

      ${
        d.waiting
          ? `<div class="faint mt-4">
              Ждут очереди: ${plural(d.waiting, 'слово', 'слова', 'слов')}.
              Портал даёт по 8 новых за сессию — это примерно
              ${plural(Math.ceil(d.waiting / 8), 'заход', 'захода', 'заходов')}.
            </div>
            <div class="row mt-4" style="flex-wrap:wrap;gap:6px">
              ${preview.map((w) => `<span class="chip">${esc(w)}</span>`).join('')}
              ${d.waiting > preview.length ? `<span class="chip faint">и ещё ${d.waiting - preview.length}</span>` : ''}
            </div>
            <button class="btn btn-primary mt-4" data-nav="review">Разобрать</button>`
          : '<div class="faint mt-4">Всё открытое заведено в память — можно брать следующий урок.</div>'
      }
    </div>`;
}

function renderSides(state) {
  const s = sideBalance(state);
  if (!s.recognition && !s.production) return '';

  return `
    <h2>Узнавание и речь</h2>
    <div class="grid grid-3">
      <div class="stat">
        <div class="stat-value">${s.recognition}</div>
        <div class="stat-label">👁 узнавание</div>
      </div>
      <div class="stat">
        <div class="stat-value" style="color:${s.production ? 'var(--green)' : 'var(--amber)'}">${s.production}</div>
        <div class="stat-label">✍️ воспроизведение</div>
      </div>
      <div class="stat">
        <div class="stat-value">${s.readyForProduction}</div>
        <div class="stat-label">готовы к обратной стороне</div>
      </div>
    </div>
    <p class="faint mt-2">
      Узнавания хватает, чтобы читать. Говорить получается только тогда,
      когда натренирована обратная сторона.
    </p>`;
}

/**
 * Грамматика показана отдельной строкой, а не подмешана к словарю:
 * знать четыреста слов и не собрать предложения — обычное дело,
 * и общая цифра прятала бы ровно этот перекос.
 */
function renderGrammar(state) {
  const g = grammarProgress(state);
  if (!g.total) return '';

  return `
    <h2>Грамматика</h2>
    <div class="grid grid-3">
      <div class="stat">
        <div class="stat-value">${g.untouched}</div>
        <div class="stat-label">не начато</div>
      </div>
      <div class="stat">
        <div class="stat-value" style="color:${g.started ? 'var(--amber)' : 'var(--text)'}">${g.started}</div>
        <div class="stat-label">в изучении</div>
      </div>
      <div class="stat">
        <div class="stat-value" style="color:var(--green)">${g.mastered}</div>
        <div class="stat-label">закреплено</div>
      </div>
    </div>
    ${progressBar((g.started / g.total) * 100, g.started === g.total)}
    <p class="faint mt-2">
      ${plural(g.total, 'фраза', 'фразы', 'фраз')} из пройденных уроков.
      Раньше упражнения проходились один раз и исчезали — теперь правила
      повторяются наравне со словами.
    </p>`;
}

function renderActivity(state) {
  const days = activity(state, 28);
  const max = Math.max(...days.map((d) => d.count), 1);
  const total = days.reduce((n, d) => n + d.count, 0);
  const active = days.filter((d) => d.count > 0).length;

  return `
    <h2>Календарь активности</h2>
    <div class="card activity-calendar">
      <div class="activity-calendar__grid">
        ${days
          .map((d) => {
            const level = d.count ? Math.min(4, Math.ceil((d.count / max) * 4)) : 0;
            return `<div class="activity-cell level-${level}" title="${esc(d.date)}: ${d.count}"></div>`;
          })
          .join('')}
      </div>
      <div class="faint mt-4">
        ${plural(active, 'день', 'дня', 'дней')} с занятиями за 28 дней,
        ${plural(total, 'повторение', 'повторения', 'повторений')} всего.
      </div>
    </div>`;
}

function renderMistakes(state) {
  const writing = state.writing || { checked: 0, errorsFound: 0 };
  const listening = state.listening || { attempts: 0, perfect: 0 };
  const pronunciation = Object.values(state.pronunciation || {}).reduce(
    (sum, item) => ({ attempts: sum.attempts + (item.attempts || 0), exact: sum.exact + (item.exact || 0) }),
    { attempts: 0, exact: 0 },
  );
  const rate = (good, total) => (total ? `${Math.round((good / total) * 100)}%` : '—');

  return `
    <h2>Где чаще ошибаешься</h2>
    <div class="grid grid-3">
      <div class="stat error-stat"><div class="stat-value">${writing.checked ? writing.errorsFound : '—'}</div><div class="stat-label">ошибок в письме</div><div class="faint mt-2">${writing.checked ? `${writing.checked} проверок` : 'пока нет попыток'}</div></div>
      <div class="stat error-stat"><div class="stat-value">${rate(listening.perfect, listening.attempts)}</div><div class="stat-label">точность аудирования</div><div class="faint mt-2">${listening.attempts ? `${listening.attempts} попыток` : 'пока нет попыток'}</div></div>
      <div class="stat error-stat"><div class="stat-value">${rate(pronunciation.exact, pronunciation.attempts)}</div><div class="stat-label">точность произношения</div><div class="faint mt-2">${pronunciation.attempts ? `${pronunciation.attempts} попыток` : 'пока нет попыток'}</div></div>
    </div>`;
}

function renderLevels(state) {
  const levels = levelProgress(state);
  return `
    <h2>По уровням</h2>
    <div class="card">
      ${levels
        .map((l) => {
          const percent = l.total ? (l.done / l.total) * 100 : 0;
          return `
            <div class="row-between mt-2">
              <span class="level-code${l.total && l.done === l.total ? ' done' : ''}">${esc(l.code)}</span>
              <span class="faint">${l.done} / ${l.total}</span>
            </div>
            <div class="mt-2">${progressBar(percent, l.total > 0 && l.done === l.total)}</div>`;
        })
        .join('')}
    </div>`;
}

function renderWeak(state) {
  const weak = weakLessons(state);
  if (!weak.length) return '';

  return `
    <h2>Стоит перепройти</h2>
    <div class="card">
      <p class="faint" style="margin-top:0">
        Следующие уроки опираются на эти — пробел здесь тянется дальше.
      </p>
      ${weak
        .map(
          (l) => `
        <button class="lesson-row" data-nav="lesson:${esc(l.id)}">
          <span class="level-code">${esc(l.level)}</span>
          <span style="flex:1">${esc(l.title)}</span>
          <span style="color:var(--amber)">${l.score}%</span>
        </button>`,
        )
        .join('')}
    </div>`;
}

function renderAchievements(state) {
  const lessonCount = Object.keys(state.lessons || {}).length;
  const achievements = [
    { icon: '🌱', title: 'Первый шаг', text: 'Пройден первый урок', unlocked: lessonCount >= 1 },
    { icon: '🔥', title: 'Ритм', text: 'Серия из 7 дней', unlocked: state.streak >= 7 },
    { icon: '⭐', title: 'В потоке', text: 'Заработано 100 XP', unlocked: state.xp >= 100 },
    { icon: '🏁', title: 'Десять уроков', text: 'Пройдено 10 уроков', unlocked: lessonCount >= 10 },
  ];

  return `
    <h2>Достижения</h2>
    <div class="achievements">
      ${achievements
        .map(
          (a) => `<div class="achievement${a.unlocked ? ' unlocked' : ''}">
            <div class="achievement__icon">${a.icon}</div>
            <div><strong>${a.title}</strong><span>${a.unlocked ? a.text : `Ещё немного: ${a.text.toLowerCase()}`}</span></div>
          </div>`,
        )
        .join('')}
    </div>`;
}

export function renderProgress() {
  const state = loadState();
  const v = vocabSummary(state);

  return `
    <h1>Разбор прогресса</h1>
    <p class="subtitle">
      Не сколько сделано, а что из этого держится в памяти и что мешает дальше.
    </p>

    ${renderInsights(state)}

    <div class="grid grid-4 mt-6">
      <div class="stat"><div class="stat-value">${state.streak}🔥</div><div class="stat-label">дней подряд</div></div>
      <div class="stat"><div class="stat-value">${Object.keys(state.lessons || {}).length}</div><div class="stat-label">уроков пройдено</div></div>
      <div class="stat"><div class="stat-value">${v.learning}</div><div class="stat-label">слов в изучении</div></div>
      <div class="stat"><div class="stat-value" style="color:var(--green)">${v.mastered}</div><div class="stat-label">слов выучено</div></div>
    </div>

    ${renderDebt(state)}
    ${renderSides(state)}
    ${renderGrammar(state)}
    ${renderActivity(state)}
    ${renderMistakes(state)}
    ${renderAchievements(state)}
    ${renderWeak(state)}
    ${renderLevels(state)}
  `;
}
