/**
 * Автоматическая синхронизация прогресса.
 *
 * Ручную кнопку легко забыть именно в тот момент, когда она нужна —
 * при пересадке с ноутбука на телефон. Поэтому синхронизация происходит
 * сама, но в трёх осторожно выбранных точках, а не после каждого действия:
 *
 *   1. при запуске  — забрать то, что сделано на другом устройстве;
 *   2. через паузу после занятий — отдать своё, не дёргая сеть на каждой
 *      карточке (иначе одна сессия повторений дала бы сотни запросов);
 *   3. когда вкладка уходит в фон — на телефоне это единственный надёжный
 *      момент: браузер может заморозить или выгрузить страницу без
 *      предупреждения, и несохранённое просто пропадёт.
 *
 * Любая ошибка тиха: занятия не должны прерываться из-за пропавшей сети.
 */

import { loadState, onSave } from './storage.js';
import { isConfigured, sync } from './sync.js';

/** Пауза бездействия, после которой отправляем накопленное. */
const IDLE_DELAY = 20000;

/** Не чаще одного обмена в эту паузу — защита от частых срабатываний. */
const MIN_INTERVAL = 10000;

let dirty = false;
let running = false;
let lastRun = 0;
let timer = null;
let notify = () => {};

/** Состояние для показа в интерфейсе. */
let status = { state: 'idle', at: null, error: null };

export function syncStatus() {
  return status;
}

function setStatus(next) {
  status = { ...status, ...next };
  notify();
}

export function isEnabled() {
  const s = loadState().settings;
  return isConfigured() && s.autoSync !== false;
}

async function run(reason) {
  if (!isEnabled() || running) return;
  if (!navigator.onLine) return;
  if (Date.now() - lastRun < MIN_INTERVAL && reason !== 'hidden') return;

  running = true;
  setStatus({ state: 'syncing', error: null });
  try {
    const before = JSON.stringify(loadState().cards);
    await sync();
    dirty = false;
    lastRun = Date.now();
    const changed = JSON.stringify(loadState().cards) !== before;
    setStatus({ state: 'ok', at: Date.now(), error: null });
    // Перерисовываем, только если слияние действительно что-то принесло:
    // лишний ре-рендер посреди занятия сбил бы ввод
    if (changed) notify(true);
  } catch (err) {
    setStatus({ state: 'error', error: err?.message || 'ошибка' });
  } finally {
    running = false;
  }
}

function scheduleIdle() {
  clearTimeout(timer);
  timer = setTimeout(() => run('idle'), IDLE_DELAY);
}

/**
 * Подключает автосинхронизацию.
 * onChange вызывается, когда интерфейс стоит обновить.
 */
export function initAutoSync(onChange) {
  notify = (rerender) => onChange?.(rerender === true);

  onSave(() => {
    if (!isEnabled()) return;
    dirty = true;
    scheduleIdle();
  });

  // Уход вкладки в фон — последний надёжный момент на телефоне
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden' && dirty) {
      clearTimeout(timer);
      run('hidden');
    }
  });

  // Связь появилась — отдаём накопленное
  window.addEventListener('online', () => {
    if (dirty) run('online');
  });

  // При запуске забираем чужие изменения, даже если своих нет
  if (isEnabled()) {
    setTimeout(() => run('start'), 1200);
  }
}

/** Ручной запуск — кнопкой в настройках. */
export function syncNow() {
  lastRun = 0;
  return run('manual');
}
