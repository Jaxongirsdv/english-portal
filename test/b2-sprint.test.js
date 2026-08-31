import test from 'node:test';
import assert from 'node:assert/strict';

import { b2Sprint } from '../src/core/b2-sprint.js';
import { tasksForLevel } from '../src/data/writing-tasks.js';
import { B2_SPEAKING_PROMPTS } from '../src/data/b2-speaking.js';
import { B2_MOCK_PARTS, mockProgress } from '../src/views/b2-mock.js';
import { diagnosticReport, subjectiveScore } from '../src/core/b2-diagnostic.js';

test('план B2 начинает интенсив с регистрации и диагностики', () => {
  const sprint = b2Sprint('2026-08-23');
  assert.equal(sprint.daysLeft, 21);
  assert.equal(sprint.task.phase, 'Старт');
});

test('план B2 ведёт к нужному тренажёру в день письма', () => {
  const sprint = b2Sprint('2026-08-27');
  assert.equal(sprint.task.action, 'b2-writing');
  assert.equal(sprint.task.phase, 'Writing');
});

test('дни Reading и Listening ведут в отдельные экзаменационные тренажёры', () => {
  assert.equal(b2Sprint('2026-08-25').task.action, 'b2-reading');
  assert.equal(b2Sprint('2026-08-26').task.action, 'b2-listening');
});

test('дни Speaking ведут в тренажёр Speaking B2', () => {
  const sprint = b2Sprint('2026-08-28');
  assert.equal(sprint.task.action, 'b2-speaking');
});

test('после экзамена интенсив не предлагает устаревшие задания', () => {
  const sprint = b2Sprint('2026-09-13');
  assert.equal(sprint.examPassed, true);
  assert.equal(sprint.task, null);
});

test('письмо B2 тренирует форматы с объёмом и самопроверкой', () => {
  const tasks = tasksForLevel('B2');
  assert.deepEqual(tasks.map((task) => task.format), ['Неформальное email', 'Формальное email', 'Article / blog post']);
  assert.ok(tasks.every((task) => task.maxWords >= task.minWords && task.checklist.length >= 3));
});

test('говорение B2 даёт вопрос, структуру и полезные фразы', () => {
  assert.ok(B2_SPEAKING_PROMPTS.length >= 3);
  assert.ok(B2_SPEAKING_PROMPTS.every((task) => task.structure.length === 4 && task.phrases.length >= 4));
});

test('мини-пробник показывает прогресс по четырём навыкам', () => {
  const completed = { Reading: true, Listening: true };
  const progress = mockProgress({ b2Mock: { completed } });
  assert.equal(B2_MOCK_PARTS.length, 4);
  assert.equal(progress.done, 2);
  assert.equal(progress.total, 4);
});

test('самооценка письма учитывает критерии и нужный объём', () => {
  assert.equal(subjectiveScore('Writing', [0, 1, 2, 3], true), 100);
  assert.equal(subjectiveScore('Writing', [0, 1], false), 40);
  assert.equal(subjectiveScore('Speaking', [0, 1, 2], false), 75);
});

test('диагностика выбирает слабейший навык и не скрывает его средним баллом', () => {
  const report = diagnosticReport({ Reading: 90, Listening: 80, Writing: 70, Speaking: 30 });
  assert.equal(report.overall, 68);
  assert.equal(report.weakest, 'Speaking');
  assert.equal(report.readiness.level, 'low');
  assert.equal(report.recommendation.route, 'b2-speaking');
});
