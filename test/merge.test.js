/**
 * Проверка слияния прогресса с двух устройств.
 *
 * Здесь важнее всего два свойства:
 *   1) слияние ничего не теряет — занятие на телефоне не должно исчезнуть
 *      после синхронизации с ноутбука;
 *   2) слияние ничего не выдумывает — счётчики не должны раздуваться
 *      от повторных синхронизаций.
 *
 * Второе проверяется отдельно: слияние состояния с самим собой обязано
 * оставлять его неизменным, иначе каждая синхронизация накручивала бы
 * прогресс на пустом месте.
 */
import test from 'node:test';
import assert from 'node:assert/strict';

const { mergeState, recomputeStreak, masteredCount } = await import('../src/core/merge.js');

const TODAY = '2026-08-16';

function baseState(over = {}) {
  return {
    createdAt: '2026-08-01T10:00:00.000Z',
    xp: 0,
    streak: 0,
    lastStudyDate: null,
    lessons: {},
    milestones: {},
    cards: {},
    history: {},
    pronunciation: {},
    listening: { attempts: 0, perfect: 0 },
    writing: { checked: 0, errorsFound: 0 },
    reading: {},
    audioTexts: {},
    dialogue: { turns: 0, offlineCompleted: 0, completedScenarios: [] },
    b2Practice: { speakingDone: 0 },
    b2Mock: { completed: {}, scores: {} },
    settings: { voiceRate: 0.9, dailyGoal: 20, apiKey: 'local-key' },
    ...over,
  };
}

test('слияние с самим собой ничего не меняет', () => {
  const state = baseState({
    xp: 300,
    history: { '2026-08-15': 20, '2026-08-16': 12 },
    lessons: { 'a0-u1-l1': { completedAt: '2026-08-15T09:00:00.000Z', score: 75 } },
    cards: { hello: { id: 'hello', reps: 3, interval: 15, ease: 2.5, due: '2026-08-30', lapses: 0 } },
    pronunciation: { hello: { attempts: 5, exact: 3, close: 1 } },
    listening: { attempts: 7, perfect: 2 },
    writing: { checked: 2, errorsFound: 9 },
  });

  const merged = mergeState(state, structuredClone(state), TODAY);

  assert.equal(merged.xp, 300, 'XP не должен удваиваться');
  assert.deepEqual(merged.history, state.history);
  assert.deepEqual(merged.cards, state.cards);
  assert.deepEqual(merged.pronunciation, state.pronunciation);
  assert.deepEqual(merged.listening, state.listening);
  assert.deepEqual(merged.writing, state.writing);
});

test('уроки объединяются, ни один не теряется', () => {
  const local = baseState({ lessons: { A: { completedAt: '2026-08-10T00:00:00Z', score: 50 } } });
  const remote = baseState({ lessons: { B: { completedAt: '2026-08-11T00:00:00Z', score: 90 } } });

  const merged = mergeState(local, remote, TODAY);
  assert.deepEqual(Object.keys(merged.lessons).sort(), ['A', 'B']);
});

test('на общем уроке остаётся первое прохождение и лучший результат', () => {
  const local = baseState({ lessons: { A: { completedAt: '2026-08-10T00:00:00Z', score: 40 } } });
  const remote = baseState({ lessons: { A: { completedAt: '2026-08-12T00:00:00Z', score: 95 } } });

  const merged = mergeState(local, remote, TODAY);
  assert.equal(merged.lessons.A.completedAt, '2026-08-10T00:00:00Z');
  assert.equal(merged.lessons.A.score, 95);
});

test('по слову побеждает более продвинутая карточка', () => {
  const local = baseState({
    cards: { w: { id: 'w', reps: 1, interval: 1, ease: 2.5, due: '2026-08-17', lapses: 0 } },
  });
  const remote = baseState({
    cards: { w: { id: 'w', reps: 4, interval: 37, ease: 2.6, due: '2026-09-20', lapses: 0 } },
  });

  assert.equal(mergeState(local, remote, TODAY).cards.w.reps, 4);
  assert.equal(mergeState(remote, local, TODAY).cards.w.reps, 4, 'результат не зависит от порядка');
});

