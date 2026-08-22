/**
 * Проверка разговорного тренажёра.
 *
 * Главная опасность раздела не в том, что он сломается, а в том, что он
 * начнёт врать. Языковая модель охотно хвалит, ошибается и противоречит
 * себе — и если пустить её приговор к карточкам, весь портал, который
 * держится на объективных проверках, потеряет смысл. Поэтому половина
 * проверок здесь про границы: что уходит в запрос и что НЕ меняется
 * после ответа.
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
const { saveKey, setProvider } = await import('../src/core/ai.js');
const { getWord, allVocabIds } = await import('../src/data/vocab.js');
const { SCENARIOS, scenariosFor, getScenario, buildPrompt, normalizeReply, sendTurn } =
  await import('../src/core/dialogue.js');

const SCENE = SCENARIOS[0];

function geminiAnswer(payload) {
  return {
    ok: true,
    json: async () => ({
      steps: [{ type: 'model_output', content: [{ type: 'text', text: JSON.stringify(payload) }] }],
    }),
  };
}

/* ---------- Сцены ---------- */

test('сцены открываются по уровню, а не все сразу', () => {
  assert.deepEqual(
    scenariosFor('A0').map((s) => s.id),
    ['meeting'],
    'на A0 обсуждать работу нечем',
  );
  assert.ok(scenariosFor('B2').length > scenariosFor('A1').length);
  assert.equal(scenariosFor('C1').length, SCENARIOS.length, 'к C1 доступно всё');
});

test('неизвестный уровень не оставляет человека без единой сцены', () => {
  assert.ok(scenariosFor(undefined).length >= 1);
  assert.ok(scenariosFor('ерунда').length >= 1);
});

test('у каждой сцены есть первая реплика с переводом', () => {
  for (const s of SCENARIOS) {
    assert.ok(s.opener.trim(), `${s.id}: не с чего начать разговор`);
    assert.ok(s.openerRu.trim(), `${s.id}: начинающий не поймёт первую фразу`);
    assert.ok(s.goal.trim(), `${s.id}: непонятно, зачем этот разговор`);
  }
  assert.equal(getScenario('нет такой'), null);
});

/* ---------- Что уходит в запрос ---------- */

test('в запрос попадают знакомые слова — иначе собеседник заговорит непонятно', () => {
  const ids = ['hello', 'water'];
  const prompt = buildPrompt({ scenario: SCENE, level: 'A0', wordIds: ids, history: [] });

  for (const id of ids) assert.ok(prompt.includes(getWord(id).en), `${id} не передан модели`);
  assert.ok(prompt.includes('A0'), 'уровень должен быть виден');
  assert.ok(prompt.includes(SCENE.goal), 'без цели разговор рассыпается');
});

test('пустой словарь не рушит запрос', () => {
  const prompt = buildPrompt({ scenario: SCENE, level: 'A0', wordIds: [], history: [] });
  assert.ok(prompt.includes('словарь пока пуст'));
});

test('история разговора передаётся с ролями', () => {
  const history = [
    { role: 'assistant', en: 'Hello! What is your name?' },
    { role: 'user', en: 'My name is Jahongir' },
  ];
  const prompt = buildPrompt({ scenario: SCENE, level: 'A0', wordIds: [], history });

  assert.ok(prompt.includes('Ученик: My name is Jahongir'));
  assert.ok(prompt.includes('Собеседник: Hello! What is your name?'));
  assert.ok(
    prompt.indexOf('Собеседник: Hello') < prompt.indexOf('Ученик: My name'),
    'порядок реплик должен сохраняться',
  );
});

/* ---------- Разбор ответа ---------- */

test('пустой разбор не превращается в выдуманную ошибку', () => {
  const r = normalizeReply({
    reply: 'Nice to meet you!',
    replyRu: 'Приятно познакомиться!',
    correction: { original: '', fixed: '', explanation: '' },
    suggestion: 'Nice to meet you too',
  });
  assert.equal(r.correction, null, 'иначе ученик правил бы верную фразу');
});

test('разбор с половиной полей ошибкой не считается', () => {
  // Модель иногда заполняет объяснение, забыв само исправление
  const r = normalizeReply({
    reply: 'ok',
    correction: { original: 'I am agree', fixed: '', explanation: 'так не говорят' },
  });
  assert.equal(r.correction, null);
});

test('настоящая ошибка доходит целиком', () => {
  const r = normalizeReply({
    reply: 'I see.',
    replyRu: 'Понятно.',
    correction: { original: ' I am agree ', fixed: ' I agree ', explanation: ' лишний глагол ' },
    suggestion: '',
  });
  assert.deepEqual(r.correction, {
    original: 'I am agree',
    fixed: 'I agree',
    explanation: 'лишний глагол',
  });
});

test('отсутствующие поля не превращаются в строку undefined', () => {
  const r = normalizeReply({});
  assert.equal(r.reply, '');
  assert.equal(r.replyRu, '');
  assert.equal(r.suggestion, '');
  assert.equal(r.correction, null);
});

/* ---------- Обмен с моделью ---------- */

test('ответ модели доходит до экрана разобранным', async () => {
  resetState();
  setProvider('gemini');
  saveKey('ключ-для-проверки', 'gemini');

  globalThis.fetch = async () =>
    geminiAnswer({
      reply: 'Nice to meet you, Jahongir!',
      replyRu: 'Приятно познакомиться, Жахонгир!',
      correction: {
        original: 'My name Jahongir',
        fixed: 'My name is Jahongir',
        explanation: 'пропущено is',
      },
      suggestion: 'How are you?',
    });

  const r = await sendTurn({ scenario: SCENE, level: 'A0', wordIds: ['hello'], history: [] });
  assert.equal(r.reply, 'Nice to meet you, Jahongir!');
  assert.equal(r.correction.fixed, 'My name is Jahongir');
  delete globalThis.fetch;
});

test('пустая реплика не выдаётся за разговор', async () => {
  resetState();
  setProvider('gemini');
  saveKey('ключ-для-проверки', 'gemini');
  globalThis.fetch = async () => geminiAnswer({ reply: '   ', replyRu: 'что-то' });

  await assert.rejects(
    () => sendTurn({ scenario: SCENE, level: 'A0', wordIds: [], history: [] }),
    /Пустой ответ/,
  );
  delete globalThis.fetch;
});

test('без ключа разговор не начинается', async () => {
  resetState();
  setProvider('gemini');
  await assert.rejects(
    () => sendTurn({ scenario: SCENE, level: 'A0', wordIds: [], history: [] }),
    /no-key/,
  );
});

/* ---------- Граница: разговор не двигает прогресс ---------- */

test('ответ модели не создаёт и не меняет ни одной карточки', async () => {
  resetState();
  setProvider('gemini');
  saveKey('ключ-для-проверки', 'gemini');
  update((s) => {
    s.cards = { hello: { ease: 2.5, interval: 6, reps: 1, lapses: 0, due: '2099-01-01' } };
  });
  const before = JSON.stringify(loadState().cards);

  globalThis.fetch = async () =>
    geminiAnswer({
      reply: 'Perfect English!',
      replyRu: 'Отличный английский!',
      correction: { original: '', fixed: '', explanation: '' },
      suggestion: '',
    });
  await sendTurn({ scenario: SCENE, level: 'A0', wordIds: allVocabIds().slice(0, 5), history: [] });

  assert.equal(
    JSON.stringify(loadState().cards),
    before,
    'похвала модели не должна отодвигать повторения',
  );
  delete globalThis.fetch;
});
