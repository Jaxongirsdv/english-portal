/**
 * Проверка обмена с хранилищем в GitHub Gist.
 *
 * Слияние проверяется отдельно (merge.test.js) — здесь важен сам обмен:
 * что уходит наружу, что делается с ответом и как разбирается отказ.
 *
 * Главное требование — первое: наружу не должны уходить настройки
 * и ключи. Ошибка здесь не проявится никак, пока секрет не окажется
 * в чужих руках.
 */
import test from 'node:test';
import assert from 'node:assert/strict';

const store = new Map();
globalThis.localStorage = {
  getItem: (k) => (store.has(k) ? store.get(k) : null),
  setItem: (k, v) => store.set(k, String(v)),
  removeItem: (k) => store.delete(k),
};

const { loadState, update, resetState } = await import('../src/core/storage.js');
const { sync, isConfigured, saveToken, forgetSync, syncInfo, describeError } = await import(
  '../src/core/sync.js'
);

/** Перехватчик сети: запоминает запросы и отдаёт заготовленные ответы. */
function mockFetch(responder) {
  const calls = [];
  globalThis.fetch = async (url, options = {}) => {
    calls.push({
      url: String(url),
      method: options.method || 'GET',
      body: options.body ? JSON.parse(options.body) : null,
      headers: options.headers || {},
    });
    return responder(calls.length, String(url), options);
  };
  return calls;
}

