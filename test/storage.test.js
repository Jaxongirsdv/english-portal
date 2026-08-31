/**
 * Проверка бэкапа прогресса.
 *
 * У бэкапа два требования, которые тянут в разные стороны:
 *   1) секреты НЕ должны попадать в файл — он скачивается, пересылается
 *      и лежит в загрузках;
 *   2) секреты НЕ должны пропадать при восстановлении — иначе загрузка
 *      бэкапа молча ломает проверку письма и синхронизацию.
 *
 * Именно на втором я и ошибся: вырезал токен GitHub из экспорта,
 * но забыл сохранить его при импорте.
 */
import test from 'node:test';
import assert from 'node:assert/strict';

const store = new Map();
globalThis.localStorage = {
  getItem: (k) => (store.has(k) ? store.get(k) : null),
  setItem: (k, v) => store.set(k, String(v)),
  removeItem: (k) => store.delete(k),
};

const { loadState, update, resetState, exportState, importState, hasSaveError } = await import(
  '../src/core/storage.js'
);

const SECRETS = { apiKey: 'sk-ant-СЕКРЕТ', githubToken: 'ghp_СЕКРЕТ' };

function deviceWithProgress() {
  resetState();
  update((s) => {
    s.xp = 300;
    s.lessons = { L1: { completedAt: '2026-08-16T00:00:00Z', score: 90 } };
    s.cards = { w: { id: 'w', reps: 3, interval: 15, ease: 2.5, due: '2026-09-01', lapses: 0 } };
    s.settings.apiKey = SECRETS.apiKey;
    s.settings.githubToken = SECRETS.githubToken;
    s.settings.gistId = 'МОЙ_GIST';
    s.settings.voiceRate = 0.6;
  });
}

test('бэкап не содержит ни одного секрета', () => {
  deviceWithProgress();
  const backup = exportState();

  for (const [name, value] of Object.entries(SECRETS)) {
    assert.ok(!backup.includes(value), `значение ${name} утекло в бэкап`);
    assert.ok(!backup.includes(name), `поле ${name} осталось в бэкапе`);
  }
});

test('бэкап содержит прогресс', () => {
  deviceWithProgress();
  const parsed = JSON.parse(exportState());

  assert.equal(parsed.xp, 300);
  assert.equal(Object.keys(parsed.lessons).length, 1);
  assert.equal(Object.keys(parsed.cards).length, 1);
});

test('восстановление бэкапа не стирает секреты этого устройства', () => {
  deviceWithProgress();
  const backup = exportState();

  // Прогресс потеряли, но ключи на устройстве остались введёнными
  resetState();
  update((s) => {
    s.settings.apiKey = SECRETS.apiKey;
    s.settings.githubToken = SECRETS.githubToken;
  });

  importState(backup);
  const s = loadState().settings;

  assert.equal(s.apiKey, SECRETS.apiKey, 'ключ Claude должен пережить восстановление');
  assert.equal(s.githubToken, SECRETS.githubToken, 'токен GitHub должен пережить восстановление');
});

test('восстановление возвращает прогресс', () => {
  deviceWithProgress();
  const backup = exportState();
  resetState();
  importState(backup);

  const s = loadState();
  assert.equal(s.xp, 300);
  assert.equal(Object.keys(s.lessons).length, 1);
  assert.equal(Object.keys(s.cards).length, 1);
});

test('настройки из бэкапа применяются', () => {
  deviceWithProgress();
  const backup = exportState();
  resetState();
  importState(backup);

  assert.equal(loadState().settings.voiceRate, 0.6, 'скорость речи переносится');
  assert.equal(loadState().settings.gistId, 'МОЙ_GIST', 'идентификатор хранилища переносится');
});

test('бэкап со старой версии не ломает состояние', () => {
  resetState();
  // В старом бэкапе нет разделов, добавленных позже
  const old = JSON.stringify({ xp: 50, lessons: {}, cards: {}, history: {} });
  importState(old);

  const s = loadState();
  assert.equal(s.xp, 50);
  assert.deepEqual(s.listening, { attempts: 0, perfect: 0 }, 'недостающий раздел берётся по умолчанию');
  assert.deepEqual(s.writing, { checked: 0, errorsFound: 0 });
  assert.deepEqual(s.reading, {});
  assert.deepEqual(s.dialogue.completedScenarios, []);
  assert.deepEqual(s.b2Mock.completed, {});
  assert.deepEqual(s.b2Mock.history, []);
  assert.deepEqual(s.b2Training, { Reading: {}, Listening: {}, Writing: {}, Speaking: {} });
  assert.equal(s.b2FullMock, null);
  assert.equal(s.settings.dailyGoal, 20, 'настройки по умолчанию на месте');
  assert.equal(s.settings.activeProgram, 'foundation', 'старый прогресс открывается в программе базы');
});

test('восстановление на чистом устройстве оставляет секреты пустыми', () => {
  deviceWithProgress();
  const backup = exportState();
  resetState();
  importState(backup);

  const s = loadState().settings;
  assert.equal(s.apiKey, '', 'на новом устройстве ключ вводится заново');
  assert.equal(s.githubToken, '');
});

test('повреждённая структура бэкапа отклоняется до изменения состояния', () => {
  resetState();
  update((s) => { s.xp = 42; });

  assert.throws(() => importState(JSON.stringify({ cards: [] })), /invalid-backup-cards/);
  assert.equal(loadState().xp, 42);
});

test('повреждённые вложенные данные бэкапа не попадают в прогресс', () => {
  resetState();
  update((s) => { s.xp = 42; });

  assert.throws(
    () => importState(JSON.stringify({ cards: { hello: { reps: 'много' } } })),
    /invalid-backup-cards/,
  );
  assert.throws(
    () => importState(JSON.stringify({ history: { '2026-08-22': 'пять' } })),
    /invalid-backup-history/,
  );
  assert.equal(loadState().xp, 42, 'состояние остаётся прежним после обеих ошибок');
});

test('результаты B2-тренажёров проходят backup и проверку структуры', () => {
  resetState();
  update((s) => {
    s.b2Training.Reading['reading-part-1'] = { score: 83, lastScore: 67, at: '2026-08-31T10:00:00Z' };
  });
  const backup = exportState();
  resetState();
  importState(backup);
  assert.equal(loadState().b2Training.Reading['reading-part-1'].score, 83);

  assert.throws(
    () => importState(JSON.stringify({ b2Training: { Reading: { bad: { score: 'high' } } } })),
    /invalid-backup-b2Training/,
  );
});

test('ошибка localStorage не ломает сохранение в памяти', () => {
  const original = globalThis.localStorage.setItem;
  globalThis.localStorage.setItem = () => { throw new Error('quota'); };

  assert.doesNotThrow(() => update((s) => { s.xp += 1; }));
  assert.equal(hasSaveError(), true, 'интерфейс должен узнать о несохранённом прогрессе');
  globalThis.localStorage.setItem = original;
  update((s) => { s.xp += 1; });
  assert.equal(hasSaveError(), false, 'успешное сохранение снимает предупреждение');
});
