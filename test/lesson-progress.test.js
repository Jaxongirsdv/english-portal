import test from 'node:test';
import assert from 'node:assert/strict';

import {
  isLessonMastered,
  lessonAttempt,
  lessonStage,
} from '../src/core/lesson-progress.js';

test('статусы попытки разделены порогами 50% и 80%', () => {
  assert.equal(lessonStage(null), 'not-started');
  assert.equal(lessonStage({ score: 49 }), 'attempted');
  assert.equal(lessonStage({ score: 50 }), 'completed');
  assert.equal(lessonStage({ score: 79 }), 'completed');
  assert.equal(lessonStage({ score: 80 }), 'mastered');
});

test('слабая попытка сохраняется, но не получает даты освоения', () => {
  const result = lessonAttempt(null, 40, '2026-09-01T10:00:00Z');

  assert.equal(result.attemptedAt, '2026-09-01T10:00:00Z');
  assert.equal(result.completedAt, null);
  assert.equal(result.masteredAt, null);
  assert.equal(result.attempts, 1);
  assert.equal(isLessonMastered(result), false);
});

test('лучшая оценка и первая дата не теряются между попытками', () => {
  const first = lessonAttempt(null, 60, '2026-09-01T10:00:00Z');
  const second = lessonAttempt(first, 40, '2026-09-01T11:00:00Z');

  assert.equal(second.attemptedAt, first.attemptedAt);
  assert.equal(second.completedAt, first.completedAt);
  assert.equal(second.score, 60);
  assert.equal(second.lastScore, 40);
  assert.equal(second.attempts, 2);
});

test('успешное закрепление переводит старую попытку в освоенную', () => {
  const weak = lessonAttempt(null, 60, '2026-09-01T10:00:00Z');
  const mastered = lessonAttempt(weak, 100, '2026-09-01T11:00:00Z');

  assert.equal(mastered.score, 100);
  assert.equal(mastered.masteredAt, '2026-09-01T11:00:00Z');
  assert.equal(isLessonMastered(mastered), true);
});

test('очень старый урок без score остаётся освоенным', () => {
  assert.equal(lessonStage({ completedAt: '2025-01-01T00:00:00Z' }), 'mastered');
});