function jsonResponse(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

const FILENAME = 'english-portal-progress.json';

function gistWith(content) {
  return { id: 'GIST1', files: { [FILENAME]: { truncated: false, content: JSON.stringify(content) } } };
}

function configured({ gistId = 'GIST1' } = {}) {
  resetState();
  update((s) => {
    s.settings.githubToken = 'ghp_ТЕСТ';
    s.settings.gistId = gistId;
    s.settings.apiKey = 'sk-ant-СЕКРЕТ';
    s.settings.voiceRate = 0.6;
    s.xp = 100;
    s.lessons = { L1: { completedAt: '2026-08-16T00:00:00Z', score: 80 } };
  });
}

test('без токена обмен не настроен', () => {
  resetState();
  assert.equal(isConfigured(), false);

  saveToken('ghp_ХХХ');
  assert.equal(isConfigured(), true);

  forgetSync();
  assert.equal(isConfigured(), false);
  assert.equal(loadState().settings.gistId, '', 'отключение убирает и ссылку на хранилище');
});

test('наружу не уходят ни настройки, ни ключи', async () => {
  configured();
  const calls = mockFetch((n) =>
    n === 1 ? jsonResponse(gistWith({ xp: 0, lessons: {}, cards: {}, history: {} })) : jsonResponse({ id: 'GIST1' }),
  );

  await sync();

  const upload = calls.find((c) => c.method === 'PATCH');
  const sent = upload.body.files[FILENAME].content;

  assert.ok(!sent.includes('sk-ant-СЕКРЕТ'), 'ключ Claude не должен покидать устройство');
  assert.ok(!sent.includes('ghp_ТЕСТ'), 'токен GitHub не должен покидать устройство');
  assert.ok(!sent.includes('settings'), 'настройки устройства в общем хранилище не нужны');
  assert.ok(sent.includes('L1'), 'а прогресс — должен уходить');
});

test('первый запуск создаёт хранилище и запоминает его', async () => {
  configured({ gistId: '' });
  const calls = mockFetch(() => jsonResponse({ id: 'НОВЫЙ_GIST' }));

  const result = await sync();

  assert.equal(calls.length, 1, 'создание — один запрос, читать ещё нечего');
  assert.equal(calls[0].method, 'POST');
  assert.equal(calls[0].body.public, false, 'хранилище прогресса должно быть приватным');
  assert.equal(result.created, true);
  assert.equal(loadState().settings.gistId, 'НОВЫЙ_GIST', 'ссылка сохраняется для следующего раза');
});

test('обмен читает удалённое, сливает и отправляет обратно', async () => {
  configured();
  const calls = mockFetch((n) =>
    n === 1
      ? jsonResponse(gistWith({ xp: 500, lessons: { L2: { completedAt: '2026-08-01T00:00:00Z', score: 90 } }, cards: {}, history: {} }))
      : jsonResponse({ id: 'GIST1' }),
  );

  const result = await sync();

  assert.deepEqual(calls.map((c) => c.method), ['GET', 'PATCH'], 'ровно одно чтение и одна запись');
  assert.equal(loadState().xp, 500, 'прогресс с другого устройства применяется');
  assert.equal(Object.keys(loadState().lessons).length, 2, 'уроки объединяются');
  assert.equal(result.after.lessons, 2);
  assert.ok(loadState().settings.lastSyncAt, 'время последнего обмена записывается');
});

test('настройки устройства переживают обмен', async () => {
  configured();
  mockFetch((n) =>
    n === 1 ? jsonResponse(gistWith({ xp: 0, lessons: {}, cards: {}, history: {} })) : jsonResponse({ id: 'GIST1' }),
  );

  await sync();

  const s = loadState().settings;
  assert.equal(s.apiKey, 'sk-ant-СЕКРЕТ', 'ключ остаётся на устройстве');
  assert.equal(s.voiceRate, 0.6, 'скорость речи не подменяется чужой');
});

test('крупное хранилище догружается по ссылке', async () => {
  configured();
  const payload = JSON.stringify({ xp: 999, lessons: {}, cards: {}, history: {} });

  mockFetch((n, url) => {
    if (n === 1) {
      // GitHub усекает большие файлы и отдаёт ссылку на полное содержимое
      return jsonResponse({ id: 'GIST1', files: { [FILENAME]: { truncated: true, raw_url: 'https://gist.example/raw' } } });
    }
    if (url === 'https://gist.example/raw') return new Response(payload, { status: 200 });
    return jsonResponse({ id: 'GIST1' });
  });

  await sync();
  assert.equal(loadState().xp, 999, 'усечённый ответ не должен терять прогресс');
});

test('пустое хранилище не считается потерей прогресса', async () => {
  configured();
  mockFetch((n) => (n === 1 ? jsonResponse({ id: 'GIST1', files: {} }) : jsonResponse({ id: 'GIST1' })));

  await sync();
  assert.equal(loadState().xp, 100, 'локальный прогресс остаётся при пустом удалённом');
});

test('отказ несёт код ответа и объяснение GitHub', async () => {
  configured();
  mockFetch(() => jsonResponse({ message: 'API rate limit exceeded' }, 403));

  const err = await sync().then(
    () => null,
    (e) => e,
  );

  assert.ok(err, 'отказ должен всплывать наружу');
  assert.equal(err.status, 403);
  assert.equal(err.detail, 'API rate limit exceeded', 'причина берётся у GitHub, а не выдумывается');
});

test('подсказка по отказу цитирует GitHub', () => {
  const text = describeError({ status: 403, detail: 'API rate limit exceeded' });
  assert.ok(text.includes('API rate limit exceeded'), 'настоящая причина должна быть видна');

  const noToken = describeError({ message: 'no-token' });
  assert.ok(noToken.includes('токен'), 'отсутствие токена объясняется отдельно');
});

test('раз GitHub ответил кодом, на сеть не жалуемся', () => {
  // Ответ есть — значит связь была, и подменять причину «нет связи»
  // значит скрыть настоящую: именно так исчерпанный лимит выглядел
  // бы как проблема с интернетом
  const text = describeError({ status: 404, detail: 'Not Found' });
  assert.ok(!text.includes('Нет связи'), 'ответ с кодом не может означать отсутствие связи');
  assert.ok(text.includes('Not Found'));
});

test('сведения для настроек не раскрывают токен целиком', () => {
  configured();
  const info = syncInfo();
  assert.ok(info.token.length < 'ghp_ТЕСТ'.length + 2, 'токен показывается сокращённо');
  assert.equal(info.gistId, 'GIST1');
});
