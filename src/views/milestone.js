import { loadState, update, touchStudyDay } from '../core/storage.js';
import { CURRICULUM } from '../data/curriculum.js';
import { plainText } from '../data/reading.js';
import { speak, speakSlow } from '../core/speech.js';
import { esc, progressBar } from '../core/ui.js';
import {
  MILESTONE_PASS_PERCENT,
  isMilestoneUnlocked,
  nextLevel,
} from '../core/curriculum-progress.js';
import {
  MILESTONE_SECTION_PASS_PERCENT,
  buildMilestoneAssessment,
  milestoneAnswerCorrect,
  scoreMilestoneAssessment,
} from '../core/milestone-assessment.js';

const SECTION_META = {
  knowledge: { label: 'Язык', detail: 'грамматика и лексика' },
  reading: { label: 'Reading', detail: 'понимание текста' },
  listening: { label: 'Listening', detail: 'понимание речи' },
};

let session = null;

function currentQuestion() {
  return session?.questions[session.index] || null;
}

export function startMilestone(levelId) {
  const level = CURRICULUM.find((item) => item.id === levelId);
  if (!level || !isMilestoneUnlocked(loadState(), levelId)) {
    session = null;
    return false;
  }
  session = {
    level,
    ...buildMilestoneAssessment(level),
    index: 0,
    picked: null,
    typed: '',
    answers: [],
    listeningPlayed: 0,
    done: false,
    result: null,
  };
  return true;
}

export function exitMilestone() {
  session = null;
}

export function syncMilestoneInput(value) {
  if (!session || session.picked !== null) return false;
  session.typed = String(value || '');
  return true;
}

function recordAnswer(value) {
  const question = currentQuestion();
  if (!question || session.done || session.picked !== null) return false;
  if (question.section === 'listening' && session.listeningPlayed === 0) return false;
  session.picked = value;
  session.answers[session.index] = milestoneAnswerCorrect(question, value);
  return true;
}

export function answerMilestone(value) {
  const question = currentQuestion();
  if (!question || question.mode !== 'choice' || !question.options.includes(value)) return false;
  return recordAnswer(value);
}

export function checkMilestoneInput() {
  const question = currentQuestion();
  if (!question || question.mode !== 'input' || !session.typed.trim()) return false;
  return recordAnswer(session.typed.trim());
}

export function playMilestoneListening(slow = false) {
  if (!session || currentQuestion()?.section !== 'listening') return false;
  session.listeningPlayed += 1;
  const text = plainText(session.listeningText);
  if (slow) speakSlow(text);
  else speak(text);
  return true;
}

export function nextMilestoneQuestion() {
  if (!session || session.done || session.picked === null) return false;
  if (session.index + 1 < session.questions.length) {
    session.index += 1;
    session.picked = null;
    session.typed = '';
    return true;
  }

  const result = scoreMilestoneAssessment(
    session.questions,
    session.answers,
    MILESTONE_PASS_PERCENT,
  );
  const now = new Date().toISOString();
  update((state) => {
    state.milestones = state.milestones || {};
    const previous = state.milestones[session.level.id];
    const bestSections = { ...(previous?.bestSections || {}) };
    for (const [name, section] of Object.entries(result.sections)) {
      bestSections[name] = Math.max(bestSections[name] || 0, section.percent);
    }
    state.milestones[session.level.id] = {
      attempts: (previous?.attempts || 0) + 1,
      bestScore: Math.max(previous?.bestScore || 0, result.percent),
      lastScore: result.percent,
      sections: Object.fromEntries(
        Object.entries(result.sections).map(([name, section]) => [name, section.percent]),
      ),
      bestSections,
      passed: previous?.passed || result.passed,
      completedAt: result.passed ? previous?.completedAt || now : previous?.completedAt || null,
      lastAttemptAt: now,
      formatVersion: 2,
      questionCount: result.total,
    };
    if (result.passed && !previous?.passed) {
      state.level = nextLevel(session.level.id)?.code || session.level.code;
      state.xp += 100;
    }
  });
  touchStudyDay();
  session.done = true;
  session.result = result;
  return true;
}

function renderSectionContext(question) {
  if (question.section === 'reading') {
    return `<div class="milestone-passage">
      <div><span>READING · ${esc(session.readingText.titleRu)}</span><strong>${esc(session.readingText.title)}</strong></div>
      ${session.readingText.paragraphs.map((paragraph) => `<p>${esc(paragraph)}</p>`).join('')}
    </div>`;
  }
  if (question.section === 'listening') {
    return `<div class="milestone-listening">
      <div><span>LISTENING · ${esc(session.listeningText.titleRu)}</span><strong>Текст скрыт: слушай основную мысль и детали</strong><small>Прослушано: ${session.listeningPlayed}</small></div>
      <div class="row">
        <button class="btn btn-primary" data-milestone-listen>🔊 Прослушать</button>
        <button class="btn btn-ghost" data-milestone-listen-slow>Медленно</button>
      </div>
    </div>`;
  }
  return `<p class="faint milestone-source">Тема урока: ${esc(question.source)}</p>`;
}

