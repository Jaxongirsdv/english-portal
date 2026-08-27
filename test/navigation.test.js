import test from 'node:test';
import assert from 'node:assert/strict';

import {
  NAV,
  parseRoute,
  primarySection,
  sectionTabs,
  routeFromHash,
  routeHash,
} from '../src/core/navigation.js';

test('навигация содержит уникальные идентификаторы экранов', () => {
  const ids = NAV.map((item) => item.id);

  assert.equal(new Set(ids).size, ids.length);
  assert.ok(ids.includes('dashboard'));
  assert.deepEqual(ids, ['dashboard', 'roadmap', 'review', 'vocab', 'progress']);
});

test('вложенные режимы остаются в своём основном разделе', () => {
  assert.equal(primarySection('listening'), 'review');
  assert.equal(primarySection('lesson'), 'roadmap');
  assert.equal(primarySection('settings'), 'progress');
  assert.deepEqual(sectionTabs('reading').map((tab) => tab.id), ['roadmap', 'reading', 'dialogue']);
  assert.ok(sectionTabs('b2-speaking').some((tab) => tab.id === 'b2-speaking'));
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
  assert.equal(routeHash('lesson:a1-u2-l3'), '#/lesson:a1-u2-l3');
  assert.deepEqual(routeFromHash('#/lesson:a1-u2-l3'), {
    name: 'lesson',
    param: 'a1-u2-l3',
  });
});

test('пустой или неизвестный hash открывает главную', () => {
  assert.deepEqual(routeFromHash(''), { name: 'dashboard', param: null });
  assert.deepEqual(routeFromHash('#/unknown'), { name: 'dashboard', param: null });
});