test('пройденный milestone сохраняется между устройствами', () => {
  const local = baseState({ level: 'A0', milestones: {} });
  const remote = baseState({
    level: 'A1',
    milestones: { a0: { attempts: 2, bestScore: 80, passed: true, completedAt: '2026-08-16T10:00:00Z' } },
  });
  const merged = mergeState(local, remote, TODAY);
  assert.equal(merged.milestones.a0.passed, true);
  assert.equal(merged.milestones.a0.bestScore, 80);
  assert.equal(merged.level, 'A1');
});

test('свежий успешный ответ снимает ошибку после синхронизации', () => {
  const local = baseState({
    cards: {
      w: {
        id: 'w', reps: 1, interval: 1, ease: 2.5, due: '2026-08-17', lapses: 1,
        lastLapseAt: null, lastReviewAt: '2026-08-16T11:00:00.000Z',
      },
    },
  });
  const remote = baseState({
    cards: {
      w: {
        id: 'w', reps: 0, interval: 0, ease: 2.3, due: '2026-08-16', lapses: 1,
        lastLapseAt: '2026-08-16', lastReviewAt: '2026-08-16T10:00:00.000Z',
      },
    },
  });

  const merged = mergeState(local, remote, TODAY).cards.w;
  assert.equal(merged.lastLapseAt, null);
  assert.equal(merged.lastReviewAt, '2026-08-16T11:00:00.000Z');
});

test('карточка, которой нет на втором устройстве, сохраняется', () => {
  const local = baseState({ cards: { only: { id: 'only', reps: 2, interval: 6, ease: 2.5, due: '2026-08-22', lapses: 0 } } });
  const merged = mergeState(local, baseState(), TODAY);
  assert.ok(merged.cards.only, 'карточка с этого устройства не должна пропасть');
});

test('история за один день не складывается с двух устройств', () => {
  const local = baseState({ history: { '2026-08-16': 20 } });
  const remote = baseState({ history: { '2026-08-16': 15 } });

  const merged = mergeState(local, remote, TODAY);
  assert.equal(merged.history['2026-08-16'], 20, 'один день — один максимум, не 35');
});

test('дни занятий с разных устройств объединяются', () => {
  const local = baseState({ history: { '2026-08-14': 10 } });
  const remote = baseState({ history: { '2026-08-15': 10 } });

  const merged = mergeState(local, remote, TODAY);
  assert.deepEqual(Object.keys(merged.history).sort(), ['2026-08-14', '2026-08-15']);
});

test('стрик пересчитывается по объединённой истории, а не складывается', () => {
  // На каждом устройстве занимались через день — вместе выходит серия
  const local = baseState({ streak: 1, history: { '2026-08-14': 5, '2026-08-16': 5 } });
  const remote = baseState({ streak: 1, history: { '2026-08-15': 5 } });

  const merged = mergeState(local, remote, TODAY);
  assert.equal(merged.streak, 3, '14, 15 и 16 августа — серия из трёх дней');
  assert.equal(merged.lastStudyDate, '2026-08-16');
});

test('стрик обрывается, если последнее занятие было давно', () => {
  const merged = mergeState(
    baseState({ streak: 9, history: { '2026-08-01': 5, '2026-08-02': 5 } }),
    baseState(),
    TODAY,
  );
  assert.equal(merged.streak, 0, 'серия оборвана — рисовать её нельзя');
});

test('стрик считается и от вчерашнего дня', () => {
  const r = recomputeStreak({ '2026-08-14': 3, '2026-08-15': 3 }, TODAY);
  assert.equal(r.streak, 2, 'сегодня ещё не занимались, но серия жива');
});

test('пустая история даёт нулевой стрик', () => {
  assert.deepEqual(recomputeStreak({}, TODAY), { streak: 0, lastStudyDate: null });
});

