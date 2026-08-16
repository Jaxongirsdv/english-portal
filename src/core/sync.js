/**
 * Синхронизация прогресса между устройствами через приватный GitHub Gist.
 *
 * Почему именно так. Полноценный бэкенд означал бы сервер, базу и учётные
 * записи — ради переноса нескольких килобайт между двумя своими
 * устройствами это несоразмерно. File System Access API не подошёл:
 * в мобильных браузерах его нет, то есть на телефоне — там, где
 * синхронизация и нужна, — он не работает. Gist остаётся: хранилище уже
 * есть у любого, кто публикует портал на GitHub Pages, сервер поднимать
 * не надо, и открывается из любого браузера.
 *
 * Синхронизация двусторонняя: локальное состояние сливается с удалённым
 * (см. merge.js), результат сохраняется здесь и отправляется обратно.
 */

import { loadState, saveState, update, today } from './storage.js';
import { mergeState, masteredCount } from './merge.js';

const API = 'https://api.github.com';
const FILENAME = 'english-portal-progress.json';
const GIST_DESCRIPTION = 'English Portal — прогресс занятий';

export function isConfigured() {
  const s = loadState().settings;
  return !!(s.githubToken && s.githubToken.trim());
}

export function saveToken(token) {
  update((s) => {
    s.settings.githubToken = (token || '').trim();
  });
}

export function forgetSync() {
  update((s) => {
    s.settings.githubToken = '';
    s.settings.gistId = '';
    s.settings.lastSyncAt = null;
  });
}

export function syncInfo() {
  const s = loadState().settings;
  return {
    gistId: s.gistId || '',
    lastSyncAt: s.lastSyncAt || null,
    token: s.githubToken ? `${s.githubToken.slice(0, 7)}…` : '',
  };
}

async function github(path, options = {}) {
  const token = loadState().settings.githubToken;
  if (!token) throw new Error('no-token');

  const response = await fetch(`${API}${path}`, {
    ...options,
    headers: {
      Accept: 'application/vnd.github+json',
      Authorization: `Bearer ${token}`,
      'X-GitHub-Api-Version': '2022-11-28',
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
    },
  });

  if (!response.ok) {
    const error = new Error(`github-${response.status}`);
    error.status = response.status;
    throw error;
  }
  return response.json();
}

/**
 * Готовит состояние к отправке.
 * Ключи и настройки устройства наружу не уходят — на другом устройстве
 * они свои, а секретам вообще не место в облачном хранилище.
 */
function forUpload(state) {
  const copy = JSON.parse(JSON.stringify(state));
  delete copy.settings;
  return copy;
}

async function readRemote(gistId) {
  const gist = await github(`/gists/${gistId}`);
  const file = gist.files?.[FILENAME];
  if (!file) return null;

  // Крупные файлы GitHub отдаёт усечёнными, забирая содержимое по ссылке
  const raw = file.truncated ? await fetch(file.raw_url).then((r) => r.text()) : file.content;
  return JSON.parse(raw);
}

async function writeRemote(gistId, state) {
  const body = JSON.stringify({
    files: { [FILENAME]: { content: JSON.stringify(forUpload(state), null, 2) } },
  });
  return github(`/gists/${gistId}`, { method: 'PATCH', body });
}

async function createRemote(state) {
  const body = JSON.stringify({
    description: GIST_DESCRIPTION,
    public: false,
    files: { [FILENAME]: { content: JSON.stringify(forUpload(state), null, 2) } },
  });
  return github('/gists', { method: 'POST', body });
}

/**
 * Двусторонняя синхронизация.
 * Возвращает сводку изменений, чтобы было видно, что именно приехало.
 */
export async function sync() {
  const local = loadState();
  let gistId = local.settings.gistId;

  const before = {
    lessons: Object.keys(local.lessons).length,
    cards: Object.keys(local.cards).length,
    mastered: masteredCount(local),
  };

  // Первый запуск — заводим хранилище
  if (!gistId) {
    const created = await createRemote(local);
    update((s) => {
      s.settings.gistId = created.id;
      s.settings.lastSyncAt = new Date().toISOString();
    });
    return { created: true, gistId: created.id, before, after: before };
  }

  const remote = await readRemote(gistId);
  const merged = mergeState(local, remote, today());

  // Сохраняем слитое состояние локально, сохранив настройки устройства
  const state = loadState();
  Object.assign(state, merged);
  saveState();

  await writeRemote(gistId, merged);
  update((s) => {
    s.settings.lastSyncAt = new Date().toISOString();
  });

  return {
    created: false,
    gistId,
    before,
    after: {
      lessons: Object.keys(merged.lessons).length,
      cards: Object.keys(merged.cards).length,
      mastered: masteredCount(merged),
    },
  };
}

/** Подключение к уже существующему хранилищу — со второго устройства. */
export async function connectExisting(gistId) {
  update((s) => {
    s.settings.gistId = (gistId || '').trim();
  });
  return sync();
}

export function describeError(err) {
  if (err?.message === 'no-token') return 'Не задан токен GitHub. Добавь его в «Настройках».';
  if (err?.status === 401) return 'Токен GitHub не принят. Проверь его и права доступа.';
  if (err?.status === 403) return 'У токена нет права на работу с gist (нужна область «gist»).';
  if (err?.status === 404) return 'Хранилище не найдено. Проверь идентификатор gist.';
  if (err?.status === 422) return 'GitHub отклонил запрос: проверь содержимое хранилища.';
  if (!navigator.onLine) return 'Нет связи. Синхронизация возможна только онлайн.';
  return `Не удалось синхронизировать: ${err?.message || 'неизвестная ошибка'}`;
}
