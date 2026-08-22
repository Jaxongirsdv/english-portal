/**
 * Проверка слоя разбора письменных работ.
 *
 * Сам разбор делает модель — проверять его тут нечего. Проверяем то,
 * что вокруг: правильный ли провайдер выбран, тот ли ключ подставлен,
 * той ли формы уходит запрос и верно ли разбирается ответ.
 *
 * Ключи двух провайдеров легко перепутать местами, и внешне это
 * выглядит как «сервис не принял ключ» — поэтому им отдельные проверки.
 */
import test from 'node:test';
import assert from 'node:assert/strict';

const store = new Map();
globalThis.localStorage = {
  getItem: (k) => (store.has(k) ? store.get(k) : null),
  setItem: (k, v) => store.set(k, String(v)),
  removeItem: (k) => store.delete(k),
};

const { resetState, loadState, update } = await import('../src/core/storage.js');
const {
  PROVIDERS,
  currentProvider,
  setProvider,
  hasKey,
  saveKey,
  forgetKey,
  maskedKey,
  reviewWriting,
  describeError,
} = await import('../src/core/ai.js');

const REVIEW = {
  corrected: 'I work in an office.',
  errors: [{ original: 'a office', fixed: 'an office', kind: 'article', explanation: 'Перед гласным звуком нужен an.' }],
  comment: 'Хорошая структура, следи за артиклями.',
  level: 'A1',
};

function mockFetch(responder) {
  const calls = [];
  globalThis.fetch = async (url, options = {}) => {
    calls.push({ url: String(url), headers: options.headers || {}, body: JSON.parse(options.body) });
    return responder(calls.length);
  };
  return calls;
}

function geminiResponse(payload) {
  return new Response(
    JSON.stringify({ steps: [{ type: 'model_output', content: [{ type: 'text', text: JSON.stringify(payload) }] }] }),
    { status: 200, headers: { 'Content-Type': 'application/json' } },
  );
}

test('по умолчанию выбран бесплатный провайдер', () => {
  resetState();
  assert.equal(currentProvider(), 'gemini');
  assert.equal(PROVIDERS.gemini.free, true, 'именно бесплатность делает его безопасным выбором по умолчанию');
});

test('неизвестный провайдер не ломает портал', () => {
  resetState();
  update((s) => {
    s.settings.aiProvider = 'какой-то-другой';
  });
  assert.equal(currentProvider(), 'gemini', 'подставляется рабочий провайдер, а не падение');
});

test('ключи провайдеров хранятся раздельно', () => {
  resetState();
  saveKey('AIzaКЛЮЧ_GEMINI', 'gemini');
  saveKey('sk-ant-КЛЮЧ_CLAUDE', 'claude');

  assert.equal(hasKey('gemini'), true);
  assert.equal(hasKey('claude'), true);
  assert.equal(loadState().settings.geminiKey, 'AIzaКЛЮЧ_GEMINI');
  assert.equal(loadState().settings.apiKey, 'sk-ant-КЛЮЧ_CLAUDE');
});

test('смена провайдера не стирает второй ключ', () => {
  resetState();
  saveKey('AIzaКЛЮЧ', 'gemini');
  saveKey('sk-ant-КЛЮЧ', 'claude');

  setProvider('claude');
  assert.equal(hasKey('gemini'), true, 'ключ другого провайдера должен уцелеть');

  forgetKey('claude');
  assert.equal(hasKey('claude'), false);
  assert.equal(hasKey('gemini'), true, 'удаление одного ключа не трогает другой');
});

test('ключ на экран целиком не выводится', () => {
  resetState();
  saveKey('AIzaSyABCDEFGHIJKLMNOPQRSTUVWXYZ', 'gemini');
  const masked = maskedKey('gemini');

  assert.ok(!masked.includes('MNOPQRST'), 'середина ключа должна быть скрыта');
  assert.ok(masked.includes('…'));
});

test('без ключа проверка не отправляется', async () => {
  resetState();
  let requested = false;
  globalThis.fetch = async () => {
    requested = true;
    return geminiResponse(REVIEW);
  };

  const err = await reviewWriting({ task: 'з', text: 'т', level: 'A1' }).then(
    () => null,
    (e) => e,
  );

  assert.equal(err?.message, 'no-key');
  assert.equal(requested, false, 'запроса быть не должно — незачем дёргать сеть без ключа');
});

test('запрос к Gemini уходит нужной формы', async () => {
  resetState();
  saveKey('AIzaТЕСТ', 'gemini');
  const calls = mockFetch(() => geminiResponse(REVIEW));

  await reviewWriting({ task: 'Опиши свой день', text: 'I work in a office.', level: 'A1' });

  const [call] = calls;
  assert.ok(call.url.includes('generativelanguage'), 'адрес сервиса');
  assert.equal(call.headers['x-goog-api-key'], 'AIzaТЕСТ', 'ключ идёт заголовком, а не в адресе');
  assert.equal(call.body.response_format.mime_type, 'application/json');
  assert.deepEqual(
    Object.keys(call.body.response_format.schema.properties).sort(),
    ['comment', 'corrected', 'errors', 'level'],
    'схема ответа обязательна: без неё разбор пришлось бы вынимать из свободного текста',
  );
  assert.ok(call.body.input.includes('I work in a office.'), 'работа ученика');
  assert.ok(call.body.input.includes('Опиши свой день'), 'задание');
  assert.ok(call.body.input.includes('русскоязычных'), 'инструкция преподавателя');
});

test('ответ Gemini разбирается в структуру', async () => {
  resetState();
  saveKey('AIzaТЕСТ', 'gemini');
  mockFetch(() => geminiResponse(REVIEW));

  const result = await reviewWriting({ task: 'з', text: 'т', level: 'A1' });

  assert.equal(result.corrected, REVIEW.corrected);
  assert.equal(result.errors[0].kind, 'article');
  assert.equal(result.level, 'A1');
});

test('пустой ответ не выдаётся за разбор', async () => {
  resetState();
  saveKey('AIzaТЕСТ', 'gemini');
  mockFetch(() => new Response(JSON.stringify({ steps: [] }), { status: 200 }));

  const err = await reviewWriting({ task: 'з', text: 'т', level: 'A1' }).then(
    () => null,
    (e) => e,
  );
  assert.ok(err, 'пустой ответ должен быть ошибкой, а не пустым разбором');
});

test('отказ сервиса несёт код и объяснение', async () => {
  resetState();
  saveKey('AIzaТЕСТ', 'gemini');
  mockFetch(
    () =>
      new Response(JSON.stringify({ error: { message: 'API key not valid' } }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      }),
  );

  const err = await reviewWriting({ task: 'з', text: 'т', level: 'A1' }).then(
    () => null,
    (e) => e,
  );

  assert.equal(err.status, 400);
  assert.equal(err.detail, 'API key not valid');
  assert.ok(describeError(err).includes('API key not valid'), 'причину показываем как есть');
});

test('оборванный запрос объясняется по-человечески', () => {
  const text = describeError(new TypeError('Failed to fetch'));
  assert.ok(!text.includes('Failed to fetch'), 'системный текст ничего не подсказывает');
  assert.ok(/связ|блокиров|VPN/i.test(text));
});

test('раз сервис ответил кодом, на сеть не жалуемся', () => {
  const text = describeError({ status: 429 });
  assert.ok(!text.includes('Нет связи'), 'ответ с кодом не означает отсутствие связи');
  assert.ok(text.includes('лимит'));
});
