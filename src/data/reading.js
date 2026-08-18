/**
 * Тексты для чтения.
 *
 * Чтение — единственный навык, которого в портале не было совсем. Оно
 * закрепляет слова иначе, чем карточки: там слово вспоминают по команде,
 * здесь его узнают в потоке, среди других, и понимают не глядя в перевод.
 *
 * Главное ограничение — словарь. Текст, где половина слов незнакома,
 * не читают, а расшифровывают, и пользы от него нет. Поэтому каждый текст
 * написан словами своего уровня и предыдущих, а всё остальное вынесено
 * в глоссарий — короткий список рядом с текстом. Тест сверяет это пословно:
 * на глаз такое не удержать, и со временем сюда неизбежно просочилось бы
 * что-нибудь лишнее.
 *
 * Глоссарий намеренно на виду у читателя, а не спрятан в проверках. Список
 * незнакомых слов внутри теста был бы удобной лазейкой: туда можно свалить
 * что угодно, и правило про уровень перестало бы что-либо значить.
 *
 * Отсюда же простота верхних уровней. На четырёхстах словах колоды
 * естественной прозы C1 не написать, а притворяться, что написана, —
 * значит выдавать расшифровку со словарём за чтение. Тексты C1 читаются
 * проще настоящих C1, и это честная цена.
 */

