import { listeningPhrases } from '../data/curriculum.js';
import { loadState, update, addXp, touchStudyDay } from '../core/storage.js';
import { diffWords, accuracy, isPerfect, WORD } from '../core/diff.js';
import { speak, speakSlow, isSupported } from '../core/speech.js';
import { esc, shuffle, plural, progressBar } from '../core/ui.js';
import { textsFor, getText, plainText, wordCount } from '../data/reading.js';
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
 * Аудирование: диктант по фразам и связный текст на слух.
 *
 * Диктант учит слышать каждое слово: варианты подсказывали бы ответ,
 * а запись требует расслышать и служебные слова, которые в беглой речи
 * проглатываются.
 *
 * Но фраза за фразой — это ещё не понимание речи. Связный текст держат
 * в голове целиком, не успевая разобрать каждое слово, и это отдельное
 * умение. Материал берём из раздела чтения: те же тексты, те же вопросы,
 * только текст закрыт. Открывается он после ответов — момент, когда
 * видно, что именно ты недослышал, и есть самое полезное в упражнении.
 */
let s = null;

export function startListening() {
  const state = loadState();
  s = {
    mode: s?.mode || 'phrases', // phrases | texts
    queue: shuffle(listeningPhrases(state.lessons)),
    typed: '',
    checked: false,
    steps: null,
    played: 0,
    done: 0,
    correct: 0,
    // Режим текстов
    text: null,
    phase: 'list', // list | listen | quiz | done
    quiz: null,
  };
}

export function setMode(mode) {
  if (!s) return false;
  s.mode = mode === 'texts' ? 'texts' : 'phrases';
  s.text = null;
  s.phase = 'list';
  s.quiz = null;
  return true;
}

export function exitListening() {
  s = null;
}

function current() {
  return s && s.queue.length ? s.queue[0] : null;
}

/** Проигрываем сразу при показе фразы — так упражнение начинается со звука. */
export function playCurrent(slow = false) {
  const phrase = current();
  if (!phrase) return false;
  s.played += 1;
  if (slow) speakSlow(phrase.en);
  else speak(phrase.en);
  return true;
}

function renderDiff() {
  const parts = s.steps
    .map((step) => {
      if (step.type === WORD.OK) {
        return `<span style="color:var(--green)">${esc(step.expected)}</span>`;
      }
      if (step.type === WORD.MISSING) {
        return `<span style="color:var(--red);text-decoration:underline">${esc(step.expected)}</span>`;
      }
      if (step.type === WORD.WRONG) {
        return `<span style="color:var(--amber)">${esc(step.expected)}</span><span class="faint"> (ты: ${esc(step.actual)})</span>`;
      }
      return `<span class="faint" style="text-decoration:line-through">${esc(step.actual)}</span>`;
    })
    .join(' ');

  const missed = s.steps.filter((x) => x.type === WORD.MISSING).map((x) => x.expected);
  const percent = Math.round(accuracy(s.steps) * 100);
  const perfect = isPerfect(s.steps);

  return `
    <div class="feedback ${perfect ? 'ok' : 'no'}">
      <strong>${perfect ? 'Всё верно 🎉' : `Расслышано ${percent}%`}</strong>
      <div style="font-size:17px;margin-top:10px;line-height:1.8">${parts}</div>
      ${
        missed.length
          ? `<div class="faint" style="margin-top:10px">
              Потеряно: ${missed.map((w) => `<strong>${esc(w)}</strong>`).join(', ')}.
              Чаще всего проглатываются именно короткие служебные слова — слушай ещё раз, следя за ними.
            </div>`
          : ''
      }
    </div>`;
}

const MODE_CHIP = 'border-color:var(--accent);color:var(--accent)';

function modeSwitch() {
  return `
    <div class="row mb-4" style="gap:6px">
      <button class="chip" style="${s.mode === 'phrases' ? MODE_CHIP : ''}" data-listen-mode="phrases">Фразы</button>
      <button class="chip" style="${s.mode === 'texts' ? MODE_CHIP : ''}" data-listen-mode="texts">Тексты</button>
    </div>`;
}

