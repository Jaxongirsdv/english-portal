export const READING_PART_2 = {
  id: 'reading-part-2',
  number: 2,
  title: 'Поиск конкретной информации',
  format: '8 ситуаций · 10 объявлений',
  minutes: 12,
  officialNote: 'Part 2: сопоставь потребность человека с подходящим объявлением. Два варианта лишние.',
  passage: [
    'A · Riverside Workshop — Weekend classes in repairing small household appliances. Tools are provided; no previous experience required.',
    'B · City Language Café — Informal conversation tables every Tuesday evening. Meet international residents and practise several languages for free.',
    'C · North Hall Study Room — Silent desks, fast Wi-Fi and printing facilities. Open until midnight during the university examination period.',
    'D · Green Route Club — Guided Sunday walks outside the city. Transport and lunch included; routes are suitable for experienced hikers.',
    'E · Start Smart — A six-week evening course for people planning their first small business. Includes budgeting and marketing advice.',
    'F · Family Science Day — Interactive experiments for children aged 7–12 and their parents. Tickets must be booked online.',
    'G · Digital Memories — Volunteers teach older residents how to scan photographs and organise family archives on a computer.',
    'H · Community Kitchen — Learn affordable vegetarian recipes on Wednesday afternoons. Ingredients are included in the fee.',
    'I · Quick Cycle Service — Same-day bicycle repairs near Central Station. Book before 10 a.m. for collection after work.',
    'J · Theatre Lab — Audition-free drama group for adults. Rehearsals twice a week and a public performance at the end of term.',
  ],
  questions: [
    { id: 'r2-1', type: 'choice', prompt: 'Aziza needs a quiet place to prepare late for university exams.', options: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'], answer: 'C', explanation: 'North Hall предлагает тишину и работает до полуночи в экзаменационный период.' },
    { id: 'r2-2', type: 'choice', prompt: 'Timur wants his bicycle fixed while he is at work.', options: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'], answer: 'I', explanation: 'Quick Cycle Service принимает утром и возвращает велосипед после работы.' },
    { id: 'r2-3', type: 'choice', prompt: 'Madina wants practical advice before opening a small company.', options: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'], answer: 'E', explanation: 'Start Smart предназначен для первого бизнеса и включает бюджет и маркетинг.' },
    { id: 'r2-4', type: 'choice', prompt: 'An older neighbour needs help saving old family photographs digitally.', options: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'], answer: 'G', explanation: 'Digital Memories обучает сканированию фотографий и созданию архива.' },
    { id: 'r2-5', type: 'choice', prompt: 'A parent wants an educational weekend activity with a ten-year-old child.', options: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'], answer: 'F', explanation: 'Family Science Day рассчитан на детей 7–12 лет и родителей.' },
    { id: 'r2-6', type: 'choice', prompt: 'Kamol wants to practise speaking with people from other countries without paying.', options: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'], answer: 'B', explanation: 'Language Café даёт бесплатную разговорную практику с международными жителями.' },
    { id: 'r2-7', type: 'choice', prompt: 'Dilnoza wants to learn inexpensive meat-free cooking.', options: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'], answer: 'H', explanation: 'Community Kitchen обучает доступным vegetarian recipes.' },
    { id: 'r2-8', type: 'choice', prompt: 'Rustam wants to learn how to repair things and has never done it before.', options: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'], answer: 'A', explanation: 'Riverside Workshop не требует опыта и предоставляет инструменты.' },
  ],
};

export const READING_PART_3 = {
  id: 'reading-part-3',
  number: 3,
  title: 'Главная мысль абзаца',
  format: '6 абзацев · 8 заголовков',
  minutes: 12,
  officialNote: 'Part 3: выбери заголовок, который передаёт главную мысль, а не отдельную деталь.',
  passage: [
    'A · A repair café is a public event where people bring broken possessions and try to fix them with help from volunteers. The goal is not a professional repair service. Visitors take part, learn how an object works and decide whether it can have a longer life.',
    'B · The first events were small, but the idea spread quickly because it answered two concerns at once. Families wanted to save money, while communities were becoming more worried about electronic waste and disposable products.',
    'C · Volunteers do not need to know everything. One person may understand bicycles, another lamps, and another clothing. The mixture of skills matters more than finding a single expert who can repair every possible object.',
    'D · Not every visit ends with a working item. Spare parts may be unavailable, or damage may be unsafe to repair. Organisers still consider the session useful when a visitor understands why the object failed and how to choose a better replacement.',
    'E · The social effect can be as valuable as the technical one. People who might never normally meet spend an hour solving a shared problem. Some visitors later return as volunteers, bringing skills that were not available before.',
    'F · Organisers say the movement will remain limited unless manufacturers make products easier to open and provide spare parts. Community effort can reduce waste, but product design and consumer law also determine whether repair is realistic.',
  ],
  questions: [
    { id: 'r3-1', type: 'choice', prompt: 'Paragraph A', options: ['Learning through participation', 'Two reasons for rapid growth', 'Different knowledge in one room', 'A useful result without success', 'Connections created by repair', 'Change needed beyond volunteers', 'The high cost of tools', 'Competition between experts'], answer: 'Learning through participation', explanation: 'Главная мысль: посетитель участвует и учится, а не просто получает услугу.' },
    { id: 'r3-2', type: 'choice', prompt: 'Paragraph B', options: ['Learning through participation', 'Two reasons for rapid growth', 'Different knowledge in one room', 'A useful result without success', 'Connections created by repair', 'Change needed beyond volunteers', 'The high cost of tools', 'Competition between experts'], answer: 'Two reasons for rapid growth', explanation: 'Названы экономия денег и экологическая тревога.' },
    { id: 'r3-3', type: 'choice', prompt: 'Paragraph C', options: ['Learning through participation', 'Two reasons for rapid growth', 'Different knowledge in one room', 'A useful result without success', 'Connections created by repair', 'Change needed beyond volunteers', 'The high cost of tools', 'Competition between experts'], answer: 'Different knowledge in one room', explanation: 'Сила события в сочетании разных навыков добровольцев.' },
    { id: 'r3-4', type: 'choice', prompt: 'Paragraph D', options: ['Learning through participation', 'Two reasons for rapid growth', 'Different knowledge in one room', 'A useful result without success', 'Connections created by repair', 'Change needed beyond volunteers', 'The high cost of tools', 'Competition between experts'], answer: 'A useful result without success', explanation: 'Даже без ремонта посетитель получает полезное понимание.' },
    { id: 'r3-5', type: 'choice', prompt: 'Paragraph E', options: ['Learning through participation', 'Two reasons for rapid growth', 'Different knowledge in one room', 'A useful result without success', 'Connections created by repair', 'Change needed beyond volunteers', 'The high cost of tools', 'Competition between experts'], answer: 'Connections created by repair', explanation: 'Абзац посвящён социальным связям между людьми.' },
    { id: 'r3-6', type: 'choice', prompt: 'Paragraph F', options: ['Learning through participation', 'Two reasons for rapid growth', 'Different knowledge in one room', 'A useful result without success', 'Connections created by repair', 'Change needed beyond volunteers', 'The high cost of tools', 'Competition between experts'], answer: 'Change needed beyond volunteers', explanation: 'Нужны изменения дизайна продуктов и законодательства.' },
  ],
};

export const READING_PART_5 = {
  id: 'reading-part-5',
  number: 5,
  title: 'Точные данные из статьи',
  format: '4 пропуска + 2 вопроса',
  minutes: 8,
  officialNote: 'Part 5: найди точное слово, число и вывод в одном тексте.',
  passage: [
    'A coastal town introduced a reusable cup scheme after discovering that local cafés were throwing away nearly 4,000 disposable cups each week. Customers now pay a small deposit when ordering a drink. They can return the cup to any participating café, not only the place where it was collected.',
    'The six-month trial began with twelve cafés. Staff initially worried that washing and storing cups would create extra work, but a shared collection service now gathers used cups every afternoon. According to the council, 82 per cent of cups were returned during the first three months.',
    'The scheme has not removed all disposable packaging. Visitors who take drinks outside the trial area sometimes choose a normal cup, and a few businesses lack storage space. Even so, the council plans to invite hotels and sports centres to join next year.',
  ],
  questions: [
    { id: 'r5-1', type: 'input', prompt: 'Almost ___ disposable cups were discarded each week.', answers: ['4000', '4,000'], explanation: 'В первом абзаце указано nearly 4,000.' },
    { id: 'r5-2', type: 'input', prompt: 'Customers pay a small ___ when receiving a reusable cup.', answers: ['deposit'], explanation: 'Платёж называется deposit.' },
    { id: 'r5-3', type: 'input', prompt: 'Used cups are collected every ___.', answers: ['afternoon'], explanation: 'Служба забирает чашки every afternoon.' },
    { id: 'r5-4', type: 'input', prompt: '___ per cent of cups were returned in the first three months.', answers: ['82'], explanation: 'Council сообщает показатель 82 per cent.' },
    { id: 'r5-5', type: 'choice', prompt: 'Why do some businesses not participate?', options: ['They do not have enough storage.', 'Customers refuse to pay deposits.', 'The collection service is too expensive.', 'They are outside the town.'], answer: 'They do not have enough storage.', explanation: 'В последнем абзаце сказано, что некоторым не хватает места.' },
    { id: 'r5-6', type: 'choice', prompt: 'What will probably happen next year?', options: ['More types of organisations will join.', 'Disposable cups will become illegal.', 'The deposit will be removed.', 'Only hotels will run the scheme.'], answer: 'More types of organisations will join.', explanation: 'Совет планирует пригласить hotels and sports centres.' },
  ],
};

export const LISTENING_PART_3 = {
  id: 'listening-part-3',
  number: 3,
  title: 'Главная мысль монолога',
  format: '4 монолога · 6 вариантов',
  minutes: 7,
  officialNote: 'Part 3: сопоставь короткого говорящего с основной причиной или отношением.',
  questions: [
    { id: 'l3-1', type: 'choice', audioSrc: 'audio/b2/l3-1.wav', audio: 'I joined the photography course expecting technical lectures. Instead, we spend most of the time outdoors comparing our pictures. Seeing how other students frame the same scene has changed the way I notice details.', prompt: 'Что особенно ценит говорящий?', options: ['Learning from other participants', 'Receiving professional equipment', 'Winning a competition', 'Studying historical photographs', 'Working completely alone', 'Travelling abroad'], answer: 'Learning from other participants', explanation: 'Говорящий подчёркивает сравнение работ и взгляд других студентов.' },
    { id: 'l3-2', type: 'choice', audioSrc: 'audio/b2/l3-2.wav', audio: 'The new office is further from my home, so I expected the journey to be a problem. Surprisingly, the train is reliable and I use the time to read. What really bothers me is that there is nowhere quiet to have lunch.', prompt: 'Что является главной проблемой?', options: ['Learning from other participants', 'Receiving professional equipment', 'Winning a competition', 'Lack of a peaceful break area', 'Working completely alone', 'Travelling abroad'], answer: 'Lack of a peaceful break area', explanation: 'Поездка оказалась нормальной; проблема — отсутствие тихого места для обеда.' },
    { id: 'l3-3', type: 'choice', audioSrc: 'audio/b2/l3-3.wav', audio: 'I used to avoid giving presentations because I worried about every mistake. My manager suggested rehearsing with one colleague first. That simple habit has made me much calmer when I speak to a large group.', prompt: 'Что помогло говорящему?', options: ['Learning from other participants', 'Receiving professional equipment', 'Winning a competition', 'Lack of a peaceful break area', 'Practising with a trusted person', 'Travelling abroad'], answer: 'Practising with a trusted person', explanation: 'Главным решением стала репетиция с одним коллегой.' },
    { id: 'l3-4', type: 'choice', audioSrc: 'audio/b2/l3-4.wav', audio: 'I bought the tablet mainly for entertainment, but it has become most useful in the kitchen. I can enlarge recipes, set several timers and keep the screen clean by controlling it with my voice.', prompt: 'Для чего устройство оказалось полезнее всего?', options: ['Learning from other participants', 'Receiving professional equipment', 'Winning a competition', 'Lack of a peaceful break area', 'Practising with a trusted person', 'Following recipes while cooking'], answer: 'Following recipes while cooking', explanation: 'Все приведённые функции относятся к приготовлению еды.' },
  ],
};

export const LISTENING_PART_4 = {
  id: 'listening-part-4',
  number: 4,
  title: 'Сопоставление деталей',
  format: '5 вопросов · 8 вариантов',
  minutes: 7,
  officialNote: 'Part 4: услышь интервью и сопоставь каждый вопрос с точной деталью.',
  audioSrc: 'audio/b2/listening-part-4.wav',
  audio: 'Interviewer: Today we are speaking to Maya, who organises a monthly street market. Maya, why was the market created? Maya: Local artists had nowhere affordable to sell their work, so the first goal was to give them direct access to customers. We began in the library car park, but after three months the market became too large and moved to King Street. The hardest issue was not finding sellers. It was persuading nearby shops that the market would bring visitors rather than take business away. Now several shops stay open later on market days. We also changed our waste policy. Food sellers must use reusable containers, and customers can borrow them with a deposit. Next year we want to add free workshops where visitors can learn simple creative skills from the sellers.',
  questions: [
    { id: 'l4-1', type: 'choice', prompt: 'What was the original purpose of the market?', options: ['Support local artists', 'Reduce traffic', 'Promote the library', 'Help restaurants', 'Create evening jobs', 'Raise money for charity', 'Teach schoolchildren', 'Attract tourists'], answer: 'Support local artists', explanation: 'Первоначальная цель — дать местным художникам доступ к покупателям.' },
    { id: 'l4-2', type: 'choice', prompt: 'Why did the market change location?', options: ['Support local artists', 'It needed more space', 'Promote the library', 'Help restaurants', 'Create evening jobs', 'Raise money for charity', 'Teach schoolchildren', 'Attract tourists'], answer: 'It needed more space', explanation: 'Рынок стал слишком большим для парковки.' },
    { id: 'l4-3', type: 'choice', prompt: 'What was the main early difficulty?', options: ['Support local artists', 'It needed more space', 'Finding enough sellers', 'Convincing nearby businesses', 'Create evening jobs', 'Raise money for charity', 'Teach schoolchildren', 'Attract tourists'], answer: 'Convincing nearby businesses', explanation: 'Сложнее всего было убедить соседние магазины.' },
    { id: 'l4-4', type: 'choice', prompt: 'What must food sellers do now?', options: ['Support local artists', 'It needed more space', 'Finding enough sellers', 'Convincing nearby businesses', 'Use reusable containers', 'Raise money for charity', 'Teach schoolchildren', 'Attract tourists'], answer: 'Use reusable containers', explanation: 'Это новое правило waste policy.' },
    { id: 'l4-5', type: 'choice', prompt: 'What is planned for next year?', options: ['Support local artists', 'It needed more space', 'Finding enough sellers', 'Convincing nearby businesses', 'Use reusable containers', 'Offer free practical workshops', 'Teach schoolchildren', 'Attract tourists'], answer: 'Offer free practical workshops', explanation: 'Планируются бесплатные творческие workshops.' },
  ],
};

export const LISTENING_PART_5 = {
  id: 'listening-part-5',
  number: 5,
  title: 'Детали и отношение говорящих',
  format: '3 диалога · 6 вопросов',
  minutes: 7,
  officialNote: 'Part 5: два вопроса к каждому диалогу, включая отношение и скрытый вывод.',
  audioSrc: 'audio/b2/listening-part-5.wav',
  audio: 'Dialogue one. Man: The hotel room was smaller than the website suggested. Woman: True, but the staff moved us to a quieter floor immediately. I was impressed by how quickly they responded. Dialogue two. Woman: Are you still taking the online statistics course? Man: Yes, although the weekly videos are longer than I expected. The discussion board is excellent because other students explain ideas in different ways. Dialogue three. Man: Did the outdoor concert go ahead in the rain? Woman: It did. The organisers gave everyone waterproof covers, but the sound became unclear near the end. I still enjoyed the atmosphere.',
  questions: [
    { id: 'l5-1', type: 'choice', prompt: 'What disappointed the hotel guests at first?', options: ['The size of the room', 'The noise at night', 'The attitude of staff'], answer: 'The size of the room', explanation: 'Комната оказалась меньше, чем на сайте.' },
    { id: 'l5-2', type: 'choice', prompt: 'What impressed the woman about the hotel?', options: ['Its location', 'Its quick response', 'Its breakfast'], answer: 'Its quick response', explanation: 'Она прямо говорит: impressed by how quickly they responded.' },
    { id: 'l5-3', type: 'choice', prompt: 'What is difficult about the online course?', options: ['The videos take a lot of time', 'The subject is too basic', 'Students rarely communicate'], answer: 'The videos take a lot of time', explanation: 'Weekly videos longer than expected.' },
    { id: 'l5-4', type: 'choice', prompt: 'Why does the man value the discussion board?', options: ['It provides official answers', 'It offers different explanations', 'It replaces the videos'], answer: 'It offers different explanations', explanation: 'Другие учащиеся объясняют идеи разными способами.' },
    { id: 'l5-5', type: 'choice', prompt: 'What problem affected the concert?', options: ['People got wet', 'The music ended early', 'The sound quality became worse'], answer: 'The sound quality became worse', explanation: 'Sound became unclear near the end.' },
    { id: 'l5-6', type: 'choice', prompt: 'How does the woman feel overall?', options: ['Positive despite a problem', 'Angry with the organisers', 'Disappointed by the audience'], answer: 'Positive despite a problem', explanation: 'Несмотря на звук, ей понравилась атмосфера.' },
  ],
};

export const LISTENING_PART_6 = {
  id: 'listening-part-6',
  number: 6,
  title: 'Лекция и точные факты',
  format: '6 пропусков · слово или число',
  minutes: 7,
  officialNote: 'Part 6: выдели ключевые факты из лекции и запиши одно слово или число.',
  audioSrc: 'audio/b2/listening-part-6.wav',
  audio: 'Today I will describe a research project on urban noise. The study began in 2021 and involved residents from fifteen neighbourhoods. Each volunteer carried a small sound sensor for seven days. The device measured volume, while participants used a phone application to record how they felt. Traffic was the loudest source overall, but construction noise caused the greatest irritation because it was less predictable. Researchers also found that access to a quiet courtyard improved sleep quality, even when the surrounding streets were busy. The team recommends planting dense rows of bushes near playgrounds because leaves can break up some high-frequency sound. A second recommendation is to schedule rubbish collection after seven in the morning rather than before six. The next phase of the project will compare summer and winter results.',
  questions: [
    { id: 'l6-1', type: 'input', prompt: 'The research project started in ___.', answers: ['2021'], explanation: 'В начале лекции назван 2021 год.' },
    { id: 'l6-2', type: 'input', prompt: 'Volunteers carried a sound ___ for seven days.', answers: ['sensor'], explanation: 'Устройство называется sound sensor.' },
    { id: 'l6-3', type: 'input', prompt: 'Participants recorded their feelings in a phone ___.', answers: ['application', 'app'], explanation: 'Для записей использовалось phone application.' },
    { id: 'l6-4', type: 'input', prompt: '___ noise caused the greatest irritation.', answers: ['construction'], explanation: 'Самым раздражающим оказался construction noise.' },
    { id: 'l6-5', type: 'input', prompt: 'A quiet courtyard improved the quality of ___.', answers: ['sleep'], explanation: 'В лекции сказано improved sleep quality.' },
    { id: 'l6-6', type: 'input', prompt: 'Researchers suggest planting rows of ___.', answers: ['bushes'], explanation: 'Рекомендованы dense rows of bushes.' },
  ],
};
