import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, statSync } from 'node:fs';
import { join } from 'node:path';

import { acceptsAnswer, skillTrainingSummary, trainingResult } from '../src/core/b2-training.js';
import { B2_LISTENING_PARTS, B2_READING_PARTS, MULTILEVEL_FORMAT } from '../src/data/b2-multilevel.js';
import { B2_WRITING_PARTS } from '../src/data/b2-writing.js';
import { examReadiness } from '../src/core/b2-readiness.js';

test('официальный формат Multilevel зафиксирован отдельно от сокращённой тренировки', () => {
  assert.deepEqual(MULTILEVEL_FORMAT.Reading, { minutes: 60, parts: 5, questions: 35 });
  assert.deepEqual(MULTILEVEL_FORMAT.Listening, { minutes: 45, parts: 6, questions: 35, plays: 2 });
});

test('Reading B2 содержит 5 частей и 35 заданий', () => {
  assert.equal(B2_READING_PARTS.length, 5);
  assert.deepEqual(B2_READING_PARTS.map((part) => part.questions.length), [6, 8, 6, 9, 6]);
  assert.equal(B2_READING_PARTS.reduce((sum, part) => sum + part.questions.length, 0), 35);
  assert.equal(B2_READING_PARTS.reduce((sum, part) => sum + part.minutes, 0), 60);
  assert.ok(B2_READING_PARTS[0].questions.every((question) => question.type === 'input'));
});

test('Listening B2 содержит 6 частей, 35 заданий и готовые аудиофайлы', () => {
  assert.equal(B2_LISTENING_PARTS.length, 6);
  assert.deepEqual(B2_LISTENING_PARTS.map((part) => part.questions.length), [8, 6, 4, 5, 6, 6]);
  assert.equal(B2_LISTENING_PARTS.reduce((sum, part) => sum + part.questions.length, 0), 35);
  assert.equal(B2_LISTENING_PARTS.reduce((sum, part) => sum + part.minutes, 0), 45);
  assert.ok(B2_LISTENING_PARTS[0].questions.every((question) => question.audio && question.options.length === 3));
  const sources = B2_LISTENING_PARTS.flatMap((part) => [part.audioSrc, ...part.questions.map((question) => question.audioSrc)]).filter(Boolean);
  assert.equal(new Set(sources).size, 16);
  for (const source of new Set(sources)) {
    const path = join(process.cwd(), 'public', source);
    assert.equal(existsSync(path), true, `${source} отсутствует`);
    assert.ok(statSync(path).size > 44, `${source} не содержит WAV-аудио`);
  }
});

test('Writing B2 содержит два email и статью в заданном объёме', () => {
  assert.equal(B2_WRITING_PARTS.length, 2);
  assert.deepEqual(B2_WRITING_PARTS[0].fields.map((field) => [field.minWords, field.maxWords]), [[45, 60], [120, 150]]);
  assert.deepEqual(B2_WRITING_PARTS[1].fields.map((field) => [field.minWords, field.maxWords]), [[180, 200]]);
});

test('свободный ответ терпит регистр и принимает допустимые варианты', () => {
  const question = { answers: ['2', 'two'] };
  assert.equal(acceptsAnswer(question, ' TWO! '), true);
  assert.equal(acceptsAnswer(question, 'three'), false);
  assert.equal(acceptsAnswer(question, ''), false);
});

test('тренировочный результат честно учитывает неотвеченные вопросы', () => {
  assert.deepEqual(trainingResult([true, false, true], 5), {
    right: 2,
    total: 5,
    percent: 40,
    score75: 30,
  });
});

test('сводка навыка считает только существующие части', () => {
  const state = { b2Training: { Reading: { 'reading-part-1': { score: 80 } } } };
  assert.deepEqual(skillTrainingSummary(state, 'Reading', B2_READING_PARTS), {
    completed: 1,
    total: 5,
    percent: 80,
  });
});

test('полный пробник не засчитывает результаты из прошлой попытки', () => {
  const old = '2026-08-31T09:00:00Z';
  const started = '2026-08-31T10:00:00Z';
  const fresh = '2026-08-31T11:00:00Z';
  const state = { b2Training: { Reading: {}, Listening: {}, Writing: {}, Speaking: {} } };
  for (const part of B2_READING_PARTS) state.b2Training.Reading[part.id] = { lastScore: 80, at: fresh };
  for (const part of B2_LISTENING_PARTS) state.b2Training.Listening[part.id] = { lastScore: 70, at: fresh };
  for (const part of B2_WRITING_PARTS) state.b2Training.Writing[part.id] = { lastScore: 60, at: fresh };
  state.b2Training.Speaking.recording = { lastScore: 90, at: old };

  const report = examReadiness(state, started);
  assert.equal(report.ready, false);
  assert.equal(report.skills.Speaking.completed, 0);
  state.b2Training.Speaking.recording.at = fresh;
  assert.equal(examReadiness(state, started).ready, true);
});