function renderTextList() {
  const state = loadState();
  const list = textsFor(levelNow());
  const heard = state.audioTexts || {};
  const read = state.reading || {};

  return `
    <h1>Аудирование</h1>
    <p class="subtitle">
      Связный текст на слух: разобрать каждое слово не успеваешь, и держать
      смысл приходится целиком. Это отдельное умение от диктанта.
    </p>
    ${modeSwitch()}

    <div class="grid grid-2">
      ${list
        .map((t) => {
          const done = heard[t.id];
          return `<button class="card" style="text-align:left;cursor:pointer" data-audio-text="${esc(t.id)}">
            <div class="row-between">
              <span class="level-code${done ? ' done' : ''}">${esc(t.level)}</span>
              ${done ? `<span class="word-status mastered">${done.score}%</span>` : ''}
            </div>
            <h3 style="margin:8px 0 2px">${esc(t.title)}</h3>
            <div class="faint">${esc(t.titleRu)}</div>
            <div class="faint mt-2">
              ${plural(wordCount(t), 'слово', 'слова', 'слов')}${
                read[t.id] ? ' · уже прочитан' : ''
              }
            </div>
          </button>`;
        })
        .join('')}
    </div>

    <p class="faint mt-6">
      Прочитанный текст слушать легче — но и это полезно: сначала глазами,
      потом на слух, и становится слышно, что раньше только читалось.
    </p>`;
}

function renderTextListen() {
  const t = s.text;
  return `
    <div class="row-between mb-4">
      <button class="btn btn-ghost" data-listen-textback>← К текстам</button>
      <span class="faint">${esc(t.level)} · ${plural(wordCount(t), 'слово', 'слова', 'слов')}</span>
    </div>

    <h1 style="margin-bottom:2px">${esc(t.titleRu)}</h1>
    <p class="faint">Название по-английски откроется вместе с текстом.</p>

    <div class="flashcard" style="padding:32px">
      <div class="row" style="justify-content:center">
        <button class="btn btn-lg" data-audio-play>🔊 Прослушать</button>
        <button class="btn btn-ghost" data-audio-slow>🐢 Медленно</button>
      </div>
      <div class="faint mt-4">
        ${
          s.played
            ? `Прослушано раз: ${s.played}. Слушать повторно не зазорно — на это упражнение и рассчитано.`
            : 'Текст закрыт: сейчас работают только уши.'
        }
      </div>
    </div>

    ${
      t.glossary.length
        ? `<div class="callout mt-4">
            <span class="callout-label">Новые слова</span>
            ${t.glossary.map((g) => `<strong>${esc(g.en)}</strong> — ${esc(g.ru)}`).join(' · ')}
          </div>`
        : ''
    }

    <button class="btn btn-primary btn-lg mt-6" style="width:100%" data-audio-quiz
            ${s.played ? '' : 'disabled'}>
      ${s.played ? 'Проверить понимание' : 'Сначала послушай'}
    </button>`;
}

function renderTextQuiz() {
  const q = currentQuestion(s.quiz, s.text.questions);
  const answered = s.quiz.picked !== null;
  const right = isCorrect(s.quiz, s.text.questions);

  return `
    <div class="row-between mb-4">
      <button class="btn btn-ghost" data-listen-textback>← К текстам</button>
      <span class="faint">Вопрос ${s.quiz.idx + 1} из ${s.quiz.order.length}</span>
    </div>
    ${progressBar(quizProgress(s.quiz))}

    <div class="row mt-4">
      <button class="btn btn-ghost" data-audio-play>🔊 Ещё раз</button>
    </div>

    <div class="exercise mt-4">
      <div class="ex-prompt">${esc(q.q)}</div>
      ${currentOptions(s.quiz)
        .map((o) => {
          const cls = !answered ? '' : o === q.answer ? ' correct' : o === s.quiz.picked ? ' wrong' : '';
          return `<button class="option${cls}" ${answered ? 'disabled' : ''} data-audio-answer="${esc(o)}">${esc(o)}</button>`;
        })
        .join('')}

      ${
        answered
          ? `<div class="feedback ${right ? 'ok' : 'no'}">
              <strong>${right ? 'Верно.' : 'Не то.'}</strong>
              ${right ? '' : ` Прозвучало: <strong>${esc(q.answer)}</strong>`}
            </div>
            <button class="btn btn-primary btn-lg mt-4" data-audio-next>
              ${s.quiz.idx + 1 < s.quiz.order.length ? 'Дальше →' : 'Итог'}
            </button>`
          : ''
      }
    </div>`;
}

