import test from 'node:test';
import assert from 'node:assert/strict';

const store = new Map();
globalThis.localStorage = {
  getItem: (key) => store.get(key) ?? null,
  setItem: (key, value) => store.set(key, String(value)),
  removeItem: (key) => store.delete(key),
};

const { resetState, update, loadState } = await import('../src/core/storage.js');
const { allLessons } = await import('../src/data/curriculum.js');
const { dailyPlan } = await import('../src/core/daily-plan.js');

test('план начинает с повторения, когда карточки уже ждут', () => {
  resetState();
  update((state) => {
    state.cards = { hello: { due: '2000-01-01', reps: 1, interval: 1, ease: 2.5, lapses: 0 } };
  });
  const plan = dailyPlan(loadState());
  assert.equal(plan[0].kind, 'review');
  assert.equal(plan[0].route, 'review');
});

test('слабый урок появляется раньше нового материала', () => {
  const lesson = allLessons()[0];
  resetState();
  update((state) => { state.lessons = { [lesson.id]: { score: 45 } }; });
  const plan = dailyPlan(loadState());
  assert.equal(plan[0].kind, 'repair');
  assert.equal(plan[0].route, `lesson:${lesson.id}`);
  assert.equal(plan[1].kind, 'advance');
});

test('план не разрастается больше трёх шагов', () => {
  const lessons = allLessons();
  resetState();
  update((state) => {
    state.cards = { hello: { due: '2000-01-01', reps: 1, interval: 1, ease: 2.5, lapses: 0 } };
    state.lessons = { [lessons[0].id]: { score: 45 } };
  });
  assert.ok(dailyPlan(loadState()).length <= 3);
});
