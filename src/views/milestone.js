import { loadState, update, touchStudyDay } from '../core/storage.js';
import { CURRICULUM } from '../data/curriculum.js';
import { esc, progressBar } from '../core/ui.js';
import {
  MILESTONE_PASS_PERCENT,
  isMilestoneUnlocked,
  lessonsForLevel,
  nextLevel,
} from '../core/curriculum-progress.js';

const QUESTION_COUNT = 5;
let session = null;

function questionsFor(level) {
  const candidates = lessonsForLevel(level)
    .map((lesson) => lesson.exercises.find((exercise) => exercise.type === 'choice'))
    .filter(Boolean);
  const selected = Array.from({ length: Math.min(QUESTION_COUNT, candidates.length) }, (_, index) => {
    const position = Math.round(index * (candidates.length - 1) / Math.max(1, QUESTION_COUNT - 1));
    return candidates[position];
  });
  return selected.map((exercise) => ({
    prompt: exercise.prompt,
    options: exercise.options,
    answer: exercise.answer,
  }));
}

export function startMilestone(levelId) {
  const level = CURRICULUM.find((item) => item.id === levelId);
  if (!level || !isMilestoneUnlocked(loadState(), levelId)) {
    session = null;
    return false;
  }
  session = { level, questions: questionsFor(level), index: 0, picked: null, correct: 0, done: false };
  return true;
}

export function exitMilestone() {
  session = null;
}

export function answerMilestone(value) {
  if (!session || session.done || session.picked !== null) return false;
  const question = session.questions[session.index];
  if (!question.options.includes(value)) return false;
  session.picked = value;
  if (value === question.answer) session.correct += 1;
  return true;
}

export function nextMilestoneQuestion() {
  if (!session || session.done || session.picked === null) return false;
  if (session.index < session.questions.length - 1) {
    session.index += 1;
    session.picked = null;
    return true;
  }

  const percent = Math.round((session.correct / session.questions.length) * 100);
  const passed = percent >= MILESTONE_PASS_PERCENT;
  update((state) => {
    state.milestones = state.milestones || {};
    const previous = state.milestones[session.level.id];
    state.milestones[session.level.id] = {
      attempts: (previous?.attempts || 0) + 1,
      bestScore: Math.max(previous?.bestScore || 0, percent),
      passed: previous?.passed || passed,
      completedAt: passed ? new Date().toISOString() : previous?.completedAt || null,
    };
    if (passed && !previous?.passed) {
      state.level = nextLevel(session.level.id)?.code || session.level.code;
      state.xp += 100;
    }
  });
  touchStudyDay();
  session.done = true;
  session.percent = percent;
  session.passed = passed;
  return true;
}

export function renderMilestone() {
  if (!session) {
    return '<div class="empty"><h2>Milestone пока закрыт</h2><p>Сначала заверши все уроки текущего уровня.</p><button class="btn" data-nav="roadmap">К программе</button></div>';
  }
  if (session.done) return renderResult();

  const question = session.questions[session.index];
  const answered = session.picked !== null;
  return `
    <div class="row-between mb-4"><button class="btn btn-ghost" data-nav="roadmap">← К программе</button><span class="level-code">${esc(session.level.code)}</span></div>
    <section class="card milestone-card">
      <div class="dashboard-kicker">MILESTONE · ${session.index + 1} ИЗ ${session.questions.length}</div>
      <h1>Проверка уровня ${esc(session.level.code)}</h1>
      ${progressBar((session.index / session.questions.length) * 100)}
      <h2 class="mt-6">${esc(question.prompt)}</h2>
      <div class="option-list">${question.options.map((option) => {
        const state = answered ? option === question.answer ? ' correct' : option === session.picked ? ' wrong' : '' : '';
        return `<button class="option${state}" data-milestone-answer="${esc(option)}" ${answered ? 'disabled' : ''}>${esc(option)}</button>`;
      }).join('')}</div>
      ${answered ? `<button class="btn btn-primary mt-4" data-milestone-next>${session.index + 1 === session.questions.length ? 'Получить результат' : 'Следующий вопрос'}</button>` : ''}
    </section>`;
}

function renderResult() {
  const next = nextLevel(session.level.id);
  return `<section class="card milestone-result">
    <div class="milestone-result__mark">${session.passed ? '✓' : `${session.percent}%`}</div>
    <div class="dashboard-kicker">MILESTONE ${session.level.code}</div>
    <h1>${session.passed ? 'Уровень завершён' : 'Нужна ещё одна попытка'}</h1>
    <p class="subtitle">${session.correct} из ${session.questions.length} верно · проходной результат ${MILESTONE_PASS_PERCENT}%.</p>
    ${session.passed
      ? `<div class="feedback ok"><strong>+100 XP</strong><p>${next ? `Открыт уровень ${esc(next.code)} — ${esc(next.title)}.` : 'Ты завершил всю доступную программу.'}</p></div>`
      : '<div class="feedback no"><strong>Milestone пока не пройден.</strong><p>Повтори сложные темы и попробуй снова.</p></div>'}
    <div class="row mt-6" style="justify-content:center">
      <button class="btn btn-primary" data-nav="roadmap">${session.passed ? 'Продолжить обучение' : 'Вернуться к темам'}</button>
      ${session.passed ? '' : `<button class="btn" data-milestone-retry="${esc(session.level.id)}">Пересдать</button>`}
    </div>
  </section>`;
}
