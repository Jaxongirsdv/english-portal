import test from 'node:test';
import assert from 'node:assert/strict';

import { NAV, parseRoute } from '../src/core/navigation.js';

test('навигация содержит уникальные идентификаторы экранов', () => {
  const ids = NAV.map((item) => item.id);

  assert.equal(new Set(ids).size, ids.length);
  assert.ok(ids.includes('dashboard'));
  assert.ok(ids.includes('settings'));
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
