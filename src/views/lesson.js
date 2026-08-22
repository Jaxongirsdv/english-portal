import { findLesson } from '../data/curriculum.js';
import { getWord } from '../data/vocab.js';
import { update, addXp, touchStudyDay } from '../core/storage.js';
import { esc, speakBtn, shuffle, normalize, plural } from '../core/ui.js';
import { speak } from '../core/speech.js';
import { scoreAttempt, VERDICT } from '../core/compare.js';

/**
 * Экран урока: теория → упражнения → результат.
 * Состояние держим в модуле — урок проходится целиком за один заход.
 */
let s = null;

export function startLesson(lessonId) {
  const lesson = findLesson(lessonId);
  if (!lesson) return;
  s = {
    lesson,
    phase: 'theory',
    idx: 0,
    correct: 0,
    answered: false,
    wasRight: false,
    verdict: null, // exact | close | wrong — только для перевода
    picked: null,
    chosen: [], // индексы выбранных слов в «собери предложение»
    typed: '',
    // Порядок вариантов перемешиваем при каждом входе в урок и держим
    // в состоянии сессии, а не на объекте урока: иначе при повторном
    // прохождении ответ узнавался бы по позиции, а не по смыслу.
    shuffled: lesson.exercises.map((ex) => {
      if (ex.type === 'choice' || ex.type === 'listen') return shuffle(ex.options);
      if (ex.type === 'order') return shuffle(ex.words);
      return null;
    }),
  };
}


export function exitLesson() {
  s = null;
}

/* ---------- Рендер теории ---------- */

function renderTheoryBlock(b) {
  switch (b.type) {
    case 'p':
      return `<p>${esc(b.text)}</p>`;
    case 'table':
      return `<table class="theory">
        <thead><tr>${b.head.map((h) => `<th>${esc(h)}</th>`).join('')}</tr></thead>
        <tbody>${b.rows
          .map((r) => `<tr>${r.map((c) => `<td>${esc(c)}</td>`).join('')}</tr>`)
          .join('')}</tbody>
      </table>`;
    case 'tip':
      return `<div class="callout tip"><span class="callout-label">Совет</span>${esc(b.text)}</div>`;
    case 'warn':
      return `<div class="callout warn"><span class="callout-label">Внимание</span>${esc(b.text)}</div>`;
    case 'formula':
      return `<div class="formula">
        <div class="formula-main">${esc(b.text)}</div>
        ${b.note ? `<div class="formula-note">${esc(b.note)}</div>` : ''}
      </div>`;
    case 'dialog':
      return `<div class="card" style="padding:8px 16px">${b.lines
        .map(
          ([who, en, ru]) => `<div class="dialog-line">
            <span class="dialog-who">${esc(who)}</span>
            <div style="flex:1">
              <div class="dialog-en">${esc(en)} ${speakBtn(en)}</div>
              <div class="dialog-ru">${esc(ru)}</div>
            </div>
          </div>`,
        )
        .join('')}</div>`;
    default:
      return '';
  }
}

function renderTheory() {
  const { lesson } = s;
  return `
    <button class="btn btn-ghost mb-4" data-nav="roadmap">← К урокам</button>
    <div class="faint">${esc(lesson.levelCode)} · ${esc(lesson.unitTitle)}</div>
    <h1>${esc(lesson.title)}</h1>
    <p class="subtitle">Теория · ≈ ${lesson.duration} мин</p>

    ${lesson.theory.map((b) => `<div class="theory-block">${renderTheoryBlock(b)}</div>`).join('')}

    ${
      lesson.vocab.length
        ? `<h2>Слова урока</h2>
           ${lesson.vocab
             .map((id) => {
               const w = getWord(id);
               if (!w) return '';
               return `<div class="word-card">
                  ${speakBtn(w.en)}
                  <div style="min-width:150px">
                    <div class="word-en">${esc(w.en)}</div>
                    <div class="word-ipa">${esc(w.ipa)} · <span class="word-rus">${esc(w.rus)}</span></div>
                  </div>
                  <div style="flex:1">
                    <div class="word-ru">${esc(w.ru)}</div>
                    <div class="faint">${esc(w.example)} — ${esc(w.exampleRu)}</div>
                  </div>
                </div>`;
             })
             .join('')}`
        : ''
    }

    <div class="mt-6">
      <button class="btn btn-primary btn-lg" data-lesson-action="to-exercises">
        Перейти к упражнениям →
      </button>
    </div>
  `;
}

/* ---------- Рендер упражнений ---------- */

