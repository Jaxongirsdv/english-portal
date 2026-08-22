import { loadState, addXp, touchStudyDay, update } from '../core/storage.js';
import { unlockedVocabIds } from '../data/curriculum.js';
import { hasKey, describeError, currentProvider, PROVIDERS } from '../core/ai.js';
import { scenariosFor, getScenario, sendTurn } from '../core/dialogue.js';
import { speak } from '../core/speech.js';
import { esc } from '../core/ui.js';

/**
 * Экран разговора.
 *
 * Здесь язык впервые для чего-то нужен, поэтому экран устроен как переписка,
 * а не как упражнение: реплики подряд, поле внизу, разбор ошибки сбоку.
 *
 * Перевод каждой реплики спрятан под кнопку, а не показан сразу. Показанный
 * перевод читают вместо английского — и разговор превращается в чтение
 * русского текста.
 */
let s = null;

export function startDialogue() {
  s = s?.scenario ? s : { scenario: null, messages: [], loading: false, error: null, typed: '', hint: false };
}

export function exitDialogue() {
  s = null;
}

function level() {
  return loadState().level || 'A0';
}

export function chooseScenario(id) {
  const scenario = getScenario(id);
  if (!scenario) return false;
  s = {
    scenario,
    // Первую реплику говорит собеседник — иначе разговор надо начинать
    // с чистого листа, а это самое трудное
    messages: [{ role: 'assistant', en: scenario.opener, ru: scenario.openerRu, shown: false }],
    loading: false,
    error: null,
    typed: '',
    hint: false,
    suggestion: '',
  };
  if (loadState().settings.autoSpeak) speak(scenario.opener);
  return true;
}

export function leaveScenario() {
  s = { scenario: null, messages: [], loading: false, error: null, typed: '', hint: false };
  return true;
}

export function syncTyped(value) {
  if (s) s.typed = value;
}

export function toggleTranslation(index) {
  const i = Number(index);
  if (!s || !s.messages[i]) return false;
  s.messages[i].shown = !s.messages[i].shown;
  return true;
}

export function toggleHint() {
  if (!s) return false;
  s.hint = !s.hint;
  return true;
}

export async function handleSend(rerender) {
  if (!s || !s.scenario || s.loading) return;
  const text = s.typed.trim();
  if (!text) return;

  s.messages.push({ role: 'user', en: text, ru: '', shown: false });
  s.typed = '';
  s.hint = false;
  s.loading = true;
  s.error = null;
  rerender();

  try {
    const state = loadState();
    const result = await sendTurn({
      scenario: s.scenario,
      level: level(),
      wordIds: unlockedVocabIds(state.lessons),
      history: s.messages.map(({ role, en }) => ({ role, en })),
    });

    s.messages.push({
      role: 'assistant',
      en: result.reply,
      ru: result.replyRu,
      shown: false,
      correction: result.correction,
    });
    s.suggestion = result.suggestion;

    // Опыт — за участие, а не за оценку модели. Двигать интервалы
    // повторений её похвала не может: прогресс меняют только
    // объективные проверки.
    addXp(4);
    touchStudyDay();
    update((st) => {
      st.dialogue = { turns: (st.dialogue?.turns || 0) + 1 };
    });

    if (state.settings.autoSpeak) speak(result.reply);
  } catch (err) {
    // Реплику возвращаем в поле: терять набранное из-за обрыва сети обидно
    s.typed = text;
    s.messages.pop();
    s.error = describeError(err);
  }
  s.loading = false;
  rerender();
}

/* ---------- Отрисовка ---------- */

