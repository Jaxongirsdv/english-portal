import { loadState, update, addXp, touchStudyDay } from '../core/storage.js';
import { textsFor, getText, plainText, wordCount } from '../data/reading.js';
import { speak } from '../core/speech.js';
import { esc, progressBar, plural } from '../core/ui.js';
import {
  createQuiz,
  currentQuestion,
  currentOptions,
  answerQuestion as answerQuiz,
  isCorrect,
  nextQuestion as advanceQuiz,
  quizScore,
  quizProgress,
} from '../core/quiz.js';

/**
 * Экран чтения.
 *
 * Порядок жёсткий: сначала текст, потом вопросы. Вопросы, видные во время
 * чтения, превращают чтение в поиск ответов — человек выхватывает нужные
 * строки и пропускает остальное, а понимания не прибавляется.
 *
 * Глоссарий, наоборот, показан сразу и рядом: незнакомое слово, за которым
 * надо куда-то идти, останавливает чтение совсем.
 */
let s = null;
let readingStatus = 'all';
let readingLevel = 'all';

export function startReading() {
  s = s?.text ? s : { text: null, phase: 'list', quiz: null };
}

export function exitReading() {
  s = null;
}

function level() {
  return loadState().level || 'A0';
}

export function openText(id) {
  const text = getText(id);
  if (!text) return false;
  s = { text, phase: 'read', quiz: createQuiz(text.questions) };
  update((st) => {
    st.settings.readingResume = id;
  });
  return true;
}

export function setReadingFilter(name, value) {
  if (name === 'status') readingStatus = ['all', 'new', 'done'].includes(value) ? value : 'all';
  if (name === 'level') readingLevel = ['all', 'A0', 'A1', 'A2', 'B1', 'B2', 'C1'].includes(value) ? value : 'all';
  return true;
}

export function backToList() {
  s = { text: null, phase: 'list', quiz: null };
  return true;
}

export function startQuestions() {
  if (!s || s.phase !== 'read') return false;
  s.phase = 'quiz';
  return true;
}

export function speakText() {
  if (s?.text) speak(plainText(s.text));
}

export function answerQuestion(value) {
  if (!s || s.phase !== 'quiz') return false;
  return answerQuiz(s.quiz, s.text.questions, value);
}

export function nextQuestion() {
  if (!s || s.phase !== 'quiz') return false;
  const { moved, finished } = advanceQuiz(s.quiz);
  if (!moved) return false;
  if (!finished) return true;

  const { right, percent } = quizScore(s.quiz);
  s.phase = 'done';

  update((st) => {
    const before = st.reading?.[s.text.id];
    // Лучший результат не понижаем: перечитать текст и ответить хуже
    // из-за спешки — не повод стирать прежнее понимание
    st.reading = {
      ...(st.reading || {}),
      [s.text.id]: { score: Math.max(percent, before?.score ?? 0), at: new Date().toISOString() },
    };
    if (st.settings.readingResume === s.text.id) st.settings.readingResume = null;
  });
  addXp(right * 3);
  touchStudyDay();
  return true;
}

/* ---------- Отрисовка ---------- */

function renderList() {
  const state = loadState();
  const available = textsFor(level());
  const done = state.reading || {};
  const resume = getText(state.settings.readingResume);
  const recommended = resume && available.some((text) => text.id === resume.id)
    ? resume
    : available.find((text) => !done[text.id]) || available[0];
  const levels = [...new Set(available.map((text) => text.level))];
  const list = available.filter((text) => {
    if (readingLevel !== 'all' && text.level !== readingLevel) return false;
    if (readingStatus === 'new' && done[text.id]) return false;
    if (readingStatus === 'done' && !done[text.id]) return false;
    return true;
  });

  return `
    <h1>Чтение</h1>
    <p class="subtitle">
      Здесь слова встречаются в потоке, а не по одному. Тексты написаны словами
      твоего уровня; всё остальное переведено рядом с текстом.
    </p>

    ${recommended ? `<button class="reading-featured" data-text="${esc(recommended.id)}">
      <div><span>${resume?.id === recommended.id ? 'Продолжить чтение' : 'Рекомендуем дальше'} · ${esc(recommended.level)}</span><strong>${esc(recommended.title)}</strong><small>${esc(recommended.titleRu)} · ${plural(wordCount(recommended), 'слово', 'слова', 'слов')}</small></div>
      <span class="reading-featured__action">${resume?.id === recommended.id ? 'Продолжить' : 'Начать'} →</span>
    </button>` : ''}

    <div class="reading-filters">
      <div class="reading-filter-chips">
        <button class="chip${readingStatus === 'all' ? ' active' : ''}" data-reading-filter="status:all">Все · ${available.length}</button>
        <button class="chip${readingStatus === 'new' ? ' active' : ''}" data-reading-filter="status:new">Новые · ${available.filter((text) => !done[text.id]).length}</button>
        <button class="chip${readingStatus === 'done' ? ' active' : ''}" data-reading-filter="status:done">Пройденные · ${available.filter((text) => done[text.id]).length}</button>
      </div>
      <select class="theme-select" data-reading-filter-select="level" aria-label="Уровень текста">
        <option value="all">Все уровни</option>
        ${levels.map((item) => `<option value="${item}" ${readingLevel === item ? 'selected' : ''}>${item}</option>`).join('')}
      </select>
    </div>

    <div class="grid grid-2 reading-grid">
      ${list.length ? list
        .map((t) => {
          const result = done[t.id];
          return `<button class="card" style="text-align:left;cursor:pointer" data-text="${esc(t.id)}">
            <div class="row-between">
              <span class="level-code${result ? ' done' : ''}">${esc(t.level)}</span>
              ${result ? `<span class="word-status mastered">${result.score}%</span>` : ''}
            </div>
            <h3 style="margin:8px 0 2px">${esc(t.title)}</h3>
            <div class="faint">${esc(t.titleRu)}</div>
            <div class="faint mt-2">${plural(wordCount(t), 'слово', 'слова', 'слов')}${
              t.glossary.length ? ` · ${plural(t.glossary.length, 'новое слово', 'новых слова', 'новых слов')}` : ''
            }</div>
          </button>`;
        })
        .join('') : '<div class="empty reading-empty"><div class="empty-icon">📖</div>В этом фильтре пока нет текстов</div>'}
    </div>

    ${
      available.length < 4
        ? `<p class="faint mt-6">
            Тексты старших уровней откроются вместе с уровнем: читать то,
            для чего ещё нет слов, — бессмысленное занятие.
          </p>`
        : ''
    }`;
}