/**
 * Разбор ответа. Опечатка выделена отдельно от ошибки: смысл усвоен,
 * промахнулась рука. Считать её провалом значило бы занижать оценку
 * урока — а по этой оценке разбор прогресса потом советует, к чему
 * вернуться, и советовал бы неверно.
 */
function feedbackBlock(correctText) {
  if (s.verdict === VERDICT.CLOSE) {
    return `<div class="feedback ok" style="border-color:var(--amber);background:var(--amber-soft)">
        <strong>Почти — опечатка.</strong>
        Правильно пишется <strong>${esc(correctText)}</strong>.
      </div>`;
  }
  return `<div class="feedback ${s.wasRight ? 'ok' : 'no'}">
      <strong>${s.wasRight ? 'Верно! 🎉' : 'Не совсем.'}</strong>
      ${s.wasRight ? '' : ` Правильный ответ: <strong>${esc(correctText)}</strong>`}
    </div>`;
}

function renderExercise() {
  const { lesson, idx, answered, picked } = s;
  const ex = lesson.exercises[idx];

  const dots = lesson.exercises
    .map((_, i) => {
      const cls = i < idx ? 'done' : i === idx ? 'current' : '';
      return `<div class="ex-dot ${cls}"></div>`;
    })
    .join('');

  let body = '';

  if (ex.type === 'choice') {
    body = `
      <div class="ex-prompt">${esc(ex.prompt)}</div>
      ${s.shuffled[idx]
        .map((o) => {
          let cls = '';
          if (answered) {
            if (o === ex.answer) cls = ' correct';
            else if (o === picked) cls = ' wrong';
          }
          return `<button class="option${cls}" data-answer="${esc(o)}" ${answered ? 'disabled' : ''}>${esc(o)}</button>`;
        })
        .join('')}`;
  }

  if (ex.type === 'listen') {
    body = `
      <div class="ex-prompt">Прослушай и выбери слово</div>
      <div class="mb-4">
        <button class="btn btn-lg" data-speak="${esc(ex.word)}">🔊 Прослушать</button>
        <button class="btn btn-ghost" data-speak-slow="${esc(ex.word)}">🐢 Медленно</button>
      </div>
      ${s.shuffled[idx]
        .map((o) => {
          let cls = '';
          if (answered) {
            if (o === ex.word) cls = ' correct';
            else if (o === picked) cls = ' wrong';
          }
          return `<button class="option${cls}" data-answer="${esc(o)}" ${answered ? 'disabled' : ''}>${esc(o)}</button>`;
        })
        .join('')}`;
  }

  if (ex.type === 'order') {
    // chosen хранит индексы банка, а не слова — иначе повторяющиеся
    // слова в предложении убирали бы друг друга.
    const bank = s.shuffled[idx];
    const used = s.chosen;
    body = `
      <div class="ex-prompt">${esc(ex.prompt)}</div>
      <div class="answer-zone">
        ${used
          .map(
            (bankIdx, pos) =>
              `<button class="chip" data-unchoose="${pos}" ${answered ? 'disabled' : ''}>${esc(bank[bankIdx])}</button>`,
          )
          .join('') || '<span class="faint">Нажимай на слова ниже…</span>'}
      </div>
      <div class="word-bank">
        ${bank
          .map((w, i) =>
            used.includes(i)
              ? ''
              : `<button class="chip" data-choose="${i}" ${answered ? 'disabled' : ''}>${esc(w)}</button>`,
          )
          .join('')}
      </div>
      ${
        !answered
          ? `<button class="btn btn-primary" data-lesson-action="check" ${used.length ? '' : 'disabled'}>Проверить</button>`
          : ''
      }`;
  }

  if (ex.type === 'translate') {
    body = `
      <div class="ex-prompt">${esc(ex.prompt)}</div>
      <input class="text-input" data-typed placeholder="Напиши по-английски…"
             value="${esc(s.typed)}" ${answered ? 'disabled' : ''} autocomplete="off" />
      ${
        !answered
          ? '<button class="btn btn-primary mt-4" data-lesson-action="check">Проверить</button>'
          : ''
      }`;
  }

  const correctText =
    ex.type === 'listen' ? ex.word : ex.type === 'choice' ? ex.answer : ex.answer;

  return `
    <button class="btn btn-ghost mb-4" data-lesson-action="exit">← Выйти</button>
    <div class="faint">${esc(lesson.title)} · ${idx + 1} из ${lesson.exercises.length}</div>
    <div class="ex-progress mt-2">${dots}</div>

    <div class="exercise">
      ${body}

      ${
        answered
          ? `${feedbackBlock(correctText)}
            <button class="btn btn-primary btn-lg mt-4" data-lesson-action="next">
              ${idx + 1 < lesson.exercises.length ? 'Дальше →' : 'Завершить урок'}
            </button>`
          : ''
      }
    </div>
  `;
}

