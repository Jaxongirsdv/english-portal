/**
 * Хранилище прогресса. Всё живёт в localStorage — никакого сервера,
 * портал полностью работает офлайн.
 */

const KEY = 'english-portal:v1';

const DEFAULT_STATE = {
  createdAt: null,
  onboardingDone: false,
  level: 'A0',
  xp: 0,
  streak: 0,
  lastStudyDate: null,
  /** id урока -> { completedAt, score } */
  lessons: {},
  /** id уровня -> { attempts, bestScore, passed, completedAt } */
  milestones: {},
  /** id слова -> карточка SRS (см. core/srs.js) */
  cards: {},
  /** дата (YYYY-MM-DD) -> сколько повторений сделано */
  history: {},
  /** id слова -> { attempts, exact, close } — статистика произношения */
  pronunciation: {},
  /** { attempts, perfect } — статистика диктантов */
  listening: { attempts: 0, perfect: 0 },
  /** id текста -> { score, at } — чтение и аудирование хранятся отдельно */
  reading: {},
  audioTexts: {},
  /** { checked, errorsFound } — статистика проверок письма */
  writing: { checked: 0, errorsFound: 0 },
  dialogue: { turns: 0, offlineCompleted: 0, completedScenarios: [] },
  b2Practice: { speakingDone: 0 },
  b2Training: { Reading: {}, Listening: {}, Writing: {}, Speaking: {} },
  b2Mock: { completed: {}, scores: {}, history: [], currentStartedAt: null, currentSavedAt: null },
  b2FullMock: null,
  settings: {
    activeProgram: 'foundation',
    voiceRate: 0.9,
    theme: 'light',
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
let saveFailed = false;

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
    state.reading = state.reading || {};
    state.audioTexts = state.audioTexts || {};
    state.writing = state.writing || { checked: 0, errorsFound: 0 };
    state.milestones = state.milestones || {};
    state.dialogue = state.dialogue || { turns: 0, offlineCompleted: 0, completedScenarios: [] };
    state.b2Practice = state.b2Practice || { speakingDone: 0 };
    state.b2Training = {
      Reading: {}, Listening: {}, Writing: {}, Speaking: {},
      ...(state.b2Training || {}),
    };
    state.b2Mock = {
      completed: {}, scores: {}, history: [], currentStartedAt: null, currentSavedAt: null,
      ...(state.b2Mock || {}),
    };
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
  if (!state) return true;
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    saveFailed = true;
    return false;
  }
  saveFailed = false;
  for (const listener of saveListeners) {
    try {
      listener();
    } catch {
      // Подписчик не должен ломать сохранение прогресса
    }
  }
  return true;
}

/** Было ли последнее сохранение в браузерное хранилище неуспешным. */
export function hasSaveError() {
  return saveFailed;
}

export function update(mutator) {
  const s = loadState();
  mutator(s);
  saveState();
  return s;
}