function renderRead() {
  const t = s.text;
  return `
    <div class="row-between mb-4">
      <button class="btn btn-ghost" data-reading-back>← К текстам</button>
      <span class="faint">${esc(t.level)} · ${plural(wordCount(t), 'слово', 'слова', 'слов')}</span>
    </div>

    <h1 style="margin-bottom:2px">${esc(t.title)}</h1>
    <p class="faint">${esc(t.titleRu)}</p>

    <div class="row mt-4">
      <button class="btn" data-reading-speak>🔊 Прослушать</button>
    </div>

    <div class="card mt-4" style="line-height:1.7;font-size:17px">
      ${t.paragraphs.map((p) => `<p style="margin:0 0 14px">${esc(p)}</p>`).join('')}
    </div>

    ${
      t.glossary.length
        ? `<div class="callout mt-4">
            <span class="callout-label">Новые слова</span>
            ${t.glossary.map((g) => `<strong>${esc(g.en)}</strong> — ${esc(g.ru)}`).join(' · ')}
          </div>`
        : ''
    }

    <button class="btn btn-primary btn-lg mt-6" style="width:100%" data-reading-quiz>
      Проверить понимание
    </button>
    <p class="faint mt-2" style="text-align:center">
      Вопросы показываются после текста: увидев их заранее, читаешь не текст,
      а поиск ответов.
    </p>`;
}

function renderQuiz() {
  const q = currentQuestion(s.quiz, s.text.questions);
  const answered = s.quiz.picked !== null;
  const right = isCorrect(s.quiz, s.text.questions);

  return `
    <div class="row-between mb-4">
      <button class="btn btn-ghost" data-reading-back>← К текстам</button>
      <span class="faint">Вопрос ${s.quiz.idx + 1} из ${s.quiz.order.length}</span>
    </div>
    ${progressBar(quizProgress(s.quiz))}

    <div class="exercise mt-4">
      <div class="ex-prompt">${esc(q.q)}</div>
      ${currentOptions(s.quiz)
        .map((o) => {
          const cls = !answered ? '' : o === q.answer ? ' correct' : o === s.quiz.picked ? ' wrong' : '';
          return `<button class="option${cls}" ${answered ? 'disabled' : ''} data-reading-answer="${esc(o)}">${esc(o)}</button>`;
        })
        .join('')}

      ${
        answered
          ? `<div class="feedback ${right ? 'ok' : 'no'}">
              <strong>${right ? 'Верно.' : 'Не то.'}</strong>
              ${right ? '' : ` В тексте: <strong>${esc(q.answer)}</strong>`}
            </div>
            <button class="btn btn-primary btn-lg mt-4" data-reading-next>
              ${s.quiz.idx + 1 < s.quiz.order.length ? 'Дальше →' : 'Итог'}
            </button>`
          : ''
      }
    </div>`;
}

function renderDone() {
  const { right, total, percent } = quizScore(s.quiz);

  return `
    <div class="empty">
      <div class="empty-icon">${percent >= 80 ? '🎉' : percent >= 50 ? '👍' : '💪'}</div>
      <h1>${esc(s.text.title)}</h1>
      <p class="subtitle">${right} из ${total} верно · ${percent}%</p>
      <p class="faint" style="max-width:460px;margin:0 auto 24px">
        ${
          percent >= 80
            ? 'Текст понят. Слова из него встретятся в повторениях — там они закрепятся окончательно.'
            : 'Стоит перечитать: понимание текста складывается со второго раза чаще, чем с первого.'
        }
      </p>
      <div class="row" style="justify-content:center">
        <button class="btn btn-primary btn-lg" data-text="${esc(s.text.id)}">Перечитать</button>
        <button class="btn btn-lg" data-reading-back>К текстам</button>
      </div>
    </div>`;
}

export function renderReading() {
  if (!s) startReading();
  if (!s.text || s.phase === 'list') return renderList();
  if (s.phase === 'read') return renderRead();
  if (s.phase === 'quiz') return renderQuiz();
  return renderDone();
}