function renderDone() {
  const { lesson, correct } = s;
  const total = lesson.exercises.length;
  const pct = Math.round((correct / total) * 100);
  const words = lesson.vocab.length;
  return `
    <div class="lesson-complete">
      <div class="lesson-complete__mark">${pct >= 80 ? '🎉' : pct >= 50 ? '👍' : '💪'}</div>
      <div class="dashboard-kicker">УРОК ЗАВЕРШЁН</div>
      <h1>Отличная работа</h1>
      <p class="subtitle">${correct} из ${total} верно · ${pct}% результата</p>
      <div class="lesson-complete__stats">
        <div><strong>+25</strong><span>XP за урок</span></div>
        <div><strong>${correct}/${total}</strong><span>правильных ответов</span></div>
        <div><strong>${words}</strong><span>новых слов</span></div>
      </div>
      ${
        words
          ? `<p class="subtitle">Открыто ${plural(words, 'новое слово', 'новых слова', 'новых слов')} —
             теперь они в очереди повторений.</p>`
          : ''
      }
      <div class="row lesson-complete__actions" style="justify-content:center">
        <button class="btn btn-primary btn-lg" data-nav="review">Повторить слова</button>
        <button class="btn btn-lg" data-nav="roadmap">К списку уроков</button>
      </div>
    </div>`;
}

export function renderLesson() {
  if (!s) return '<div class="empty">Урок не найден</div>';
  if (s.phase === 'theory') return renderTheory();
  if (s.phase === 'done') return renderDone();
  return renderExercise();
}

/* ---------- Обработка действий ---------- */

function checkAnswer(value) {
  const ex = s.lesson.exercises[s.idx];
  let right = false;

  if (ex.type === 'choice') right = value === ex.answer;
  else if (ex.type === 'listen') right = value === ex.word;
  else if (ex.type === 'order') {
    const sentence = s.chosen.map((i) => s.shuffled[s.idx][i]).join(' ');
    right = normalize(sentence) === normalize(ex.answer);
  } else if (ex.type === 'translate') {
    // Единственное упражнение со свободным вводом — значит единственное,
    // где возможна опечатка. В остальных слова берутся из готовых вариантов,
    // и «почти» там означало бы неверный выбор, а не промах пальцем.
    s.verdict = scoreAttempt(ex.answer, [s.typed]).verdict;
    right = s.verdict !== VERDICT.WRONG;
  }

  s.answered = true;
  s.wasRight = right;
  s.picked = value;
  if (right) s.correct += 1;

  // Опечатка — между верным и неверным: смысл ты знаешь, написание пока нет
  addXp(s.verdict === VERDICT.CLOSE ? 7 : right ? 10 : 3);
  touchStudyDay();

  // Озвучиваем правильный вариант — связка «звук ↔ смысл» закрепляется лучше.
  if (ex.type === 'listen') speak(ex.word);
}

/** Возвращает true, если действие обработано и нужен ре-рендер. */
export function handleLessonAction(action, el) {
  if (!s) return false;

  switch (action) {
    case 'to-exercises':
      s.phase = 'exercises';
      return true;

    case 'exit':
      exitLesson();
      return 'roadmap';

    case 'check':
      checkAnswer(null);
      return true;

    case 'next': {
      if (s.idx + 1 < s.lesson.exercises.length) {
        s.idx += 1;
        s.answered = false;
        s.verdict = null;
        s.picked = null;
        s.chosen = [];
        s.typed = '';
      } else {
        const score = Math.round((s.correct / s.lesson.exercises.length) * 100);
        update((st) => {
          st.lessons[s.lesson.id] = { completedAt: new Date().toISOString(), score };
        });
        addXp(25);
        s.phase = 'done';
      }
      return true;
    }
  }
  return false;
}

export function handleAnswerClick(value) {
  if (!s || s.answered) return false;
  checkAnswer(value);
  return true;
}

export function handleChoose(bankIndex) {
  if (!s || s.answered) return false;
  s.chosen.push(Number(bankIndex));
  return true;
}

export function handleUnchoose(index) {
  if (!s || s.answered) return false;
  s.chosen.splice(Number(index), 1);
  return true;
}

export function syncTyped(value) {
  if (s) s.typed = value;
}
