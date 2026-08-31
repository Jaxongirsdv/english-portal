import { findLesson } from '../data/curriculum.js';
import { getWord } from '../data/vocab.js';
import { loadState, update, addXp, touchStudyDay } from '../core/storage.js';
import { nextCurriculumStep } from '../core/curriculum-progress.js';
import {
  LESSON_COMPLETE_PERCENT,
  LESSON_MASTERY_PERCENT,
  isLessonMastered,
  lessonAttempt,
} from '../core/lesson-progress.js';
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
    theoryIdx: 0,
    vocabIdx: 0,
    theoryCheckShown: false,
    exercises: lesson.exercises,
    idx: 0,
    correct: 0,
    mistakes: [],
    completionXp: 0,
    answered: false,
    wasRight: false,
    verdict: null, // exact | close | wrong — только для перевода
    picked: null,
    chosen: [], // индексы выбранных слов в «собери предложение»
    typed: '',
    // Порядок вариантов перемешиваем при каждом входе в урок и держим
    // в состоянии сессии, а не на объекте урока: иначе при повторном
    // прохождении ответ узнавался бы по позиции, а не по смыслу.
    shuffled: shuffledExercises(lesson.exercises),
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
  const { lesson, theoryIdx } = s;
  const block = lesson.theory[theoryIdx];
  const checks = lesson.exercises.filter((exercise) => exercise.type === 'choice');
  const check = checks[theoryIdx % checks.length];
  const last = theoryIdx === lesson.theory.length - 1;
  return `
    ${renderLessonHeader('theory')}
    <main class="lesson-focus-card">
      <div class="row-between"><div class="dashboard-kicker">ТЕОРИЯ · ШАГ ${theoryIdx + 1} ИЗ ${lesson.theory.length}</div><span class="faint">${esc(lesson.levelCode)} · ${esc(lesson.unitTitle)}</span></div>
      <h1>${esc(lesson.title)}</h1>
      <div class="lesson-theory-content">${renderTheoryBlock(block)}</div>
      ${check ? `<div class="lesson-recall">
        <div class="dashboard-kicker">БЫСТРАЯ ПРОВЕРКА ПАМЯТИ</div>
        <strong>${esc(check.prompt)}</strong>
        ${s.theoryCheckShown ? `<div class="feedback ok">Ответ: <strong>${esc(check.answer)}</strong></div>` : '<button class="btn btn-ghost" data-lesson-action="reveal-check">Показать ответ</button>'}
      </div>` : ''}
      <div class="lesson-focus-actions">
        ${theoryIdx > 0 ? '<button class="btn" data-lesson-action="prev-theory">← Назад</button>' : '<span></span>'}
        <button class="btn btn-primary btn-lg" data-lesson-action="${last ? (lesson.vocab.length ? 'to-vocab' : 'to-exercises') : 'next-theory'}">${last ? (lesson.vocab.length ? 'Перейти к словам' : 'Начать практику') : 'Следующий шаг'} →</button>
      </div>
    </main>
  `;
}

function renderVocabulary() {
  const { lesson, vocabIdx } = s;
  const word = getWord(lesson.vocab[vocabIdx]);
  const last = vocabIdx === lesson.vocab.length - 1;
  if (!word) return '';
  return `${renderLessonHeader('vocab')}
    <main class="lesson-focus-card lesson-vocab-focus">
      <div class="row-between"><div class="dashboard-kicker">СЛОВА · ${vocabIdx + 1} ИЗ ${lesson.vocab.length}</div><span class="faint">Слушай и повторяй вслух</span></div>
      <div class="lesson-word-main">
        ${speakBtn(word.en)}
        <h1>${esc(word.en)}</h1>
        <div class="word-ipa">${esc(word.ipa)} · <span class="word-rus">${esc(word.rus)}</span></div>
        <div class="word-ru">${esc(word.ru)}</div>
      </div>
      <div class="lesson-word-example"><strong>${esc(word.example)}</strong><span>${esc(word.exampleRu)}</span>${speakBtn(word.example)}</div>
      <div class="lesson-focus-actions">
        ${vocabIdx > 0 ? '<button class="btn" data-lesson-action="prev-vocab">← Назад</button>' : '<span></span>'}
        <button class="btn btn-primary btn-lg" data-lesson-action="${last ? 'to-exercises' : 'next-vocab'}">${last ? 'Начать практику' : 'Следующее слово'} →</button>
      </div>
    </main>`;
}

