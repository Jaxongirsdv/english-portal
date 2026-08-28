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

const OFFLINE_DIALOGUES = {
  meeting: [
    { choices: ['My name is Jahongir.', 'Hello! I am Jahongir.'], reply: 'Nice to meet you! Where are you from?', ru: 'Приятно познакомиться! Откуда ты?' },
    { choices: ['I am from Uzbekistan.', 'I live in Uzbekistan.'], reply: 'Great! How are you today?', ru: 'Здорово! Как ты сегодня?' },
    { choices: ['I am fine, thank you.', 'I am good. And you?'], reply: 'I am good too. It was nice to meet you!', ru: 'У меня тоже всё хорошо. Было приятно познакомиться!' },
  ],
  cafe: [
    { choices: ['I would like tea, please.', 'Can I have coffee, please?'], reply: 'Of course. Would you like something to eat?', ru: 'Конечно. Хотите что-нибудь поесть?' },
    { choices: ['Yes, a sandwich, please.', 'No, thank you.'], reply: 'All right. Is that everything?', ru: 'Хорошо. Это всё?' },
    { choices: ['Yes. How much is it?', 'Yes, that is all. Thank you.'], reply: 'It is five dollars. Have a nice day!', ru: 'Пять долларов. Хорошего дня!' },
  ],
  directions: [
    { choices: ['Yes. Where is the bank?', 'Can you help me find the station?'], reply: 'Go straight and turn left at the cafe.', ru: 'Идите прямо и поверните налево у кафе.' },
    { choices: ['Is it far from here?', 'Do I turn left at the cafe?'], reply: 'No, it is about five minutes from here.', ru: 'Нет, это примерно в пяти минутах отсюда.' },
    { choices: ['Thank you for your help.', 'Great, thank you very much.'], reply: 'You are welcome. Have a good day!', ru: 'Пожалуйста. Хорошего дня!' },
  ],
  day: [
    { choices: ['It was good. I worked.', 'It was busy, but good.'], reply: 'What did you do after work?', ru: 'Что ты делал после работы?' },
    { choices: ['I went home and cooked dinner.', 'I met my friend after work.'], reply: 'That sounds nice. Did you watch anything?', ru: 'Звучит хорошо. Ты что-нибудь смотрел?' },
    { choices: ['Yes, I watched a film.', 'No, I read a book.'], reply: 'Sounds like a good evening!', ru: 'Похоже на хороший вечер!' },
  ],
  work: [
    { choices: ['I work as an engineer.', 'I work in an office.'], reply: 'Interesting. What do you usually do at work?', ru: 'Интересно. Чем ты обычно занимаешься на работе?' },
    { choices: ['I solve problems and work with people.', 'I plan projects and write reports.'], reply: 'What do you like about your job?', ru: 'Что тебе нравится в твоей работе?' },
    { choices: ['I like learning new things.', 'I like working with my team.'], reply: 'That is important. Good luck with your work!', ru: 'Это важно. Удачи в работе!' },
  ],
  opinion: [
    { choices: ['I agree because it saves time.', 'I partly agree with you.'], reply: 'What is the main advantage for you?', ru: 'Какое главное преимущество для тебя?' },
    { choices: ['People can work more comfortably.', 'There is no time lost on the road.'], reply: 'That makes sense. Are there any disadvantages?', ru: 'Логично. Есть ли недостатки?' },
    { choices: ['Yes, communication can be more difficult.', 'Some people may feel lonely.'], reply: 'I agree. A balance between both can work well.', ru: 'Согласен. Баланс между двумя форматами может хорошо работать.' },
  ],
};

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
    mode: hasKey() ? 'ai' : 'offline',
    offlineStep: 0,
    completed: false,
  };
  if (loadState().settings.autoSpeak) speak(scenario.opener);
  return true;
}

