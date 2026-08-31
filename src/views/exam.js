import { loadState } from '../core/storage.js';
import { b2Sprint, B2_EXAM_DATE } from '../core/b2-sprint.js';
import { B2_SKILLS, diagnosticReport } from '../core/b2-diagnostic.js';
import { skillTrainingSummary } from '../core/b2-training.js';
import { B2_OBJECTIVE_PARTS } from '../data/b2-multilevel.js';
import { B2_WRITING_PARTS } from '../data/b2-writing.js';
import { esc, progressBar } from '../core/ui.js';
import { examReadiness } from '../core/b2-readiness.js';

const SKILL_META = {
  Reading: { icon: 'R', title: 'Reading', text: 'Multilevel: пропуски, заголовки, детали и скрытый смысл.', route: 'b2-reading' },
  Listening: { icon: 'L', title: 'Listening', text: 'Multilevel: два прослушивания, смысл, детали и числа.', route: 'b2-listening' },
  Writing: { icon: 'W', title: 'Writing', text: 'Multilevel: два email и текст для онлайн-издания.', route: 'b2-writing' },
  Speaking: { icon: 'S', title: 'Speaking', text: 'Свободный ответ, аргументы, пример и вывод.', route: 'b2-speaking' },
};

export function renderExam() {
  const state = loadState();
  const sprint = b2Sprint();
  const mock = state.b2Mock || {};
  const completed = mock.completed || {};
  const scores = mock.scores || {};
  const done = B2_SKILLS.filter((skill) => completed[skill]).length;
  const report = done === B2_SKILLS.length ? diagnosticReport(scores) : null;
  const readiness = examReadiness(state);
  const examDate = new Date(`${B2_EXAM_DATE}T00:00:00`).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' });

  return `
    <header class="exam-hero">
      <div><div class="dashboard-kicker">ОТДЕЛЬНЫЙ МАРШРУТ</div><h1>Подготовка к экзамену B2</h1><p>Тренируй формат, время и четыре экзаменационных навыка. База остаётся в соседнем разделе и не смешивается с пробниками.</p></div>
      <div class="exam-countdown"><strong>${sprint.examPassed ? '—' : sprint.daysLeft}</strong><span>${sprint.examPassed ? 'цикл завершён' : `дней до ${examDate}`}</span></div>
    </header>

    <section class="exam-diagnostic card">
      <div><div class="dashboard-kicker">ТОЧКА КОНТРОЛЯ</div><h2>${report ? esc(report.readiness.title) : 'Диагностика четырёх навыков'}</h2><p class="faint">${report ? `Общий тренировочный результат ${report.overall}%. Главный фокус: ${esc(report.weakest)}.` : `${done} из 4 частей завершено. Пройди все части, чтобы получить персональный фокус.`}</p></div>
      <div class="exam-diagnostic__progress"><strong>${report ? `${report.overall}%` : `${done}/4`}</strong>${progressBar(report ? report.overall : done * 25, !!report && report.overall >= 70)}</div>
      <button class="btn btn-primary" data-nav="b2-mock">${done ? 'Продолжить диагностику' : 'Начать диагностику'}</button>
    </section>

    <section class="exam-full-mock card">
      <div><div class="dashboard-kicker">ПОЛНАЯ РЕПЕТИЦИЯ</div><h2>Письменный блок и Speaking</h2><p class="faint">Reading, Listening и Writing идут под общим лимитом 2:45. Speaking записывается отдельно, затем портал выбирает слабейший навык.</p></div>
      <div class="exam-diagnostic__progress"><strong>${readiness.ready ? `${readiness.overall}%` : `${Object.values(readiness.skills).reduce((sum, item) => sum + item.completed, 0)}/14`}</strong>${progressBar(readiness.ready ? readiness.overall : (Object.values(readiness.skills).reduce((sum, item) => sum + item.completed, 0) / 14) * 100, readiness.ready)}</div>
      <button class="btn btn-primary" data-nav="b2-full-mock">Открыть полный пробник</button>
    </section>

    ${sprint.task && !sprint.examPassed ? `<section class="exam-today"><div class="exam-today__date">СЕГОДНЯ</div><div><span>${esc(sprint.task.phase)}</span><h2>${esc(sprint.task.title)}</h2><p>${esc(sprint.task.text)}</p></div><button class="btn btn-primary" data-nav="${esc(sprint.task.action)}">${esc(sprint.task.actionLabel)}</button></section>` : ''}

    <div class="dashboard-section-head"><div><div class="dashboard-kicker">ЭКЗАМЕНАЦИОННЫЕ НАВЫКИ</div><h2>Тренировать по отдельности</h2></div><span>результат последней диагностики</span></div>
    <div class="exam-skills">
      ${B2_SKILLS.map((skill) => {
        const item = SKILL_META[skill];
        const parts = B2_OBJECTIVE_PARTS[skill] || (skill === 'Writing' ? B2_WRITING_PARTS : null);
        const training = parts ? skillTrainingSummary(state, skill, parts) : null;
        const score = training?.completed ? `${training.percent}%` : completed[skill] ? `${scores[skill] ?? 0}%` : '→';
        return `<button class="exam-skill" data-nav="${item.route}"><span>${item.icon}</span><div><h3>${item.title}</h3><p>${item.text}</p>${training?.completed ? `<small>${training.completed}/${training.total} тренировочных частей</small>` : ''}</div><strong>${score}</strong></button>`;
      }).join('')}
    </div>

    <section class="exam-base-bridge mt-6"><div><div class="dashboard-kicker">ЕСЛИ НЕ ХВАТАЕТ БАЗЫ</div><h2>Не угадывай темы — вернись к конкретному пробелу</h2><p>Уроки укрепляют грамматику и словарь, повторение удерживает их в памяти. Экзаменационный раздел проверяет применение под временем.</p></div><div class="row"><button class="btn" data-nav="roadmap">Открыть уроки</button><button class="btn btn-ghost" data-nav="review-mistakes">Разобрать ошибки</button></div></section>`;
}
