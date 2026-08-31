import { loadState, touchStudyDay, update } from '../core/storage.js';
import { examReadiness } from '../core/b2-readiness.js';
import { esc, progressBar } from '../core/ui.js';

const MOCK_SECONDS = 165 * 60;
let ticker = null;

function stopTicker() {
  if (ticker) clearInterval(ticker);
  ticker = null;
}

function remaining(mock) {
  if (!mock?.endsAt) return MOCK_SECONDS;
  return Math.max(0, Math.ceil((Date.parse(mock.endsAt) - Date.now()) / 1000));
}

function clock(seconds) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const rest = seconds % 60;
  return `${hours}:${String(minutes).padStart(2, '0')}:${String(rest).padStart(2, '0')}`;
}

export function startFullMock() {
  update((state) => {
    const now = new Date();
    state.b2FullMock = {
      startedAt: now.toISOString(),
      endsAt: new Date(now.getTime() + MOCK_SECONDS * 1000).toISOString(),
      completedAt: null,
      score: null,
    };
  });
  return true;
}

export function startFullMockClock(rerender) {
  stopTicker();
  const mock = loadState().b2FullMock;
  if (!mock?.endsAt || mock.completedAt) return;
  ticker = setInterval(() => {
    const value = remaining(loadState().b2FullMock);
    const label = document.querySelector('[data-b2-full-time]');
    if (label) label.textContent = clock(value);
    if (!value) {
      stopTicker();
      rerender();
    }
  }, 1000);
}

export function exitFullMock() {
  stopTicker();
}

export function finishFullMock() {
  const state = loadState();
  const report = examReadiness(state, state.b2FullMock?.startedAt);
  if (!report.ready) return false;
  update((state) => {
    state.b2FullMock = state.b2FullMock || {};
    state.b2FullMock.completedAt = new Date().toISOString();
    state.b2FullMock.score = report.overall;
  });
  touchStudyDay();
  return true;
}

export function resetFullMock() {
  stopTicker();
  update((state) => { state.b2FullMock = null; });
  return true;
}

export function renderFullMock() {
  const state = loadState();
  const mock = state.b2FullMock;
  const report = examReadiness(state, mock?.startedAt);
  if (mock?.completedAt) {
    return `<section class="diagnostic-report"><div class="diagnostic-report__hero"><div><div class="dashboard-kicker">ПОЛНАЯ РЕПЕТИЦИЯ ЗАВЕРШЕНА</div><h1>${report.overall >= 70 ? 'Формат под контролем' : 'Нужен ещё один цикл'}</h1><p>Тренировочный результат ${report.overall}%. Следующий фокус: ${esc(report.focus.skill)}.</p></div><div class="diagnostic-score"><strong>${report.overall}%</strong><span>оценочная готовность</span></div></div><div class="diagnostic-next"><div><span>СЛЕДУЮЩИЙ ШАГ</span><strong>Укрепить ${esc(report.focus.skill)}</strong></div><button class="btn btn-primary" data-nav="${report.focus.route}">Тренировать</button></div><button class="btn mt-4" data-b2-full-reset>Новая репетиция</button></section>`;
  }
  return `<div class="row-between mb-4"><button class="btn btn-ghost" data-nav="exam-mocks">← Пробники</button><span class="level-code">ПИСЬМЕННЫЙ БЛОК · 2:45</span></div>
    <header class="full-mock-hero"><div><div class="dashboard-kicker">ПОЛНЫЙ МАРШРУТ</div><h1>Репетиция Multilevel</h1><p>Под таймером пройди Reading, Listening и Writing. Затем отдельно запиши Speaking: устная часть не входит в лимит письменного блока.</p></div><div class="exam-countdown"><strong data-b2-full-time>${clock(remaining(mock))}</strong><span>${mock ? 'письменное время идёт' : 'лимит письменной части'}</span></div></header>
    ${!mock ? `<button class="btn btn-primary btn-lg mt-4" data-b2-full-start>Начать репетицию</button>` : ''}
    <div class="full-mock-sections mt-6">${Object.entries(report.skills).map(([skill, value], index) => `<article class="card"><div class="row-between"><span class="level-code">${skill === 'Speaking' ? 'ОТДЕЛЬНО ОТ 2:45' : `SECTION ${index + 1}`}</span><strong>${value.completed}/${value.total}</strong></div><h2>${esc(skill)}</h2>${progressBar((value.completed / value.total) * 100, value.completed === value.total)}<button class="btn ${value.completed === value.total ? '' : 'btn-primary'} mt-4" data-nav="${value.route}">${value.completed === value.total ? 'Повторить' : 'Продолжить'}</button></article>`).join('')}</div>
    <section class="exam-base-bridge mt-6"><div><div class="dashboard-kicker">ТЕКУЩИЙ ФОКУС</div><h2>${report.ready ? 'Все разделы завершены' : `Следующий: ${esc(report.focus.skill)}`}</h2><p>${report.ready ? 'Можно завершить репетицию и получить персональную рекомендацию.' : 'Сначала закончи обязательные части. После этого результат определит слабейший навык.'}</p></div><button class="btn btn-primary" data-b2-full-finish ${report.ready ? '' : 'disabled'}>Завершить и получить отчёт</button></section>`;
}