export function handleOfflineChoice(index) {
  if (!s?.scenario || s.mode !== 'offline' || s.completed) return false;
  const steps = OFFLINE_DIALOGUES[s.scenario.id] || OFFLINE_DIALOGUES.meeting;
  const step = steps[s.offlineStep];
  const choice = step?.choices[Number(index)];
  if (!step || !choice) return false;

  s.messages.push({ role: 'user', en: choice, ru: '', shown: false });
  s.messages.push({ role: 'assistant', en: step.reply, ru: step.ru, shown: false });
  s.offlineStep += 1;
  s.completed = s.offlineStep >= steps.length;
  if (s.completed) {
    addXp(8);
    touchStudyDay();
    update((st) => {
      const completedScenarios = new Set(st.dialogue?.completedScenarios || []);
      completedScenarios.add(s.scenario.id);
      st.dialogue = {
        ...(st.dialogue || {}),
        offlineCompleted: (st.dialogue?.offlineCompleted || 0) + 1,
        completedScenarios: [...completedScenarios],
      };
    });
  }
  if (loadState().settings.autoSpeak) speak(step.reply);
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
      st.dialogue = { ...(st.dialogue || {}), turns: (st.dialogue?.turns || 0) + 1 };
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

function renderPicker() {
  const list = scenariosFor(level());
  const aiReady = hasKey();
  const completed = new Set(loadState().dialogue?.completedScenarios || []);
  const completedCount = list.filter((scenario) => completed.has(scenario.id)).length;
  const progress = list.length ? Math.round((completedCount / list.length) * 100) : 0;
  return `
    <h1>Разговор</h1>
    <p class="subtitle">
      ${aiReady ? 'Свободный AI-разговор с разбором ошибок.' : 'Бесплатные офлайн-диалоги работают без ключа и интернета.'}
    </p>
    <div class="dialogue-mode"><span class="dialogue-mode__dot"></span><div><strong>${aiReady ? `AI · ${esc(PROVIDERS[currentProvider()].label)}` : 'Офлайн-режим'}</strong><small>${aiReady ? 'Можно отвечать своими словами' : 'Выбирай подходящую английскую реплику'}</small></div>${!aiReady ? '<button class="btn btn-ghost" data-nav="settings">Подключить AI</button>' : ''}</div>
    ${!aiReady ? `<div class="dialogue-progress"><div class="row-between"><strong>Разговорный маршрут</strong><span>${completedCount} из ${list.length}</span></div><div class="progress-track"><span style="width:${progress}%"></span></div><small>${completedCount === list.length ? 'Все доступные темы пройдены. Повтори любую, чтобы закрепить фразы.' : 'Завершай темы по одной: результат сохранится в прогрессе.'}</small></div>` : ''}
    <div class="grid grid-2 mt-6">
      ${list
        .map(
          (sc) => `<button class="card dialogue-scene${completed.has(sc.id) ? ' is-complete' : ''}" data-scene="${esc(sc.id)}">
            <div class="dialogue-scene__top"><span>${sc.icon}</span>${completed.has(sc.id) ? '<strong>✓ Пройдено</strong>' : '<small>Начать →</small>'}</div>
            <h3 style="margin:6px 0 4px">${esc(sc.title)}</h3>
            <div class="faint">${esc(sc.goal)}</div>
          </button>`,
        )
        .join('')}
    </div>
    <p class="faint mt-6">
      ${
        aiReady
          ? 'Разбор AI не влияет на интервалы повторений: прогресс двигают только объективные проверки.'
          : 'Каждый сценарий состоит из трёх шагов. Заверши его, чтобы получить опыт и отметить учебный день.'
      }
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

    ${s.mode === 'offline' ? renderOfflineControls() : `
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
    `}
  `;
}

function renderOfflineControls() {
  const steps = OFFLINE_DIALOGUES[s.scenario.id] || OFFLINE_DIALOGUES.meeting;
  if (s.completed) {
    const available = scenariosFor(level());
    const currentIndex = available.findIndex((scenario) => scenario.id === s.scenario.id);
    const next = available[currentIndex + 1];
    return `<div class="dialogue-complete"><span>Сцена завершена · +8 XP</span><strong>${s.scenario.icon} Отличный разговор</strong><p>Ты прошёл ${steps.length} шага и потренировал ${steps.length} полезные реплики.</p><div class="row">${next ? `<button class="btn btn-primary" data-scene="${esc(next.id)}">Дальше: ${esc(next.title)}</button>` : `<button class="btn btn-primary" data-scene="${esc(s.scenario.id)}">Пройти ещё раз</button>`}<button class="btn" data-scene-exit>Все темы</button></div></div>`;
  }
  const step = steps[s.offlineStep];
  return `<div class="offline-replies"><div class="row-between"><strong>Выбери ответ</strong><span class="faint">Шаг ${s.offlineStep + 1} из ${steps.length}</span></div>${step.choices.map((choice, index) => `<button data-offline-choice="${index}"><span>${esc(choice)}</span><small>Нажми, чтобы ответить</small></button>`).join('')}</div>`;
}