export const TEXTS = [
  /* ---------- A0 ---------- */
  {
    id: 'a0-meeting',
    level: 'A0',
    title: 'My friend Sam',
    titleRu: 'Мой друг Сэм',
    names: ['Ann', 'Sam'],
    glossary: [],
    paragraphs: [
      'Hello! My name is Ann. I am a woman.',
      'This is my house. That is my book.',
      'This man is my friend. His name is Sam.',
      'Nice to meet you. Goodbye!',
    ],
    questions: [
      { q: 'Как зовут рассказчицу?', options: ['Ann', 'Sam', 'Anna'], answer: 'Ann' },
      { q: 'Кто такой Сэм?', options: ['my friend', 'my book', 'my house'], answer: 'my friend' },
      { q: 'Что названо рядом с домом?', options: ['my book', 'my work', 'my city'], answer: 'my book' },
    ],
  },
  {
    id: 'a0-numbers',
    level: 'A0',
    title: 'One, two, three',
    titleRu: 'Раз, два, три',
    names: ['Tom'],
    glossary: [],
    paragraphs: [
      'Good morning! My name is Tom.',
      'This is my work. My work is my time.',
      'One book, two books, three books. Four, five, six.',
      'Water and food, please. Thank you!',
    ],
    questions: [
      { q: 'Как зовут рассказчика?', options: ['Tom', 'Sam', 'Ann'], answer: 'Tom' },
      { q: 'Сколько книг названо по порядку?', options: ['three', 'six', 'ten'], answer: 'three' },
      { q: 'Что он просит в конце?', options: ['water and food', 'a book', 'my time'], answer: 'water and food' },
    ],
  },

  /* ---------- A1 ---------- */
  {
    id: 'a1-family',
    level: 'A1',
    title: 'My family',
    titleRu: 'Моя семья',
    names: ['Maria', 'Nick'],
    glossary: [{ en: 'doctor', ru: 'врач' }],
    paragraphs: [
      'My name is Maria. I live in a big city. My house is small, but it is good.',
      'I have a family. My mother is a doctor and my father works in an office. My brother Nick is a child. He is happy today.',
      'We eat bread and drink tea in the kitchen. My mother makes coffee in the morning.',
      'I like my family. I want to live here always.',
    ],
    questions: [
      { q: 'Где живёт Мария?', options: ['in a big city', 'in a small office', 'in a school'], answer: 'in a big city' },
      { q: 'Где работает отец?', options: ['in an office', 'in a shop', 'at home'], answer: 'in an office' },
      { q: 'Что мама делает утром?', options: ['makes coffee', 'reads a book', 'drives a car'], answer: 'makes coffee' },
    ],
  },
  {
    id: 'a1-week',
    level: 'A1',
    title: 'My week',
    titleRu: 'Моя неделя',
    names: ['Ben'],
    glossary: [{ en: 'film', ru: 'фильм' }],
    paragraphs: [
      'I am Ben. I work in a shop on Monday, Tuesday and Wednesday.',
      'On Thursday I study at school. I read books and write. I always need my computer.',
      'On Friday evening I play with my friends. We often watch a new film.',
      'On Saturday and Sunday I sleep, cook food and help my mother. I never work on Sunday.',
    ],
    questions: [
      { q: 'Где Бен работает в понедельник?', options: ['in a shop', 'at school', 'in an office'], answer: 'in a shop' },
      { q: 'Что он делает в четверг?', options: ['study at school', 'play with friends', 'cook food'], answer: 'study at school' },
      { q: 'Как часто он работает в воскресенье?', options: ['never', 'always', 'often'], answer: 'never' },
    ],
  },

  /* ---------- A2 ---------- */
  {
    id: 'a2-holiday',
    level: 'A2',
    title: 'A cold holiday',
    titleRu: 'Холодный отпуск',
    names: ['Lena'],
    glossary: [
      { en: 'sea', ru: 'море' },
      { en: 'winter', ru: 'зима' },
      { en: 'weather', ru: 'погода' },
      { en: 'sun', ru: 'солнце' },
    ],
    paragraphs: [
      'Last year Lena went to a small city near the sea. The holiday was very cheap, because it was winter.',
      'The weather was cold and it often rained. She waited for the sun, but the sun did not come.',
      'Then she bought a beautiful old book and went to a restaurant. She drank hot tea and read all day.',
      'It was not the holiday she wanted, but it was interesting. Now she thinks it was better than a hot city.',
    ],
    questions: [
      { q: 'Почему отпуск был дешёвым?', options: ['because it was winter', 'because it was short', 'because she had a friend there'], answer: 'because it was winter' },
      { q: 'Что она делала в ресторане?', options: ['drank hot tea and read', 'waited for the sun', 'bought a phone'], answer: 'drank hot tea and read' },
      { q: 'Что она думает об этом сейчас?', options: ['it was better than a hot city', 'it was a bad holiday', 'she will never go there'], answer: 'it was better than a hot city' },
    ],
  },
  {
    id: 'a2-first-job',
    level: 'A2',
    title: 'The first day at work',
    titleRu: 'Первый день на работе',
    names: ['Omar'],
    glossary: [
      { en: 'early', ru: 'рано' },
      { en: 'mistake', ru: 'ошибка' },
      { en: 'tired', ru: 'уставший' },
    ],
    paragraphs: [
      'Omar started to work in a big restaurant. He was young and he did not know much.',
      'On the first day he came very early and waited near the door. A tall woman opened it and said: "Are you the new one? Come in."',
      'The work was difficult and fast. He worked all day, talked to a lot of people and made many mistakes.',
      'After work he was tired, but happy. "Tomorrow will be easier," he thought. And it was.',
    ],
    questions: [
      { q: 'Когда Омар пришёл в первый день?', options: ['very early', 'after work', 'late in the evening'], answer: 'very early' },
      { q: 'Какой была работа?', options: ['difficult and fast', 'easy and slow', 'cheap but interesting'], answer: 'difficult and fast' },
      { q: 'Как он себя чувствовал после работы?', options: ['tired, but happy', 'cold and young', 'fast and easy'], answer: 'tired, but happy' },
    ],
  },

  /* ---------- B1 ---------- */
  {
    id: 'b1-lost-key',
    level: 'B1',
    title: 'The lost key',
    titleRu: 'Потерянный ключ',
    names: ['Dima'],
    glossary: [
      { en: 'hour', ru: 'час' },
      { en: 'coat', ru: 'пальто' },
    ],
    paragraphs: [
      'Dima has lost his key again. He has already looked for it in every room, but he has not found it yet.',
      'He must be at work in an hour, so he cannot go on looking. He should have put it on the table, as always.',
      'Then he finds out where it is: he took off his coat in the kitchen yesterday evening. The key has been there since then.',
      'If he had a second key, this problem could not happen so often. He has to make one, but he has been saying that for two years.',
    ],
    questions: [
      { q: 'Где в итоге оказался ключ?', options: ['in his coat in the kitchen', 'on the table', 'at work'], answer: 'in his coat in the kitchen' },
      { q: 'Почему он не может продолжать искать?', options: ['he must be at work in an hour', 'he has lost his coat', 'the shop is closed'], answer: 'he must be at work in an hour' },
      { q: 'Что решило бы проблему?', options: ['a second key', 'a new coat', 'a new table'], answer: 'a second key' },
    ],
  },
  {
    id: 'b1-idea',
    level: 'B1',
    title: 'A small idea',
    titleRu: 'Маленькая идея',
    names: ['Kate'],
    glossary: [
      { en: 'minute', ru: 'минута' },
      { en: 'hour', ru: 'час' },
      { en: 'simple', ru: 'простой' },
      { en: 'different', ru: 'другой, иной' },
    ],
    paragraphs: [
      'Kate has always wanted to learn something new, but she could never find the time.',
      'Recently she has tried a different idea: to study for just ten minutes a day. Ten minutes is not much, so there is no reason to give up.',
      'She has been doing this for three months. She has already learned more than in the two years before, when she tried to study for three hours and finished after a week.',
      'The reason is simple: a small decision you do not forget is better than a big one you give up.',
    ],
    questions: [
      { q: 'Сколько она занимается в день?', options: ['ten minutes', 'three hours', 'one week'], answer: 'ten minutes' },
      { q: 'Почему прошлая попытка не сработала?', options: ['she finished after a week', 'she had no computer', 'she did not like it'], answer: 'she finished after a week' },
      { q: 'В чём главная мысль?', options: ['a small decision is better', 'you must study three hours', 'three months is enough'], answer: 'a small decision is better' },
    ],
  },

  /* ---------- B2 ---------- */
  {
    id: 'b2-remote',
    level: 'B2',
    title: 'Working from home',
    titleRu: 'Работа из дома',
    names: ['Sofia'],
    glossary: [
      { en: 'free', ru: 'свободный' },
      { en: 'freedom', ru: 'свобода' },
      { en: 'different', ru: 'другой, иной' },
      { en: 'hour', ru: 'час' },
      { en: 'way', ru: 'способ, путь' },
    ],
    paragraphs: [
      'When Sofia left her office, she thought that working from home would be easier. Actually, it was not.',
      'At first she felt free. She could begin at any hour and nobody asked her to explain where she had been. However, she soon realized that her day never finished: she kept working until night.',
      'She has since chosen a different way. She begins at nine and leaves the table at six, although nobody would complain if she did not.',
      'She would not go back to an office. Despite the problems, she understands that the freedom is important, and she had to learn how to live with it.',
    ],
    questions: [
      { q: 'Что оказалось главной проблемой?', options: ['her day never finished', 'the office was far', 'she could not begin early'], answer: 'her day never finished' },
      { q: 'Как она решила эту проблему?', options: ['she begins at nine and leaves at six', 'she went back to the office', 'she works only at night'], answer: 'she begins at nine and leaves at six' },
      { q: 'Что она думает сейчас?', options: ['the freedom is important', 'an office is better', 'she would rather complain'], answer: 'the freedom is important' },
    ],
  },
  {
    id: 'b2-ice',
    level: 'B2',
    title: 'How to break the ice',
    titleRu: 'Как растопить лёд',
    names: [],
    glossary: [
      { en: 'advice', ru: 'совет' },
      { en: 'question', ru: 'вопрос' },
      { en: 'answer', ru: 'ответ' },
      { en: 'conversation', ru: 'разговор' },
      { en: 'rule', ru: 'правило' },
    ],
    paragraphs: [
      'Meeting new people is difficult for most of us, although some admit it and others do not.',
      'People often give this advice: ask questions. That makes sense, but it is not enough: a question without attention becomes cold, and nobody wants to be asked many questions and then forgotten.',
      'What actually helps is to pay attention to the answer and to say something about yourself too. Otherwise the other one will feel that only they are speaking.',
      'It is probably the most important rule in any conversation: to break the ice, you have to give something of yourself first.',
    ],
    questions: [
      { q: 'Почему одних вопросов мало?', options: ['a question without attention becomes cold', 'questions are too difficult', 'people never answer them'], answer: 'a question without attention becomes cold' },
      { q: 'Что помогает на самом деле?', options: ['to say something about yourself as well', 'to ask twenty things', 'to keep in touch later'], answer: 'to say something about yourself as well' },
      { q: 'В чём главное правило?', options: ['give something of yourself first', 'never speak about yourself', 'let the other person speak only'], answer: 'give something of yourself first' },
    ],
  },

  /* ---------- C1 ---------- */
  {
    id: 'c1-research',
    level: 'C1',
    title: 'What the research indicates',
    titleRu: 'О чём говорит исследование',
    names: [],
    glossary: [
      { en: 'material', ru: 'материал' },
      { en: 'page', ru: 'страница' },
      { en: 'confident', ru: 'уверенный' },
      { en: 'useless', ru: 'бесполезный' },
      { en: 'remember', ru: 'помнить, вспоминать' },
    ],
    paragraphs: [
      'New research on learning indicates that the approach we choose is relatively more important than the time we give.',
      'The evidence largely demonstrates that trying to remember is essential, whereas reading the same page again is largely useless. Reading again seems to work, and that feeling is arguably the reason it happens so often.',
      'Nevertheless, the evidence is strong. People who tried to remember the material seldom lost it, although they felt less confident while they were learning.',
      'Consequently, one crucial implication appears: the approach which seems easiest tends to be the one that works least.',
    ],
    questions: [
      { q: 'Что важнее по данным исследования?', options: ['the approach we choose', 'the time we give', 'the number of pages'], answer: 'the approach we choose' },
      { q: 'Почему перечитывание так распространено?', options: ['it seems to work', 'it is faster', 'research recommends it'], answer: 'it seems to work' },
      { q: 'Каков главный вывод?', options: ['the easiest approach works least', 'the time we give matters most', 'reading again is essential'], answer: 'the easiest approach works least' },
    ],
  },
  {
    id: 'c1-decision',
    level: 'C1',
    title: 'A decision nobody made',
    titleRu: 'Решение, которого никто не принимал',
    names: [],
    glossary: [
      { en: 'mistake', ru: 'ошибка' },
      { en: 'question', ru: 'вопрос' },
      { en: 'answer', ru: 'ответ' },
      { en: 'project', ru: 'проект' },
      { en: 'responsible', ru: 'ответственный' },
      { en: 'technical', ru: 'технический' },
    ],
    paragraphs: [
      'Big mistakes seldom occur because somebody made a bad decision. More often nobody made a decision at all.',
      'Everybody assumes that the question has been considered somewhere else. Nobody insists on an answer, because asking would imply that something essential has been forgotten. Thus the assumption is maintained regardless of the evidence.',
      'The impact appears much later, when the outcome cannot be changed any more. At that time everybody acknowledges the problem, and everybody asks why nobody had asked before.',
      'Hence the most crucial question in any project is scarcely technical: who is responsible for asking what nobody wants to ask?',
    ],
    questions: [
      { q: 'Почему случаются крупные ошибки?', options: ['nobody made a decision at all', 'somebody made a bad decision', 'the evidence was wrong'], answer: 'nobody made a decision at all' },
      { q: 'Почему никто не задаёт вопрос?', options: ['asking would imply something was forgotten', 'the answer is obvious', 'it is not allowed'], answer: 'asking would imply something was forgotten' },
      { q: 'Какой вопрос автор считает самым важным?', options: ['who is responsible for asking', 'what the outcome will be', 'how much it will cost'], answer: 'who is responsible for asking' },
    ],
  },
];

const BY_ID = Object.fromEntries(TEXTS.map((t) => [t.id, t]));

export function getText(id) {
  return BY_ID[id] || null;
}

const LEVEL_ORDER = ['A0', 'A1', 'A2', 'B1', 'B2', 'C1'];

/**
 * Тексты, доступные на этом уровне: свой и все предыдущие.
 * Читать пройденное полезно — это единственное место, где старая лексика
 * встречается без усилия.
 */
export function textsFor(level) {
  const reached = LEVEL_ORDER.indexOf(level);
  const limit = reached < 0 ? 0 : reached;
  return TEXTS.filter((t) => LEVEL_ORDER.indexOf(t.level) <= limit);
}

/** Весь текст одной строкой — для озвучки и подсчёта слов. */
export function plainText(text) {
  return text.paragraphs.join(' ');
}

export function wordCount(text) {
  return plainText(text).split(/\s+/).filter(Boolean).length;
}
