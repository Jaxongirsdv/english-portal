import test from 'node:test';
import assert from 'node:assert/strict';

import { foundationSupportFor } from '../src/core/program-bridge.js';

test('каждому экзаменационному навыку соответствует точечная база', () => {
  assert.deepEqual(
    ['Reading', 'Listening', 'Writing', 'Speaking'].map((skill) => foundationSupportFor(skill)?.route),
    ['reading', 'listening', 'writing', 'pronounce'],
  );
});

test('неизвестный навык не получает выдуманную рекомендацию', () => {
  assert.equal(foundationSupportFor('Grammar'), null);
});
