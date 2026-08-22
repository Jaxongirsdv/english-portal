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
  const mistakes = Object.values(state.cards || {}).filter((card) => card.lastLapseAt).length;
  const lessons = allLessons();
  const done = lessons.filter((l) => state.lessons[l.id]).length;
  const next = nextLesson(state.lessons);
  const goal = state.settings.dailyGoal;
  const doneToday = todayCount();
  const goalPct = Math.min(100, (doneToday / goal) * 100);

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

    <div class="card dashboard-goal mb-4">
      <div class="row-between mb-4">
        <div>
          <h3 style="margin:0">Цель на сегодня</h3>
          <div class="faint">${doneToday} / ${goal} повторений</div>
        </div>
        ${doneToday >= goal ? '<span class="word-status mastered">выполнено ✓</span>' : ''}
      </div>
      ${progressBar(goalPct, doneToday >= goal)}
    </div>

    <div class="quick-practice mb-4">
      <div>
        <div class="dashboard-kicker">МАЛЕНЬКИЙ ШАГ · БОЛЬШОЙ РЕЗУЛЬТАТ</div>
        <strong>Есть только 5 минут?</strong>
        <span>Возьми несколько карточек и сохрани ритм.</span>
      </div>
      <button class="btn" data-nav="review-quick">Практика на 5 минут <span aria-hidden="true">→</span></button>
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

    ${mistakes > 0
      ? `<div class="card dashboard-mistakes mb-4">
          <div class="row-between">
            <div>
              <h3 style="margin:0 0 2px">Слова, которые требуют внимания</h3>
              <div class="faint">${mistakes} ${plural(mistakes, 'карточка ждёт', 'карточки ждут', 'карточек ждут')} короткой тренировки.</div>
            </div>
            <button class="btn" data-nav="review-mistakes">Повторить ошибки</button>
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
      ? `<div class="card dashboard-next mb-4">
          <div class="dashboard-next__content">
            <div class="dashboard-kicker">ТВОЙ СЛЕДУЮЩИЙ ШАГ · ${esc(next.levelCode)}</div>
            <h3>Следующий урок: ${esc(next.title)}</h3>
            <div class="faint">${esc(next.unitTitle)} · примерно ${next.duration} минут</div>
          </div>
          <button class="btn btn-primary btn-lg dashboard-next__action" data-nav="lesson:${esc(next.id)}">Начать урок <span aria-hidden="true">→</span></button>
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