function renderLessonHeader(active) {
  const stages = [['theory', 'Теория'], ['vocab', 'Слова'], ['exercises', 'Практика'], ['done', 'Результат']];
  const activeIndex = stages.findIndex(([id]) => id === active);
  return `<div class="lesson-topbar"><button class="btn btn-ghost" data-lesson-action="exit">← Выйти</button><div class="lesson-stagebar">${stages.map(([id, label], index) => `<span class="${index < activeIndex ? 'done' : index === activeIndex ? 'current' : ''}${id === 'vocab' && !s.lesson.vocab.length ? ' skipped' : ''}"><i>${index < activeIndex ? '✓' : index + 1}</i>${label}</span>`).join('')}</div></div>`;
}

function shuffledExercises(exercises) {
  return exercises.map((ex) => {
    if (ex.type === 'choice' || ex.type === 'listen') return shuffle(ex.options);
    if (ex.type === 'order') return shuffle(ex.words);
    return null;
  });
}

/* ---------- Рендер упражнений ---------- */

/**
 * Разбор ответа. Опечатка выделена отдельно от ошибки: смысл усвоен,
 * промахнулась рука. Считать её провалом значило бы занижать оценку
 * урока — а по этой оценке разбор прогресса потом советует, к чему
 * вернуться, и советовал бы неверно.
 */
function feedbackBlock(correctText, exercise) {
  if (s.verdict === VERDICT.CLOSE) {
    return `<div class="feedback ok" style="border-color:var(--amber);background:var(--amber-soft)">
        <strong>Почти — опечатка.</strong>
        Правильно пишется <strong>${esc(correctText)}</strong>.
      </div>`;
  }
  return `<div class="feedback ${s.wasRight ? 'ok' : 'no'}">
      <strong>${s.wasRight ? 'Верно! 🎉' : 'Не совсем.'}</strong>
      ${s.wasRight ? '' : ` Правильный ответ: <strong>${esc(correctText)}</strong>`}
      <div class="lesson-answer-note">${answerExplanation(exercise, correctText)}</div>
    </div>`;
}

function answerExplanation(exercise, correctText) {
  if (exercise.type === 'listen') return `В записи прозвучало: <strong>${esc(correctText)}</strong>. Прослушай ещё раз и повтори вслух.`;
  if (exercise.type === 'order') return `Правильный порядок слов: <strong>${esc(correctText)}</strong>.`;
  if (exercise.type === 'translate') return `Используй эту модель как готовую опору: <strong>${esc(correctText)}</strong>.`;
  return `Связка для запоминания: <strong>${esc(exercise.prompt)}</strong> → <strong>${esc(correctText)}</strong>.`;
}