/**
 * Итог — и сразу расшифровка. Это главный момент упражнения: пока звучание
 * ещё в голове, видно, какое слово ты услышал не так.
 */
function renderTextDone() {
  const t = s.text;
  const { right, total, percent } = quizScore(s.quiz);

  return `
    <div class="row-between mb-4">
      <button class="btn btn-ghost" data-listen-textback>← К текстам</button>
      <span class="faint">${right} из ${total} · ${percent}%</span>
    </div>

    <h1 style="margin-bottom:2px">${esc(t.title)}</h1>
    <p class="faint">${esc(t.titleRu)}</p>

    <div class="card mt-4" style="line-height:1.7;font-size:17px">
      ${t.paragraphs.map((p) => `<p style="margin:0 0 14px">${esc(p)}</p>`).join('')}
    </div>

    <p class="faint mt-4">
      ${
        percent >= 80
          ? 'Связная речь разобрана. Сравни с текстом — обычно пара мест всё равно звучала иначе, чем написано.'
          : 'Прочти и послушай ещё раз: со второй попытки на слух ложится заметно больше.'
      }
    </p>

    <div class="row mt-4">
      <button class="btn" data-audio-play>🔊 Прослушать снова</button>
      <button class="btn btn-primary" data-audio-text="${esc(t.id)}">Пройти заново</button>
    </div>`;
}

function renderTextsMode() {
  if (!s.text || s.phase === 'list') return renderTextList();
  if (s.phase === 'listen') return renderTextListen();
  if (s.phase === 'quiz') return renderTextQuiz();
  return renderTextDone();
}

export function renderListening() {
  if (!isSupported()) {
    return `
      <h1>Аудирование</h1>
      <div class="callout warn mt-4">
        <span class="callout-label">Недоступно</span>
        В этом браузере нет синтеза речи, а без него диктант невозможен.
        Открой портал в Chrome или Edge.
      </div>
      <button class="btn btn-primary mt-4" data-nav="dashboard">На главную</button>`;
  }

  if (!s) startListening();
  if (s.mode === 'texts') return renderTextsMode();

  if (!s.queue.length) {
    return `
      <div class="empty">
        <div class="empty-icon">📘</div>
        <h1>${s.done ? 'Фразы закончились' : 'Сначала урок'}</h1>
        <p class="subtitle">
          ${
            s.done
              ? `Разобрано ${plural(s.done, 'фраза', 'фразы', 'фраз')}, из них верно ${s.correct}. Пройди новые уроки — добавятся новые фразы.`
              : 'Диктант собирается из диалогов и примеров пройденных уроков.'
          }
        </p>
        <div class="row" style="justify-content:center">
          <button class="btn btn-primary btn-lg" data-nav="roadmap">К урокам</button>
          <button class="btn btn-lg" data-listen-mode="texts">Слушать тексты</button>
        </div>
      </div>`;
  }

  const phrase = current();

  return `
    <div class="row-between mb-4">
      <button class="btn btn-ghost" data-nav="dashboard">← Выйти</button>
      <span class="faint">Осталось: ${s.queue.length}</span>
    </div>

    <h1>Диктант</h1>
    <p class="subtitle">Прослушай и запиши, что услышал. Регистр и знаки препинания не важны.</p>
    ${modeSwitch()}

    <div class="flashcard" style="padding:32px">
      <div class="row" style="justify-content:center">
        <button class="btn btn-lg" data-listen-play>🔊 Прослушать</button>
        <button class="btn btn-ghost" data-listen-slow>🐢 Медленно</button>
      </div>
      <div class="faint mt-4">
        Прослушано раз: ${s.played}${s.played > 3 ? ' — попробуй записать хотя бы часть' : ''}
      </div>
      ${
        s.checked
          ? `<div class="flash-example" style="margin-top:20px">${esc(phrase.en)}</div>
             <div class="flash-example-ru">${esc(phrase.ru)}</div>
             <div class="faint" style="margin-top:6px">из урока «${esc(phrase.source)}»</div>`
          : ''
      }
    </div>

    <input class="text-input" data-listen-input placeholder="Запиши услышанное…"
           value="${esc(s.typed)}" ${s.checked ? 'disabled' : ''} autocomplete="off" autocapitalize="off" />

    ${s.checked ? renderDiff() : ''}

    <div class="row mt-4">
      ${
        s.checked
          ? `<button class="btn btn-primary btn-lg" data-listen-next>Дальше →</button>
             <button class="btn" data-listen-replay>🔊 Ещё раз</button>`
          : `<button class="btn btn-primary btn-lg" data-listen-check>Проверить</button>`
      }
    </div>
  `;
}

