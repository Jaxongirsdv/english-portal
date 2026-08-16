import { tasksForLevel, LEVELS } from '../data/writing-tasks.js';
import { loadState, update, addXp, touchStudyDay } from '../core/storage.js';
import { hasKey, reviewWriting, describeError } from '../core/ai.js';
import { esc, shuffle, plural, speakBtn } from '../core/ui.js';

/**
 * Письменная практика с разбором.
 *
 * Единственный раздел портала, которому нужен интернет и ключ API,
 * поэтому он полностью необязателен: без ключа экран объясняет, что
 * происходит, и не мешает остальному.
 */
let s = null;

const KIND_LABELS = {
  grammar: 'грамматика',
  vocabulary: 'лексика',
  'word-order': 'порядок слов',
  article: 'артикль',
  preposition: 'предлог',
  spelling: 'орфография',
  style: 'стиль',
};

export function startWriting() {
  const state = loadState();
  const level = state.settings.writingLevel || 'A1';
  s = {
    level,
    task: shuffle(tasksForLevel(level))[0] || null,
    text: '',
    status: 'idle', // idle | checking | done | error
    result: null,
    error: null,
  };
}


export function exitWriting() {
  s = null;
}

export function setLevel(level) {
  if (!s) return false;
  s.level = level;
  s.task = shuffle(tasksForLevel(level))[0] || null;
  s.text = '';
  s.status = 'idle';
  s.result = null;
  s.error = null;
  update((st) => {
    st.settings.writingLevel = level;
  });
  return true;
}

export function nextTask() {
  if (!s) return false;
  const pool = tasksForLevel(s.level).filter((t) => t.prompt !== s.task?.prompt);
  s.task = shuffle(pool.length ? pool : tasksForLevel(s.level))[0] || null;
  s.text = '';
  s.status = 'idle';
  s.result = null;
  s.error = null;
  return true;
}

export function syncText(value) {
  if (s) s.text = value;
}

/**
 * Обновляет счётчик слов и доступность кнопки без перерисовки экрана.
 * Полный ре-рендер на каждом нажатии сбрасывал бы курсор в середину
 * текста — писать было бы невозможно.
 */
export function refreshCounter() {
  if (!s || !s.task) return;
  const words = s.text.trim().split(/\s+/).filter(Boolean).length;

  const counter = document.querySelector('[data-writing-counter]');
  if (counter) counter.textContent = `${words} / ${s.task.minWords} слов`;

  const check = document.querySelector('[data-writing-check]');
  if (check) check.disabled = words < s.task.minWords || s.status === 'checking';

  const hint = document.querySelector('[data-writing-hint]');
  if (hint) {
    const left = s.task.minWords - words;
    hint.textContent =
      left > 0
        ? `Нужно ещё ${plural(left, 'слово', 'слова', 'слов')} — короткий текст не даёт материала для разбора.`
        : '';
  }
}

function renderNoKey() {
  return `
    <h1>Письмо</h1>
    <p class="subtitle">Единственный раздел, которому нужен интернет и ключ API.</p>

    <div class="callout warn">
      <span class="callout-label">Не подключено</span>
      Проверка письменных работ идёт через Claude API и требует твоего
      собственного ключа. Без него раздел не работает — остальной портал
      от этого не страдает.
    </div>

    <div class="card mt-4">
      <h3 style="margin-top:0">Как подключить</h3>
      <ol class="dim" style="padding-left:20px;line-height:1.9">
        <li>Заведи ключ в консоли Anthropic: <span class="word-ipa">console.anthropic.com</span></li>
        <li>Вставь его в «Настройках» портала</li>
        <li>Вернись сюда</li>
      </ol>
      <div class="callout warn mt-4">
        <span class="callout-label">Про безопасность честно</span>
        Ключ хранится в localStorage этого браузера и виден любому, кто
        откроет консоль разработчика на этой машине. Для личного портала
        на своём компьютере это приемлемо. Не вставляй ключ на чужом
        устройстве и не выкладывай собранную версию с ключом в интернет.
      </div>
      <button class="btn btn-primary mt-4" data-nav="settings">Открыть настройки</button>
    </div>
  `;
}