function renderExercise() {
  const { lesson, exercises, idx, answered, picked } = s;
  const ex = exercises[idx];

  const dots = exercises
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
    ${renderLessonHeader('exercises')}
    <main class="lesson-practice-shell">
      <div class="row-between"><div><div class="dashboard-kicker">ПРАКТИКА · ${idx + 1} ИЗ ${exercises.length}</div><h2>${esc(lesson.title)}</h2></div><strong class="lesson-live-score">${s.correct} верно</strong></div>
      <div class="ex-progress mt-2">${dots}</div>
      <div class="exercise">
      ${body}

      ${
        answered
          ? `${feedbackBlock(correctText, ex)}
            <button class="btn btn-primary btn-lg mt-4" data-lesson-action="next">
              ${idx + 1 < exercises.length ? 'Дальше →' : 'Завершить урок'}
            </button>`
          : ''
      }
      </div>
    </main>
  `;
}

function renderDone() {
  const { lesson, exercises, correct } = s;
  const total = exercises.length;
  const pct = Math.round((correct / total) * 100);
  const mastered = pct >= LESSON_MASTERY_PERCENT;
  const completed = pct >= LESSON_COMPLETE_PERCENT;
  const words = lesson.vocab.length;
  const next = nextCurriculumStep(loadState());
  return `
    ${renderLessonHeader('done')}
    <div class="lesson-complete">
      <div class="lesson-complete__mark">${mastered ? '🎉' : completed ? '↻' : '!'}</div>
      <div class="dashboard-kicker">${mastered ? 'УРОК ОСВОЕН' : completed ? 'ПРАКТИКА ЗАВЕРШЕНА' : 'ПОПЫТКА ЗАВЕРШЕНА'}</div>
      <h1>${mastered ? 'Материал усвоен' : completed ? `Закрепи результат до ${LESSON_MASTERY_PERCENT}%` : 'Сначала повтори объяснение'}</h1>
      <p class="subtitle">${correct} из ${total} верно · ${pct}% результата</p>
      <div class="lesson-complete__stats">
        <div><strong>+${s.completionXp}</strong><span>бонус за освоение</span></div>
        <div><strong>${correct}/${total}</strong><span>правильных ответов</span></div>
        <div><strong>${s.mistakes.length}</strong><span>нужно повторить</span></div>
      </div>
      ${
        words
          ? `<p class="subtitle">Открыто ${plural(words, 'новое слово', 'новых слова', 'новых слов')} —
             теперь они в очереди повторений.</p>`
          : ''
      }
      ${!mastered && s.mistakes.length
        ? `<div class="callout warn"><span class="callout-label">Следующий урок пока закрыт</span>${completed ? 'Повтори только ошибки и подними результат до 80%.' : 'Вернись к теории или повтори ошибки. Для освоения нужно 80%.'}</div>`
        : '<div class="callout tip"><span class="callout-label">Освоено</span>Следующий урок открыт. Новые слова уже добавлены в повторение.</div>'}
      <div class="row lesson-complete__actions" style="justify-content:center">
        ${!mastered && s.mistakes.length ? '<button class="btn btn-primary btn-lg" data-lesson-action="retry-mistakes">Повторить ошибки</button>' : next ? `<button class="btn btn-primary btn-lg" data-nav="${esc(next.route)}">${next.type === 'milestone' ? `Пройти milestone ${esc(next.level.code)}` : 'Следующий урок'} →</button>` : ''}
        <button class="btn btn-lg" data-nav="review">Повторить слова</button>
        <button class="btn btn-lg" data-nav="roadmap">К списку уроков</button>
      </div>
    </div>`;
}

export function renderLesson() {
  if (!s) return '<div class="empty">Урок не найден</div>';
  if (s.phase === 'theory') return renderTheory();
  if (s.phase === 'vocab') return renderVocabulary();
  if (s.phase === 'done') return renderDone();
  return renderExercise();
}

/* ---------- Обработка действий ---------- */

function checkAnswer(value) {
  const ex = s.exercises[s.idx];
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
  else if (!s.mistakes.includes(ex)) s.mistakes.push(ex);

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
    case 'reveal-check':
      s.theoryCheckShown = true;
      return true;

    case 'prev-theory':
      s.theoryIdx = Math.max(0, s.theoryIdx - 1);
      s.theoryCheckShown = false;
      return true;

    case 'next-theory':
      s.theoryIdx = Math.min(s.lesson.theory.length - 1, s.theoryIdx + 1);
      s.theoryCheckShown = false;
      return true;

    case 'to-vocab':
      s.phase = 'vocab';
      s.vocabIdx = 0;
      return true;

    case 'prev-vocab':
      s.vocabIdx = Math.max(0, s.vocabIdx - 1);
      return true;

    case 'next-vocab':
      s.vocabIdx = Math.min(s.lesson.vocab.length - 1, s.vocabIdx + 1);
      return true;

    case 'to-exercises':
      s.phase = 'exercises';
      return true;

    case 'retry-mistakes':
      if (!s.mistakes.length) return false;
      s.exercises = [...s.mistakes];
      s.shuffled = shuffledExercises(s.exercises);
      s.mistakes = [];
      s.correct = 0;
      resetExercise();
      s.phase = 'exercises';
      return true;

    case 'exit':
      exitLesson();
      return 'roadmap';

    case 'check':
      checkAnswer(null);
      return true;

    case 'next': {
      if (s.idx + 1 < s.exercises.length) {
        s.idx += 1;
        resetExercise(false);
      } else {
        const score = Math.round((s.correct / s.exercises.length) * 100);
        let firstMastery = false;
        update((st) => {
          const previous = st.lessons[s.lesson.id];
          firstMastery = score >= LESSON_MASTERY_PERCENT && !isLessonMastered(previous);
          st.lessons[s.lesson.id] = lessonAttempt(previous, score);
        });
        s.completionXp = firstMastery ? 25 : 0;
        if (firstMastery) addXp(25);
        s.phase = 'done';
      }
      return true;
    }
  }
  return false;
}

function resetExercise(resetIndex = true) {
  if (resetIndex) s.idx = 0;
  s.answered = false;
  s.wasRight = false;
  s.verdict = null;
  s.picked = null;
  s.chosen = [];
  s.typed = '';
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
