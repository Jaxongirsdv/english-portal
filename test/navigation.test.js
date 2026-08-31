import test from 'node:test';
import assert from 'node:assert/strict';

import {
  EXAM_NAV,
  NAV,
  navigationForProgram,
  parseRoute,
  primarySection,
  programForRoute,
  sectionTabs,
  routeFromHash,
  routeHash,
} from '../src/core/navigation.js';

test('навигация содержит уникальные идентификаторы экранов', () => {
  const ids = NAV.map((item) => item.id);

  assert.equal(new Set(ids).size, ids.length);
  assert.ok(ids.includes('dashboard'));
  assert.deepEqual(ids, ['dashboard', 'roadmap', 'review', 'vocab', 'progress']);
  assert.deepEqual(EXAM_NAV.map((item) => item.id), ['exam', 'exam-skills', 'exam-mocks', 'exam-errors', 'exam-readiness']);
  assert.equal(navigationForProgram('exam'), EXAM_NAV);
  assert.equal(navigationForProgram('foundation'), NAV);
});

test('вложенные режимы остаются в своём основном разделе', () => {
  assert.equal(primarySection('listening'), 'review');
  assert.equal(primarySection('lesson'), 'roadmap');
  assert.equal(primarySection('settings'), 'progress');
  assert.deepEqual(sectionTabs('reading').map((tab) => tab.id), ['roadmap', 'reading', 'dialogue']);
  assert.equal(primarySection('b2-speaking'), 'exam-skills');
  assert.equal(primarySection('b2-reading'), 'exam-skills');
  assert.equal(primarySection('b2-listening'), 'exam-skills');
  assert.equal(primarySection('b2-writing'), 'exam-skills');
  assert.equal(primarySection('b2-full-mock'), 'exam-mocks');
  assert.deepEqual(sectionTabs('b2-speaking'), []);
  assert.ok(!sectionTabs('review').some((tab) => tab.id === 'b2-speaking'));
  assert.equal(primarySection('exam'), 'exam');
  assert.equal(primarySection('b2-mock'), 'exam-mocks');
  assert.deepEqual(sectionTabs('exam'), []);
  assert.equal(programForRoute('dashboard'), 'foundation');
  assert.equal(programForRoute('b2-reading'), 'exam');
  assert.equal(programForRoute('exam-errors'), 'exam');
});

test('маршрут без параметра разбирается в имя экрана', () => {
  assert.deepEqual(parseRoute('dashboard'), {
    name: 'dashboard',
    param: null,
  });
});

test('маршрут урока сохраняет параметр после двоеточия', () => {
  assert.deepEqual(parseRoute('lesson:a1-u2-l3'), {
    name: 'lesson',
    param: 'a1-u2-l3',
  });
});

test('пустой параметр нормализуется в null', () => {
  assert.deepEqual(parseRoute('lesson:'), {
    name: 'lesson',
    param: null,
  });
});

test('hash сохраняет маршрут и параметр урока', () => {
  assert.equal(routeHash('lesson:a1-u2-l3'), '#/foundation/lesson:a1-u2-l3');
  assert.deepEqual(routeFromHash('#/foundation/lesson:a1-u2-l3'), {
    name: 'lesson',
    param: 'a1-u2-l3',
  });
  assert.deepEqual(routeFromHash('#/lesson:a1-u2-l3'), { name: 'lesson', param: 'a1-u2-l3' });
});

test('пустой или неизвестный hash открывает главную', () => {
  assert.deepEqual(routeFromHash(''), { name: 'dashboard', param: null });
  assert.deepEqual(routeFromHash('#/unknown'), { name: 'dashboard', param: null });
});

test('экзаменационный центр имеет отдельный маршрут', () => {
  assert.deepEqual(routeFromHash('#/exam/today'), { name: 'exam', param: null });
  assert.deepEqual(routeFromHash('#/exam'), { name: 'exam', param: null });
  assert.equal(routeHash('exam'), '#/exam/today');
  assert.equal(routeHash('exam-skills'), '#/exam/skills');
  assert.equal(routeHash('exam-mocks'), '#/exam/mocks');
  assert.equal(routeHash('exam-errors'), '#/exam/errors');
  assert.equal(routeHash('exam-readiness'), '#/exam/readiness');
  assert.deepEqual(routeFromHash('#/exam/skills'), { name: 'exam-skills', param: null });
  assert.deepEqual(routeFromHash('#/b2-reading'), { name: 'b2-reading', param: null });
  assert.deepEqual(routeFromHash('#/exam/reading'), { name: 'b2-reading', param: null });
  assert.deepEqual(routeFromHash('#/b2-listening'), { name: 'b2-listening', param: null });
  assert.deepEqual(routeFromHash('#/b2-writing'), { name: 'b2-writing', param: null });
  assert.deepEqual(routeFromHash('#/b2-full-mock'), { name: 'b2-full-mock', param: null });
});

test('пустой адрес может открыть последнюю выбранную программу', () => {
  assert.deepEqual(routeFromHash('', 'exam'), { name: 'exam', param: null });
  assert.deepEqual(routeFromHash('', 'dashboard'), { name: 'dashboard', param: null });
});