function renderAnswer(question) {
  const answered = session.picked !== null;
  if (question.mode === 'input') {
    return `<input class="text-input" data-milestone-input value="${esc(session.typed)}"
      placeholder="Напиши ответ по-английски" ${answered ? 'disabled' : ''} autocomplete="off" />
      ${answered ? '' : '<button class="btn btn-primary mt-4" data-milestone-check>Проверить</button>'}`;
  }
  const locked = question.section === 'listening' && session.listeningPlayed === 0;
  return `<div class="option-list">${question.options.map((option) => {
    const state = answered
      ? option === question.answer ? ' correct' : option === session.picked ? ' wrong' : ''
      : '';
    return `<button class="option${state}" data-milestone-answer="${esc(option)}" ${answered || locked ? 'disabled' : ''}>${esc(option)}</button>`;
  }).join('')}</div>${locked ? '<p class="faint">Сначала прослушай текст хотя бы один раз.</p>' : ''}`;
}

function renderQuestionFeedback(question) {
  if (session.picked === null) return '';
  const correct = session.answers[session.index];
  return `<div class="feedback ${correct ? 'ok' : 'no'} mt-4">
    <strong>${correct ? 'Верно.' : 'Неверно.'}</strong>
    ${correct ? '' : ` Правильный ответ: <strong>${esc(question.answer)}</strong>`}
  </div>
  <button class="btn btn-primary mt-4" data-milestone-next>${session.index + 1 === session.questions.length ? 'Получить результат' : 'Следующее задание →'}</button>`;
}

export function renderMilestone() {
  if (!session) {
    return '<div class="empty"><h2>Milestone пока закрыт</h2><p>Сначала освой все уроки уровня минимум на 80%.</p><button class="btn" data-nav="roadmap">К программе</button></div>';
  }
  if (session.done) return renderResult();

  const question = currentQuestion();
  const meta = SECTION_META[question.section];
  return `
    <div class="row-between mb-4"><button class="btn btn-ghost" data-nav="roadmap">← К программе</button><span class="level-code">${esc(session.level.code)}</span></div>
    <section class="card milestone-card">
      <div class="milestone-section-head">
        <div><span>${esc(meta.label)}</span><strong>${esc(meta.detail)}</strong></div>
        <small>${session.index + 1} из ${session.questions.length}</small>
      </div>
      ${progressBar((session.index / session.questions.length) * 100)}
      ${renderSectionContext(question)}
      <h2 class="mt-6">${esc(question.prompt)}</h2>
      ${renderAnswer(question)}
      ${renderQuestionFeedback(question)}
    </section>`;
}

function renderResult() {
  const next = nextLevel(session.level.id);
  const result = session.result;
  const weakest = Object.entries(result.sections).sort((a, b) => a[1].percent - b[1].percent)[0];
  return `<section class="card milestone-result">
    <div class="milestone-result__mark">${result.passed ? '✓' : `${result.percent}%`}</div>
    <div class="dashboard-kicker">MILESTONE ${esc(session.level.code)}</div>
    <h1>${result.passed ? 'Уровень подтверждён' : 'Нужно укрепить один из навыков'}</h1>
    <p class="subtitle">${result.correct} из ${result.total} верно · общий результат ${result.percent}%.</p>
    <div class="milestone-skill-grid">
      ${Object.entries(result.sections).map(([name, section]) => `<div class="milestone-skill${section.percent < MILESTONE_SECTION_PASS_PERCENT ? ' is-weak' : ''}">
        <span>${esc(SECTION_META[name].label)}</span><strong>${section.percent}%</strong><small>${section.correct} из ${section.total}</small>
      </div>`).join('')}
    </div>
    ${result.passed
      ? `<div class="feedback ok"><strong>+100 XP</strong><p>${next ? `Открыт уровень ${esc(next.code)} — ${esc(next.title)}.` : 'Ты завершил всю доступную программу.'}</p></div>`
      : `<div class="feedback no"><strong>Слабее всего: ${esc(SECTION_META[weakest[0]].label)} (${weakest[1].percent}%).</strong><p>Для прохождения нужно ${MILESTONE_PASS_PERCENT}% в целом и минимум ${MILESTONE_SECTION_PASS_PERCENT}% в каждом блоке.</p></div>`}
    <div class="row mt-6" style="justify-content:center">
      <button class="btn btn-primary" data-nav="roadmap">${result.passed ? 'Продолжить обучение' : 'Вернуться к темам'}</button>
      ${result.passed ? '' : `<button class="btn" data-milestone-retry="${esc(session.level.id)}">Новый вариант</button>`}
    </div>
  </section>`;
}
