import test from 'node:test';
import assert from 'node:assert/strict';

import { CURRICULUM } from '../src/data/curriculum.js';
import {
  MILESTONE_QUESTION_COUNT,
  buildMilestoneAssessment,
  milestoneAnswerCorrect,
  scoreMilestoneAssessment,
} from '../src/core/milestone-assessment.js';
import { MILESTONE_PASS_PERCENT } from '../src/core/curriculum-progress.js';

function seeded(seed) {
  let value = seed;
  return () => {
    value = (value * 1664525 + 1013904223) % 4294967296;
    return value / 4294967296;
  };
}

test('каждый milestone проверяет язык, чтение и аудирование', () => {
  for (const level of CURRICULUM) {
    const assessment = buildMilestoneAssessment(level, seeded(10));
    const counts = assessment.questions.reduce((result, question) => {
      result[question.section] = (result[question.section] || 0) + 1;
      return result;
    }, {});

    assert.equal(assessment.questions.length, MILESTONE_QUESTION_COUNT, level.code);
    assert.deepEqual(counts, { knowledge: 6, reading: 3, listening: 3 }, level.code);
    assert.equal(assessment.questions.filter((question) => question.mode === 'input').length, 2, level.code);
    assert.equal(assessment.readingText.level, level.code);
    assert.equal(assessment.listeningText.level, level.code);
    assert.notEqual(assessment.readingText.id, assessment.listeningText.id);
  }
});

test('правильный вариант не остаётся на постоянной позиции', () => {
  const level = CURRICULUM[2];
  const first = buildMilestoneAssessment(level, seeded(1));
  const second = buildMilestoneAssessment(level, seeded(2));
  const signature = (assessment) => assessment.questions
    .map((question) => `${question.id}:${question.options?.join('|') || ''}`)
    .join('\n');

  assert.notEqual(signature(first), signature(second));
});

test('открытый ответ терпит регистр, пробелы и пунктуацию', () => {
  const question = { mode: 'input', answer: 'I have already finished.' };
  assert.equal(milestoneAnswerCorrect(question, '  i HAVE already finished! '), true);
  assert.equal(milestoneAnswerCorrect(question, 'I finished yesterday'), false);
});

test('высокий общий балл не скрывает провал отдельного навыка', () => {
  const { questions } = buildMilestoneAssessment(CURRICULUM[3], seeded(4));
  const answers = questions.map(() => true);
  const listening = questions
    .map((question, index) => (question.section === 'listening' ? index : -1))
    .filter((index) => index >= 0);
  answers[listening[0]] = false;
  answers[listening[1]] = false;

  const result = scoreMilestoneAssessment(questions, answers, MILESTONE_PASS_PERCENT);
  assert.equal(result.percent, 83, 'общий порог формально пройден');
  assert.equal(result.sections.listening.percent, 33);
  assert.equal(result.passed, false, 'уровень не подтверждается при слабом Listening');
});

test('уровень подтверждается только при общем и секционных порогах', () => {
  const { questions } = buildMilestoneAssessment(CURRICULUM[4], seeded(8));
  const answers = questions.map(() => true);
  answers[0] = false;
  answers[6] = false;

  const result = scoreMilestoneAssessment(questions, answers, MILESTONE_PASS_PERCENT);
  assert.equal(result.percent, 83);
  assert.equal(result.sections.knowledge.percent, 83);
  assert.equal(result.sections.reading.percent, 67);
  assert.equal(result.sections.listening.percent, 100);
  assert.equal(result.passed, true);
});