test('счётчики берутся максимумом, а не суммой', () => {
  const local = baseState({
    pronunciation: { w: { attempts: 10, exact: 6, close: 2 } },
    listening: { attempts: 8, perfect: 3 },
    writing: { checked: 4, errorsFound: 20 },
  });
  const remote = baseState({
    pronunciation: { w: { attempts: 7, exact: 7, close: 0 } },
    listening: { attempts: 12, perfect: 1 },
    writing: { checked: 2, errorsFound: 30 },
  });

  const m = mergeState(local, remote, TODAY);
  assert.deepEqual(m.pronunciation.w, { attempts: 10, exact: 7, close: 2 });
  assert.deepEqual(m.listening, { attempts: 12, perfect: 3 });
  assert.deepEqual(m.writing, { checked: 4, errorsFound: 30 });
});

test('настройки и ключ API остаются локальными', () => {
  const local = baseState({ settings: { voiceRate: 0.6, dailyGoal: 40, apiKey: 'local-key' } });
  const remote = baseState({ settings: { voiceRate: 1.2, dailyGoal: 5, apiKey: 'ЧУЖОЙ-КЛЮЧ' } });

  const merged = mergeState(local, remote, TODAY);
  assert.equal(merged.settings.voiceRate, 0.6);
  assert.equal(merged.settings.dailyGoal, 40);
  assert.equal(merged.settings.apiKey, 'local-key', 'ключ с другого устройства не должен подменять локальный');
});

test('новые тренажёры не теряют прогресс между устройствами', () => {
  const local = baseState({
    onboardingDone: true,
    reading: { r1: { score: 70, at: '2026-08-15T10:00:00Z' } },
    dialogue: { turns: 3, offlineCompleted: 1, completedScenarios: ['meeting'] },
    b2Practice: { speakingDone: 2 },
    b2Mock: { completed: { Reading: true }, scores: { Reading: 60 } },
  });
  const remote = baseState({
    audioTexts: { a1: { score: 80, at: '2026-08-16T10:00:00Z' } },
    dialogue: { turns: 5, offlineCompleted: 2, completedScenarios: ['cafe'] },
    b2Practice: { speakingDone: 4 },
    b2Mock: { completed: { Listening: true }, scores: { Reading: 90, Listening: 75 } },
  });

  const merged = mergeState(local, remote, TODAY);
  assert.equal(merged.onboardingDone, true);
  assert.equal(merged.reading.r1.score, 70);
  assert.equal(merged.audioTexts.a1.score, 80);
  assert.deepEqual(merged.dialogue.completedScenarios.sort(), ['cafe', 'meeting']);
  assert.equal(merged.dialogue.turns, 5);
  assert.equal(merged.b2Practice.speakingDone, 4);
  assert.deepEqual(merged.b2Mock.completed, { Reading: true, Listening: true });
  assert.equal(merged.b2Mock.scores.Reading, 90);
});

test('дата создания берётся самая ранняя', () => {
  const local = baseState({ createdAt: '2026-08-05T00:00:00Z' });
  const remote = baseState({ createdAt: '2026-08-01T00:00:00Z' });
  assert.equal(mergeState(local, remote, TODAY).createdAt, '2026-08-01T00:00:00Z');
});

test('слияние с пустой удалённой копией сохраняет всё локальное', () => {
  const local = baseState({
    xp: 500,
    cards: { a: { id: 'a', reps: 3, interval: 15, ease: 2.5, due: '2026-09-01', lapses: 0 } },
    history: { '2026-08-16': 30 },
  });
  const merged = mergeState(local, null, TODAY);
  assert.equal(merged.xp, 500);
  assert.deepEqual(merged.cards, local.cards);
});

test('счётчик выученных слов считает по границе в 21 день', () => {
  const state = baseState({
    cards: {
      a: { interval: 37 },
      b: { interval: 21 },
      c: { interval: 6 },
    },
  });
  assert.equal(masteredCount(state), 2);
});