/* ---------- Текст на слух ---------- */

function levelNow() {
  return loadState().level || 'A0';
}

export function openAudioText(id) {
  const text = getText(id);
  if (!text || !s) return false;
  s.text = text;
  s.phase = 'listen';
  s.played = 0;
  s.quiz = createQuiz(text.questions);
  return true;
}

export function backToTextList() {
  if (!s) return false;
  s.text = null;
  s.phase = 'list';
  s.quiz = null;
  return true;
}

/**
 * Проигрывает текст целиком. Перематывать по абзацам намеренно нельзя:
 * связную речь слушают потоком, а разбор по кусочкам — это уже диктант,
 * он в соседнем режиме.
 */
export function playAudioText(slow = false) {
  if (!s?.text) return false;
  s.played += 1;
  const body = plainText(s.text);
  if (slow) speakSlow(body);
  else speak(body);
  return true;
}

export function startAudioQuestions() {
  if (!s || s.phase !== 'listen') return false;
  s.phase = 'quiz';
  return true;
}

export function answerAudioQuestion(value) {
  if (!s || s.phase !== 'quiz') return false;
  return answerQuiz(s.quiz, s.text.questions, value);
}

export function nextAudioQuestion() {
  if (!s || s.phase !== 'quiz') return false;
  const { moved, finished } = advanceQuiz(s.quiz);
  if (!moved) return false;
  if (!finished) return true;

  const { right, percent } = quizScore(s.quiz);
  s.phase = 'done';

  update((st) => {
    const before = st.audioTexts?.[s.text.id];
    // Прослушанный текст отмечаем отдельно от прочитанного: понять
    // на слух и понять глазами — разные умения, и общая галочка
    // скрывала бы, какое из них ещё не тренировалось
    st.audioTexts = {
      ...(st.audioTexts || {}),
      [s.text.id]: { score: Math.max(percent, before?.score ?? 0), at: new Date().toISOString() },
    };
  });
  addXp(right * 4);
  touchStudyDay();
  return true;
}

/* ---------- Действия ---------- */

export function syncTyped(value) {
  if (s) s.typed = value;
}

export function handleCheck() {
  if (!s || s.checked) return false;
  const phrase = current();
  if (!phrase) return false;

  s.steps = diffWords(phrase.en, s.typed);
  s.checked = true;

  const perfect = isPerfect(s.steps);
  if (perfect) s.correct += 1;

  update((st) => {
    st.listening = st.listening || { attempts: 0, perfect: 0 };
    st.listening.attempts += 1;
    if (perfect) st.listening.perfect += 1;
  });

  addXp(perfect ? 8 : Math.round(accuracy(s.steps) * 5));
  touchStudyDay();

  // Услышать фразу сразу после разбора полезнее всего: теперь видно текст
  speak(phrase.en);
  return true;
}

export function handleNext() {
  if (!s) return false;
  s.queue.shift();
  s.done += 1;
  s.typed = '';
  s.checked = false;
  s.steps = null;
  s.played = 0;
  return true;
}
