/**
 * Проверка расписания автосинхронизации.
 *
 * Здесь ловится ошибка, которую руками не увидишь: синхронизация
 * сохраняет состояние, сохранение будит подписчика, подписчик ставит
 * следующую синхронизацию — и обмен идёт вечно, даже когда пользователь
 * ничего не делает. Внешне всё выглядит нормально, а лимит запросов
 * к GitHub исчерпывается за несколько часов.
 *
 * Поэтому главная проверка тут — «после обмена новых обменов не
 * назначается».
 */
import test from 'node:test';
import assert from 'node:assert/strict';

const store = new Map();
globalThis.localStorage = {
  getItem: (k) => (store.has(k) ? store.get(k) : null),
  setItem: (k, v) => store.set(k, String(v)),
  removeItem: (k) => store.delete(k),
};

// Проверяем механизм подписки на сохранение и правило подавления —
// сам модуль расписания завязан на браузерные события и таймеры,
// поэтому его логику воспроизводим здесь на той же схеме
const { loadState, update, saveState, resetState, onSave } = await import('../src/core/storage.js');

test('сохранение помечает состояние изменённым', () => {
  resetState();
  let saves = 0;
  onSave(() => saves++);

  update((s) => {
    s.xp += 10;
  });
  assert.equal(saves, 1, 'изменение прогресса должно будить подписчиков');
});

test('подписчик получает уже сохранённое состояние', () => {
  resetState();
  let seen = null;
  onSave(() => {
    seen = JSON.parse(localStorage.getItem('english-portal:v1')).xp;
  });

  update((s) => {
    s.xp = 42;
  });
  assert.equal(seen, 42, 'в localStorage должно быть новое значение к моменту вызова');
});

/**
 * Воспроизведение самого цикла — на упрощённой модели того, что делает
 * расписание. Проверяем именно правило подавления, а не таймеры.
 */
test('собственные сохранения синхронизации не назначают новый обмен', () => {
  resetState();

  let applyingSync = false;
  let scheduled = 0;

  onSave(() => {
    if (applyingSync) return;
    scheduled += 1;
  });

  // Занятие пользователя — обмен назначить нужно
  update((s) => {
    s.xp += 5;
  });
  assert.equal(scheduled, 1);

  // Обмен: пишет слитое состояние и отметку времени — двумя сохранениями
  applyingSync = true;
  update((s) => {
    s.xp = 500;
  });
  saveState();
  update((s) => {
    s.settings.lastSyncAt = '2026-08-16T18:00:00.000Z';
  });
  applyingSync = false;

  assert.equal(
    scheduled,
    1,
    'после обмена новых обменов быть не должно — иначе он перезапускает сам себя бесконечно',
  );
});

test('без подавления цикл действительно возникает', () => {
  resetState();
  let scheduled = 0;
  onSave(() => {
    scheduled += 1;
  });

  update((s) => {
    s.xp += 5;
  });
  const afterUser = scheduled;

  // Те же сохранения, но без подавления
  update((s) => {
    s.xp = 500;
  });
  update((s) => {
    s.settings.lastSyncAt = '2026-08-16T18:00:00.000Z';
  });

  assert.ok(
    scheduled > afterUser,
    'этот тест фиксирует, что подавление действительно необходимо',
  );
});

test('подписка снимается', () => {
  resetState();
  let count = 0;
  const off = onSave(() => count++);

  update((s) => {
    s.xp += 1;
  });
  off();
  update((s) => {
    s.xp += 1;
  });

  assert.equal(count, 1, 'после отписки уведомления приходить не должны');
});

test('ошибка в подписчике не ломает сохранение прогресса', () => {
  resetState();
  onSave(() => {
    throw new Error('подписчик упал');
  });

  update((s) => {
    s.xp = 77;
  });
  assert.equal(loadState().xp, 77, 'прогресс должен сохраниться несмотря на ошибку');
  assert.equal(JSON.parse(localStorage.getItem('english-portal:v1')).xp, 77);
});