function renderNoKey() {
  const p = PROVIDERS[currentProvider()];
  return `
    <h1>Разговор</h1>
    <p class="subtitle">Единственное место в портале, где язык не тренируют, а используют.</p>
    <div class="callout warn mt-4">
      <span class="callout-label">Нужен ключ</span>
      Разговор идёт через ${esc(p.label)}, а ключ пока не задан.
      ${p.free ? 'Бесплатный уровень для этого подходит.' : 'Учти, что каждая реплика платная.'}
      <div class="mt-4"><button class="btn btn-primary" data-nav="settings">В настройки</button></div>
    </div>
    <p class="faint mt-4">
      Остальные разделы от этого не зависят: уроки, повторения и произношение
      работают без ключа и без интернета.
    </p>`;
}

function renderPicker() {
  const list = scenariosFor(level());
  return `
    <h1>Разговор</h1>
    <p class="subtitle">
      Собеседник говорит только теми словами, которые ты уже проходил.
      Ошибку разбирает по одной за реплику — чтобы не отбить охоту говорить.
    </p>
    <div class="grid grid-2 mt-6">
      ${list
        .map(
          (sc) => `<button class="card" style="text-align:left;cursor:pointer" data-scene="${esc(sc.id)}">
            <div style="font-size:26px">${sc.icon}</div>
            <h3 style="margin:6px 0 4px">${esc(sc.title)}</h3>
            <div class="faint">${esc(sc.goal)}</div>
          </button>`,
        )
        .join('')}
    </div>
    <p class="faint mt-6">
      Разбор ошибок здесь не влияет на интервалы повторений: языковая модель
      ошибается и легко хвалит, а прогресс в портале двигают только
      объективные проверки.
    </p>`;
}

function renderMessage(m, i) {
  const mine = m.role === 'user';
  return `
    <div class="turn ${mine ? 'mine' : 'theirs'}">
      <div class="turn-text">${esc(m.en)}</div>
      ${
        !mine
          ? `<div class="turn-tools">
              <button class="btn-speak" data-speak="${esc(m.en)}" title="Произнести" aria-label="Произнести реплику">🔊</button>
              <button class="btn-speak" data-translate="${i}" title="Перевод" aria-label="Показать перевод">🇷🇺</button>
            </div>
            ${m.shown && m.ru ? `<div class="turn-ru">${esc(m.ru)}</div>` : ''}`
          : ''
      }
    </div>
    ${
      m.correction
        ? `<div class="feedback ok" style="border-color:var(--amber);background:var(--amber-soft);margin:6px 0 14px">
            <strong>${esc(m.correction.original)}</strong> → <strong>${esc(m.correction.fixed)}</strong>
            ${m.correction.explanation ? `<br /><span class="faint">${esc(m.correction.explanation)}</span>` : ''}
          </div>`
        : ''
    }`;
}

export function renderDialogue() {
  if (!s) startDialogue();
  if (!hasKey()) return renderNoKey();
  if (!s.scenario) return renderPicker();

  return `
    <div class="row-between mb-4">
      <button class="btn btn-ghost" data-scene-exit>← Другая сцена</button>
      <span class="faint">${s.scenario.icon} ${esc(s.scenario.title)}</span>
    </div>

    <div class="chat">
      ${s.messages.map(renderMessage).join('')}
      ${s.loading ? '<div class="turn theirs"><div class="turn-text faint">…печатает</div></div>' : ''}
    </div>

    ${s.error ? `<div class="feedback no">${esc(s.error)}</div>` : ''}

    ${
      s.hint && s.suggestion
        ? `<div class="callout mt-4"><span class="callout-label">Можно ответить</span>${esc(s.suggestion)}</div>`
        : ''
    }

    <input class="text-input mt-4" data-chat-input placeholder="Ответь по-английски…"
           value="${esc(s.typed)}" ${s.loading ? 'disabled' : ''}
           autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false" />
    <div class="row mt-4">
      <button class="btn btn-primary" data-chat-send ${s.loading ? 'disabled' : ''}>Отправить</button>
      ${s.suggestion ? '<button class="btn btn-ghost" data-chat-hint>Подсказка</button>' : ''}
    </div>
  `;
}