function renderResult() {
  const { corrected, errors, comment, level } = s.result;

  return `
    <div class="card mt-4">
      <div class="row-between mb-4">
        <h3 style="margin:0">Разбор</h3>
        <span class="level-code">${esc(level)}</span>
      </div>

      <div class="faint">Исправленный вариант</div>
      <div style="font-size:16px;line-height:1.7;margin:6px 0 16px">
        ${esc(corrected)} ${speakBtn(corrected)}
      </div>

      ${
        errors.length
          ? `<div class="faint mb-4">${plural(errors.length, 'ошибка', 'ошибки', 'ошибок')}</div>
             ${errors
               .map(
                 (e) => `
              <div class="word-card" style="align-items:flex-start;flex-direction:column;gap:6px">
                <div class="row" style="gap:8px;flex-wrap:wrap">
                  <span style="color:var(--red);text-decoration:line-through">${esc(e.original)}</span>
                  <span class="dim">→</span>
                  <span style="color:var(--green)">${esc(e.fixed)}</span>
                  <span class="word-status learning">${esc(KIND_LABELS[e.kind] || e.kind)}</span>
                </div>
                <div class="faint">${esc(e.explanation)}</div>
              </div>`,
               )
               .join('')}`
          : `<div class="feedback ok"><strong>Ошибок не найдено 🎉</strong></div>`
      }

      <div class="callout tip mt-4">
        <span class="callout-label">Комментарий</span>
        ${esc(comment)}
      </div>
    </div>

    <div class="row mt-4">
      <button class="btn btn-primary btn-lg" data-writing-next>Следующее задание →</button>
      <button class="btn" data-writing-retry>Переписать</button>
    </div>
  `;
}

export function renderWriting() {
  if (!hasKey()) return renderNoKey();
  if (!s) startWriting();
  if (!s.task) return '<div class="empty">Для этого уровня заданий пока нет</div>';

  const words = s.text.trim().split(/\s+/).filter(Boolean).length;
  const enough = words >= s.task.minWords;
  const busy = s.status === 'checking';

  return `
    <div class="row-between mb-4">
      <button class="btn btn-ghost" data-nav="dashboard">← Выйти</button>
      <span class="faint" data-writing-counter>${words} / ${s.task.minWords} слов</span>
    </div>

    <h1>Письмо</h1>

    <div class="row mb-4" style="gap:6px;flex-wrap:wrap">
      ${LEVELS.map(
        (l) => `<button class="chip"
            style="${s.level === l ? 'border-color:var(--accent);color:var(--accent)' : ''}"
            data-writing-level="${l}">${l}</button>`,
      ).join('')}
    </div>

    <div class="card mb-4">
      <div class="ex-prompt" style="margin-bottom:8px">${esc(s.task.prompt)}</div>
      <div class="faint">Подсказка: ${esc(s.task.hint)} · минимум ${s.task.minWords} слов</div>
    </div>

    <textarea class="text-input" data-writing-input rows="8"
      style="resize:vertical;line-height:1.7;font-size:15px"
      placeholder="Пиши по-английски…" ${busy || s.status === 'done' ? 'disabled' : ''}>${esc(s.text)}</textarea>

    <div class="row mt-4">
      ${
        s.status === 'done'
          ? ''
          : `<button class="btn btn-primary btn-lg" data-writing-check
              ${busy || !enough ? 'disabled' : ''}>
              ${busy ? 'Проверяю…' : 'Проверить'}
            </button>
            <button class="btn btn-ghost" data-writing-next ${busy ? 'disabled' : ''}>Другое задание</button>`
      }
    </div>

    ${
      s.status === 'done'
        ? ''
        : `<div class="faint mt-4" data-writing-hint>${
            enough ? '' : `Нужно ещё ${plural(s.task.minWords - words, 'слово', 'слова', 'слов')} — короткий текст не даёт материала для разбора.`
          }</div>`
    }

    ${s.status === 'error' ? `<div class="feedback no mt-4"><strong>${esc(s.error)}</strong></div>` : ''}
    ${s.status === 'done' ? renderResult() : ''}
  `;
}

/* ---------- Действия ---------- */

export async function handleCheck(rerender) {
  if (!s || s.status === 'checking') return;
  const input = document.querySelector('[data-writing-input]');
  if (input) s.text = input.value;

  s.status = 'checking';
  s.error = null;
  rerender();

  try {
    s.result = await reviewWriting({
      task: s.task.prompt,
      text: s.text,
      level: s.level,
    });
    s.status = 'done';

    update((st) => {
      st.writing = st.writing || { checked: 0, errorsFound: 0 };
      st.writing.checked += 1;
      st.writing.errorsFound += s.result.errors.length;
    });
    addXp(15);
    touchStudyDay();
  } catch (err) {
    s.error = describeError(err);
    s.status = 'error';
  }
  rerender();
}

export function handleRetry() {
  if (!s) return false;
  s.status = 'idle';
  s.result = null;
  s.error = null;
  return true;
}
