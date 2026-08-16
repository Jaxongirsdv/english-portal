import { loadState, update, resetState, exportState, importState } from '../core/storage.js';
import { isSupported, hasEnglishVoice, speak } from '../core/speech.js';
import { hasKey, saveKey, forgetKey, maskedKey } from '../core/ai.js';
import {
  isConfigured as syncConfigured,
  syncInfo,
  saveToken as saveSyncToken,
  forgetSync,
  sync,
  connectExisting,
  describeError as describeSyncError,
} from '../core/sync.js';
import { esc, plural } from '../core/ui.js';

export function renderSettings() {
  const st = loadState();
  const voiceOk = isSupported() && hasEnglishVoice();

  return `
    <h1>Настройки</h1>
    <p class="subtitle">Всё хранится локально в браузере. Никаких аккаунтов и серверов.</p>

    <div class="card mb-4">
      <h3 style="margin-top:0">Озвучка</h3>
      <div class="row-between mt-4">
        <div>
          <div>Английский голос</div>
          <div class="faint">${
            voiceOk
              ? 'Найден — озвучка работает'
              : 'Не найден. Установи английский языковой пакет в системе или открой портал в Chrome/Edge.'
          }</div>
        </div>
        <button class="btn" data-speak="This is a test of the voice.">Проверить</button>
      </div>

      <div class="mt-6">
        <div class="row-between">
          <span>Скорость речи</span>
          <strong>${st.settings.voiceRate.toFixed(1)}×</strong>
        </div>
        <input type="range" min="0.5" max="1.3" step="0.1" style="width:100%"
               value="${st.settings.voiceRate}" data-setting="voiceRate" />
        <div class="faint">На старте медленнее — легче различать звуки.</div>
      </div>

      <label class="row mt-6" style="cursor:pointer">
        <input type="checkbox" data-setting="autoSpeak" ${st.settings.autoSpeak ? 'checked' : ''} />
        <span>Автоматически произносить слово при показе перевода</span>
      </label>
    </div>

    <div class="card mb-4">
      <h3 style="margin-top:0">Цель на день</h3>
      <div class="row-between mt-4">
        <span>Повторений в день</span>
        <strong>${st.settings.dailyGoal}</strong>
      </div>
      <input type="range" min="5" max="60" step="5" style="width:100%"
             value="${st.settings.dailyGoal}" data-setting="dailyGoal" />
      <div class="faint">15–25 в день — устойчивый темп, который реально выдержать месяцами.</div>
    </div>

    <div class="card mb-4">
      <h3 style="margin-top:0">Проверка письма (Claude API)</h3>
      <p class="faint">
        Необязательный раздел. Без ключа портал работает полностью —
        не работает только проверка письменных работ.
      </p>

      ${
        hasKey()
          ? `<div class="row-between mt-4">
              <div>
                <div>Ключ подключён</div>
                <div class="word-ipa">${esc(maskedKey())}</div>
              </div>
              <button class="btn" data-action="forget-key" style="color:var(--red);border-color:var(--red)">Удалить ключ</button>
            </div>`
          : `<input class="text-input mt-4" data-api-key type="password"
                 placeholder="sk-ant-…" autocomplete="off" spellcheck="false" />
             <button class="btn btn-primary mt-4" data-action="save-key">Сохранить ключ</button>`
      }

      <div class="callout warn mt-4">
        <span class="callout-label">Где лежит ключ</span>
        В localStorage этого браузера. Любой, кто откроет консоль
        разработчика на этой машине, увидит его. Для личного портала
        на своём компьютере это приемлемо; на общем устройстве ключ
        вводить не стоит, а собранную версию с ключом нельзя выкладывать
        в интернет. В бэкап прогресса ключ не попадает.
      </div>
    </div>

    <div class="card mb-4">
      <h3 style="margin-top:0">Синхронизация между устройствами</h3>
      <p class="faint">
        Прогресс хранится в приватном GitHub Gist. Занимайся где угодно —
        карточки, уроки и стрик сливаются, ничего не теряется.
      </p>

      ${
        syncConfigured()
          ? (() => {
              const info = syncInfo();
              return `<div class="row-between mt-4">
                  <div>
                    <div>Подключено · ${esc(info.token)}</div>
                    <div class="faint">
                      ${
                        info.lastSyncAt
                          ? `последняя синхронизация: ${esc(new Date(info.lastSyncAt).toLocaleString('ru-RU'))}`
                          : 'ещё не синхронизировано'
                      }
                    </div>
                    ${info.gistId ? `<div class="word-ipa">gist: ${esc(info.gistId)}</div>` : ''}
                  </div>
                  <button class="btn btn-primary" data-action="sync">Синхронизировать</button>
                </div>
                <div class="row mt-4">
                  <button class="btn btn-ghost" data-action="forget-sync"
                          style="color:var(--red)">Отключить</button>
                </div>`;
            })()
          : `<input class="text-input mt-4" data-github-token type="password"
                 placeholder="Токен GitHub с областью «gist»" autocomplete="off" spellcheck="false" />
             <input class="text-input mt-2" data-gist-id
                 placeholder="Идентификатор gist — только на втором устройстве" autocomplete="off" />
             <button class="btn btn-primary mt-4" data-action="save-sync">Подключить</button>
             <div class="faint mt-4">
               На первом устройстве поле gist оставь пустым — хранилище
               создастся само, а его идентификатор появится здесь. На втором
               устройстве вставь этот идентификатор.
             </div>`
      }

      <div id="sync-result"></div>

      <div class="callout warn mt-4">
        <span class="callout-label">Про токен</span>
        Нужна только область «gist» — доступа к коду и репозиториям такой
        токен не даёт. Хранится он там же, где ключ Claude: в localStorage
        этого браузера. В бэкап прогресса не попадает, в сам gist —
        тоже: наружу уходит только прогресс, без настроек и ключей.
      </div>
    </div>

    <div class="card">
      <h3 style="margin-top:0">Данные</h3>
      <p class="faint">Прогресс живёт в localStorage этого браузера. Очистка данных сайта сотрёт его — делай бэкап.</p>
      <div class="row mt-4">
        <button class="btn" data-action="export">Скачать бэкап</button>
        <button class="btn" data-action="import">Загрузить бэкап</button>
        <button class="btn" data-action="reset" style="color:var(--red);border-color:var(--red)">Сбросить прогресс</button>
      </div>
      <input type="file" accept="application/json" data-import-file hidden />
    </div>

    <div class="faint mt-6">
      Слов в базе: ${Object.keys(st.cards).length} начато ·
      Создан: ${esc(new Date(st.createdAt).toLocaleDateString('ru-RU'))}
    </div>
  `;
}