export function completeOnboarding() {
  update((st) => {
    st.onboardingDone = true;
  });
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

function isRecord(value) {
  return !!value && typeof value === 'object' && !Array.isArray(value);
}

function isFiniteNonNegative(value) {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0;
}

function assertRecordMap(value, name, validateEntry) {
  if (value === undefined) return;
  if (!isRecord(value)) throw new Error(`invalid-backup-${name}`);
  for (const entry of Object.values(value)) validateEntry(entry, name);
}

function assertStats(entry, name, fields) {
  if (!isRecord(entry) || fields.some((field) => !isFiniteNonNegative(field in entry ? entry[field] : 0))) {
    throw new Error(`invalid-backup-${name}`);
  }
}

/** Проверяем только форму данных: старые необязательные поля не отбрасываем. */
function validateBackup(parsed) {
  if (!isRecord(parsed)) throw new Error('invalid-backup');

  assertRecordMap(parsed.lessons, 'lessons', (lesson, name) => {
    if (!isRecord(lesson) || (lesson.score !== undefined && !isFiniteNonNegative(lesson.score))) {
      throw new Error(`invalid-backup-${name}`);
    }
  });
  assertRecordMap(parsed.milestones, 'milestones', (milestone, name) => {
    if (!isRecord(milestone)
      || !isFiniteNonNegative(milestone.attempts || 0)
      || !isFiniteNonNegative(milestone.bestScore || 0)
      || (milestone.passed !== undefined && typeof milestone.passed !== 'boolean')
      || (milestone.completedAt !== undefined && milestone.completedAt !== null && typeof milestone.completedAt !== 'string')) {
      throw new Error(`invalid-backup-${name}`);
    }
  });
  assertRecordMap(parsed.cards, 'cards', (card, name) => {
    if (!isRecord(card)) throw new Error(`invalid-backup-${name}`);
    for (const field of ['reps', 'interval', 'ease', 'lapses']) {
      if (card[field] !== undefined && !isFiniteNonNegative(card[field])) {
        throw new Error(`invalid-backup-${name}`);
      }
    }
    for (const field of ['due', 'lastLapseAt', 'lastReviewAt']) {
      if (card[field] !== undefined && card[field] !== null && typeof card[field] !== 'string') {
        throw new Error(`invalid-backup-${name}`);
      }
    }
  });
  assertRecordMap(parsed.history, 'history', (count, name) => {
    if (!isFiniteNonNegative(count)) throw new Error(`invalid-backup-${name}`);
  });
  assertRecordMap(parsed.pronunciation, 'pronunciation', (stats, name) => {
    assertStats(stats, name, ['attempts', 'exact', 'close']);
  });

  if (parsed.listening !== undefined) assertStats(parsed.listening, 'listening', ['attempts', 'perfect']);
  if (parsed.writing !== undefined) assertStats(parsed.writing, 'writing', ['checked', 'errorsFound']);
  for (const name of ['reading', 'audioTexts']) {
    assertRecordMap(parsed[name], name, (result, field) => {
      if (!isRecord(result) || !isFiniteNonNegative(result.score || 0)) throw new Error(`invalid-backup-${field}`);
    });
  }
  if (parsed.dialogue !== undefined) {
    assertStats(parsed.dialogue, 'dialogue', ['turns', 'offlineCompleted']);
    if (parsed.dialogue.completedScenarios !== undefined
      && (!Array.isArray(parsed.dialogue.completedScenarios)
        || parsed.dialogue.completedScenarios.some((id) => typeof id !== 'string'))) {
      throw new Error('invalid-backup-dialogue');
    }
  }
  if (parsed.b2Practice !== undefined) assertStats(parsed.b2Practice, 'b2Practice', ['speakingDone']);
  if (parsed.b2Training !== undefined) {
    if (!isRecord(parsed.b2Training)) throw new Error('invalid-backup-b2Training');
    for (const skill of ['Reading', 'Listening', 'Writing', 'Speaking']) {
      assertRecordMap(parsed.b2Training[skill], 'b2Training', (result, name) => {
        if (!isRecord(result)
          || !isFiniteNonNegative(result.score || 0)
          || !isFiniteNonNegative(result.lastScore || 0)
          || (result.at !== undefined && result.at !== null && typeof result.at !== 'string')) {
          throw new Error(`invalid-backup-${name}`);
        }
      });
    }
  }
  if (parsed.b2Mock !== undefined) {
    if (!isRecord(parsed.b2Mock) || !isRecord(parsed.b2Mock.completed || {}) || !isRecord(parsed.b2Mock.scores || {})) {
      throw new Error('invalid-backup-b2Mock');
    }
    if (Object.values(parsed.b2Mock.completed || {}).some((value) => typeof value !== 'boolean')
      || Object.values(parsed.b2Mock.scores || {}).some((value) => !isFiniteNonNegative(value))) {
      throw new Error('invalid-backup-b2Mock');
    }
    if (parsed.b2Mock.history !== undefined
      && (!Array.isArray(parsed.b2Mock.history)
        || parsed.b2Mock.history.some((item) => !isRecord(item) || typeof item.id !== 'string'
          || typeof item.at !== 'string' || !isFiniteNonNegative(item.overall)))) {
      throw new Error('invalid-backup-b2Mock');
    }
  }
  if (parsed.b2FullMock !== undefined && parsed.b2FullMock !== null) {
    if (!isRecord(parsed.b2FullMock)
      || (parsed.b2FullMock.score !== undefined && parsed.b2FullMock.score !== null && !isFiniteNonNegative(parsed.b2FullMock.score))) {
      throw new Error('invalid-backup-b2FullMock');
    }
  }
  if (parsed.settings !== undefined && !isRecord(parsed.settings)) throw new Error('invalid-backup-settings');
}

export function importState(json) {
  const parsed = JSON.parse(json);
  validateBackup(parsed);
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
