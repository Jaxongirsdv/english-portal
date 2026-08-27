import test from 'node:test';
import assert from 'node:assert/strict';

import { CURRICULUM } from '../src/data/curriculum.js';
import {
  isLessonUnlocked,
  isLevelUnlocked,
  isMilestoneUnlocked,
  lessonsForLevel,
  nextCurriculumStep,
} from '../src/core/curriculum-progress.js';

function state(overrides = {}) {
  return { lessons: {}, milestones: {}, ...overrides };
}

test('в начале открыт только первый урок A0', () => {
  const first = lessonsForLevel(CURRICULUM[0]);
  assert.equal(isLessonUnlocked(state(), first[0].id), true);
  assert.equal(isLessonUnlocked(state(), first[1].id), false);
  assert.equal(isLevelUnlocked(state(), CURRICULUM[1]), false);
});

test('завершённый урок открывает ровно следующий', () => {
  const lessons = lessonsForLevel(CURRICULUM[0]);
  const progress = state({ lessons: { [lessons[0].id]: { score: 90 } } });
  assert.equal(isLessonUnlocked(progress, lessons[1].id), true);
  assert.equal(isLessonUnlocked(progress, lessons[2].id), false);
  assert.equal(nextCurriculumStep(progress).lesson.id, lessons[1].id);
});

test('milestone открывается после всех уроков уровня', () => {
  const level = CURRICULUM[0];
  const completed = Object.fromEntries(lessonsForLevel(level).map((lesson) => [lesson.id, { score: 80 }]));
  const progress = state({ lessons: completed });
  assert.equal(isMilestoneUnlocked(progress, level.id), true);
  assert.deepEqual(nextCurriculumStep(progress).type, 'milestone');
});

test('успешный milestone открывает следующий уровень', () => {
  const firstLevel = CURRICULUM[0];
  const secondLevel = CURRICULUM[1];
  const completed = Object.fromEntries(lessonsForLevel(firstLevel).map((lesson) => [lesson.id, { score: 80 }]));
  const progress = state({ lessons: completed, milestones: { [firstLevel.id]: { passed: true, bestScore: 80 } } });
  assert.equal(isLevelUnlocked(progress, secondLevel), true);
  assert.equal(nextCurriculumStep(progress).lesson.id, lessonsForLevel(secondLevel)[0].id);
});

test('старый прогресс на уровне не блокируется новой системой', () => {
  const level = CURRICULUM[2];
  const first = lessonsForLevel(level)[0];
  const progress = state({ lessons: { [first.id]: { score: 75 } } });
  assert.equal(isLevelUnlocked(progress, level), true);
});