export function handleSettingChange(key, value) {
  update((s) => {
    if (key === 'voiceRate') s.settings.voiceRate = Number(value);
    if (key === 'dailyGoal') s.settings.dailyGoal = Number(value);
    if (key === 'autoSpeak') s.settings.autoSpeak = !!value;
  });
}

export function doExport() {
  const blob = new Blob([exportState()], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `english-portal-backup-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export function doReset() {
  if (confirm('Сбросить весь прогресс? Это действие нельзя отменить.')) {
    resetState();
    return true;
  }
  return false;
}

export function handleSaveKey() {
  const input = document.querySelector('[data-api-key]');
  if (!input || !input.value.trim()) return false;
  saveKey(input.value);
  return true;
}

export function handleForgetKey() {
  if (confirm('Удалить ключ API? Проверка письма перестанет работать.')) {
    forgetKey();
    return true;
  }
  return false;
}

/* ---------- Синхронизация ---------- */

function showSyncResult(html) {
  const box = document.getElementById('sync-result');
  if (box) box.innerHTML = html;
}

export function handleSaveSync() {
  const token = document.querySelector('[data-github-token]');
  const gist = document.querySelector('[data-gist-id]');
  if (!token || !token.value.trim()) return false;

  saveSyncToken(token.value);
  const gistId = gist?.value.trim();

  // Синхронизацию запускаем после перерисовки: иначе render() снесёт
  // блок, в который она пишет ход выполнения
  setTimeout(() => runSync(gistId ? () => connectExisting(gistId) : sync), 0);
  return true;
}

export function handleSync() {
  runSync(sync);
  return false; // результат дорисовываем сами, без перерисовки экрана
}

async function runSync(fn) {
  showSyncResult('<div class="feedback ok mt-4">Синхронизирую…</div>');
  try {
    const r = await fn();
    if (r.created) {
      showSyncResult(`
        <div class="feedback ok mt-4">
          <strong>Хранилище создано.</strong><br />
          Идентификатор gist: <span class="word-ipa">${esc(r.gistId)}</span><br />
          <span class="faint">Вставь его на втором устройстве, чтобы связать их.</span>
        </div>`);
      return;
    }
    const добавлено = {
      lessons: r.after.lessons - r.before.lessons,
      cards: r.after.cards - r.before.cards,
    };
    const изменения =
      добавлено.lessons || добавлено.cards
        ? `Пришло с другого устройства: ${plural(добавлено.lessons, 'урок', 'урока', 'уроков')}, ${plural(добавлено.cards, 'слово', 'слова', 'слов')}.`
        : 'Расхождений не было — прогресс совпадал.';
    showSyncResult(`
      <div class="feedback ok mt-4">
        <strong>Синхронизировано.</strong><br />${esc(изменения)}<br />
        <span class="faint">Всего: ${r.after.lessons} уроков, ${r.after.cards} слов в изучении, ${r.after.mastered} выучено.</span>
      </div>`);
  } catch (err) {
    showSyncResult(`<div class="feedback no mt-4"><strong>${esc(describeSyncError(err))}</strong></div>`);
  }
}

export function handleForgetSync() {
  if (confirm('Отключить синхронизацию? Прогресс на этом устройстве останется, хранилище в GitHub не удалится.')) {
    forgetSync();
    return true;
  }
  return false;
}

/** Читает выбранный JSON-бэкап и заменяет им текущий прогресс. */
export async function doImport(file, onDone) {
  try {
    const text = await file.text();
    importState(text);
    onDone(true);
  } catch (err) {
    alert('Не удалось прочитать файл бэкапа: ' + err.message);
    onDone(false);
  }
}
