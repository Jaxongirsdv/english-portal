/**
 * Хранилище прогресса. Всё живёт в localStorage — никакого сервера,
 * портал полностью работает офлайн.
 */

const KEY = 'english-portal:v1';

const DEFAULT_STATE = {
  createdAt: null,
  level: 'A0',
  xp: 0,
  streak: 0,
  lastStudyDate: null,
  /** id урока -> { completedAt, score } */
  lessons: {},
  /** id слова -> карточка SRS (см. core/srs.js) */
  cards: {},
  /** дата (YYYY-MM-DD) -> сколько повторений сделано */
  history: {},
  /** id слова -> { attempts, exact, close } — статистика произношения */
  pronunciation: {},
  /** { attempts, perfect } — статистика диктантов */
  listening: { attempts: 0, perfect: 0 },
  /** { checked, errorsFound } — статистика проверок письма */
  writing: { checked: 0, errorsFound: 0 },
  settings: {
    voiceRate: 0.9,
    autoSpeak: true,
    dailyGoal: 20,
    /**
     * Как отвечать на обратной стороне карточки: write | speak.
     * Живёт в настройках, а они не синхронизируются между устройствами —
     * и правильно: микрофон есть не везде, и переносить этот выбор
     * с телефона на рабочий ноутбук было бы неверно.
     */
    prodAnswer: 'write',
    /** Ключи проверки письма. Пусто = раздел выключен. */
    apiKey: '', // Claude
    geminiKey: '', // Gemini
    aiProvider: 'gemini',
    writingLevel: 'A1',
    /** Синхронизация через приватный GitHub Gist. Пусто = выключена. */
    githubToken: '',
    gistId: '',
    lastSyncAt: null,
    /** Автоматическая синхронизация. Выключается, если фоновые запросы не нужны. */
    autoSync: true,
  },
};

let state = null;

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

export function loadState() {
  if (state) return state;
  try {
    const raw = localStorage.getItem(KEY);
    state = raw
      ? { ...clone(DEFAULT_STATE), ...JSON.parse(raw) }
      : clone(DEFAULT_STATE);
    // settings мог появиться позже — доливаем недостающие ключи
    state.settings = { ...DEFAULT_STATE.settings, ...(state.settings || {}) };
    // Разделы могли появиться после того, как прогресс уже был сохранён
    state.pronunciation = state.pronunciation || {};
    state.listening = state.listening || { attempts: 0, perfect: 0 };
    state.writing = state.writing || { checked: 0, errorsFound: 0 };
  } catch {
    state = clone(DEFAULT_STATE);
  }
  if (!state.createdAt) {
    state.createdAt = new Date().toISOString();
    saveState();
  }
  return state;
}

/** Подписчики на изменение прогресса — на них держится автосинхронизация. */
const saveListeners = new Set();

export function onSave(listener) {
  saveListeners.add(listener);
  return () => saveListeners.delete(listener);
}

export function saveState() {
  if (!state) return;
  localStorage.setItem(KEY, JSON.stringify(state));
  for (const listener of saveListeners) {
    try {
      listener();
    } catch {
      // Подписчик не должен ломать сохранение прогресса
    }
  }
}

export function update(mutator) {
  const s = loadState();
  mutator(s);
  saveState();
  return s;
}

export function resetState() {
  localStorage.removeItem(KEY);
  state = null;
  return loadState();
}

/**
 * Секреты, которые принадлежат устройству, а не прогрессу.
 *
 * Единый список, потому что забыть одну строчку здесь стоит дорого:
 * пропущенный в экспорте секрет утечёт в скачанный файл, пропущенный
 * в импорте — молча сотрётся при восстановлении бэкапа.
 */
const DEVICE_SECRETS = ['apiKey', 'geminiKey', 'githubToken'];

/**
 * Бэкап прогресса — БЕЗ секретов.
 *
 * Бэкап скачивается файлом, пересылается и лежит в загрузках, а секрет
 * в таком файле рано или поздно утечёт. Прогресс переносится, ключи
 * вводятся заново на новом устройстве.
 */
export function exportState() {
  const snapshot = clone(loadState());
  for (const key of DEVICE_SECRETS) delete snapshot.settings[key];
  return JSON.stringify(snapshot, null, 2);
}

export function importState(json) {
  const parsed = JSON.parse(json);
  const current = loadState().settings;

  state = { ...clone(DEFAULT_STATE), ...parsed };
  state.settings = { ...DEFAULT_STATE.settings, ...(parsed.settings || {}) };

  // Секретов в бэкапе нет — оставляем те, что уже введены на этом
  // устройстве, иначе восстановление прогресса молча ломало бы
  // проверку письма и синхронизацию
  for (const key of DEVICE_SECRETS) {
    state.settings[key] = parsed.settings?.[key] || current[key] || '';
  }

  saveState();
  return state;
}

/* ---------- Дата и стрик ---------- */

/**
 * Дата в виде YYYY-MM-DD по ЛОКАЛЬНОМУ времени.
 *
 * Наивный `toISOString().slice(0,10)` вернул бы дату по UTC: в поясе UTC+5
 * весь вечер после 19:00 считался бы «вчера», и стрик с интервалами
 * повторений уезжали бы на день. Поэтому собираем дату руками.
 */
export function toISODate(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function today() {
  return toISODate(new Date());
}

function daysBetween(a, b) {
  const ms = new Date(b + 'T00:00:00') - new Date(a + 'T00:00:00');
  return Math.round(ms / 86400000);
}

/** Отмечает активность за сегодня и пересчитывает стрик. */
export function touchStudyDay() {
  return update((s) => {
    const t = today();
    if (s.lastStudyDate === t) return;
    if (!s.lastStudyDate) {
      s.streak = 1;
    } else {
      const gap = daysBetween(s.lastStudyDate, t);
      s.streak = gap === 1 ? s.streak + 1 : 1;
    }
    s.lastStudyDate = t;
  });
}

export function addXp(amount) {
  return update((s) => {
    s.xp += amount;
    const t = today();
    s.history[t] = (s.history[t] || 0) + 1;
  });
}

/** Сколько повторений сделано сегодня. */
export function todayCount() {
  return loadState().history[today()] || 0;
}
