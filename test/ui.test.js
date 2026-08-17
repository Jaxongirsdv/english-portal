/**
 * Проверка помощников рендера.
 *
 * Главная здесь — esc(). Портал собирает разметку строками, и esc()
 * остаётся единственной защитой от того, чтобы чужой текст — ответ
 * модели, распознанная речь, содержимое из облака — не стал разметкой.
 * Ошибка в ней не проявится нигде, пока не проявится сразу везде,
 * поэтому проверяем её недоверчиво.
 */
import test from 'node:test';
import assert from 'node:assert/strict';

const { esc, speakBtn, progressBar, shuffle, normalize, plural } = await import(
  '../src/core/ui.js'
);

/* ---------- esc ---------- */

test('экранируются все символы, ломающие разметку', () => {
  assert.equal(esc('<'), '&lt;');
  assert.equal(esc('>'), '&gt;');
  assert.equal(esc('&'), '&amp;');
  assert.equal(esc('"'), '&quot;');
  assert.equal(esc("'"), '&#39;');
});

test('попытка внедрить скрипт обезвреживается', () => {
  const attack = '<script>alert(1)</script>';
  const safe = esc(attack);

  assert.ok(!safe.includes('<script'), 'открывающего тега остаться не должно');
  assert.ok(!safe.includes('</script'), 'закрывающего тоже');
  assert.equal(safe, '&lt;script&gt;alert(1)&lt;/script&gt;');
});

test('нельзя вырваться из значения атрибута', () => {
  // Классический приём: закрыть кавычку и дописать обработчик события
  const attack = '" onerror="alert(1)';
  const safe = esc(attack);

  assert.ok(!safe.includes('"'), 'двойных кавычек в выводе быть не может');
  assert.ok(safe.includes('&quot;'));

  const single = esc("' onmouseover='alert(1)");
  assert.ok(!single.includes("'"), 'одинарных тоже');
});

test('амперсанд не экранируется дважды', () => {
  // Если бы & обрабатывался после остальных, вышло бы &amp;lt;
  assert.equal(esc('<'), '&lt;');
  assert.equal(esc('&amp;'), '&amp;amp;', 'уже экранированный текст экранируется как обычный');
  assert.equal(esc('a & b'), 'a &amp; b');
});

test('пустые значения не превращаются в строку «undefined»', () => {
  assert.equal(esc(undefined), '');
  assert.equal(esc(null), '');
  assert.equal(esc(''), '');
  assert.equal(esc(0), '0', 'ноль — осмысленное значение, а не пустота');
});

test('обычный текст не портится', () => {
  assert.equal(esc('Привет, мир!'), 'Привет, мир!');
  assert.equal(esc('I have a car'), 'I have a car');
  assert.equal(esc('/ˈwɔːtə/'), '/ˈwɔːtə/', 'транскрипция не должна страдать');
});

test('кнопка озвучки экранирует текст в атрибуте', () => {
  // Сюда попадают примеры из словаря и ответы модели
  const html = speakBtn('" onclick="alert(1)');

  assert.ok(!/data-speak="[^"]*"[^>]*onclick/.test(html), 'обработчик не должен появиться');
  assert.ok(html.includes('&quot;'));
});

/* ---------- progressBar ---------- */

test('полоса прогресса не выходит за границы', () => {
  assert.ok(progressBar(-50).includes('width:0%'), 'отрицательное значение прижимается к нулю');
  assert.ok(progressBar(150).includes('width:100%'), 'а избыточное — к сотне');
  assert.ok(progressBar(33.7).includes('width:34%'), 'дробное округляется');
});

/* ---------- shuffle ---------- */

test('перемешивание не трогает исходный массив', () => {
  const source = [1, 2, 3, 4, 5];
  const copy = [...source];
  shuffle(source);

  assert.deepEqual(source, copy, 'исходные данные должны остаться нетронутыми');
});

test('при перемешивании ничего не теряется и не дублируется', () => {
  const source = ['a', 'b', 'c', 'd', 'e', 'f'];
  const mixed = shuffle(source);

  assert.equal(mixed.length, source.length);
  assert.deepEqual([...mixed].sort(), [...source].sort());
});

test('перемешивание переживает пустой и одиночный массив', () => {
  assert.deepEqual(shuffle([]), []);
  assert.deepEqual(shuffle(['один']), ['один']);
});

/* ---------- normalize ---------- */

test('регистр и знаки препинания не считаются ошибкой', () => {
  assert.equal(normalize('Good Morning.'), 'good morning');
  assert.equal(normalize('I  have   a car!'), 'i have a car');
  assert.equal(normalize('  Hello?  '), 'hello');
});

test('апостроф прощается в обоих начертаниях', () => {
  // В уроках апостроф фигурный, с клавиатуры набирается прямой
  assert.equal(normalize("I don't know"), normalize('I don’t know'));
  assert.equal(normalize("don't"), 'dont');
});

test('нормализация пустого значения не падает', () => {
  assert.equal(normalize(undefined), '');
  assert.equal(normalize(null), '');
});

/* ---------- plural ---------- */

test('русские окончания выбираются по правилу, а не по последней цифре', () => {
  const f = (n) => plural(n, 'урок', 'урока', 'уроков');

  assert.equal(f(1), '1 урок');
  assert.equal(f(2), '2 урока');
  assert.equal(f(4), '4 урока');
  assert.equal(f(5), '5 уроков');
  assert.equal(f(0), '0 уроков');
});

test('второй десяток — исключение, которое ломает наивную реализацию', () => {
  const f = (n) => plural(n, 'урок', 'урока', 'уроков');

  assert.equal(f(11), '11 уроков', 'не «11 урок»');
  assert.equal(f(12), '12 уроков', 'не «12 урока»');
  assert.equal(f(13), '13 уроков');
  assert.equal(f(14), '14 уроков');
});

test('за пределами первой сотни правило повторяется', () => {
  const f = (n) => plural(n, 'слово', 'слова', 'слов');

  assert.equal(f(21), '21 слово');
  assert.equal(f(22), '22 слова');
  assert.equal(f(25), '25 слов');
  assert.equal(f(101), '101 слово');
  assert.equal(f(111), '111 слов', 'второй десяток остаётся исключением и в сотнях');
  assert.equal(f(112), '112 слов');
  assert.equal(f(122), '122 слова');
});
