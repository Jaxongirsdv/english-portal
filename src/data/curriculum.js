import { VOCAB_BY_ID } from './vocab.js';

/**
 * Учебная программа: уровни → юниты → уроки.
 *
 * Урок состоит из теории (на русском, потому что старт с нуля),
 * набора слов и упражнений. Слова ссылаются на id из data/vocab.js.
 *
 * Типы упражнений:
 *   choice    — выбрать перевод из вариантов
 *   listen    — прослушать и выбрать услышанное
 *   order     — собрать предложение из слов
 *   translate — напечатать перевод
 */

export const CURRICULUM = [
  {
    id: 'a0',
    code: 'A0',
    title: 'Полный ноль',
    subtitle: 'Буквы, звуки, первые фразы',
    goal: 'Научиться читать латиницу, здороваться и говорить «я — такой-то».',
    units: [
      {
        id: 'a0-u1',
        title: 'Алфавит и звуки',
        icon: 'Aa',
        lessons: [
          {
            id: 'a0-u1-l1',
            title: 'Английский алфавит',
            duration: 10,
            theory: [
              { type: 'p', text: 'В английском алфавите 26 букв. Пишутся они как латиница, но называются иначе, чем в русском.' },
              {
                type: 'table',
                head: ['Буква', 'Название', 'Буква', 'Название'],
                rows: [
                  ['A a', 'эй', 'N n', 'эн'],
                  ['B b', 'би', 'O o', 'оу'],
                  ['C c', 'си', 'P p', 'пи'],
                  ['D d', 'ди', 'Q q', 'кью'],
                  ['E e', 'и', 'R r', 'ар'],
                  ['F f', 'эф', 'S s', 'эс'],
                  ['G g', 'джи', 'T t', 'ти'],
                  ['H h', 'эйч', 'U u', 'ю'],
                  ['I i', 'ай', 'V v', 'ви'],
                  ['J j', 'джей', 'W w', 'дабл-ю'],
                  ['K k', 'кей', 'X x', 'экс'],
                  ['L l', 'эл', 'Y y', 'уай'],
                  ['M m', 'эм', 'Z z', 'зэд / зи'],
                ],
              },
              { type: 'tip', text: 'Гласных букв всего 5 (a, e, i, o, u), но звуков они дают больше 20. Поэтому в английском важна не буква, а транскрипция — /ˈlaɪk/ читается «лайк», хотя букв там четыре.' },
              { type: 'p', text: 'Нажимай на 🔊 рядом со словами — портал произнесёт их голосом. На старте слушать важнее, чем читать.' },
            ],
            vocab: [],
            exercises: [
              { type: 'choice', prompt: 'Как называется буква «W»?', options: ['дабл-ю', 'ви', 'уай', 'дабл-ви'], answer: 'дабл-ю' },
              { type: 'choice', prompt: 'Сколько букв в английском алфавите?', options: ['26', '24', '28', '33'], answer: '26' },
              { type: 'choice', prompt: 'Какая буква читается как «джей»?', options: ['J', 'G', 'Y', 'I'], answer: 'J' },
            ],
          },
          {
            id: 'a0-u1-l2',
            title: 'Звуки, которых нет в русском',
            duration: 12,
            theory: [
              { type: 'p', text: 'Несколько звуков сбивают всех новичков. Разберём их сразу, чтобы не переучиваться потом.' },
              {
                type: 'table',
                head: ['Звук', 'Как получить', 'Пример'],
                rows: [
                  ['/θ/', 'Язык между зубами, выдох без голоса', 'think, three'],
                  ['/ð/', 'То же, но с голосом', 'this, that'],
                  ['/w/', 'Губы трубочкой, как перед «у»', 'water, we'],
                  ['/ŋ/', '«н» в нос, язык у нёба', 'morning, thing'],
                  ['/æ/', 'Средний между «э» и «а»', 'cat, happy'],
                  ['/r/', 'Язык загнут назад, не дрожит', 'red, are'],
                ],
              },
              { type: 'warn', text: 'Главная ошибка: заменять /θ/ и /ð/ на «с» и «з». Носители это слышат сразу. Тренируй пару think — this каждый день по минуте.' },
              { type: 'tip', text: 'Слушай слово в портале несколько раз и повторяй вслух. Без проговаривания вслух произношение не ставится.' },
            ],
            vocab: ['thank-you', 'this', 'that', 'three', 'think', 'water'],
            exercises: [
              { type: 'listen', word: 'this', options: ['this', 'that', 'these', 'zis'] },
              { type: 'choice', prompt: 'В каком слове есть звук /θ/ (глухой, без голоса)?', options: ['think', 'this', 'that', 'they'], answer: 'think' },
              { type: 'listen', word: 'water', options: ['water', 'wanted', 'winter', 'waiter'] },
            ],
          },
        ],
      },
      {
        id: 'a0-u2',
        title: 'Приветствия и знакомство',
        icon: '👋',
        lessons: [
          {
            id: 'a0-u2-l1',
            title: 'Здравствуй и до свидания',
            duration: 12,
            theory: [
              { type: 'p', text: 'Первый рабочий набор фраз. Их достаточно, чтобы начать любой разговор.' },
              {
                type: 'table',
                head: ['Фраза', 'Перевод', 'Когда'],
                rows: [
                  ['Hello', 'Здравствуйте', 'всегда уместно'],
                  ['Hi', 'Привет', 'друзья, коллеги'],
                  ['Good morning', 'Доброе утро', 'до 12:00'],
                  ['Good afternoon', 'Добрый день', '12:00–18:00'],
                  ['Good evening', 'Добрый вечер', 'после 18:00'],
                  ['Goodbye / Bye', 'До свидания / Пока', 'прощание'],
                  ['See you', 'Увидимся', 'неформально'],
                ],
              },
              { type: 'p', text: 'Ответ на «How are you?» почти всегда формальный, реального отчёта о самочувствии от тебя не ждут:' },
              { type: 'dialog', lines: [
                ['A', 'Hi! How are you?', 'Привет! Как дела?'],
                ['B', "I'm fine, thanks. And you?", 'Хорошо, спасибо. А ты?'],
                ['A', 'Good, thank you.', 'Хорошо, спасибо.'],
              ] },
            ],
            vocab: ['hello', 'hi', 'goodbye', 'good-morning', 'thank-you', 'please', 'sorry', 'yes', 'no'],
            exercises: [
              { type: 'choice', prompt: 'Как сказать «спасибо»?', options: ['thank you', 'please', 'sorry', 'goodbye'], answer: 'thank you' },
              { type: 'order', prompt: 'Собери: «Привет! Как дела?»', words: ['Hi', 'how', 'are', 'you'], answer: 'Hi how are you' },
              { type: 'listen', word: 'goodbye', options: ['goodbye', 'good day', 'good boy', 'go by'] },
              { type: 'translate', prompt: 'Переведи на английский: «Доброе утро»', answer: 'good morning' },
            ],
          },
          {
            id: 'a0-u2-l2',
            title: 'Как тебя зовут',
            duration: 12,
            theory: [
              { type: 'p', text: 'В английском нельзя сказать «Меня зовут Иван» дословно. Используется конструкция «Моё имя есть Иван».' },
              { type: 'formula', text: 'My name is + имя', note: 'My name is Ivan. — Меня зовут Иван.' },
              { type: 'p', text: 'Вопрос строится тем же способом:' },
              { type: 'formula', text: 'What is your name?', note: 'Дословно: «Что есть твоё имя?»' },
              { type: 'tip', text: 'В живой речи почти всегда сокращают: What’s your name? — My name’s Ivan. Апостроф заменяет «i» в is.' },
              { type: 'dialog', lines: [
                ['A', "Hello! What's your name?", 'Здравствуйте! Как вас зовут?'],
                ['B', "My name is Anna. And you?", 'Меня зовут Анна. А вас?'],
                ['A', "I'm Tom. Nice to meet you.", 'Я Том. Приятно познакомиться.'],
                ['B', 'Nice to meet you too.', 'Мне тоже приятно.'],
              ] },
            ],
            vocab: ['name', 'my', 'your', 'what', 'nice-to-meet-you', 'i', 'you'],
            exercises: [
              { type: 'order', prompt: 'Собери: «Как тебя зовут?»', words: ['What', 'is', 'your', 'name'], answer: 'What is your name' },
              { type: 'choice', prompt: 'Как правильно представиться?', options: ['My name is Ivan', 'Me name Ivan', 'I name is Ivan', 'My is name Ivan'], answer: 'My name is Ivan' },
              { type: 'translate', prompt: 'Переведи: «приятно познакомиться»', answer: 'nice to meet you' },
            ],
          },
        ],
      },
      {
        id: 'a0-u3',
        title: 'Местоимения и глагол to be',
        icon: '🔑',
        lessons: [
          {
            id: 'a0-u3-l1',
            title: 'Я, ты, он, она',
            duration: 10,
            theory: [
              { type: 'p', text: 'Личные местоимения — каркас любого предложения. В английском подлежащее опускать нельзя: нельзя сказать просто «Работаю», обязательно «I work».' },
              {
                type: 'table',
                head: ['Англ.', 'Рус.', 'Пример'],
                rows: [
                  ['I', 'я', 'I am here.'],
                  ['you', 'ты / вы', 'You are late.'],
                  ['he', 'он', 'He is my friend.'],
                  ['she', 'она', 'She is a doctor.'],
                  ['it', 'оно (предмет, животное)', 'It is a book.'],
                  ['we', 'мы', 'We are ready.'],
                  ['they', 'они', 'They are at home.'],
                ],
              },
              { type: 'warn', text: '«I» всегда пишется с большой буквы — в любом месте предложения. А «you» означает и «ты», и «вы»: отдельного вежливого местоимения в английском нет.' },
              { type: 'tip', text: 'Для неодушевлённых предметов всегда «it», даже если в русском это «он» или «она». Стол — it, книга — it, машина — it.' },
            ],
            vocab: ['i', 'you', 'he', 'she', 'it', 'we', 'they'],
            exercises: [
              { type: 'choice', prompt: 'Какое местоимение для слова «стол» (table)?', options: ['it', 'he', 'she', 'they'], answer: 'it' },
              { type: 'choice', prompt: 'Переведи «мы»', options: ['we', 'they', 'you', 'he'], answer: 'we' },
              { type: 'listen', word: 'they', options: ['they', 'day', 'the', 'say'] },
            ],
          },
          {
            id: 'a0-u3-l2',
            title: 'am, is, are — главный глагол',
            duration: 15,
            theory: [
              { type: 'p', text: 'В русском мы говорим «Я студент» без глагола. В английском глагол-связка обязателен: «Я есть студент» — I am a student.' },
              {
                type: 'table',
                head: ['Местоимение', 'Форма', 'Сокращение', 'Пример'],
                rows: [
                  ['I', 'am', "I'm", "I'm a student."],
                  ['he / she / it', 'is', "he's / she's / it's", "She's my sister."],
                  ['you / we / they', 'are', "you're / we're / they're", "They're at work."],
                ],
              },
              { type: 'formula', text: 'Отрицание: подлежащее + am/is/are + not', note: "I am not tired. — Я не устал.  |  She isn't here. — Её здесь нет." },
              { type: 'formula', text: 'Вопрос: am/is/are + подлежащее?', note: 'Are you ready? — Ты готов?  |  Is he at home? — Он дома?' },
              { type: 'warn', text: 'Частая ошибка новичков: «I student» или «He doctor». Без am/is/are предложение неверно.' },
              { type: 'tip', text: 'Запомни тройку одной фразой: I am, he is, we are. Всё остальное подставляется по образцу.' },
            ],
            vocab: ['am', 'is', 'are', 'not', 'happy', 'friend', 'good'],
            exercises: [
              { type: 'choice', prompt: 'Выбери верное: «Она врач»', options: ['She is a doctor', 'She are a doctor', 'She am a doctor', 'She a doctor'], answer: 'She is a doctor' },
              { type: 'order', prompt: 'Собери: «Я не устал»', words: ['I', 'am', 'not', 'tired'], answer: 'I am not tired' },
              { type: 'order', prompt: 'Собери вопрос: «Ты готов?»', words: ['Are', 'you', 'ready'], answer: 'Are you ready' },
              { type: 'choice', prompt: 'Какая форма нужна с «they»?', options: ['are', 'is', 'am', 'be'], answer: 'are' },
              { type: 'translate', prompt: 'Переведи: «Мы друзья»', answer: 'we are friends' },
            ],
          },
        ],
      },
      {
        id: 'a0-u4',
        title: 'Числа и артикли',
        icon: '#',
        lessons: [
          {
            id: 'a0-u4-l1',
            title: 'Числа от 1 до 100',
            duration: 12,
            theory: [
              { type: 'p', text: 'Числа 1–12 надо просто запомнить. Дальше работают два простых правила.' },
              {
                type: 'table',
                head: ['Число', 'Слово', 'Число', 'Слово'],
                rows: [
                  ['1', 'one', '7', 'seven'],
                  ['2', 'two', '8', 'eight'],
                  ['3', 'three', '9', 'nine'],
                  ['4', 'four', '10', 'ten'],
                  ['5', 'five', '11', 'eleven'],
                  ['6', 'six', '12', 'twelve'],
                ],
              },
              { type: 'formula', text: '13–19: корень + -teen', note: 'thirteen, fourteen, fifteen, sixteen, seventeen, eighteen, nineteen' },
              { type: 'formula', text: 'Десятки: корень + -ty', note: 'twenty, thirty, forty, fifty, sixty, seventy, eighty, ninety' },
              { type: 'p', text: 'Составные числа пишутся через дефис: 21 — twenty-one, 45 — forty-five, 99 — ninety-nine.' },
              { type: 'warn', text: 'Осторожно с парами thirteen /θɜːˈtiːn/ и thirty /ˈθɜːti/. Разница в ударении и последнем звуке — носители различают их именно так.' },
            ],
            vocab: ['one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten'],
            exercises: [
              { type: 'choice', prompt: 'Как будет 40?', options: ['forty', 'fourty', 'fourteen', 'foury'], answer: 'forty' },
              { type: 'choice', prompt: 'Что означает «eighteen»?', options: ['18', '80', '8', '88'], answer: '18' },
              { type: 'listen', word: 'three', options: ['three', 'free', 'tree', 'thirty'] },
              { type: 'translate', prompt: 'Напиши словом число 7', answer: 'seven' },
            ],
          },
          {
            id: 'a0-u4-l2',
            title: 'Артикли a, an, the',
            duration: 15,
            theory: [
              { type: 'p', text: 'Артикль — служебное слово перед существительным. В русском его нет, поэтому это самая частая ошибка русскоязычных.' },
              { type: 'formula', text: 'a / an — «какой-то, один из многих»', note: 'I see a dog. — Я вижу (какую-то) собаку.' },
              { type: 'formula', text: 'the — «тот самый, известный обоим»', note: 'The dog is big. — (Та самая) собака большая.' },
              {
                type: 'table',
                head: ['Ситуация', 'Артикль', 'Пример'],
                rows: [
                  ['Первое упоминание', 'a / an', 'I have a car.'],
                  ['Повторное упоминание', 'the', 'The car is red.'],
                  ['Единственный в мире', 'the', 'the sun, the moon'],
                  ['Перед гласным звуком', 'an', 'an apple, an hour'],
                  ['Множественное число, вообще', '—', 'I like cats.'],
                  ['Имена, страны, города', '—', 'Ivan, Russia, Moscow'],
                ],
              },
              { type: 'tip', text: 'Выбор a/an зависит от ЗВУКА, а не буквы: an hour (час) — «h» не читается; a university — читается «ю», согласный звук.' },
              { type: 'warn', text: 'Артикль не ставится перед притяжательными: не «the my book», а просто «my book».' },
            ],
            vocab: ['book', 'house', 'city', 'water', 'food', 'day'],
            exercises: [
              { type: 'choice', prompt: 'Вставь артикль: «I see ___ apple»', options: ['an', 'a', 'the', '—'], answer: 'an' },
              { type: 'choice', prompt: 'Вставь артикль: «___ sun is bright»', options: ['The', 'A', 'An', '—'], answer: 'The' },
              { type: 'choice', prompt: 'Что верно?', options: ['my book', 'the my book', 'a my book', 'my the book'], answer: 'my book' },
              { type: 'order', prompt: 'Собери: «Это большой дом»', words: ['This', 'is', 'a', 'big', 'house'], answer: 'This is a big house' },
            ],
          },
        ],
      },
    ],
  },

  /* ---------- Дальнейшая дорожная карта ---------- */
  {
    id: 'a1',
    code: 'A1',
    title: 'Elementary',
    subtitle: 'Простые фразы о себе и быте',
    goal: 'Рассказать о себе, семье и распорядке дня. Задать простой вопрос.',
    units: [
      {
        id: 'a1-u1',
        title: 'Present Simple',
        icon: '🔁',
        lessons: [
          {
            id: 'a1-u1-l1',
            title: 'Регулярные действия: я работаю',
            duration: 15,
            theory: [
              { type: 'p', text: 'Present Simple — время для того, что происходит регулярно, вообще или всегда: «я работаю», «она живёт в Москве», «вода кипит при 100 градусах». Это самое частое время в английском, с него начинается вся речь о себе.' },
              { type: 'formula', text: 'I / you / we / they + глагол', note: 'I work. — Я работаю.  |  They live here. — Они живут здесь.' },
              { type: 'formula', text: 'he / she / it + глагол + -s', note: 'He works. — Он работает.  |  She lives here. — Она живёт здесь.' },
              {
                type: 'table',
                head: ['Кто', 'Форма', 'Пример'],
                rows: [
                  ['I', 'work', 'I work every day.'],
                  ['you', 'work', 'You work a lot.'],
                  ['he / she / it', 'works', 'He works at home.'],
                  ['we', 'work', 'We work together.'],
                  ['they', 'work', 'They work here.'],
                ],
              },
              { type: 'warn', text: 'Окончание -s появляется ТОЛЬКО в третьем лице единственного числа (he, she, it). Это самая частая ошибка на A1: либо забывают -s там, где нужно, либо лепят везде.' },
              { type: 'p', text: 'Как именно добавляется -s, зависит от того, чем кончается глагол:' },
              {
                type: 'table',
                head: ['Окончание глагола', 'Что делаем', 'Пример'],
                rows: [
                  ['обычный случай', '+ s', 'work → works'],
                  ['-o, -s, -sh, -ch, -x', '+ es', 'go → goes, watch → watches'],
                  ['согласная + y', 'y → ies', 'study → studies'],
                  ['гласная + y', '+ s', 'play → plays'],
                ],
              },
              { type: 'tip', text: 'Мнемоника: «he, she, it — s не забудь». Проговори её пару раз, и рука сама начнёт дописывать окончание.' },
            ],
            vocab: ['study', 'read', 'write', 'play', 'watch', 'listen', 'live', 'work'],
            exercises: [
              { type: 'choice', prompt: 'Выбери верное: «Она читает каждый день»', options: ['She reads every day', 'She read every day', 'She readsing every day', 'She is read every day'], answer: 'She reads every day' },
              { type: 'choice', prompt: 'Какая форма у «study» для he?', options: ['studies', 'studys', 'study', 'studyes'], answer: 'studies' },
              { type: 'choice', prompt: 'Какая форма у «watch» для she?', options: ['watches', 'watchs', 'watch', 'watchies'], answer: 'watches' },
              { type: 'order', prompt: 'Собери: «Мы живём здесь»', words: ['We', 'live', 'here'], answer: 'We live here' },
              { type: 'order', prompt: 'Собери: «Он работает дома»', words: ['He', 'works', 'at', 'home'], answer: 'He works at home' },
              { type: 'translate', prompt: 'Переведи: «Я изучаю английский» (English)', answer: 'I study English' },
              { type: 'listen', word: 'works', options: ['works', 'work', 'walks', 'worse'] },
            ],
          },
          {
            id: 'a1-u1-l2',
            title: 'Отрицание: don’t и doesn’t',
            duration: 15,
            theory: [
              { type: 'p', text: 'В русском отрицание — это одна частица «не». В английском для Present Simple нужен вспомогательный глагол do, и именно он берёт на себя отрицание.' },
              { type: 'formula', text: 'I / you / we / they + don’t + глагол', note: 'I don’t work. — Я не работаю.' },
              { type: 'formula', text: 'he / she / it + doesn’t + глагол', note: 'He doesn’t work. — Он не работает.' },
              {
                type: 'table',
                head: ['Утверждение', 'Отрицание'],
                rows: [
                  ['I know.', 'I don’t know.'],
                  ['You like tea.', 'You don’t like tea.'],
                  ['She works here.', 'She doesn’t work here.'],
                  ['He eats meat.', 'He doesn’t eat meat.'],
                  ['They live here.', 'They don’t live here.'],
                ],
              },
              { type: 'warn', text: 'Ключевой момент: окончание -s переезжает на doesn’t, и сам глагол остаётся в начальной форме. «He doesn’t works» — грубая ошибка. Правильно: He doesn’t work.' },
              { type: 'tip', text: 'don’t = do not, doesn’t = does not. Полные формы используют, когда хотят подчеркнуть отрицание: «I do NOT agree».' },
              { type: 'dialog', lines: [
                ['A', 'Do you like coffee?', 'Ты любишь кофе?'],
                ['B', 'No, I don’t. I drink tea.', 'Нет. Я пью чай.'],
                ['A', 'And your brother?', 'А твой брат?'],
                ['B', 'He doesn’t drink tea or coffee.', 'Он не пьёт ни чай, ни кофе.'],
              ] },
            ],
            vocab: ['not', 'know', 'like', 'eat', 'drink', 'coffee', 'tea', 'meat'],
            exercises: [
              { type: 'choice', prompt: 'Выбери верное: «Он не работает здесь»', options: ['He doesn’t work here', 'He doesn’t works here', 'He don’t work here', 'He not work here'], answer: 'He doesn’t work here' },
              { type: 'choice', prompt: 'Вставь нужную форму: «They ___ live in Moscow»', options: ['don’t', 'doesn’t', 'not', 'aren’t'], answer: 'don’t' },
              { type: 'choice', prompt: 'Вставь нужную форму: «She ___ eat meat»', options: ['doesn’t', 'don’t', 'isn’t', 'not'], answer: 'doesn’t' },
              { type: 'order', prompt: 'Собери: «Я не знаю»', words: ['I', 'don’t', 'know'], answer: 'I don’t know' },
              { type: 'order', prompt: 'Собери: «Она не пьёт кофе»', words: ['She', 'doesn’t', 'drink', 'coffee'], answer: 'She doesn’t drink coffee' },
              { type: 'translate', prompt: 'Переведи: «Мы не живём здесь»', answer: 'we don’t live here' },
            ],
          },
        ],
      },
      {
        id: 'a1-u2',
        title: 'Множественное число',
        icon: '➕',
        lessons: [
          {
            id: 'a1-u2-l1',
            title: 'Обычное множественное число',
            duration: 12,
            theory: [
              { type: 'p', text: 'В английском множественное число образуется куда проще, чем в русском: почти всегда достаточно добавить -s. Падежей нет, род не меняется.' },
              {
                type: 'table',
                head: ['Окончание слова', 'Что делаем', 'Пример'],
                rows: [
                  ['обычный случай', '+ s', 'table → tables'],
                  ['-s, -ss, -sh, -ch, -x', '+ es', 'box → boxes, watch → watches'],
                  ['согласная + y', 'y → ies', 'city → cities'],
                  ['гласная + y', '+ s', 'day → days'],
                  ['-f, -fe', 'f → ves', 'knife → knives'],
                ],
              },
              { type: 'p', text: 'Окончание читается по-разному — это слышно, и носители на это опираются:' },
              {
                type: 'table',
                head: ['После чего', 'Звук', 'Пример'],
                rows: [
                  ['глухих согласных (p, t, k, f)', '/s/', 'books /bʊks/'],
                  ['звонких согласных и гласных', '/z/', 'keys /kiːz/'],
                  ['шипящих и свистящих', '/ɪz/', 'boxes /ˈbɒksɪz/'],
                ],
              },
              { type: 'warn', text: 'Прилагательные во множественном числе НЕ меняются: «big houses», а не «bigs houses». В английском согласования по числу у прилагательного просто нет.' },
            ],
            vocab: ['table', 'chair', 'key', 'bag', 'door', 'window', 'phone', 'city'],
            exercises: [
              { type: 'choice', prompt: 'Множественное число от «city»', options: ['cities', 'citys', 'cityes', 'cityies'], answer: 'cities' },
              { type: 'choice', prompt: 'Множественное число от «day»', options: ['days', 'daies', 'dayes', 'day'], answer: 'days' },
              { type: 'choice', prompt: 'Что верно?', options: ['big houses', 'bigs houses', 'big housees', 'bigs house'], answer: 'big houses' },
              { type: 'order', prompt: 'Собери: «Ключи на столе»', words: ['The', 'keys', 'are', 'on', 'the', 'table'], answer: 'The keys are on the table' },
              { type: 'translate', prompt: 'Напиши множественное число слова «window»', answer: 'windows' },
            ],
          },
          {
            id: 'a1-u2-l2',
            title: 'Особые формы и неисчисляемые',
            duration: 15,
            theory: [
              { type: 'p', text: 'Небольшая группа слов образует множественное число не по правилам. Их просто запоминают — зато они самые частые в речи.' },
              {
                type: 'table',
                head: ['Единственное', 'Множественное', 'Перевод'],
                rows: [
                  ['man', 'men', 'мужчина → мужчины'],
                  ['woman', 'women', 'женщина → женщины'],
                  ['child', 'children', 'ребёнок → дети'],
                  ['person', 'people', 'человек → люди'],
                  ['foot', 'feet', 'нога → ноги'],
                  ['tooth', 'teeth', 'зуб → зубы'],
                ],
              },
              { type: 'warn', text: 'Пишется woman /ˈwʊmən/, а women /ˈwɪmɪn/ — меняется звук в ПЕРВОМ слоге, хотя на письме меняется вторая буква. На слух их различают именно по этому.' },
              { type: 'p', text: 'Отдельная история — неисчисляемые существительные. Их нельзя посчитать поштучно, поэтому у них нет множественного числа и они требуют глагола в единственном числе:' },
              {
                type: 'table',
                head: ['Слово', 'Как правильно', 'Как неправильно'],
                rows: [
                  ['money', 'money is', 'monies are'],
                  ['water', 'some water', 'two waters'],
                  ['bread', 'a piece of bread', 'a bread'],
                  ['information', 'information is', 'informations'],
                  ['advice', 'a piece of advice', 'an advice'],
                ],
              },
              { type: 'tip', text: 'Чтобы посчитать неисчисляемое, добавляют «порцию»: a glass of water, a piece of bread, a cup of tea.' },
            ],
            vocab: ['children', 'people', 'men', 'women', 'money', 'bread', 'milk', 'water'],
            exercises: [
              { type: 'choice', prompt: 'Множественное число от «child»', options: ['children', 'childs', 'childrens', 'childes'], answer: 'children' },
              { type: 'choice', prompt: 'Что верно?', options: ['Money is important', 'Money are important', 'Monies are important', 'A money is important'], answer: 'Money is important' },
              { type: 'choice', prompt: 'Множественное число от «person»', options: ['people', 'persons', 'peoples', 'personen'], answer: 'people' },
              { type: 'listen', word: 'women', options: ['women', 'woman', 'warming', 'wooden'] },
              { type: 'order', prompt: 'Собери: «Дети в школе»', words: ['The', 'children', 'are', 'at', 'school'], answer: 'The children are at school' },
              { type: 'translate', prompt: 'Напиши множественное число слова «man»', answer: 'men' },
            ],
          },
        ],
      },
      {
        id: 'a1-u3',
        title: 'have got — «у меня есть»',
        icon: '🎒',
        lessons: [
          {
            id: 'a1-u3-l1',
            title: 'У меня есть машина',
            duration: 15,
            theory: [
              { type: 'p', text: 'Русское «у меня есть» устроено наоборот по сравнению с английским. У нас обладатель стоит в косвенной форме («у меня»), а вещь — подлежащее. В английском наоборот: обладатель становится подлежащим.' },
              { type: 'formula', text: 'У меня есть машина → Я имею машину', note: 'I have got a car.  |  I have a car.' },
              {
                type: 'table',
                head: ['Кто', 'Форма', 'Сокращение'],
                rows: [
                  ['I / you / we / they', 'have got', 'I’ve got'],
                  ['he / she / it', 'has got', 'He’s got'],
                ],
              },
              { type: 'p', text: 'Две формы означают одно и то же:' },
              {
                type: 'table',
                head: ['Вариант', 'Где чаще', 'Пример'],
                rows: [
                  ['have got', 'британский', 'I’ve got two brothers.'],
                  ['have', 'американский', 'I have two brothers.'],
                ],
              },
              { type: 'warn', text: 'Не смешивай с глаголом to be. «Я имею 25 лет» по-английски — I am 25, а не I have 25. Возраст, голод и жажда в английском идут через to be: I am hungry, I am thirsty.' },
              { type: 'tip', text: 'He’s got — это has got, а не is got. Сокращение ’s прячет и is, и has: смотри по смыслу.' },
            ],
            vocab: ['have', 'car', 'phone', 'computer', 'money', 'bag'],
            exercises: [
              { type: 'choice', prompt: 'Выбери верное: «У неё есть машина»', options: ['She has got a car', 'She have got a car', 'She is got a car', 'At her is a car'], answer: 'She has got a car' },
              { type: 'choice', prompt: 'Как сказать «Мне 25 лет»?', options: ['I am 25', 'I have 25', 'I have got 25 years', 'To me 25 years'], answer: 'I am 25' },
              { type: 'order', prompt: 'Собери: «У меня есть телефон»', words: ['I', 'have', 'got', 'a', 'phone'], answer: 'I have got a phone' },
              { type: 'translate', prompt: 'Переведи: «У них есть компьютер»', answer: 'they have got a computer' },
              { type: 'listen', word: 'money', options: ['money', 'many', 'Monday', 'mommy'] },
            ],
          },
          {
            id: 'a1-u3-l2',
            title: 'Вопросы и отрицания: есть ли у тебя…',
            duration: 15,
            theory: [
              { type: 'p', text: 'У have got свои вопрос и отрицание — вспомогательный do здесь не нужен, have само выходит вперёд.' },
              { type: 'formula', text: 'Вопрос: Have / Has + кто + got …?', note: 'Have you got a car? — У тебя есть машина?  |  Has she got children? — У неё есть дети?' },
              { type: 'formula', text: 'Отрицание: haven’t got / hasn’t got', note: 'I haven’t got a car. — У меня нет машины.' },
              {
                type: 'table',
                head: ['Тип', 'have got', 'have (амер.)'],
                rows: [
                  ['Вопрос', 'Have you got a car?', 'Do you have a car?'],
                  ['Отрицание', 'I haven’t got a car.', 'I don’t have a car.'],
                  ['Краткий ответ', 'Yes, I have. / No, I haven’t.', 'Yes, I do. / No, I don’t.'],
                ],
              },
              { type: 'warn', text: 'Формы нельзя смешивать. «Do you have got…?» — ошибка: либо Have you got, либо Do you have.' },
              { type: 'dialog', lines: [
                ['A', 'Have you got a big family?', 'У тебя большая семья?'],
                ['B', 'Yes, I have. I’ve got two sisters.', 'Да. У меня две сестры.'],
                ['A', 'Has your sister got children?', 'У твоей сестры есть дети?'],
                ['B', 'No, she hasn’t.', 'Нет.'],
              ] },
            ],
            vocab: ['family', 'brother', 'sister', 'children', 'house', 'key'],
            exercises: [
              { type: 'choice', prompt: 'Выбери верный вопрос', options: ['Have you got a car?', 'Do you have got a car?', 'Have you a car got?', 'You have got a car?'], answer: 'Have you got a car?' },
              { type: 'choice', prompt: 'Выбери верное отрицание: «У него нет денег»', options: ['He hasn’t got money', 'He haven’t got money', 'He doesn’t got money', 'He not has money'], answer: 'He hasn’t got money' },
              { type: 'order', prompt: 'Собери вопрос: «У неё есть дети?»', words: ['Has', 'she', 'got', 'children'], answer: 'Has she got children' },
              { type: 'translate', prompt: 'Переведи: «У меня нет ключа» (используй haven’t got)', answer: 'I haven’t got a key' },
            ],
          },
        ],
      },
      {
        id: 'a1-u4',
        title: 'Вопросы с do / does',
        icon: '❓',
        lessons: [
          {
            id: 'a1-u4-l1',
            title: 'Общие вопросы: ты любишь…?',
            duration: 15,
            theory: [
              { type: 'p', text: 'В русском вопрос отличается от утверждения только интонацией: «Ты работаешь.» → «Ты работаешь?». В английском так нельзя — нужен вспомогательный глагол do, и он встаёт в начало.' },
              { type: 'formula', text: 'Do + I / you / we / they + глагол?', note: 'Do you work? — Ты работаешь?' },
              { type: 'formula', text: 'Does + he / she / it + глагол?', note: 'Does he work? — Он работает?' },
              { type: 'warn', text: 'Окончание -s переезжает на does, а глагол остаётся в начальной форме. «Does he works?» — ошибка. Правильно: Does he work?' },
              { type: 'p', text: 'Отвечают на такие вопросы коротко — полное предложение звучит неестественно:' },
              {
                type: 'table',
                head: ['Вопрос', 'Да', 'Нет'],
                rows: [
                  ['Do you like tea?', 'Yes, I do.', 'No, I don’t.'],
                  ['Does she work here?', 'Yes, she does.', 'No, she doesn’t.'],
                  ['Do they speak English?', 'Yes, they do.', 'No, they don’t.'],
                ],
              },
              { type: 'tip', text: 'В кратком ответе повторяется вспомогательный глагол, а не смысловой: «Yes, I do», а не «Yes, I like».' },
            ],
            vocab: ['do', 'like', 'speak', 'live', 'work', 'study'],
            exercises: [
              { type: 'choice', prompt: 'Выбери верный вопрос: «Он говорит по-английски?»', options: ['Does he speak English?', 'Does he speaks English?', 'Do he speak English?', 'He speaks English?'], answer: 'Does he speak English?' },
              { type: 'choice', prompt: 'Как ответить утвердительно на «Do you like coffee?»', options: ['Yes, I do', 'Yes, I like', 'Yes, I am', 'Yes, I does'], answer: 'Yes, I do' },
              { type: 'choice', prompt: 'Вставь: «___ they live here?»', options: ['Do', 'Does', 'Are', 'Is'], answer: 'Do' },
              { type: 'order', prompt: 'Собери: «Ты работаешь здесь?»', words: ['Do', 'you', 'work', 'here'], answer: 'Do you work here' },
              { type: 'translate', prompt: 'Переведи вопрос: «Она изучает английский?» (English)', answer: 'does she study English' },
            ],
          },
          {
            id: 'a1-u4-l2',
            title: 'Вопросы со словами what, where, when',
            duration: 15,
            theory: [
              { type: 'p', text: 'Если нужен не «да/нет», а конкретная информация, впереди ставится вопросительное слово. Всё остальное остаётся ровно тем же.' },
              { type: 'formula', text: 'Вопросительное слово + do/does + кто + глагол?', note: 'Where do you live? — Где ты живёшь?' },
              {
                type: 'table',
                head: ['Слово', 'Вопрос', 'Перевод'],
                rows: [
                  ['what', 'What do you want?', 'Что ты хочешь?'],
                  ['where', 'Where does he work?', 'Где он работает?'],
                  ['when', 'When do they come?', 'Когда они приходят?'],
                  ['why', 'Why do you ask?', 'Почему ты спрашиваешь?'],
                  ['how', 'How do you know?', 'Откуда ты знаешь?'],
                  ['how much', 'How much does it cost?', 'Сколько это стоит?'],
                ],
              },
              { type: 'warn', text: 'Порядок слов жёсткий: сначала вопросительное слово, потом do/does, потом подлежащее, потом глагол. «Where you live?» — типичная ошибка русскоязычных, do пропускать нельзя.' },
              { type: 'p', text: 'Исключение — вопрос к подлежащему («кто?»). Там do не нужен, порядок как в утверждении:' },
              { type: 'formula', text: 'Who lives here?', note: 'Кто здесь живёт? — не «Who does live here?»' },
              { type: 'dialog', lines: [
                ['A', 'Where do you live?', 'Где ты живёшь?'],
                ['B', 'I live in Moscow. And you?', 'Я живу в Москве. А ты?'],
                ['A', 'I live near the station. What do you do?', 'Я живу у вокзала. Чем занимаешься?'],
                ['B', 'I work in an office.', 'Я работаю в офисе.'],
              ] },
            ],
            vocab: ['what', 'where', 'when', 'why', 'how', 'who', 'office', 'station'],
            exercises: [
              { type: 'choice', prompt: 'Выбери верное: «Где ты живёшь?»', options: ['Where do you live?', 'Where you live?', 'Where live you?', 'Where does you live?'], answer: 'Where do you live?' },
              { type: 'choice', prompt: 'Выбери верное: «Кто здесь работает?»', options: ['Who works here?', 'Who does work here?', 'Who do work here?', 'Who working here?'], answer: 'Who works here?' },
              { type: 'choice', prompt: 'Вставь: «What ___ she want?»', options: ['does', 'do', 'is', 'are'], answer: 'does' },
              { type: 'order', prompt: 'Собери: «Когда они приходят?»', words: ['When', 'do', 'they', 'come'], answer: 'When do they come' },
              { type: 'translate', prompt: 'Переведи: «Где он работает?»', answer: 'where does he work' },
            ],
          },
        ],
      },
      {
        id: 'a1-u5',
        title: 'Предлоги места и времени',
        icon: '📍',
        lessons: [
          {
            id: 'a1-u5-l1',
            title: 'Где что находится',
            duration: 12,
            theory: [
              { type: 'p', text: 'Предлоги места отвечают на вопрос «где?». Три главных — in, on, at — различаются не по словарю, а по образу.' },
              {
                type: 'table',
                head: ['Предлог', 'Образ', 'Пример'],
                rows: [
                  ['in', 'внутри объёма', 'in the room, in the bag'],
                  ['on', 'на поверхности', 'on the table, on the wall'],
                  ['at', 'в точке, у места', 'at the station, at work'],
                  ['under', 'под', 'under the table'],
                  ['behind', 'позади', 'behind the door'],
                  ['between', 'между двумя', 'between the shop and the bank'],
                  ['next to', 'рядом с', 'next to me'],
                ],
              },
              { type: 'warn', text: 'Устойчивые сочетания без артикля надо просто запомнить: at home, at work, at school. Не «at the home».' },
              { type: 'tip', text: 'in the street — британский вариант, on the street — американский. Оба правильны, просто разные традиции.' },
            ],
            vocab: ['in', 'on', 'at', 'under', 'behind', 'between', 'next-to', 'room', 'kitchen', 'table'],
            exercises: [
              { type: 'choice', prompt: 'Вставь предлог: «The keys are ___ the table»', options: ['on', 'in', 'at', 'under'], answer: 'on' },
              { type: 'choice', prompt: 'Вставь предлог: «She is ___ the kitchen»', options: ['in', 'on', 'at', 'behind'], answer: 'in' },
              { type: 'choice', prompt: 'Как правильно «дома»?', options: ['at home', 'at the home', 'in home', 'on home'], answer: 'at home' },
              { type: 'order', prompt: 'Собери: «Кот под столом»', words: ['The', 'cat', 'is', 'under', 'the', 'table'], answer: 'The cat is under the table' },
              { type: 'translate', prompt: 'Переведи: «Я на работе»', answer: 'I am at work' },
            ],
          },
          {
            id: 'a1-u5-l2',
            title: 'Когда что происходит',
            duration: 12,
            theory: [
              { type: 'p', text: 'Те же три предлога работают и со временем, но правило здесь чёткое и запоминается за минуту: чем крупнее отрезок времени, тем «объёмнее» предлог.' },
              {
                type: 'table',
                head: ['Предлог', 'С чем', 'Пример'],
                rows: [
                  ['at', 'точное время', 'at 7 o’clock, at noon'],
                  ['on', 'дни и даты', 'on Monday, on 5 May'],
                  ['in', 'месяцы, годы, части суток', 'in July, in 2026, in the morning'],
                ],
              },
              { type: 'warn', text: 'Исключение, которое ломает логику: at night, а не «in the night». Зато in the morning / in the evening — по правилу.' },
              { type: 'p', text: 'С сегодня, завтра и вчера предлог не ставится вообще:' },
              { type: 'formula', text: 'today, tomorrow, yesterday — без предлога', note: 'I work tomorrow. — не «on tomorrow».' },
              { type: 'tip', text: 'Мнемоника по возрастанию: at — точка, on — день, in — всё, что больше дня.' },
            ],
            vocab: ['monday', 'friday', 'morning', 'evening', 'night', 'week', 'month', 'year'],
            exercises: [
              { type: 'choice', prompt: 'Вставь предлог: «I work ___ Monday»', options: ['on', 'in', 'at', '—'], answer: 'on' },
              { type: 'choice', prompt: 'Вставь предлог: «The film starts ___ 8 o’clock»', options: ['at', 'on', 'in', '—'], answer: 'at' },
              { type: 'choice', prompt: 'Вставь предлог: «___ the morning I drink tea»', options: ['In', 'On', 'At', '—'], answer: 'In' },
              { type: 'choice', prompt: 'Как правильно «ночью»?', options: ['at night', 'in the night', 'on night', 'in night'], answer: 'at night' },
              { type: 'order', prompt: 'Собери: «Увидимся в пятницу»', words: ['See', 'you', 'on', 'Friday'], answer: 'See you on Friday' },
              { type: 'translate', prompt: 'Переведи: «Я работаю завтра»', answer: 'I work tomorrow' },
            ],
          },
        ],
      },
      {
        id: 'a1-u6',
        title: 'can / can’t',
        icon: '💪',
        lessons: [
          {
            id: 'a1-u6-l1',
            title: 'Умею и могу',
            duration: 12,
            theory: [
              { type: 'p', text: 'can — модальный глагол. Он выражает умение и возможность и ведёт себя не как обычный глагол: у него нет -s, ему не нужен do, а следующий за ним глагол идёт без частицы to.' },
              { type: 'formula', text: 'кто + can + глагол', note: 'I can swim. — Я умею плавать.  |  She can drive. — Она умеет водить.' },
              {
                type: 'table',
                head: ['Тип', 'Форма', 'Пример'],
                rows: [
                  ['Утверждение', 'can', 'He can cook.'],
                  ['Отрицание', 'can’t (cannot)', 'He can’t cook.'],
                  ['Вопрос', 'Can + кто …?', 'Can he cook?'],
                  ['Краткий ответ', 'Yes, he can. / No, he can’t.', '—'],
                ],
              },
              { type: 'warn', text: 'Три ошибки подряд в одном предложении: «She cans to swims». Правильно: She can swim. Никакого -s у can, никакого to, никакого -s у смыслового глагола.' },
              { type: 'tip', text: 'cannot пишется слитно — это единственный модальный глагол с таким написанием. Раздельное «can not» встречается, но только когда not относится к чему-то другому.' },
            ],
            vocab: ['can', 'swim', 'drive', 'cook', 'read', 'write', 'speak'],
            exercises: [
              { type: 'choice', prompt: 'Выбери верное: «Она умеет плавать»', options: ['She can swim', 'She cans swim', 'She can to swim', 'She can swims'], answer: 'She can swim' },
              { type: 'choice', prompt: 'Выбери верный вопрос', options: ['Can you drive?', 'Do you can drive?', 'Can you to drive?', 'You can drive?'], answer: 'Can you drive?' },
              { type: 'choice', prompt: 'Как пишется отрицание?', options: ['cannot', 'can not', 'donot can', 'no can'], answer: 'cannot' },
              { type: 'order', prompt: 'Собери: «Я не умею готовить»', words: ['I', 'can’t', 'cook'], answer: 'I can’t cook' },
              { type: 'translate', prompt: 'Переведи: «Он умеет водить машину» (drive)', answer: 'he can drive' },
            ],
          },
          {
            id: 'a1-u6-l2',
            title: 'Просьбы и разрешения',
            duration: 12,
            theory: [
              { type: 'p', text: 'Тот же can — главный инструмент вежливой бытовой речи. Разница между «можно мне» и «можешь ли ты» — только в подлежащем.' },
              { type: 'formula', text: 'Can I …? — Можно мне …?', note: 'Can I open the window? — Можно открыть окно?' },
              { type: 'formula', text: 'Can you …? — Можешь ли ты …?', note: 'Can you help me? — Можешь мне помочь?' },
              {
                type: 'table',
                head: ['Фраза', 'Вежливость', 'Перевод'],
                rows: [
                  ['Can you help me?', 'обычная', 'Поможешь?'],
                  ['Could you help me?', 'вежливее', 'Не могли бы вы помочь?'],
                  ['Can I have a coffee?', 'обычная', 'Можно мне кофе?'],
                  ['Could I have a coffee, please?', 'вежливо', 'Можно мне кофе, пожалуйста?'],
                ],
              },
              { type: 'tip', text: 'Одно слово please поднимает вежливость сильнее любой конструкции. В магазине и кафе «Can I have …, please?» — самая рабочая фраза на свете.' },
              { type: 'dialog', lines: [
                ['A', 'Can I have a coffee, please?', 'Можно мне кофе, пожалуйста?'],
                ['B', 'Sure. Anything else?', 'Конечно. Что-нибудь ещё?'],
                ['A', 'Could you give me the menu?', 'Не могли бы вы дать мне меню?'],
                ['B', 'Here you are.', 'Пожалуйста, вот.'],
              ] },
            ],
            vocab: ['help', 'open', 'close', 'give', 'take', 'please', 'restaurant', 'coffee'],
            exercises: [
              { type: 'choice', prompt: 'Как вежливо попросить помощь?', options: ['Could you help me, please?', 'You help me', 'Help me now', 'Can you helping me?'], answer: 'Could you help me, please?' },
              { type: 'choice', prompt: 'Как попросить кофе в кафе?', options: ['Can I have a coffee, please?', 'I want coffee', 'Give coffee', 'Can I to have coffee?'], answer: 'Can I have a coffee, please?' },
              { type: 'order', prompt: 'Собери: «Можно открыть окно?»', words: ['Can', 'I', 'open', 'the', 'window'], answer: 'Can I open the window' },
              { type: 'translate', prompt: 'Переведи: «Можешь мне помочь?»', answer: 'can you help me' },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'a2',
    code: 'A2',
    title: 'Pre-Intermediate',
    subtitle: 'Прошлое, будущее, сравнения',
    goal: 'Рассказать историю в прошлом и построить планы на будущее.',
    units: [
      {
        id: 'a2-u1',
        title: 'Past Simple',
        icon: '⏪',
        lessons: [
          {
            id: 'a2-u1-l1',
            title: 'Правильные глаголы и окончание -ed',
            duration: 15,
            theory: [
              { type: 'p', text: 'Past Simple — время для законченных действий в прошлом. В русском мы меняем глагол по родам («работал», «работала»), в английском форма одна для всех: добавляется -ed.' },
              { type: 'formula', text: 'кто + глагол + -ed', note: 'I worked. She worked. They worked. — Форма не зависит ни от лица, ни от рода.' },
              {
                type: 'table',
                head: ['Окончание глагола', 'Что делаем', 'Пример'],
                rows: [
                  ['обычный случай', '+ ed', 'work → worked'],
                  ['уже кончается на -e', '+ d', 'live → lived'],
                  ['согласная + y', 'y → ied', 'study → studied'],
                  ['гласная + y', '+ ed', 'play → played'],
                  ['короткий слог: согл.+гл.+согл.', 'удвоить согласную + ed', 'stop → stopped'],
                ],
              },
              { type: 'p', text: 'Окончание -ed читается тремя способами. Это не прихоть: язык просто выбирает то, что удобнее произнести.' },
              {
                type: 'table',
                head: ['После чего', 'Звук', 'Пример'],
                rows: [
                  ['глухих согласных (p, k, f, s, ʃ, tʃ)', '/t/', 'worked /wɜːkt/'],
                  ['звонких согласных и гласных', '/d/', 'lived /lɪvd/'],
                  ['звуков /t/ и /d/', '/ɪd/', 'wanted /ˈwɒntɪd/'],
                ],
              },
              { type: 'warn', text: 'Только после t и d появляется лишний слог. «worked» — это ОДИН слог (уоркт), а не «уоркед». Ошибка выдаёт новичка мгновенно.' },
              { type: 'p', text: 'Прошедшее почти всегда сопровождается маркером времени — по нему собеседник понимает, что речь о прошлом:' },
              { type: 'formula', text: 'yesterday · last week · two days ago · in 2020', note: 'I worked here two years ago. — Я работал здесь два года назад.' },
            ],
            vocab: ['work', 'live', 'study', 'play', 'watch', 'ago', 'last', 'yesterday'],
            exercises: [
              { type: 'choice', prompt: 'Прошедшее время от «study»', options: ['studied', 'studyed', 'studed', 'studies'], answer: 'studied' },
              { type: 'choice', prompt: 'Прошедшее время от «live»', options: ['lived', 'liveed', 'livd', 'living'], answer: 'lived' },
              { type: 'choice', prompt: 'Сколько слогов в слове «worked»?', options: ['один', 'два', 'три', 'зависит от лица'], answer: 'один' },
              { type: 'choice', prompt: 'Где окончание читается как /ɪd/?', options: ['wanted', 'worked', 'lived', 'played'], answer: 'wanted' },
              { type: 'order', prompt: 'Собери: «Я работал здесь в прошлом году»', words: ['I', 'worked', 'here', 'last', 'year'], answer: 'I worked here last year' },
              { type: 'translate', prompt: 'Переведи: «Она жила в Москве» (Moscow)', answer: 'she lived in Moscow' },
            ],
          },
          {
            id: 'a2-u1-l2',
            title: 'Неправильные глаголы',
            duration: 18,
            theory: [
              { type: 'p', text: 'Примерно двести глаголов не подчиняются правилу -ed. Плохая новость: их надо запоминать. Хорошая: это самые частые глаголы языка, и вы будете встречать их постоянно, так что они осядут сами.' },
              {
                type: 'table',
                head: ['Настоящее', 'Прошедшее', 'Перевод'],
                rows: [
                  ['be', 'was / were', 'быть'],
                  ['go', 'went', 'идти, ехать'],
                  ['have', 'had', 'иметь'],
                  ['do', 'did', 'делать'],
                  ['see', 'saw', 'видеть'],
                  ['make', 'made', 'делать, создавать'],
                  ['say', 'said', 'сказать'],
                  ['come', 'came', 'приходить'],
                  ['take', 'took', 'брать'],
                  ['give', 'gave', 'давать'],
                  ['get', 'got', 'получать'],
                  ['know', 'knew', 'знать'],
                  ['think', 'thought', 'думать'],
                  ['speak', 'spoke', 'говорить'],
                  ['write', 'wrote', 'писать'],
                  ['eat', 'ate', 'есть'],
                  ['drink', 'drank', 'пить'],
                  ['buy', 'bought', 'покупать'],
                ],
              },
              { type: 'p', text: 'Глагол to be — единственный, у которого в прошедшем ДВЕ формы:' },
              {
                type: 'table',
                head: ['Кто', 'Форма', 'Пример'],
                rows: [
                  ['I / he / she / it', 'was', 'I was tired.'],
                  ['you / we / they', 'were', 'They were at home.'],
                ],
              },
              { type: 'warn', text: 'said читается /sed/, а не /seɪd/. Такая же ловушка в read: настоящее /riːd/, прошедшее пишется так же, но читается /red/.' },
              { type: 'tip', text: 'Учи их не списком, а тройками по звучанию: think–thought, buy–bought; speak–spoke, write–wrote. Так они цепляются друг за друга.' },
            ],
            vocab: ['was', 'were', 'went', 'saw', 'had', 'made', 'said', 'came', 'took', 'gave', 'knew', 'thought', 'bought'],
            exercises: [
              { type: 'choice', prompt: 'Прошедшее время от «go»', options: ['went', 'goed', 'gone', 'goes'], answer: 'went' },
              { type: 'choice', prompt: 'Прошедшее время от «buy»', options: ['bought', 'buyed', 'brought', 'boughted'], answer: 'bought' },
              { type: 'choice', prompt: 'Вставь форму: «They ___ at home»', options: ['were', 'was', 'is', 'are'], answer: 'were' },
              { type: 'choice', prompt: 'Вставь форму: «I ___ tired»', options: ['was', 'were', 'am', 'been'], answer: 'was' },
              { type: 'listen', word: 'said', options: ['said', 'sad', 'seed', 'sight'] },
              { type: 'order', prompt: 'Собери: «Я видел его вчера»', words: ['I', 'saw', 'him', 'yesterday'], answer: 'I saw him yesterday' },
              { type: 'translate', prompt: 'Переведи: «Она купила машину» (a car)', answer: 'she bought a car' },
            ],
          },
          {
            id: 'a2-u1-l3',
            title: 'Отрицания и вопросы: did',
            duration: 15,
            theory: [
              { type: 'p', text: 'В прошедшем времени вспомогательный глагол один на всех — did. Никакого деления на лица, как с do/does.' },
              { type: 'formula', text: 'Отрицание: кто + didn’t + глагол', note: 'I didn’t work. — Я не работал.' },
              { type: 'formula', text: 'Вопрос: Did + кто + глагол?', note: 'Did you work? — Ты работал?' },
              { type: 'warn', text: 'Главное правило: did уже несёт прошедшее время, поэтому смысловой глагол возвращается в НАЧАЛЬНУЮ форму. «I didn’t went» и «Did you went?» — грубые ошибки. Правильно: I didn’t go. Did you go?' },
              {
                type: 'table',
                head: ['Утверждение', 'Отрицание', 'Вопрос'],
                rows: [
                  ['I went.', 'I didn’t go.', 'Did I go?'],
                  ['She saw him.', 'She didn’t see him.', 'Did she see him?'],
                  ['They bought it.', 'They didn’t buy it.', 'Did they buy it?'],
                ],
              },
              { type: 'p', text: 'Исключение — глагол to be. У него нет did, он справляется сам:' },
              { type: 'formula', text: 'was / were not · Was …? Were …?', note: 'I wasn’t there. — Меня там не было.  |  Were you at home? — Ты был дома?' },
              { type: 'dialog', lines: [
                ['A', 'Did you go to the party?', 'Ты ходил на вечеринку?'],
                ['B', 'No, I didn’t. I was very tired.', 'Нет. Я очень устал.'],
                ['A', 'Was it interesting?', 'Было интересно?'],
                ['B', 'I don’t know. I didn’t see it.', 'Не знаю. Я не видел.'],
              ] },
            ],
            vocab: ['did', 'was', 'were', 'went', 'saw', 'because', 'but', 'then'],
            exercises: [
              { type: 'choice', prompt: 'Выбери верное: «Я не ходил»', options: ['I didn’t go', 'I didn’t went', 'I don’t went', 'I not went'], answer: 'I didn’t go' },
              { type: 'choice', prompt: 'Выбери верный вопрос: «Ты видел его?»', options: ['Did you see him?', 'Did you saw him?', 'Do you saw him?', 'You did see him?'], answer: 'Did you see him?' },
              { type: 'choice', prompt: 'Вставь: «___ you at home yesterday?»', options: ['Were', 'Did', 'Was', 'Do'], answer: 'Were' },
              { type: 'order', prompt: 'Собери: «Она не купила это»', words: ['She', 'didn’t', 'buy', 'it'], answer: 'She didn’t buy it' },
              { type: 'order', prompt: 'Собери вопрос: «Что ты делал вчера?»', words: ['What', 'did', 'you', 'do', 'yesterday'], answer: 'What did you do yesterday' },
              { type: 'translate', prompt: 'Переведи: «Я не знал» (know)', answer: 'I didn’t know' },
            ],
          },
        ],
      },
      {
        id: 'a2-u2',
        title: 'Present Continuous',
        icon: '⏳',
        lessons: [
          {
            id: 'a2-u2-l1',
            title: 'Что происходит прямо сейчас',
            duration: 15,
            theory: [
              { type: 'p', text: 'В русском «я читаю» означает и привычку, и то, что происходит сию секунду. Английский эти смыслы различает: для процесса в данный момент есть отдельное время.' },
              { type: 'formula', text: 'am / is / are + глагол + -ing', note: 'I am reading. — Я (сейчас) читаю.' },
              {
                type: 'table',
                head: ['Кто', 'Форма', 'Пример'],
                rows: [
                  ['I', 'am + -ing', 'I am working.'],
                  ['he / she / it', 'is + -ing', 'She is sleeping.'],
                  ['you / we / they', 'are + -ing', 'They are waiting.'],
                ],
              },
              { type: 'p', text: 'Окончание -ing добавляется почти всегда просто, но есть три случая:' },
              {
                type: 'table',
                head: ['Глагол кончается на', 'Что делаем', 'Пример'],
                rows: [
                  ['обычный случай', '+ ing', 'work → working'],
                  ['немую -e', 'убрать e, + ing', 'live → living'],
                  ['короткий слог согл.+гл.+согл.', 'удвоить согласную', 'run → running, sit → sitting'],
                ],
              },
              { type: 'warn', text: 'Вспомогательный глагол обязателен. «I working» — ошибка, нужно «I am working». Без am/is/are предложения просто нет.' },
              { type: 'tip', text: 'Маркеры этого времени: now, at the moment, today, right now, look!, listen!' },
            ],
            vocab: ['wait', 'run', 'sit', 'stand', 'talk', 'wear', 'rain', 'now'],
            exercises: [
              { type: 'choice', prompt: 'Выбери верное: «Я сейчас работаю»', options: ['I am working now', 'I working now', 'I am work now', 'I works now'], answer: 'I am working now' },
              { type: 'choice', prompt: 'Форма с -ing от «run»', options: ['running', 'runing', 'runnning', 'runs'], answer: 'running' },
              { type: 'choice', prompt: 'Форма с -ing от «live»', options: ['living', 'liveing', 'livving', 'live'], answer: 'living' },
              { type: 'order', prompt: 'Собери: «Идёт дождь»', words: ['It', 'is', 'raining'], answer: 'It is raining' },
              { type: 'order', prompt: 'Собери: «Они ждут снаружи»', words: ['They', 'are', 'waiting', 'outside'], answer: 'They are waiting outside' },
              { type: 'translate', prompt: 'Переведи: «Мы сейчас разговариваем» (talk, now)', answer: 'we are talking now' },
            ],
          },
          {
            id: 'a2-u2-l2',
            title: 'Simple или Continuous',
            duration: 15,
            theory: [
              { type: 'p', text: 'Это главное противопоставление уровня A2. Выбор времени меняет смысл, а не просто стиль.' },
              {
                type: 'table',
                head: ['Present Simple', 'Present Continuous'],
                rows: [
                  ['вообще, регулярно', 'сейчас, в этот момент'],
                  ['I work in a bank.', 'I am working at home today.'],
                  ['Я работаю в банке (вообще).', 'Сегодня я работаю дома (сейчас).'],
                  ['She drinks tea.', 'She is drinking coffee.'],
                  ['Она пьёт чай (всегда).', 'Она пьёт кофе (в эту минуту).'],
                ],
              },
              {
                type: 'table',
                head: ['Маркеры Simple', 'Маркеры Continuous'],
                rows: [
                  ['always, usually, often', 'now, at the moment'],
                  ['sometimes, never', 'today, right now'],
                  ['every day, on Mondays', 'Look! Listen!'],
                ],
              },
              { type: 'warn', text: 'Есть глаголы, которые почти никогда не идут в Continuous: know, want, like, love, need, understand, remember. Они обозначают состояние, а не процесс. «I am knowing» — ошибка, только «I know».' },
              { type: 'tip', text: 'Проверка на глагол состояния: можно ли это «делать» осознанно? Бежать — можно, знать — нельзя. Значит, know в Continuous не идёт.' },
              { type: 'dialog', lines: [
                ['A', 'What do you do?', 'Чем ты занимаешься (по жизни)?'],
                ['B', 'I am a teacher.', 'Я учитель.'],
                ['A', 'And what are you doing now?', 'А что ты делаешь сейчас?'],
                ['B', 'I am waiting for a friend.', 'Жду друга.'],
              ] },
            ],
            vocab: ['always', 'usually', 'often', 'sometimes', 'never', 'now', 'know', 'want'],
            exercises: [
              { type: 'choice', prompt: 'Выбери верное: «Я всегда пью чай по утрам»', options: ['I always drink tea', 'I am always drinking tea', 'I always am drinking tea', 'I always drinking tea'], answer: 'I always drink tea' },
              { type: 'choice', prompt: 'Выбери верное: «Смотри! Идёт дождь»', options: ['Look! It is raining', 'Look! It rains', 'Look! It rain', 'Look! It raining'], answer: 'Look! It is raining' },
              { type: 'choice', prompt: 'Какой вариант невозможен?', options: ['I am knowing', 'I know', 'I am working', 'I work'], answer: 'I am knowing' },
              { type: 'choice', prompt: 'Вставь верное: «She ___ coffee at the moment»', options: ['is drinking', 'drinks', 'drink', 'is drink'], answer: 'is drinking' },
              { type: 'order', prompt: 'Собери: «Сегодня я работаю дома»', words: ['Today', 'I', 'am', 'working', 'at', 'home'], answer: 'Today I am working at home' },
              { type: 'translate', prompt: 'Переведи: «Он обычно работает здесь» (usually)', answer: 'he usually works here' },
            ],
          },
        ],
      },
      {
        id: 'a2-u3',
        title: 'will / going to',
        icon: '⏩',
        lessons: [
          {
            id: 'a2-u3-l1',
            title: 'will — решения и прогнозы',
            duration: 15,
            theory: [
              { type: 'p', text: 'will — самый простой способ говорить о будущем. Он не меняется по лицам, и после него глагол идёт в начальной форме.' },
              { type: 'formula', text: 'кто + will + глагол', note: 'I will help you. — Я тебе помогу.  |  She will come. — Она придёт.' },
              {
                type: 'table',
                head: ['Тип', 'Форма', 'Пример'],
                rows: [
                  ['Утверждение', 'will (’ll)', 'I’ll call you.'],
                  ['Отрицание', 'won’t', 'He won’t come.'],
                  ['Вопрос', 'Will + кто …?', 'Will you help me?'],
                ],
              },
              { type: 'warn', text: 'Отрицание — won’t, а не «willn’t». Форма нерегулярная, её просто запоминают.' },
              { type: 'p', text: 'will используют в трёх случаях:' },
              {
                type: 'table',
                head: ['Случай', 'Пример', 'Перевод'],
                rows: [
                  ['решение прямо сейчас', 'It’s cold. I’ll close the window.', 'Холодно. Закрою окно.'],
                  ['прогноз, мнение', 'I think it will rain.', 'Думаю, пойдёт дождь.'],
                  ['обещание', 'I won’t tell anyone.', 'Я никому не скажу.'],
                ],
              },
              { type: 'tip', text: 'После will глагол без -s и без to: «She will comes» и «She will to come» — обе ошибки. Только «She will come».' },
            ],
            vocab: ['will', 'help', 'soon', 'later', 'think', 'rain', 'call'],
            exercises: [
              { type: 'choice', prompt: 'Выбери верное: «Она придёт завтра»', options: ['She will come tomorrow', 'She will comes tomorrow', 'She wills come tomorrow', 'She will to come tomorrow'], answer: 'She will come tomorrow' },
              { type: 'choice', prompt: 'Как будет отрицание от will?', options: ['won’t', 'willn’t', 'don’t will', 'will not be'], answer: 'won’t' },
              { type: 'order', prompt: 'Собери: «Я позвоню тебе позже»', words: ['I', 'will', 'call', 'you', 'later'], answer: 'I will call you later' },
              { type: 'translate', prompt: 'Переведи: «Я тебе помогу»', answer: 'I will help you' },
            ],
          },
          {
            id: 'a2-u3-l2',
            title: 'going to — планы и очевидное',
            duration: 15,
            theory: [
              { type: 'p', text: 'Если решение принято заранее, англичанин скажет не will, а going to. Разница ощутимая: will — решил только что, going to — планировал.' },
              { type: 'formula', text: 'am / is / are + going to + глагол', note: 'I am going to buy a car. — Я собираюсь купить машину.' },
              {
                type: 'table',
                head: ['Ситуация', 'Что говорим', 'Почему'],
                rows: [
                  ['Телефон звонит. — Я отвечу.', 'I’ll answer it.', 'решение сию секунду'],
                  ['Я взял отпуск, еду в Рим.', 'I’m going to Rome.', 'план был заранее'],
                  ['Небо чёрное.', 'It’s going to rain.', 'есть видимое доказательство'],
                  ['Думаю, завтра будет тепло.', 'I think it will be warm.', 'просто мнение'],
                ],
              },
              { type: 'warn', text: 'Разница не всегда критична — вас поймут в любом случае. Но «I’m going to help you» в ответ на внезапную просьбу звучит странно: получается, вы это заранее спланировали.' },
              { type: 'tip', text: 'В разговоре going to часто произносят как «gonna» /ˈɡɒnə/. Понимать это нужно, а писать так — не стоит.' },
              { type: 'dialog', lines: [
                ['A', 'What are you going to do at the weekend?', 'Что собираешься делать на выходных?'],
                ['B', 'I’m going to visit my parents.', 'Собираюсь навестить родителей.'],
                ['A', 'Look at the sky! It’s going to rain.', 'Посмотри на небо! Сейчас пойдёт дождь.'],
                ['B', 'Then I’ll take an umbrella.', 'Тогда возьму зонт.'],
              ] },
            ],
            vocab: ['going-to', 'weekend', 'holiday', 'buy', 'take', 'or', 'also'],
            exercises: [
              { type: 'choice', prompt: 'Телефон звонит, ты решаешь ответить. Что скажешь?', options: ['I’ll answer it', 'I’m going to answer it', 'I answer it', 'I will answering it'], answer: 'I’ll answer it' },
              { type: 'choice', prompt: 'Ты купил билеты в Рим. Как скажешь о планах?', options: ['I’m going to Rome', 'I’ll go to Rome', 'I go to Rome', 'I will going to Rome'], answer: 'I’m going to Rome' },
              { type: 'choice', prompt: 'Небо чёрное. Что скажешь?', options: ['It’s going to rain', 'It will rain maybe', 'It rains', 'It is rain'], answer: 'It’s going to rain' },
              { type: 'order', prompt: 'Собери: «Я собираюсь купить машину»', words: ['I', 'am', 'going', 'to', 'buy', 'a', 'car'], answer: 'I am going to buy a car' },
              { type: 'translate', prompt: 'Переведи: «Что ты собираешься делать?» (do)', answer: 'what are you going to do' },
            ],
          },
        ],
      },
      {
        id: 'a2-u4',
        title: 'Степени сравнения',
        icon: '📊',
        lessons: [
          {
            id: 'a2-u4-l1',
            title: 'Сравнительная степень: больше, чем',
            duration: 15,
            theory: [
              { type: 'p', text: 'Правило выбора зависит от длины прилагательного — считаем слоги.' },
              { type: 'formula', text: 'Короткие (1 слог) + -er', note: 'big → bigger, fast → faster, tall → taller' },
              { type: 'formula', text: 'Длинные (3+ слога) → more + прилагательное', note: 'expensive → more expensive, interesting → more interesting' },
              {
                type: 'table',
                head: ['Слогов', 'Как', 'Пример'],
                rows: [
                  ['1', '+ er', 'small → smaller'],
                  ['2, кончается на -y', 'y → ier', 'easy → easier, happy → happier'],
                  ['2, прочие', 'обычно more', 'modern → more modern'],
                  ['3 и больше', 'more', 'beautiful → more beautiful'],
                ],
              },
              { type: 'p', text: 'После сравнения ставится than — «чем»:' },
              { type: 'formula', text: 'A + сравнительная + than + B', note: 'He is taller than me. — Он выше меня.' },
              { type: 'warn', text: 'Нельзя удваивать сравнение. «more bigger» — ошибка: либо bigger, либо more. Это частая ловушка, потому что в русском «более большой» звучит нормально.' },
              {
                type: 'table',
                head: ['Прилагательное', 'Сравнительная', 'Превосходная'],
                rows: [
                  ['good', 'better', 'the best'],
                  ['bad', 'worse', 'the worst'],
                  ['far', 'further', 'the furthest'],
                  ['little', 'less', 'the least'],
                ],
              },
              { type: 'tip', text: 'Эти четыре — единственные по-настоящему неправильные. Выучив их, вы закрыли все исключения темы.' },
            ],
            vocab: ['tall', 'fast', 'slow', 'easy', 'difficult', 'expensive', 'cheap', 'than', 'better', 'worse'],
            exercises: [
              { type: 'choice', prompt: 'Сравнительная степень от «big»', options: ['bigger', 'more big', 'biger', 'biggest'], answer: 'bigger' },
              { type: 'choice', prompt: 'Сравнительная степень от «expensive»', options: ['more expensive', 'expensiver', 'more expensiver', 'expensivest'], answer: 'more expensive' },
              { type: 'choice', prompt: 'Сравнительная степень от «good»', options: ['better', 'gooder', 'more good', 'best'], answer: 'better' },
              { type: 'choice', prompt: 'Что неверно?', options: ['more bigger', 'bigger', 'more beautiful', 'easier'], answer: 'more bigger' },
              { type: 'order', prompt: 'Собери: «Он выше меня»', words: ['He', 'is', 'taller', 'than', 'me'], answer: 'He is taller than me' },
              { type: 'translate', prompt: 'Переведи: «Эта книга интереснее» (interesting)', answer: 'this book is more interesting' },
            ],
          },
          {
            id: 'a2-u4-l2',
            title: 'Превосходная степень: самый',
            duration: 12,
            theory: [
              { type: 'p', text: 'Превосходная степень строится по той же логике, но с артиклем the — ведь «самый» всегда один, он определённый.' },
              { type: 'formula', text: 'Короткие: the + прилагательное + -est', note: 'the biggest, the fastest, the tallest' },
              { type: 'formula', text: 'Длинные: the most + прилагательное', note: 'the most expensive, the most beautiful' },
              {
                type: 'table',
                head: ['Обычная', 'Сравнительная', 'Превосходная'],
                rows: [
                  ['big', 'bigger', 'the biggest'],
                  ['easy', 'easier', 'the easiest'],
                  ['expensive', 'more expensive', 'the most expensive'],
                  ['good', 'better', 'the best'],
                  ['bad', 'worse', 'the worst'],
                ],
              },
              { type: 'warn', text: 'Артикль the перед превосходной степенью обязателен. «He is best student» — ошибка, нужно «the best student».' },
              { type: 'p', text: 'Часто добавляют, среди чего сравниваем:' },
              { type: 'formula', text: 'the + превосходная + in / of', note: 'the biggest city in the world · the best of all' },
              { type: 'tip', text: 'in — с местами и группами (in the world, in my class), of — с количествами (of all, of the three).' },
            ],
            vocab: ['best', 'worse', 'beautiful', 'interesting', 'important', 'young', 'hot', 'cold'],
            exercises: [
              { type: 'choice', prompt: 'Превосходная степень от «big»', options: ['the biggest', 'the bigest', 'the most big', 'bigger'], answer: 'the biggest' },
              { type: 'choice', prompt: 'Превосходная степень от «good»', options: ['the best', 'the goodest', 'the most good', 'better'], answer: 'the best' },
              { type: 'choice', prompt: 'Что верно?', options: ['He is the best student', 'He is best student', 'He is the most best student', 'He is a best student'], answer: 'He is the best student' },
              { type: 'order', prompt: 'Собери: «Это самый красивый город»', words: ['This', 'is', 'the', 'most', 'beautiful', 'city'], answer: 'This is the most beautiful city' },
              { type: 'translate', prompt: 'Переведи: «Мой лучший друг»', answer: 'my best friend' },
            ],
          },
        ],
      },
      {
        id: 'a2-u5',
        title: 'Количество: some, any, much, many',
        icon: '🥛',
        lessons: [
          {
            id: 'a2-u5-l1',
            title: 'some и any',
            duration: 12,
            theory: [
              { type: 'p', text: 'Оба слова означают «немного, сколько-то», но распределены по типам предложений.' },
              {
                type: 'table',
                head: ['Тип предложения', 'Слово', 'Пример'],
                rows: [
                  ['утверждение', 'some', 'I have some money.'],
                  ['отрицание', 'any', 'I don’t have any money.'],
                  ['вопрос', 'any', 'Have you got any money?'],
                  ['предложение / просьба', 'some', 'Would you like some tea?'],
                ],
              },
              { type: 'warn', text: 'Исключение в последней строке важное: в вопросе-предложении («не хотите ли») используется some, а не any. «Would you like some coffee?» — стандартная фраза официанта.' },
              { type: 'p', text: 'Оба слова работают и с исчисляемыми во множественном числе, и с неисчисляемыми:' },
              { type: 'formula', text: 'some books · some water · any friends · any bread', note: 'С единственным исчисляемым — не используются: не «some book», а «a book».' },
              { type: 'dialog', lines: [
                ['A', 'Have we got any bread?', 'У нас есть хлеб?'],
                ['B', 'No, we haven’t got any. But we have some milk.', 'Нет. Но есть молоко.'],
                ['A', 'Would you like some tea?', 'Хочешь чаю?'],
                ['B', 'Yes, please.', 'Да, пожалуйста.'],
              ] },
            ],
            vocab: ['some', 'any', 'money', 'bread', 'milk', 'water', 'enough'],
            exercises: [
              { type: 'choice', prompt: 'Вставь: «I don’t have ___ money»', options: ['any', 'some', 'much of', 'a'], answer: 'any' },
              { type: 'choice', prompt: 'Вставь: «I have ___ friends here»', options: ['some', 'any', 'a', 'much'], answer: 'some' },
              { type: 'choice', prompt: 'Официант предлагает чай. Как правильно?', options: ['Would you like some tea?', 'Would you like any tea?', 'Would you like a tea?', 'Would you like much tea?'], answer: 'Would you like some tea?' },
              { type: 'order', prompt: 'Собери: «У нас есть хлеб?»', words: ['Have', 'we', 'got', 'any', 'bread'], answer: 'Have we got any bread' },
              { type: 'translate', prompt: 'Переведи: «Мне нужно немного воды» (need)', answer: 'I need some water' },
            ],
          },
          {
            id: 'a2-u5-l2',
            title: 'much, many и a lot of',
            duration: 15,
            theory: [
              { type: 'p', text: 'Выбор зависит от того, можно ли предмет посчитать поштучно.' },
              {
                type: 'table',
                head: ['Слово', 'С чем', 'Пример'],
                rows: [
                  ['many', 'исчисляемые (мн. ч.)', 'many books, many people'],
                  ['much', 'неисчисляемые', 'much water, much time'],
                  ['a lot of', 'и то, и другое', 'a lot of books, a lot of water'],
                  ['a few', 'исчисляемые', 'a few friends'],
                  ['a little', 'неисчисляемые', 'a little sugar'],
                ],
              },
              { type: 'warn', text: 'much в утверждении звучит книжно и почти не встречается в живой речи. «I have much money» носитель не скажет — только «a lot of money». А вот в вопросах и отрицаниях much совершенно нормален: «How much time?», «I don’t have much time».' },
              { type: 'p', text: 'Отсюда простое рабочее правило:' },
              { type: 'formula', text: 'Утверждение → a lot of · Вопрос и отрицание → much / many', note: 'I have a lot of work. · Do you have much work? · I don’t have many friends here.' },
              { type: 'tip', text: 'How much? спрашивает и о количестве неисчисляемого, и о цене: «How much is it?» — «Сколько это стоит?»' },
            ],
            vocab: ['much', 'many', 'a-lot-of', 'few', 'little', 'how-much', 'how-many', 'very'],
            exercises: [
              { type: 'choice', prompt: 'Вставь: «How ___ people are here?»', options: ['many', 'much', 'a lot of', 'little'], answer: 'many' },
              { type: 'choice', prompt: 'Вставь: «How ___ time do we have?»', options: ['much', 'many', 'few', 'a lot'], answer: 'much' },
              { type: 'choice', prompt: 'Как естественнее сказать «У меня много работы»?', options: ['I have a lot of work', 'I have much work', 'I have many work', 'I have a many work'], answer: 'I have a lot of work' },
              { type: 'choice', prompt: 'Вставь: «I have ___ sugar, just a bit»', options: ['a little', 'a few', 'many', 'much of'], answer: 'a little' },
              { type: 'order', prompt: 'Собери: «У меня мало времени»', words: ['I', 'don’t', 'have', 'much', 'time'], answer: 'I don’t have much time' },
              { type: 'translate', prompt: 'Переведи вопрос: «Сколько это стоит?»', answer: 'how much is it' },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'b1',
    code: 'B1',
    title: 'Intermediate',
    subtitle: 'Свободный разговор на бытовые темы',
    goal: 'Поддержать беседу, объяснить причину, выразить мнение.',
    units: [
      {
        id: 'b1-u1',
        title: 'Present Perfect',
        icon: '✅',
        lessons: [
          {
            id: 'b1-u1-l1',
            title: 'Прошлое, которое важно сейчас',
            duration: 18,
            theory: [
              { type: 'p', text: 'Present Perfect — время, которого в русском просто нет. Отсюда и трудность: его нельзя перевести дословно, его нужно почувствовать. Оно описывает прошлое действие, у которого есть результат в настоящем.' },
              { type: 'formula', text: 'have / has + 3-я форма глагола', note: 'I have lost my keys. — Я потерял ключи (и сейчас их у меня нет).' },
              { type: 'p', text: 'Сравните два предложения. Оба про прошлое, но говорят о разном:' },
              {
                type: 'table',
                head: ['Предложение', 'Что важно'],
                rows: [
                  ['I lost my keys yesterday.', 'факт в прошлом; может, уже нашёл'],
                  ['I have lost my keys.', 'результат сейчас: ключей нет'],
                  ['He broke his leg in 2020.', 'просто было'],
                  ['He has broken his leg.', 'нога сломана прямо сейчас'],
                ],
              },
              {
                type: 'table',
                head: ['Кто', 'Форма', 'Сокращение'],
                rows: [
                  ['I / you / we / they', 'have + V3', 'I’ve seen'],
                  ['he / she / it', 'has + V3', 'He’s seen'],
                ],
              },
              { type: 'p', text: 'Третья форма (participle) — та самая колонка в таблице неправильных глаголов. У правильных она совпадает с прошедшим: work → worked → worked.' },
              {
                type: 'table',
                head: ['Начальная', 'Прошедшее', '3-я форма'],
                rows: [
                  ['be', 'was / were', 'been'],
                  ['go', 'went', 'gone'],
                  ['do', 'did', 'done'],
                  ['see', 'saw', 'seen'],
                  ['take', 'took', 'taken'],
                  ['write', 'wrote', 'written'],
                  ['speak', 'spoke', 'spoken'],
                  ['break', 'broke', 'broken'],
                ],
              },
              { type: 'warn', text: 'has, а не have, для he/she/it. «He have seen» — ошибка. И не путайте ’s: в «He’s seen» это has, а в «He’s tired» — is.' },
              { type: 'tip', text: 'been и gone различаются: «He has been to Rome» — съездил и вернулся. «He has gone to Rome» — уехал и всё ещё там.' },
            ],
            vocab: ['been', 'gone', 'done', 'seen', 'taken', 'written', 'spoken', 'broken', 'lost'],
            exercises: [
              { type: 'choice', prompt: 'Выбери верное: «Я потерял ключи» (и сейчас их нет)', options: ['I have lost my keys', 'I have lose my keys', 'I has lost my keys', 'I am lost my keys'], answer: 'I have lost my keys' },
              { type: 'choice', prompt: 'Вставь: «She ___ seen this film»', options: ['has', 'have', 'is', 'did'], answer: 'has' },
              { type: 'choice', prompt: '3-я форма от «write»', options: ['written', 'wrote', 'writed', 'writing'], answer: 'written' },
              { type: 'choice', prompt: 'Он уехал в Рим и всё ещё там. Как сказать?', options: ['He has gone to Rome', 'He has been to Rome', 'He went to Rome', 'He is gone Rome'], answer: 'He has gone to Rome' },
              { type: 'order', prompt: 'Собери: «Окно разбито»', words: ['The', 'window', 'is', 'broken'], answer: 'The window is broken' },
              { type: 'translate', prompt: 'Переведи: «Я видел этот фильм» (see, this film)', answer: 'I have seen this film' },
            ],
          },
          {
            id: 'b1-u1-l2',
            title: 'Present Perfect или Past Simple',
            duration: 18,
            theory: [
              { type: 'p', text: 'Это главный выбор уровня B1. Правило простое: если в предложении есть конкретное время в прошлом — только Past Simple. Present Perfect с ним несовместим.' },
              {
                type: 'table',
                head: ['Past Simple', 'Present Perfect'],
                rows: [
                  ['есть точное время', 'времени нет или оно не закончилось'],
                  ['I saw him yesterday.', 'I have seen him.'],
                  ['She came at five.', 'She has come.'],
                  ['We went there in 2020.', 'We have been there.'],
                ],
              },
              { type: 'warn', text: '«I have seen him yesterday» — ошибка, которую делают почти все. Слово yesterday закрывает отрезок времени, значит нужен Past Simple: «I saw him yesterday».' },
              {
                type: 'table',
                head: ['Только Past Simple', 'Только Present Perfect'],
                rows: [
                  ['yesterday', 'ever, never'],
                  ['last week / year', 'already, yet'],
                  ['two days ago', 'just'],
                  ['in 2020', 'so far, up to now'],
                  ['when I was a child', 'recently, lately'],
                ],
              },
              { type: 'p', text: 'Периоды времени бывают открытыми и закрытыми — от этого тоже зависит выбор:' },
              { type: 'formula', text: 'today, this week, this year — ещё не закончились', note: 'I have seen him today. — день ещё идёт, встреча может повториться.' },
              { type: 'tip', text: 'Проверка одним вопросом: «а когда именно?». Если ответ есть и он в прошлом — Past Simple. Если «неважно когда» или «за всю жизнь» — Present Perfect.' },
              { type: 'dialog', lines: [
                ['A', 'Have you ever been to Japan?', 'Ты когда-нибудь был в Японии?'],
                ['B', 'Yes, I have. I went there in 2019.', 'Да. Я ездил туда в 2019-м.'],
                ['A', 'Did you like it?', 'Понравилось?'],
                ['B', 'It was amazing.', 'Было потрясающе.'],
              ] },
            ],
            vocab: ['ever', 'never', 'yesterday', 'ago', 'last', 'recently', 'happen', 'change'],
            exercises: [
              { type: 'choice', prompt: 'Выбери верное: «Я видел его вчера»', options: ['I saw him yesterday', 'I have seen him yesterday', 'I have saw him yesterday', 'I seen him yesterday'], answer: 'I saw him yesterday' },
              { type: 'choice', prompt: 'Выбери верное: «Ты когда-нибудь был в Риме?»', options: ['Have you ever been to Rome?', 'Did you ever been to Rome?', 'Have you ever was in Rome?', 'Were you ever been to Rome?'], answer: 'Have you ever been to Rome?' },
              { type: 'choice', prompt: 'С каким словом Present Perfect невозможен?', options: ['in 2020', 'never', 'already', 'just'], answer: 'in 2020' },
              { type: 'choice', prompt: 'Вставь верное: «She ___ to London last year»', options: ['went', 'has gone', 'has been', 'is going'], answer: 'went' },
              { type: 'order', prompt: 'Собери: «Я никогда там не был»', words: ['I', 'have', 'never', 'been', 'there'], answer: 'I have never been there' },
              { type: 'translate', prompt: 'Переведи: «Он приехал два дня назад» (come, two days ago)', answer: 'he came two days ago' },
            ],
          },
          {
            id: 'b1-u1-l3',
            title: 'for, since, already, yet, just',
            duration: 15,
            theory: [
              { type: 'p', text: 'У Present Perfect есть свой набор слов-спутников. Они и подсказывают собеседнику, что время выбрано верно.' },
              { type: 'formula', text: 'for + промежуток · since + точка старта', note: 'for five years — пять лет  |  since 2020 — с 2020 года' },
              {
                type: 'table',
                head: ['for (сколько)', 'since (с какого момента)'],
                rows: [
                  ['for two hours', 'since 9 o’clock'],
                  ['for a week', 'since Monday'],
                  ['for ten years', 'since 2015'],
                  ['for a long time', 'since I was a child'],
                ],
              },
              { type: 'warn', text: 'Тут ловушка для русскоязычных. «Я живу здесь пять лет» — это НЕ прошедшее и не настоящее простое, а Present Perfect: «I have lived here for five years». Действие началось в прошлом и длится сейчас.' },
              {
                type: 'table',
                head: ['Слово', 'Где стоит', 'Пример'],
                rows: [
                  ['already', 'перед глаголом (утверждение)', 'I have already eaten.'],
                  ['yet', 'в конце (вопрос, отрицание)', 'Have you finished yet?'],
                  ['just', 'перед глаголом', 'She has just left.'],
                  ['never', 'перед глаголом', 'I have never seen it.'],
                  ['ever', 'в вопросе, перед глаголом', 'Have you ever tried?'],
                ],
              },
              { type: 'tip', text: 'already — «уже», в утверждении. yet — «уже/ещё», только в вопросе или отрицании: «I haven’t finished yet» — я ещё не закончил.' },
              { type: 'dialog', lines: [
                ['A', 'How long have you worked here?', 'Как долго ты здесь работаешь?'],
                ['B', 'For three years. Since 2023.', 'Три года. С 2023-го.'],
                ['A', 'Have you finished the report yet?', 'Ты уже закончил отчёт?'],
                ['B', 'I have just started it.', 'Я только что начал.'],
              ] },
            ],
            vocab: ['for-period', 'since', 'already', 'yet', 'just', 'job', 'learn', 'try'],
            exercises: [
              { type: 'choice', prompt: 'Вставь: «I have lived here ___ 2020»', options: ['since', 'for', 'from', 'during'], answer: 'since' },
              { type: 'choice', prompt: 'Вставь: «I have worked here ___ five years»', options: ['for', 'since', 'during', 'from'], answer: 'for' },
              { type: 'choice', prompt: 'Как сказать «Я живу здесь пять лет»?', options: ['I have lived here for five years', 'I live here five years', 'I am living here five years', 'I lived here for five years'], answer: 'I have lived here for five years' },
              { type: 'choice', prompt: 'Вставь: «I haven’t finished ___»', options: ['yet', 'already', 'just', 'ever'], answer: 'yet' },
              { type: 'order', prompt: 'Собери: «Она только что ушла»', words: ['She', 'has', 'just', 'left'], answer: 'She has just left' },
              { type: 'translate', prompt: 'Переведи: «Я уже поел» (eat, already)', answer: 'I have already eaten' },
            ],
          },
        ],
      },
      {
        id: 'b1-u2',
        title: 'Условные 0 и 1 типа',
        icon: '🔀',
        lessons: [
          {
            id: 'b1-u2-l1',
            title: 'Если — то: реальные условия',
            duration: 15,
            theory: [
              { type: 'p', text: 'Условные предложения состоят из двух частей: условия с if и результата. Тип зависит от того, насколько условие реально.' },
              { type: 'formula', text: 'Нулевой тип: If + Present Simple, Present Simple', note: 'If you heat water, it boils. — Если нагреть воду, она кипит.' },
              { type: 'formula', text: 'Первый тип: If + Present Simple, will + глагол', note: 'If it rains, we will stay home. — Если пойдёт дождь, останемся дома.' },
              {
                type: 'table',
                head: ['Тип', 'Смысл', 'Пример'],
                rows: [
                  ['0', 'всегда так, закон природы', 'If you drop it, it falls.'],
                  ['0', 'привычка, инструкция', 'If I am tired, I go to bed.'],
                  ['1', 'реальное будущее', 'If I have time, I will call you.'],
                  ['1', 'обещание, угроза', 'If you help me, I will help you.'],
                ],
              },
              { type: 'warn', text: 'Самая частая ошибка русскоязычных: будущее время в части с if. По-русски мы говорим «если пойдёт дождь», и рука сама пишет «If it will rain». В английском после if будущего НЕ БЫВАЕТ — только настоящее: «If it rains…».' },
              { type: 'p', text: 'Части можно менять местами. От этого зависит только запятая:' },
              { type: 'formula', text: 'If it rains, we will stay. = We will stay if it rains.', note: 'Если if в начале — запятая нужна. Если в середине — не нужна.' },
              { type: 'tip', text: 'Вместо if можно взять when, если событие точно произойдёт: «When I finish work, I will call you» — не «если», а «когда закончу».' },
            ],
            vocab: ['if', 'will', 'rain', 'call', 'help', 'idea', 'reason', 'happen'],
            exercises: [
              { type: 'choice', prompt: 'Выбери верное: «Если пойдёт дождь, мы останемся дома»', options: ['If it rains, we will stay home', 'If it will rain, we will stay home', 'If it rains, we stay home tomorrow', 'If it will rain, we stay home'], answer: 'If it rains, we will stay home' },
              { type: 'choice', prompt: 'Что нельзя ставить после «if» в 1-м типе?', options: ['will', 'настоящее время', 'подлежащее', 'глагол'], answer: 'will' },
              { type: 'choice', prompt: 'Вставь: «If I ___ time, I will call you»', options: ['have', 'will have', 'had', 'am having'], answer: 'have' },
              { type: 'order', prompt: 'Собери: «Если ты поможешь мне, я помогу тебе»', words: ['If', 'you', 'help', 'me', 'I', 'will', 'help', 'you'], answer: 'If you help me I will help you' },
              { type: 'translate', prompt: 'Переведи: «Если я закончу, я позвоню» (finish, call)', answer: 'if I finish I will call' },
            ],
          },
          {
            id: 'b1-u2-l2',
            title: 'unless и другие союзы',
            duration: 12,
            theory: [
              { type: 'p', text: 'Кроме if в условиях работают ещё несколько союзов. Все они подчиняются тому же правилу: никакого будущего внутри условия.' },
              {
                type: 'table',
                head: ['Союз', 'Значение', 'Пример'],
                rows: [
                  ['if', 'если', 'If you come, we will talk.'],
                  ['unless', 'если не', 'Unless you hurry, you will be late.'],
                  ['when', 'когда (точно будет)', 'When I arrive, I will call.'],
                  ['as soon as', 'как только', 'As soon as he comes, we will start.'],
                  ['before / after', 'до / после того как', 'I will call before I leave.'],
                ],
              },
              { type: 'warn', text: 'unless уже содержит отрицание. «Unless you don’t hurry» — двойное отрицание и ошибка. Правильно: «Unless you hurry» = «If you don’t hurry».' },
              { type: 'p', text: 'Разница между if и when тонкая, но заметная:' },
              {
                type: 'table',
                head: ['Фраза', 'Что подразумевается'],
                rows: [
                  ['If I see him, I will tell him.', 'может, увижу, а может, нет'],
                  ['When I see him, I will tell him.', 'точно увижу, вопрос только когда'],
                ],
              },
              { type: 'tip', text: 'После as soon as, when, before, after в разговоре о будущем тоже идёт настоящее время. Это то же правило, просто оно шире, чем кажется на первый взгляд.' },
            ],
            vocab: ['unless', 'if', 'when', 'before', 'after', 'come-back', 'find-out', 'decision'],
            exercises: [
              { type: 'choice', prompt: 'Как сказать «Если не поторопишься, опоздаешь»?', options: ['Unless you hurry, you will be late', 'Unless you don’t hurry, you will be late', 'Unless you will hurry, you will be late', 'If you hurry, you will be late'], answer: 'Unless you hurry, you will be late' },
              { type: 'choice', prompt: 'Вставь: «As soon as he ___, we will start»', options: ['comes', 'will come', 'came', 'is coming'], answer: 'comes' },
              { type: 'choice', prompt: 'Какая фраза означает «точно увижу»?', options: ['When I see him', 'If I see him', 'Unless I see him', 'In case I see him'], answer: 'When I see him' },
              { type: 'order', prompt: 'Собери: «Я позвоню, когда приеду»', words: ['I', 'will', 'call', 'when', 'I', 'arrive'], answer: 'I will call when I arrive' },
              { type: 'translate', prompt: 'Переведи: «Если ты не придёшь, я уйду» (использовать unless, come, leave)', answer: 'unless you come I will leave' },
            ],
          },
        ],
      },
      {
        id: 'b1-u3',
        title: 'Модальные глаголы',
        icon: '⚖️',
        lessons: [
          {
            id: 'b1-u3-l1',
            title: 'must, have to, should',
            duration: 15,
            theory: [
              { type: 'p', text: 'Три способа сказать «надо», и они не взаимозаменяемы. Разница — в источнике необходимости.' },
              {
                type: 'table',
                head: ['Глагол', 'Откуда необходимость', 'Пример'],
                rows: [
                  ['must', 'изнутри, я сам так решил', 'I must stop smoking.'],
                  ['have to', 'снаружи: правило, обстоятельства', 'I have to wear a uniform.'],
                  ['should', 'совет, не обязанность', 'You should see a doctor.'],
                ],
              },
              { type: 'p', text: 'Грамматически они ведут себя по-разному:' },
              {
                type: 'table',
                head: ['', 'must', 'have to'],
                rows: [
                  ['3-е лицо', 'must (без -s)', 'has to'],
                  ['Вопрос', 'Must I …?', 'Do I have to …?'],
                  ['Прошедшее', 'нет формы → had to', 'had to'],
                  ['Будущее', 'нет формы → will have to', 'will have to'],
                ],
              },
              { type: 'warn', text: 'У must нет прошедшего времени. «Вчера мне пришлось работать» — только «I had to work yesterday», никакого «musted».' },
              { type: 'tip', text: 'После всех трёх глагол идёт без to и без -s: must go, should go, но have TO go — здесь to часть самой конструкции.' },
              { type: 'dialog', lines: [
                ['A', 'I have to work this Saturday.', 'Мне придётся работать в эту субботу.'],
                ['B', 'Again? You should talk to your boss.', 'Опять? Тебе стоит поговорить с начальником.'],
                ['A', 'You are right. I must do it.', 'Ты прав. Надо это сделать.'],
              ] },
            ],
            vocab: ['must', 'have-to', 'should', 'job', 'problem', 'try', 'tell'],
            exercises: [
              { type: 'choice', prompt: 'Правило компании требует носить форму. Что скажешь?', options: ['I have to wear a uniform', 'I must to wear a uniform', 'I should wear a uniform', 'I have wear a uniform'], answer: 'I have to wear a uniform' },
              { type: 'choice', prompt: 'Даёшь дружеский совет. Что используешь?', options: ['should', 'must', 'have to', 'will'], answer: 'should' },
              { type: 'choice', prompt: 'Как сказать «Вчера мне пришлось работать»?', options: ['I had to work yesterday', 'I musted work yesterday', 'I must worked yesterday', 'I have to work yesterday'], answer: 'I had to work yesterday' },
              { type: 'choice', prompt: 'Вставь: «She ___ to go now»', options: ['has', 'have', 'must', 'should'], answer: 'has' },
              { type: 'order', prompt: 'Собери: «Тебе стоит сходить к врачу»', words: ['You', 'should', 'see', 'a', 'doctor'], answer: 'You should see a doctor' },
              { type: 'translate', prompt: 'Переведи: «Мне надо идти» (использовать must)', answer: 'I must go' },
            ],
          },
          {
            id: 'b1-u3-l2',
            title: 'mustn’t и don’t have to — не путать',
            duration: 15,
            theory: [
              { type: 'p', text: 'Это место, где ошибка меняет смысл на противоположный. В утверждении must и have to похожи, но в отрицании они расходятся полностью.' },
              { type: 'formula', text: 'mustn’t = нельзя, запрещено', note: 'You mustn’t smoke here. — Здесь курить нельзя.' },
              { type: 'formula', text: 'don’t have to = не обязательно, можно не', note: 'You don’t have to come. — Ты можешь не приходить.' },
              {
                type: 'table',
                head: ['Фраза', 'Смысл', 'Перевод'],
                rows: [
                  ['You mustn’t go.', 'запрет', 'Тебе нельзя идти.'],
                  ['You don’t have to go.', 'свобода выбора', 'Тебе не обязательно идти.'],
                  ['You mustn’t tell him.', 'ни в коем случае', 'Не смей ему говорить.'],
                  ['You don’t have to tell him.', 'как хочешь', 'Можешь ему не говорить.'],
                ],
              },
              { type: 'warn', text: 'Представьте, что вы сказали коллеге «You mustn’t come tomorrow», имея в виду «можешь не приходить». Он услышит «тебе запрещено приходить». Разница именно такого масштаба.' },
              { type: 'p', text: 'Для запретов есть и другие формулировки:' },
              {
                type: 'table',
                head: ['Фраза', 'Тон'],
                rows: [
                  ['You mustn’t park here.', 'строгий запрет'],
                  ['Parking is not allowed.', 'официально'],
                  ['You can’t park here.', 'разговорный'],
                ],
              },
              { type: 'tip', text: 'Проверка: если можно заменить на «не обязан» — нужно don’t have to. Если на «не смей» — mustn’t.' },
            ],
            vocab: ['must', 'have-to', 'allowed', 'should', 'forget', 'break', 'lose'],
            exercises: [
              { type: 'choice', prompt: 'Как сказать «Тебе не обязательно приходить»?', options: ['You don’t have to come', 'You mustn’t come', 'You shouldn’t come', 'You can’t come'], answer: 'You don’t have to come' },
              { type: 'choice', prompt: 'Как сказать «Здесь курить нельзя»?', options: ['You mustn’t smoke here', 'You don’t have to smoke here', 'You shouldn’t smoke here maybe', 'You needn’t smoke here'], answer: 'You mustn’t smoke here' },
              { type: 'choice', prompt: 'Что означает «You don’t have to pay»?', options: ['Платить не обязательно', 'Платить запрещено', 'Ты не можешь заплатить', 'Ты должен заплатить'], answer: 'Платить не обязательно' },
              { type: 'choice', prompt: 'Что означает «You mustn’t tell him»?', options: ['Не смей ему говорить', 'Можешь ему не говорить', 'Тебе стоит ему сказать', 'Ты не сможешь сказать'], answer: 'Не смей ему говорить' },
              { type: 'order', prompt: 'Собери: «Ты не обязан ждать»', words: ['You', 'don’t', 'have', 'to', 'wait'], answer: 'You don’t have to wait' },
            ],
          },
          {
            id: 'b1-u3-l3',
            title: 'may, might, could — вероятность',
            duration: 12,
            theory: [
              { type: 'p', text: 'Когда вы не уверены, английский предлагает целую шкалу — от «почти точно» до «вряд ли». Русское «наверное» покрывает всё это одним словом, поэтому шкалу стоит разобрать отдельно.' },
              {
                type: 'table',
                head: ['Глагол', 'Уверенность', 'Пример'],
                rows: [
                  ['must be', '~95%: почти точно', 'He must be at home. — Он наверняка дома.'],
                  ['may / might', '~50%: может быть', 'It may rain. — Может пойти дождь.'],
                  ['could', '~30%: в принципе возможно', 'It could be true. — Это может быть правдой.'],
                  ['can’t be', '~95%: точно нет', 'He can’t be at home. — Не может быть, что он дома.'],
                ],
              },
              { type: 'warn', text: 'Для отрицания вероятности берут can’t be, а не mustn’t be. «He mustn’t be at home» означало бы «ему запрещено быть дома» — совсем другой смысл.' },
              { type: 'p', text: 'may используется ещё и для вежливого разрешения:' },
              { type: 'formula', text: 'May I …? — официальное «можно мне»', note: 'May I come in? — Разрешите войти? (вежливее, чем Can I)' },
              { type: 'tip', text: 'might — чуть менее уверенно, чем may, но в живой речи их различают редко. Берите might, если сомневаетесь: он звучит естественнее.' },
            ],
            vocab: ['may', 'might', 'could', 'must', 'happen', 'reason', 'idea'],
            exercises: [
              { type: 'choice', prompt: 'Свет горит, машина у дома. Как сказать «Он наверняка дома»?', options: ['He must be at home', 'He may be at home', 'He could be at home', 'He can be at home'], answer: 'He must be at home' },
              { type: 'choice', prompt: 'Как сказать «Не может быть, что он дома»?', options: ['He can’t be at home', 'He mustn’t be at home', 'He may not be at home', 'He doesn’t must be at home'], answer: 'He can’t be at home' },
              { type: 'choice', prompt: 'Самый вежливый способ попросить разрешения войти', options: ['May I come in?', 'Can I come in?', 'I come in?', 'Must I come in?'], answer: 'May I come in?' },
              { type: 'order', prompt: 'Собери: «Возможно, позже пойдёт дождь»', words: ['It', 'might', 'rain', 'later'], answer: 'It might rain later' },
              { type: 'translate', prompt: 'Переведи: «Это может быть правдой» (use could, true)', answer: 'it could be true' },
            ],
          },
        ],
      },
      {
        id: 'b1-u4',
        title: 'Пассивный залог',
        icon: '🔄',
        lessons: [
          {
            id: 'b1-u4-l1',
            title: 'Действие важнее исполнителя',
            duration: 15,
            theory: [
              { type: 'p', text: 'В активном залоге важно, кто делает. В пассивном — что происходит с предметом. По-русски это «дом строят», «письмо отправлено» — исполнитель не назван и не важен.' },
              { type: 'formula', text: 'be + 3-я форма глагола', note: 'The house is built. — Дом построен.  |  The letter was sent. — Письмо отправлено.' },
              {
                type: 'table',
                head: ['Время', 'Актив', 'Пассив'],
                rows: [
                  ['Present Simple', 'They build houses.', 'Houses are built.'],
                  ['Past Simple', 'They built the house.', 'The house was built.'],
                  ['Future', 'They will build it.', 'It will be built.'],
                  ['Present Perfect', 'They have built it.', 'It has been built.'],
                ],
              },
              { type: 'p', text: 'Меняется только форма be — третья форма глагола остаётся неизменной всегда. Это и делает пассив простым: выучил be, знаешь весь пассив.' },
              { type: 'warn', text: 'Не путайте пассив с Present Perfect: «is broken» — состояние (окно разбито), «has broken» — действие (он разбил). Разные вспомогательные глаголы, разный смысл.' },
              { type: 'tip', text: 'Если нужно всё-таки назвать исполнителя, используется by: «The book was written by Orwell».' },
            ],
            vocab: ['built', 'sent', 'paid', 'found', 'made', 'done', 'build', 'send'],
            exercises: [
              { type: 'choice', prompt: 'Пассив от «They build houses»', options: ['Houses are built', 'Houses are build', 'Houses is built', 'Houses been built'], answer: 'Houses are built' },
              { type: 'choice', prompt: 'Выбери верное: «Дом был построен в 1900 году»', options: ['The house was built in 1900', 'The house was build in 1900', 'The house is built in 1900', 'The house were built in 1900'], answer: 'The house was built in 1900' },
              { type: 'choice', prompt: 'Вставь: «The letter ___ sent yesterday»', options: ['was', 'is', 'has', 'were'], answer: 'was' },
              { type: 'choice', prompt: 'Что означает «The window is broken»?', options: ['Окно разбито (состояние)', 'Он разбил окно', 'Окно разбивается сейчас', 'Окно разобьют'], answer: 'Окно разбито (состояние)' },
              { type: 'order', prompt: 'Собери: «Счёт оплачен»', words: ['The', 'bill', 'is', 'paid'], answer: 'The bill is paid' },
              { type: 'translate', prompt: 'Переведи: «Ключи были найдены» (the keys, find)', answer: 'the keys were found' },
            ],
          },
          {
            id: 'b1-u4-l2',
            title: 'Когда пассив уместен',
            duration: 12,
            theory: [
              { type: 'p', text: 'Пассив — не украшение, а инструмент. Он нужен в четырёх ситуациях, и в остальных его лучше не трогать.' },
              {
                type: 'table',
                head: ['Ситуация', 'Пример'],
                rows: [
                  ['исполнитель неизвестен', 'My bike was stolen.'],
                  ['исполнитель очевиден', 'He was arrested. (полицией, ясно)'],
                  ['исполнитель не важен', 'English is spoken here.'],
                  ['официальный стиль', 'Smoking is not allowed.'],
                ],
              },
              { type: 'p', text: 'Конструкция с by добавляется, только если исполнитель действительно несёт информацию:' },
              {
                type: 'table',
                head: ['Хорошо', 'Плохо'],
                rows: [
                  ['The book was written by Orwell.', 'The book was written by a writer.'],
                  ['The song was sung by my sister.', 'The bread was baked by a baker.'],
                ],
              },
              { type: 'warn', text: 'Русскоязычные часто злоупотребляют пассивом, потому что в русском безличные конструкции звучат солиднее. В английском наоборот: активный залог считается более сильным и ясным. «We made a decision» лучше, чем «A decision was made», если известно, кто решал.' },
              { type: 'tip', text: 'Объявления и инструкции почти целиком на пассиве: «Tickets must be shown», «Doors are closed automatically». Это тот случай, когда он абсолютно уместен.' },
            ],
            vocab: ['invent', 'allowed', 'spoken', 'taken', 'given', 'told', 'decision', 'change'],
            exercises: [
              { type: 'choice', prompt: 'Когда пассив уместен?', options: ['Когда неизвестно, кто сделал', 'Всегда, он звучит солиднее', 'Только в прошедшем времени', 'Когда предложение длинное'], answer: 'Когда неизвестно, кто сделал' },
              { type: 'choice', prompt: 'Какая фраза избыточна?', options: ['The bread was baked by a baker', 'The book was written by Orwell', 'My bike was stolen', 'English is spoken here'], answer: 'The bread was baked by a baker' },
              { type: 'choice', prompt: 'Выбери верное: «Здесь говорят по-английски»', options: ['English is spoken here', 'English speaks here', 'English is speak here', 'Here speaks English'], answer: 'English is spoken here' },
              { type: 'order', prompt: 'Собери: «Курить запрещено»', words: ['Smoking', 'is', 'not', 'allowed'], answer: 'Smoking is not allowed' },
              { type: 'translate', prompt: 'Переведи: «Телефон был изобретён Беллом» (the telephone, invent, Bell)', answer: 'the telephone was invented by Bell' },
            ],
          },
        ],
      },
      {
        id: 'b1-u5',
        title: 'Фразовые глаголы',
        icon: '🧩',
        lessons: [
          {
            id: 'b1-u5-l1',
            title: 'Как они устроены',
            duration: 15,
            theory: [
              { type: 'p', text: 'Фразовый глагол — это глагол плюс предлог или наречие, которые вместе означают совсем не то, что по отдельности. Их невозможно перевести по частям, зато без них английская речь звучит книжно.' },
              {
                type: 'table',
                head: ['Обычный глагол', 'Фразовый', 'Разница'],
                rows: [
                  ['continue', 'go on', 'книжно / разговорно'],
                  ['search', 'look for', 'формально / обычно'],
                  ['discover', 'find out', 'формально / обычно'],
                  ['abandon', 'give up', 'книжно / разговорно'],
                  ['tolerate', 'put up with', 'книжно / разговорно'],
                ],
              },
              { type: 'p', text: 'Главная техническая сложность — можно ли разделять глагол и предлог. Разделяемые пускают дополнение внутрь:' },
              { type: 'formula', text: 'Разделяемые: turn on the light = turn the light on', note: 'Но с местоимением — ТОЛЬКО внутрь: turn it on, никогда «turn on it».' },
              { type: 'formula', text: 'Неразделяемые: look for the keys', note: 'Нельзя «look the keys for». Местоимение тоже снаружи: look for them.' },
              { type: 'warn', text: 'Правило с местоимениями жёсткое: «Turn on it» — ошибка, «Turn it on» — верно. Если дополнение это it, them, him — оно всегда встаёт между частями разделяемого глагола.' },
              { type: 'tip', text: 'Разделяемость не выводится логикой, её запоминают вместе с глаголом. Хорошая новость: самых частых фразовых глаголов около сорока, и они покрывают почти всю бытовую речь.' },
            ],
            vocab: ['turn-on', 'turn-off', 'look-for', 'find-out', 'go-on', 'give-up'],
            exercises: [
              { type: 'choice', prompt: 'Что верно с местоимением?', options: ['Turn it on', 'Turn on it', 'Turn on him', 'It turn on'], answer: 'Turn it on' },
              { type: 'choice', prompt: 'Что означает «find out»?', options: ['выяснить', 'найти снаружи', 'выйти', 'потерять'], answer: 'выяснить' },
              { type: 'choice', prompt: 'Что означает «give up»?', options: ['бросить, сдаться', 'отдать наверх', 'подарить', 'поднять'], answer: 'бросить, сдаться' },
              { type: 'order', prompt: 'Собери: «Я ищу свои ключи»', words: ['I', 'am', 'looking', 'for', 'my', 'keys'], answer: 'I am looking for my keys' },
              { type: 'translate', prompt: 'Переведи: «Выключи телевизор» (turn off, the TV)', answer: 'turn off the TV' },
            ],
          },
          {
            id: 'b1-u5-l2',
            title: 'Самые нужные в быту',
            duration: 15,
            theory: [
              { type: 'p', text: 'Эти двенадцать закрывают большую часть повседневных ситуаций. Их стоит довести до автоматизма.' },
              {
                type: 'table',
                head: ['Глагол', 'Значение', 'Пример'],
                rows: [
                  ['get up', 'вставать с постели', 'I get up at seven.'],
                  ['put on', 'надевать', 'Put on your coat.'],
                  ['take off', 'снимать; взлетать', 'Take off your shoes.'],
                  ['turn on / off', 'включать / выключать', 'Turn off the light.'],
                  ['look for', 'искать', 'I’m looking for a job.'],
                  ['look after', 'заботиться', 'She looks after her son.'],
                  ['find out', 'выяснить', 'I found out the truth.'],
                  ['give up', 'бросить, сдаться', 'Don’t give up!'],
                  ['come back', 'возвращаться', 'Come back soon.'],
                  ['pick up', 'забрать, подобрать', 'I’ll pick you up at eight.'],
                  ['go on', 'продолжаться', 'Go on, I’m listening.'],
                  ['run out of', 'закончиться (о запасе)', 'We ran out of milk.'],
                ],
              },
              { type: 'warn', text: 'look for, look after и look at — три разных глагола, отличающихся одним предлогом: искать, заботиться и смотреть на. Предлог здесь несёт весь смысл.' },
              { type: 'tip', text: 'Учите их не списком, а фразами целиком: «pick you up at eight», «run out of milk». Так предлог не потеряется.' },
              { type: 'dialog', lines: [
                ['A', 'What time do you get up?', 'Во сколько ты встаёшь?'],
                ['B', 'At seven. Can you pick me up at eight?', 'В семь. Заберёшь меня в восемь?'],
                ['A', 'Sure. Don’t forget to turn off the lights.', 'Конечно. Не забудь выключить свет.'],
                ['B', 'And we’ve run out of coffee.', 'И у нас кончился кофе.'],
              ] },
            ],
            vocab: ['get-up', 'put-on', 'take-off', 'look-after', 'come-back', 'pick-up'],
            exercises: [
              { type: 'choice', prompt: 'Что означает «look after»?', options: ['заботиться', 'искать', 'смотреть назад', 'выглядеть'], answer: 'заботиться' },
              { type: 'choice', prompt: 'Что означает «pick up» в «I’ll pick you up at eight»?', options: ['заеду за тобой', 'подниму тебя', 'выберу тебя', 'позвоню тебе'], answer: 'заеду за тобой' },
              { type: 'choice', prompt: 'Как сказать «У нас кончилось молоко»?', options: ['We ran out of milk', 'We run milk out', 'We finished milk out', 'Milk ran us out'], answer: 'We ran out of milk' },
              { type: 'choice', prompt: 'Какой предлог означает «искать»?', options: ['look for', 'look after', 'look at', 'look up'], answer: 'look for' },
              { type: 'order', prompt: 'Собери: «Во сколько ты встаёшь?»', words: ['What', 'time', 'do', 'you', 'get', 'up'], answer: 'What time do you get up' },
              { type: 'translate', prompt: 'Переведи: «Надень пальто» (put on, your coat)', answer: 'put on your coat' },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'b2',
    code: 'B2',
    title: 'Upper-Intermediate',
    subtitle: 'Уверенная речь, сложные конструкции',
    goal: 'Аргументировать позицию, понимать фильмы и подкасты без субтитров.',
    units: [
      {
        id: 'b2-u1',
        title: 'Perfect Continuous и Past Perfect',
        icon: '🔗',
        lessons: [
          {
            id: 'b2-u1-l1',
            title: 'Present Perfect Continuous',
            duration: 15,
            theory: [
              { type: 'p', text: 'Это время подчёркивает не результат, а сам процесс, который начался в прошлом и всё ещё идёт — или только что закончился, оставив следы.' },
              { type: 'formula', text: 'have / has been + глагол + -ing', note: 'I have been working since morning. — Я работаю с утра (и всё ещё работаю).' },
              {
                type: 'table',
                head: ['Present Perfect', 'Present Perfect Continuous'],
                rows: [
                  ['важен результат', 'важен процесс и его длительность'],
                  ['I have written three letters.', 'I have been writing letters all day.'],
                  ['Я написал три письма (готово).', 'Я весь день пишу письма (процесс).'],
                  ['She has read the book.', 'She has been reading the book.'],
                  ['Прочла (закончила).', 'Читает (ещё не закончила).'],
                ],
              },
              { type: 'p', text: 'Часто это время объясняет видимое следствие:' },
              {
                type: 'table',
                head: ['Наблюдение', 'Объяснение'],
                rows: [
                  ['Your eyes are red.', 'Have you been crying?'],
                  ['He is out of breath.', 'He has been running.'],
                  ['The ground is wet.', 'It has been raining.'],
                ],
              },
              { type: 'warn', text: 'Глаголы состояния (know, love, want, understand, believe) в Continuous не идут. «I have been knowing him for years» — ошибка, нужно «I have known him for years».' },
              { type: 'tip', text: 'С for и since работают оба времени, но Continuous звучит естественнее, когда речь о длительном занятии: «I’ve been learning English for two years».' },
            ],
            vocab: ['for-period', 'since', 'wait', 'run', 'learn', 'feel', 'hear', 'keep'],
            exercises: [
              { type: 'choice', prompt: 'Выбери верное: «Я работаю с утра» (и всё ещё работаю)', options: ['I have been working since morning', 'I have worked since morning ago', 'I am working since morning', 'I work since morning'], answer: 'I have been working since morning' },
              { type: 'choice', prompt: 'Земля мокрая. Что скажешь?', options: ['It has been raining', 'It has rained three times', 'It is rain', 'It rains'], answer: 'It has been raining' },
              { type: 'choice', prompt: 'Какой вариант невозможен?', options: ['I have been knowing him', 'I have known him', 'I have been working', 'I have worked'], answer: 'I have been knowing him' },
              { type: 'choice', prompt: 'Что подчёркивает Perfect Continuous?', options: ['процесс и длительность', 'точный результат', 'будущее действие', 'привычку'], answer: 'процесс и длительность' },
              { type: 'order', prompt: 'Собери: «Он бегал»', words: ['He', 'has', 'been', 'running'], answer: 'He has been running' },
              { type: 'translate', prompt: 'Переведи: «Я учу английский два года» (learn English, for two years)', answer: 'I have been learning English for two years' },
            ],
          },
          {
            id: 'b2-u1-l2',
            title: 'Past Perfect — прошлое до прошлого',
            duration: 15,
            theory: [
              { type: 'p', text: 'Когда в рассказе два прошедших события, Past Perfect показывает, какое из них случилось раньше. В русском мы обходимся словами «уже», «до этого» — в английском для этого есть отдельное время.' },
              { type: 'formula', text: 'had + 3-я форма глагола', note: 'When I arrived, she had already left. — Когда я приехал, она уже ушла.' },
              {
                type: 'table',
                head: ['Что было раньше', 'Что было потом'],
                rows: [
                  ['She had left', 'when I arrived.'],
                  ['I had finished work', 'before he called.'],
                  ['They had eaten', 'by the time we came.'],
                ],
              },
              { type: 'warn', text: 'Без Past Perfect смысл меняется. «When I arrived, she left» — она ушла ПОСЛЕ моего приезда. «When I arrived, she had left» — ушла ДО. Одно слово had переворачивает картину.' },
              { type: 'p', text: 'Форма had одна для всех лиц — это самое простое время в английском по образованию:' },
              { type: 'formula', text: 'I had · you had · he had · we had · they had', note: 'Отрицание: hadn’t.  Вопрос: Had you …?' },
              { type: 'tip', text: 'Past Perfect не нужен, если порядок событий и так ясен по словам before или after: «I ate before he came» — уже понятно, что раньше.' },
            ],
            vocab: ['left-v3', 'brought', 'understood', 'begun', 'already', 'before', 'after', 'arrive'],
            exercises: [
              { type: 'choice', prompt: 'Выбери верное: «Когда я приехал, она уже ушла»', options: ['When I arrived, she had left', 'When I arrived, she has left', 'When I arrived, she left already', 'When I had arrived, she left'], answer: 'When I arrived, she had left' },
              { type: 'choice', prompt: 'Что означает «When I arrived, she left»?', options: ['Она ушла после моего приезда', 'Она ушла до моего приезда', 'Она уходила долго', 'Она собиралась уйти'], answer: 'Она ушла после моего приезда' },
              { type: 'choice', prompt: 'Как образуется Past Perfect?', options: ['had + 3-я форма', 'have + 3-я форма', 'was + 3-я форма', 'did + 3-я форма'], answer: 'had + 3-я форма' },
              { type: 'order', prompt: 'Собери: «Я закончил работу до того, как он позвонил»', words: ['I', 'had', 'finished', 'work', 'before', 'he', 'called'], answer: 'I had finished work before he called' },
              { type: 'translate', prompt: 'Переведи: «Он уже поел» (eat, already, Past Perfect)', answer: 'he had already eaten' },
            ],
          },
          {
            id: 'b2-u1-l3',
            title: 'Какое время выбрать',
            duration: 15,
            theory: [
              { type: 'p', text: 'К уровню B2 в вашем распоряжении шесть прошедших и настоящих времён. Свести их в одну таблицу — самый быстрый способ перестать путаться.' },
              {
                type: 'table',
                head: ['Время', 'Когда', 'Пример'],
                rows: [
                  ['Present Simple', 'вообще, регулярно', 'I work here.'],
                  ['Present Continuous', 'сейчас, в этот момент', 'I am working now.'],
                  ['Past Simple', 'факт в прошлом с точным временем', 'I worked here in 2020.'],
                  ['Present Perfect', 'прошлое с результатом сейчас', 'I have worked here for years.'],
                  ['Present Perfect Cont.', 'процесс, идущий до сих пор', 'I have been working since nine.'],
                  ['Past Perfect', 'раньше другого прошлого', 'I had worked there before I moved.'],
                ],
              },
              { type: 'p', text: 'Три вопроса, которые почти всегда дают верный ответ:' },
              { type: 'formula', text: '1. Есть точное время в прошлом? → Past Simple', note: 'yesterday, in 2020, two days ago' },
              { type: 'formula', text: '2. Важен результат сейчас? → Present Perfect', note: 'I have lost my keys.' },
              { type: 'formula', text: '3. Было раньше другого прошлого? → Past Perfect', note: 'She had left when I came.' },
              { type: 'warn', text: 'Самая устойчивая ошибка русскоязычных остаётся прежней: Present Perfect с точным временем. «I have seen him yesterday» неверно на любом уровне.' },
              { type: 'dialog', lines: [
                ['A', 'How long have you been waiting?', 'Сколько ты уже ждёшь?'],
                ['B', 'About an hour. The train had already left when I got here.', 'Около часа. Поезд уже ушёл, когда я приехал.'],
                ['A', 'I called you twice yesterday.', 'Я звонил тебе вчера дважды.'],
                ['B', 'Sorry, I was working.', 'Извини, я работал.'],
              ] },
            ],
            vocab: ['leave', 'begin', 'become', 'realize', 'probably', 'actually', 'however'],
            exercises: [
              { type: 'choice', prompt: 'Вставь: «I ___ him yesterday»', options: ['saw', 'have seen', 'had seen', 'have been seeing'], answer: 'saw' },
              { type: 'choice', prompt: 'Вставь: «She ___ here since 2020»', options: ['has worked', 'worked', 'works', 'had worked'], answer: 'has worked' },
              { type: 'choice', prompt: 'Вставь: «The film ___ when we arrived»', options: ['had started', 'has started', 'started', 'starts'], answer: 'had started' },
              { type: 'choice', prompt: 'Какое время нужно при точном времени в прошлом?', options: ['Past Simple', 'Present Perfect', 'Past Perfect', 'Present Perfect Continuous'], answer: 'Past Simple' },
              { type: 'order', prompt: 'Собери: «Сколько ты уже ждёшь?»', words: ['How', 'long', 'have', 'you', 'been', 'waiting'], answer: 'How long have you been waiting' },
            ],
          },
        ],
      },
      {
        id: 'b2-u2',
        title: 'Условные 2 и 3 типа',
        icon: '🌀',
        lessons: [
          {
            id: 'b2-u2-l1',
            title: 'Второй тип: нереальное настоящее',
            duration: 15,
            theory: [
              { type: 'p', text: 'Первый тип говорил о реальном будущем. Второй — о том, чего нет: фантазии, мечты, гипотезы. По-русски это «если бы… то бы».' },
              { type: 'formula', text: 'If + Past Simple, would + глагол', note: 'If I had money, I would buy a house. — Если бы у меня были деньги, я бы купил дом.' },
              { type: 'warn', text: 'Прошедшее время здесь не про прошлое. «If I had money» означает «сейчас у меня их нет». Форма прошедшая, смысл — настоящий и нереальный. Это сбивает с толку, но правило именно такое.' },
              {
                type: 'table',
                head: ['Реальность', '1-й тип', '2-й тип'],
                rows: [
                  ['может случиться', 'If I have time, I will come.', '—'],
                  ['вряд ли, фантазия', '—', 'If I had time, I would come.'],
                  ['перевод', 'Если будет время, приду.', 'Если бы было время, пришёл бы.'],
                ],
              },
              { type: 'p', text: 'С глаголом to be во втором типе для всех лиц используется were — в том числе с I:' },
              { type: 'formula', text: 'If I were you, I would…', note: 'На твоём месте я бы… — самая частая фраза для совета.' },
              { type: 'tip', text: '«If I was you» тоже встречается в разговоре, но «If I were you» — стандарт, и в письме нужен именно он.' },
            ],
            vocab: ['would', 'if', 'were', 'money', 'buy', 'rather', 'suggest'],
            exercises: [
              { type: 'choice', prompt: 'Выбери верное: «Если бы у меня были деньги, я бы купил дом»', options: ['If I had money, I would buy a house', 'If I have money, I would buy a house', 'If I had money, I will buy a house', 'If I would have money, I would buy a house'], answer: 'If I had money, I would buy a house' },
              { type: 'choice', prompt: 'Как правильно дать совет?', options: ['If I were you, I would wait', 'If I am you, I will wait', 'If I would be you, I wait', 'If I were you, I will wait'], answer: 'If I were you, I would wait' },
              { type: 'choice', prompt: 'Что означает «If I had a car»?', options: ['Сейчас у меня нет машины', 'У меня была машина', 'У меня будет машина', 'Я купил машину'], answer: 'Сейчас у меня нет машины' },
              { type: 'order', prompt: 'Собери: «Если бы я знал, я бы сказал тебе»', words: ['If', 'I', 'knew', 'I', 'would', 'tell', 'you'], answer: 'If I knew I would tell you' },
              { type: 'translate', prompt: 'Переведи: «На твоём месте я бы остался» (stay)', answer: 'if I were you I would stay' },
            ],
          },
          {
            id: 'b2-u2-l2',
            title: 'Третий тип: упущенное прошлое',
            duration: 18,
            theory: [
              { type: 'p', text: 'Третий тип — о том, что уже не изменить. Это сожаление, упрёк или разбор того, как могло бы сложиться.' },
              { type: 'formula', text: 'If + Past Perfect, would have + 3-я форма', note: 'If I had known, I would have come. — Если бы я знал, я бы пришёл.' },
              {
                type: 'table',
                head: ['Что было на самом деле', 'Третий тип'],
                rows: [
                  ['Я не знал, поэтому не пришёл.', 'If I had known, I would have come.'],
                  ['Он опоздал и не успел.', 'If he had hurried, he would have made it.'],
                  ['Мы не взяли зонт и промокли.', 'If we had taken an umbrella, we wouldn’t have got wet.'],
                ],
              },
              { type: 'warn', text: 'Конструкция громоздкая, и её легко перепутать со вторым типом. Разница проста: второй тип — про сейчас, третий — про прошлое, которое уже не переиграть.' },
              {
                type: 'table',
                head: ['Тип', 'Условие', 'Результат', 'Про что'],
                rows: [
                  ['1', 'If I have time', 'I will come', 'реальное будущее'],
                  ['2', 'If I had time', 'I would come', 'нереальное настоящее'],
                  ['3', 'If I had had time', 'I would have come', 'упущенное прошлое'],
                ],
              },
              { type: 'p', text: 'Бывает и смешанный тип: условие в прошлом, а следствие в настоящем.' },
              { type: 'formula', text: 'If + Past Perfect, would + глагол', note: 'If I had studied medicine, I would be a doctor now. — Если бы я выучился на врача, сейчас был бы врачом.' },
              { type: 'tip', text: 'В речи would have часто звучит как «would’ve» /ˈwʊdəv/. На слух это похоже на «would of» — так иногда и пишут по ошибке даже носители. Правильно только would have.' },
            ],
            vocab: ['would', 'known', 'come', 'taken', 'happen', 'admit', 'explain'],
            exercises: [
              { type: 'choice', prompt: 'Выбери верное: «Если бы я знал, я бы пришёл»', options: ['If I had known, I would have come', 'If I knew, I would have come', 'If I had known, I would come', 'If I would know, I would come'], answer: 'If I had known, I would have come' },
              { type: 'choice', prompt: 'Третий тип описывает…', options: ['упущенное в прошлом', 'реальное будущее', 'привычку', 'процесс сейчас'], answer: 'упущенное в прошлом' },
              { type: 'choice', prompt: 'Что верно?', options: ['would have done', 'would of done', 'would has done', 'would had done'], answer: 'would have done' },
              { type: 'choice', prompt: 'Вставь: «If he ___ harder, he would have passed»', options: ['had studied', 'studied', 'has studied', 'would study'], answer: 'had studied' },
              { type: 'order', prompt: 'Собери: «Если бы мы вышли раньше, мы бы не опоздали»', words: ['If', 'we', 'had', 'left', 'earlier', 'we', 'would', 'not', 'have', 'been', 'late'], answer: 'If we had left earlier we would not have been late' },
            ],
          },
          {
            id: 'b2-u2-l3',
            title: 'I wish — сожаления',
            duration: 15,
            theory: [
              { type: 'p', text: 'Конструкция с wish выражает сожаление о том, что есть или чего не случилось. Она работает по той же логике сдвига времени назад, что и условные предложения.' },
              {
                type: 'table',
                head: ['О чём сожалеем', 'Конструкция', 'Пример'],
                rows: [
                  ['о настоящем', 'wish + Past Simple', 'I wish I knew. — Жаль, что я не знаю.'],
                  ['о прошлом', 'wish + Past Perfect', 'I wish I had known. — Жаль, что я не знал.'],
                  ['о чужом поведении', 'wish + would', 'I wish he would stop. — Хоть бы он перестал.'],
                ],
              },
              { type: 'warn', text: 'Русский и английский тут зеркальны. «Жаль, что я НЕ знаю» по-английски будет утвердительным: «I wish I knew». Отрицание переходит в само слово wish, и добавлять второе не нужно.' },
              {
                type: 'table',
                head: ['Русский', 'Английский'],
                rows: [
                  ['Жаль, что я не знаю.', 'I wish I knew.'],
                  ['Жаль, что он здесь.', 'I wish he weren’t here.'],
                  ['Жаль, что я это сказал.', 'I wish I hadn’t said that.'],
                  ['Жаль, что у меня нет времени.', 'I wish I had time.'],
                ],
              },
              { type: 'tip', text: 'После wish в формальной речи для всех лиц берут were: «I wish I were taller». В разговоре допустимо was.' },
            ],
            vocab: ['wish', 'would', 'rather', 'otherwise', 'instead', 'refuse', 'complain'],
            exercises: [
              { type: 'choice', prompt: 'Как сказать «Жаль, что я не знаю»?', options: ['I wish I knew', 'I wish I don’t know', 'I wish I didn’t know', 'I wish I know'], answer: 'I wish I knew' },
              { type: 'choice', prompt: 'Как сказать «Жаль, что я это сказал»?', options: ['I wish I hadn’t said that', 'I wish I didn’t say that', 'I wish I don’t say that', 'I wish I haven’t said that'], answer: 'I wish I hadn’t said that' },
              { type: 'choice', prompt: 'Что означает «I wish I had time»?', options: ['У меня нет времени, и жаль', 'У меня есть время', 'У меня было время', 'Я найду время'], answer: 'У меня нет времени, и жаль' },
              { type: 'order', prompt: 'Собери: «Хоть бы он перестал»', words: ['I', 'wish', 'he', 'would', 'stop'], answer: 'I wish he would stop' },
              { type: 'translate', prompt: 'Переведи: «Жаль, что я не выше» (использовать wish, taller)', answer: 'I wish I were taller' },
            ],
          },
        ],
      },
      {
        id: 'b2-u3',
        title: 'Косвенная речь',
        icon: '💬',
        lessons: [
          {
            id: 'b2-u3-l1',
            title: 'Согласование времён',
            duration: 18,
            theory: [
              { type: 'p', text: 'Когда мы пересказываем чужие слова, время в английском сдвигается на шаг назад. В русском ничего подобного нет: мы говорим «Он сказал, что работает», сохраняя настоящее.' },
              { type: 'formula', text: 'Прямая: He said, "I am tired."', note: 'Косвенная: He said (that) he was tired.' },
              {
                type: 'table',
                head: ['Прямая речь', 'Косвенная речь'],
                rows: [
                  ['Present Simple (works)', 'Past Simple (worked)'],
                  ['Present Continuous (is working)', 'Past Continuous (was working)'],
                  ['Past Simple (worked)', 'Past Perfect (had worked)'],
                  ['Present Perfect (has worked)', 'Past Perfect (had worked)'],
                  ['will', 'would'],
                  ['can', 'could'],
                  ['must', 'had to'],
                ],
              },
              { type: 'warn', text: 'Русскоязычные почти всегда забывают сдвиг: «He said he is tired» вместо «He said he was tired». Ошибка не мешает пониманию, но выдаёт уровень мгновенно.' },
              { type: 'p', text: 'Вместе со временем меняются слова, привязанные к говорящему и моменту речи:' },
              {
                type: 'table',
                head: ['Было', 'Стало'],
                rows: [
                  ['I → he / she', 'my → his / her'],
                  ['here', 'there'],
                  ['now', 'then'],
                  ['today', 'that day'],
                  ['tomorrow', 'the next day'],
                  ['yesterday', 'the day before'],
                  ['this', 'that'],
                ],
              },
              { type: 'tip', text: 'Сдвиг не нужен, если сказанное остаётся верным всегда: «He said the Earth is round» — факт не устарел, прошедшее здесь необязательно.' },
            ],
            vocab: ['said', 'told', 'ask', 'explain', 'promise', 'understood', 'admit'],
            exercises: [
              { type: 'choice', prompt: 'Переведи в косвенную: He said, "I am tired."', options: ['He said he was tired', 'He said he is tired', 'He said he had been tired', 'He said I was tired'], answer: 'He said he was tired' },
              { type: 'choice', prompt: 'Во что превращается «will» в косвенной речи?', options: ['would', 'will', 'was', 'had'], answer: 'would' },
              { type: 'choice', prompt: 'Во что превращается Past Simple?', options: ['Past Perfect', 'Present Perfect', 'Past Simple', 'Present Simple'], answer: 'Past Perfect' },
              { type: 'choice', prompt: 'Во что превращается «tomorrow»?', options: ['the next day', 'that day', 'the day before', 'then'], answer: 'the next day' },
              { type: 'order', prompt: 'Собери: «Она сказала, что работает здесь»', words: ['She', 'said', 'she', 'worked', 'there'], answer: 'She said she worked there' },
            ],
          },
          {
            id: 'b2-u3-l2',
            title: 'Вопросы и просьбы в пересказе',
            duration: 15,
            theory: [
              { type: 'p', text: 'При пересказе вопрос перестаёт быть вопросом: исчезает вспомогательный do, а порядок слов становится как в утверждении.' },
              { type: 'formula', text: 'Вопрос со словом: asked + вопросительное слово + подлежащее + глагол', note: 'Прямая: "Where do you live?" → Косвенная: He asked where I lived.' },
              { type: 'formula', text: 'Общий вопрос: asked if / whether …', note: 'Прямая: "Are you ready?" → Косвенная: He asked if I was ready.' },
              { type: 'warn', text: 'Главная ошибка — сохранить вопросительный порядок: «He asked where did I live» неверно. Правильно: «He asked where I lived». Никакого did, подлежащее перед глаголом.' },
              {
                type: 'table',
                head: ['Прямая речь', 'Косвенная речь'],
                rows: [
                  ['"What is your name?"', 'She asked what my name was.'],
                  ['"Do you speak English?"', 'She asked if I spoke English.'],
                  ['"Can you help?"', 'She asked if I could help.'],
                  ['"Close the door."', 'She told me to close the door.'],
                  ['"Don’t be late."', 'She told me not to be late.'],
                ],
              },
              { type: 'p', text: 'Просьбы и команды передаются инфинитивом с to — время не сдвигается вовсе:' },
              { type: 'formula', text: 'told / asked + кого + to + глагол', note: 'Отрицание: told me NOT to go.' },
              { type: 'tip', text: 'say и tell различаются дополнением: say something (to somebody), но tell somebody something. «He told that…» — ошибка, нужно «He said that…» или «He told me that…».' },
              { type: 'dialog', lines: [
                ['A', 'What did she say?', 'Что она сказала?'],
                ['B', 'She asked if you were coming.', 'Она спросила, придёшь ли ты.'],
                ['A', 'And what did you tell her?', 'А ты что ответил?'],
                ['B', 'I told her not to wait.', 'Я сказал ей не ждать.'],
              ] },
            ],
            vocab: ['whether', 'ask', 'told', 'said', 'refuse', 'suggest', 'complain'],
            exercises: [
              { type: 'choice', prompt: 'Переведи в косвенную: "Where do you live?"', options: ['He asked where I lived', 'He asked where did I live', 'He asked where do I live', 'He asked where I did live'], answer: 'He asked where I lived' },
              { type: 'choice', prompt: 'Переведи в косвенную: "Are you ready?"', options: ['He asked if I was ready', 'He asked was I ready', 'He asked am I ready', 'He asked if was I ready'], answer: 'He asked if I was ready' },
              { type: 'choice', prompt: 'Переведи в косвенную: "Close the door."', options: ['She told me to close the door', 'She told me close the door', 'She said me to close the door', 'She told to close the door'], answer: 'She told me to close the door' },
              { type: 'choice', prompt: 'Что верно?', options: ['He told me that…', 'He told that…', 'He said me that…', 'He asked me that…'], answer: 'He told me that…' },
              { type: 'order', prompt: 'Собери: «Она сказала мне не ждать»', words: ['She', 'told', 'me', 'not', 'to', 'wait'], answer: 'She told me not to wait' },
            ],
          },
        ],
      },
      {
        id: 'b2-u4',
        title: 'Идиомы и коллокации',
        icon: '🎭',
        lessons: [
          {
            id: 'b2-u4-l1',
            title: 'Слова, которые дружат',
            duration: 15,
            theory: [
              { type: 'p', text: 'Коллокация — устойчивое сочетание слов. Грамматически можно сказать «do a decision», и вас поймут, но носитель так никогда не скажет. Именно коллокации отличают беглую речь от правильной, но чужой.' },
              { type: 'p', text: 'Самая частая пара, на которой спотыкаются, — make и do:' },
              {
                type: 'table',
                head: ['make (создавать)', 'do (выполнять)'],
                rows: [
                  ['make a decision', 'do homework'],
                  ['make a mistake', 'do the washing'],
                  ['make money', 'do business'],
                  ['make a plan', 'do a favour'],
                  ['make friends', 'do your best'],
                  ['make sense', 'do research'],
                ],
              },
              { type: 'warn', text: 'В русском и то и другое — «делать»: делать ошибку, делать домашнее задание. Поэтому пары make/do приходится запоминать отдельно, логика тут почти не помогает.' },
              { type: 'p', text: 'Прилагательные тоже выбирают себе существительные:' },
              {
                type: 'table',
                head: ['Правильно', 'Неправильно', 'По-русски'],
                rows: [
                  ['heavy rain', 'strong rain', 'сильный дождь'],
                  ['strong coffee', 'heavy coffee', 'крепкий кофе'],
                  ['heavy traffic', 'big traffic', 'плотное движение'],
                  ['fast food', 'quick food', 'фастфуд'],
                  ['high price', 'big price', 'высокая цена'],
                ],
              },
              { type: 'tip', text: 'Учите коллокации целыми блоками, а не отдельными словами. «Make a decision» запоминается как одно слово — и тогда ошибиться просто негде.' },
            ],
            vocab: ['make-a-decision', 'do-homework', 'take-a-photo', 'pay-attention', 'make-sense', 'heavy-rain', 'strong-coffee'],
            exercises: [
              { type: 'choice', prompt: 'Как правильно «принять решение»?', options: ['make a decision', 'do a decision', 'take a decision now', 'give a decision'], answer: 'make a decision' },
              { type: 'choice', prompt: 'Как правильно «делать домашнее задание»?', options: ['do homework', 'make homework', 'take homework', 'give homework'], answer: 'do homework' },
              { type: 'choice', prompt: 'Как правильно «сильный дождь»?', options: ['heavy rain', 'strong rain', 'big rain', 'hard rain'], answer: 'heavy rain' },
              { type: 'choice', prompt: 'Как правильно «крепкий кофе»?', options: ['strong coffee', 'heavy coffee', 'hard coffee', 'thick coffee'], answer: 'strong coffee' },
              { type: 'choice', prompt: 'Как правильно «сделать фото»?', options: ['take a photo', 'make a photo', 'do a photo', 'give a photo'], answer: 'take a photo' },
              { type: 'order', prompt: 'Собери: «Это имеет смысл»', words: ['That', 'makes', 'sense'], answer: 'That makes sense' },
            ],
          },
          {
            id: 'b2-u4-l2',
            title: 'Идиомы в живой речи',
            duration: 15,
            theory: [
              { type: 'p', text: 'Идиома — выражение, смысл которого не складывается из значений слов. Их не нужно много: десятка частых хватает, чтобы понимать разговорную речь и не выглядеть учебником.' },
              {
                type: 'table',
                head: ['Идиома', 'Значение', 'Дословно'],
                rows: [
                  ['a piece of cake', 'проще простого', 'кусок торта'],
                  ['under the weather', 'нездоровится', 'под погодой'],
                  ['once in a while', 'время от времени', 'однажды за время'],
                  ['break the ice', 'разрядить обстановку', 'разбить лёд'],
                  ['cost an arm and a leg', 'стоить целое состояние', 'стоить руку и ногу'],
                  ['on the same page', 'понимать друг друга', 'на одной странице'],
                  ['hit the books', 'засесть за учёбу', 'бить книги'],
                  ['call it a day', 'закончить на сегодня', 'назвать это днём'],
                ],
              },
              { type: 'warn', text: 'Идиомы нельзя менять. «A piece of pie» или «under the rain» — уже не идиомы, а бессмыслица. Либо целиком, либо никак.' },
              { type: 'p', text: 'Есть и ложные друзья — русские выражения, которые дословно не переводятся:' },
              {
                type: 'table',
                head: ['Русский', 'Дословно (неверно)', 'Правильно'],
                rows: [
                  ['Как дела?', 'How are your deals?', 'How are you?'],
                  ['Мне всё равно.', 'To me all equal.', 'I don’t mind. / I don’t care.'],
                  ['Давай!', 'Give!', 'Come on! / Go ahead!'],
                  ['Ни пуха ни пера.', '—', 'Good luck! / Break a leg!'],
                ],
              },
              { type: 'tip', text: 'Не вставляйте идиомы через силу — одна к месту работает лучше, чем три подряд. И осторожнее с устаревшими: «It’s raining cats and dogs» носители почти не говорят.' },
              { type: 'dialog', lines: [
                ['A', 'How was the exam?', 'Как экзамен?'],
                ['B', 'A piece of cake. I had hit the books all week.', 'Проще простого. Я всю неделю сидел за учебниками.'],
                ['A', 'Nice. Let’s call it a day then.', 'Отлично. Тогда на сегодня закончим.'],
                ['B', 'Sure. I’m a bit under the weather anyway.', 'Давай. Мне всё равно нездоровится.'],
              ] },
            ],
            vocab: ['piece-of-cake', 'under-the-weather', 'once-in-a-while', 'break-the-ice', 'cost-an-arm-and-a-leg', 'on-the-same-page'],
            exercises: [
              { type: 'choice', prompt: 'Что означает «a piece of cake»?', options: ['проще простого', 'кусок торта', 'вкусно', 'мало'], answer: 'проще простого' },
              { type: 'choice', prompt: 'Что означает «under the weather»?', options: ['нездоровится', 'на улице плохая погода', 'грустно от дождя', 'холодно'], answer: 'нездоровится' },
              { type: 'choice', prompt: 'Что означает «cost an arm and a leg»?', options: ['стоить целое состояние', 'быть опасным', 'требовать усилий', 'стоить дёшево'], answer: 'стоить целое состояние' },
              { type: 'choice', prompt: 'Как правильно спросить «Как дела?»', options: ['How are you?', 'How are your deals?', 'How is your business?', 'What are your things?'], answer: 'How are you?' },
              { type: 'choice', prompt: 'Что означает «on the same page»?', options: ['понимать друг друга', 'читать одну книгу', 'быть рядом', 'соглашаться формально'], answer: 'понимать друг друга' },
              { type: 'order', prompt: 'Собери: «Давай на сегодня закончим»', words: ['Let’s', 'call', 'it', 'a', 'day'], answer: 'Let’s call it a day' },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'c1',
    code: 'C1',
    title: 'Advanced',
    subtitle: 'Нюансы, стиль, академический язык',
    goal: 'Говорить точно и естественно, писать эссе и деловые письма.',
    units: [
      {
        id: 'c1-u1',
        title: 'Инверсия и эмфаза',
        icon: '🔝',
        lessons: [
          {
            id: 'c1-u1-l1',
            title: 'Инверсия после отрицательных наречий',
            duration: 18,
            theory: [
              { type: 'p', text: 'Обычный порядок в английском жёсткий: подлежащее, потом сказуемое. Но если предложение начинается с отрицательного или ограничительного наречия, порядок переворачивается — как в вопросе. Это и есть инверсия.' },
              { type: 'formula', text: 'Наречие + вспомогательный глагол + подлежащее + смысловой глагол', note: 'Never have I seen such a thing. — Никогда я не видел ничего подобного.' },
              {
                type: 'table',
                head: ['Обычный порядок', 'С инверсией'],
                rows: [
                  ['I have never seen it.', 'Never have I seen it.'],
                  ['We rarely go there.', 'Rarely do we go there.'],
                  ['He had hardly arrived when…', 'Hardly had he arrived when…'],
                  ['She not only sings but also dances.', 'Not only does she sing, but she also dances.'],
                ],
              },
              { type: 'p', text: 'Слова, которые запускают инверсию:' },
              {
                type: 'table',
                head: ['Выражение', 'Перевод'],
                rows: [
                  ['never', 'никогда'],
                  ['rarely / seldom', 'редко'],
                  ['hardly / scarcely … when', 'едва … как'],
                  ['no sooner … than', 'как только … так'],
                  ['not only … but also', 'не только … но и'],
                  ['under no circumstances', 'ни при каких обстоятельствах'],
                  ['little', 'мало (в значении «вовсе не»)'],
                ],
              },
              { type: 'warn', text: 'Если вспомогательного глагола нет, появляется do/does/did — ровно как в вопросе: «Rarely do we go there», а не «Rarely we go there» и не «Rarely go we there».' },
              { type: 'p', text: 'Инверсия — не украшение. Она сдвигает акцент на само отрицание и делает фразу заметно более весомой:' },
              {
                type: 'table',
                head: ['Нейтрально', 'С акцентом'],
                rows: [
                  ['I will never agree.', 'Never will I agree.'],
                  ['You must not touch it.', 'Under no circumstances must you touch it.'],
                ],
              },
              { type: 'tip', text: 'В обычном разговоре инверсия звучит театрально. Её место — письменная речь, публичные выступления и моменты, когда нужно подчеркнуть категоричность.' },
            ],
            vocab: ['hardly', 'scarcely', 'seldom', 'rarely', 'barely', 'never'],
            exercises: [
              { type: 'choice', prompt: 'Выбери верное: «Никогда я не видел ничего подобного»', options: ['Never have I seen such a thing', 'Never I have seen such a thing', 'Never seen I have such a thing', 'Never I saw such a thing'], answer: 'Never have I seen such a thing' },
              { type: 'choice', prompt: 'Выбери верное: «Редко мы туда ходим»', options: ['Rarely do we go there', 'Rarely we go there', 'Rarely go we there', 'Rarely we do go there'], answer: 'Rarely do we go there' },
              { type: 'choice', prompt: 'Что нужно добавить, если нет вспомогательного глагола?', options: ['do / does / did', 'be', 'have', 'ничего'], answer: 'do / does / did' },
              { type: 'choice', prompt: 'Где инверсия уместна?', options: ['в письменной и торжественной речи', 'в любом разговоре', 'только в вопросах', 'только в прошедшем времени'], answer: 'в письменной и торжественной речи' },
              { type: 'order', prompt: 'Собери: «Едва он приехал»', words: ['Hardly', 'had', 'he', 'arrived'], answer: 'Hardly had he arrived' },
              { type: 'translate', prompt: 'Переведи с инверсией: «Редко я бывал так удивлён» (rarely, be so surprised)', answer: 'rarely have I been so surprised' },
            ],
          },
          {
            id: 'c1-u1-l2',
            title: 'Расщеплённые предложения',
            duration: 15,
            theory: [
              { type: 'p', text: 'В русском акцент ставится порядком слов и интонацией: «Именно Джон это сделал». В английском порядок слов жёсткий, поэтому для выделения используют специальные конструкции — они «расщепляют» предложение надвое.' },
              { type: 'formula', text: 'It + be + выделяемое + that / who …', note: 'It was John who broke the window. — Именно Джон разбил окно.' },
              {
                type: 'table',
                head: ['Что выделяем', 'Пример'],
                rows: [
                  ['кто', 'It was John who called.'],
                  ['что', 'It was the car that he sold.'],
                  ['когда', 'It was in 2020 that we met.'],
                  ['где', 'It is here that I work.'],
                ],
              },
              { type: 'p', text: 'Вторая конструкция начинается с what и выделяет действие или объект целиком:' },
              { type: 'formula', text: 'What + подлежащее + глагол + is / was …', note: 'What I need is time. — Что мне нужно, так это время.' },
              {
                type: 'table',
                head: ['Нейтрально', 'С акцентом'],
                rows: [
                  ['I need time.', 'What I need is time.'],
                  ['He wants respect.', 'What he wants is respect.'],
                  ['She said nothing.', 'What she did was say nothing.'],
                ],
              },
              { type: 'warn', text: 'В конструкции с It глагол be согласуется с самим предложением, а не с выделяемым словом: «It was they who came», хотя дальше идёт множественное число. В разговоре, впрочем, чаще скажут «It was them».' },
              { type: 'tip', text: 'Эти конструкции особенно полезны на письме, где нельзя выделить слово голосом. В устной речи достаточно ударения — не злоупотребляйте.' },
            ],
            vocab: ['emphasize', 'consider', 'maintain', 'acknowledge', 'evidence', 'approach'],
            exercises: [
              { type: 'choice', prompt: 'Как выделить «именно Джон разбил окно»?', options: ['It was John who broke the window', 'John it was broke the window', 'Was John who broke the window', 'It is John broke the window'], answer: 'It was John who broke the window' },
              { type: 'choice', prompt: 'Как выделить «что мне нужно, так это время»?', options: ['What I need is time', 'That I need is time', 'It is what I need time', 'What is I need time'], answer: 'What I need is time' },
              { type: 'choice', prompt: 'Зачем нужны такие конструкции?', options: ['выделить часть предложения при жёстком порядке слов', 'сократить предложение', 'заменить пассив', 'избежать местоимений'], answer: 'выделить часть предложения при жёстком порядке слов' },
              { type: 'order', prompt: 'Собери: «Именно в 2020 году мы познакомились»', words: ['It', 'was', 'in', '2020', 'that', 'we', 'met'], answer: 'It was in 2020 that we met' },
              { type: 'translate', prompt: 'Переведи: «Что он хочет, так это уважения» (respect)', answer: 'what he wants is respect' },
            ],
          },
        ],
      },
      {
        id: 'c1-u2',
        title: 'Сослагательное наклонение',
        icon: '🎩',
        lessons: [
          {
            id: 'c1-u2-l1',
            title: 'Subjunctive после требования и совета',
            duration: 15,
            theory: [
              { type: 'p', text: 'После глаголов требования, предложения и настояния английский использует особую форму: начальный глагол без всяких окончаний, для любого лица. Это остаток древнего сослагательного наклонения.' },
              { type: 'formula', text: 'suggest / insist / demand / recommend + that + подлежащее + начальная форма', note: 'I suggest that he go. — Я предлагаю, чтобы он пошёл.  (не «goes»!)' },
              {
                type: 'table',
                head: ['Обычно', 'Subjunctive'],
                rows: [
                  ['He goes.', 'I suggest that he go.'],
                  ['She is present.', 'It is essential that she be present.'],
                  ['They pay.', 'They demanded that we pay.'],
                  ['He does not leave.', 'I insist that he not leave.'],
                ],
              },
              { type: 'warn', text: 'Три ловушки сразу: нет -s в третьем лице, вместо is/are берётся be, а отрицание строится просто через not без do. «I insist that he doesn’t leave» — разговорно допустимо, но в формальном письме нужно «that he not leave».' },
              { type: 'p', text: 'Та же форма идёт после безличных оборотов с прилагательными оценки:' },
              {
                type: 'table',
                head: ['Оборот', 'Пример'],
                rows: [
                  ['It is essential that…', 'It is essential that he be informed.'],
                  ['It is crucial that…', 'It is crucial that we act now.'],
                  ['It is important that…', 'It is important that she attend.'],
                  ['It is necessary that…', 'It is necessary that they agree.'],
                ],
              },
              { type: 'tip', text: 'В британском варианте часто вставляют should: «I suggest that he should go». Смысл тот же, звучит мягче. Американский вариант обходится без него.' },
            ],
            vocab: ['insist', 'demand', 'recommend', 'suggest', 'essential', 'crucial', 'require'],
            exercises: [
              { type: 'choice', prompt: 'Выбери верное: «Я предлагаю, чтобы он пошёл»', options: ['I suggest that he go', 'I suggest that he goes', 'I suggest that he going', 'I suggest him to go'], answer: 'I suggest that he go' },
              { type: 'choice', prompt: 'Выбери верное: «Необходимо, чтобы она присутствовала»', options: ['It is essential that she be present', 'It is essential that she is present', 'It is essential that she will be present', 'It is essential she being present'], answer: 'It is essential that she be present' },
              { type: 'choice', prompt: 'Как строится отрицание в subjunctive?', options: ['that he not leave', 'that he doesn’t leave', 'that he not leaves', 'that he don’t leave'], answer: 'that he not leave' },
              { type: 'choice', prompt: 'Что происходит с окончанием -s в 3-м лице?', options: ['исчезает', 'сохраняется', 'меняется на -es', 'заменяется на -ing'], answer: 'исчезает' },
              { type: 'order', prompt: 'Собери: «Они потребовали, чтобы мы заплатили»', words: ['They', 'demanded', 'that', 'we', 'pay'], answer: 'They demanded that we pay' },
            ],
          },
          {
            id: 'c1-u2-l2',
            title: 'Инверсия вместо if',
            duration: 15,
            theory: [
              { type: 'p', text: 'В формальной речи союз if можно убрать вовсе — вместо него используется инверсия. Смысл не меняется, но регистр становится заметно выше.' },
              {
                type: 'table',
                head: ['С if', 'С инверсией'],
                rows: [
                  ['If I had known…', 'Had I known…'],
                  ['If I were you…', 'Were I you…'],
                  ['If you should need help…', 'Should you need help…'],
                  ['If it had not been for you…', 'Had it not been for you…'],
                ],
              },
              { type: 'formula', text: 'Had / Were / Should + подлежащее + …', note: 'Had I known, I would have come. — Знай я, я бы пришёл.' },
              { type: 'warn', text: 'Инверсия возможна только с этими тремя глаголами: had, were, should. «Knew I the answer» или «Did I know» в условном значении — ошибки, так не говорят.' },
              { type: 'p', text: 'Отрицание в такой конструкции не сокращается — это важная деталь формального стиля:' },
              {
                type: 'table',
                head: ['Правильно', 'Неправильно'],
                rows: [
                  ['Had I not seen it…', 'Hadn’t I seen it…'],
                  ['Were it not for him…', 'Weren’t it for him…'],
                ],
              },
              { type: 'tip', text: 'Should you need anything, let me know — стандартная вежливая формула деловой переписки. Стоит запомнить целиком: она заменяет более простое «If you need anything».' },
              { type: 'dialog', lines: [
                ['A', 'Should you need any assistance, please contact us.', 'Если вам понадобится помощь, свяжитесь с нами.'],
                ['B', 'Thank you. Had I known earlier, I would have asked.', 'Спасибо. Знай я раньше, я бы попросил.'],
              ] },
            ],
            vocab: ['would', 'wish', 'whether', 'regardless', 'albeit', 'assume'],
            exercises: [
              { type: 'choice', prompt: 'Перепиши без if: «If I had known…»', options: ['Had I known…', 'Did I know…', 'Knew I…', 'Have I known…'], answer: 'Had I known…' },
              { type: 'choice', prompt: 'Перепиши без if: «If you should need help…»', options: ['Should you need help…', 'Would you need help…', 'Need you help…', 'Do you need help…'], answer: 'Should you need help…' },
              { type: 'choice', prompt: 'С какими глаголами возможна такая инверсия?', options: ['had, were, should', 'do, did, does', 'have, has, had', 'will, would, can'], answer: 'had, were, should' },
              { type: 'choice', prompt: 'Как правильно оформить отрицание?', options: ['Had I not seen it', 'Hadn’t I seen it', 'Had not I seen it', 'I had not seen it'], answer: 'Had I not seen it' },
              { type: 'order', prompt: 'Собери: «На вашем месте я бы подождал»', words: ['Were', 'I', 'you', 'I', 'would', 'wait'], answer: 'Were I you I would wait' },
            ],
          },
        ],
      },
      {
        id: 'c1-u3',
        title: 'Тонкие оттенки модальности',
        icon: '🪶',
        lessons: [
          {
            id: 'c1-u3-l1',
            title: 'Модальные глаголы о прошлом',
            duration: 18,
            theory: [
              { type: 'p', text: 'Модальные глаголы умеют говорить и о прошлом — для этого после них ставится перфектный инфинитив. Каждое сочетание даёт свой оттенок, и разница между ними существенная.' },
              { type: 'formula', text: 'модальный + have + 3-я форма', note: 'He must have left. — Он, должно быть, ушёл.' },
              {
                type: 'table',
                head: ['Конструкция', 'Значение', 'Пример'],
                rows: [
                  ['must have done', 'уверенное предположение', 'He must have left. — Наверняка ушёл.'],
                  ['can’t have done', 'уверенное отрицание', 'He can’t have known. — Не мог он знать.'],
                  ['might / may have done', 'возможно, случилось', 'She might have forgotten.'],
                  ['should have done', 'упрёк: надо было, но не сделал', 'You should have called.'],
                  ['shouldn’t have done', 'упрёк: сделал зря', 'You shouldn’t have said that.'],
                  ['could have done', 'была возможность, но не вышло', 'We could have won.'],
                ],
              },
              { type: 'warn', text: 'should have — это всегда упрёк или сожаление, действие НЕ состоялось. «You should have called» означает «ты не позвонил, а надо было». Русское «ты должен был позвонить» двусмысленно, английское — нет.' },
              { type: 'p', text: 'Сравните пару, которую путают чаще всего:' },
              {
                type: 'table',
                head: ['Фраза', 'Что произошло на самом деле'],
                rows: [
                  ['needn’t have done', 'сделал, но было не нужно'],
                  ['didn’t need to do', 'не делал, потому что было не нужно'],
                  ['You needn’t have cooked.', 'Ты приготовил — зря, у нас есть еда.'],
                  ['I didn’t need to cook.', 'Я не готовил — не пришлось.'],
                ],
              },
              { type: 'tip', text: 'В беглой речи «must have» звучит как /ˈmʌstəv/, «should have» — /ˈʃʊdəv/. Отсюда и распространённая письменная ошибка «should of». Правильно только have.' },
            ],
            vocab: ['must', 'might', 'could', 'should', 'gone', 'known', 'forgotten', 'realize'],
            exercises: [
              { type: 'choice', prompt: 'Свет не горит, машины нет. «Он, должно быть, ушёл»', options: ['He must have left', 'He must leave', 'He should have left', 'He can have left'], answer: 'He must have left' },
              { type: 'choice', prompt: 'Что означает «You should have called»?', options: ['Ты не позвонил, а надо было', 'Ты позвонил, и правильно', 'Тебе нужно позвонить', 'Ты можешь позвонить'], answer: 'Ты не позвонил, а надо было' },
              { type: 'choice', prompt: 'Что означает «You needn’t have cooked»?', options: ['Ты приготовил, но было не нужно', 'Ты не готовил и правильно', 'Тебе не надо готовить', 'Ты должен был приготовить'], answer: 'Ты приготовил, но было не нужно' },
              { type: 'choice', prompt: 'Как сказать «Не мог он знать»?', options: ['He can’t have known', 'He mustn’t have known', 'He couldn’t know', 'He didn’t can know'], answer: 'He can’t have known' },
              { type: 'choice', prompt: 'Что верно?', options: ['should have done', 'should of done', 'should had done', 'should have did'], answer: 'should have done' },
              { type: 'order', prompt: 'Собери: «Она могла забыть»', words: ['She', 'might', 'have', 'forgotten'], answer: 'She might have forgotten' },
            ],
          },
          {
            id: 'c1-u3-l2',
            title: 'Смягчение: как не звучать категорично',
            duration: 15,
            theory: [
              { type: 'p', text: 'В английской академической и деловой культуре прямые утверждения считаются грубыми и наивными. Автор, который пишет «This proves that…», выглядит менее убедительно, чем тот, кто пишет «This suggests that…». Приём называется хеджированием.' },
              {
                type: 'table',
                head: ['Категорично', 'Смягчённо'],
                rows: [
                  ['This proves…', 'This suggests / indicates…'],
                  ['It is…', 'It appears / seems to be…'],
                  ['People are…', 'People tend to be…'],
                  ['This is the best.', 'This is arguably the best.'],
                  ['It will fail.', 'It is likely to fail.'],
                  ['Everyone agrees.', 'Most would agree.'],
                ],
              },
              { type: 'p', text: 'Инструменты смягчения делятся на несколько групп:' },
              {
                type: 'table',
                head: ['Тип', 'Примеры'],
                rows: [
                  ['глаголы', 'seem, appear, tend to, suggest, indicate'],
                  ['модальные', 'may, might, could, would'],
                  ['наречия', 'arguably, presumably, relatively, somewhat, largely'],
                  ['обороты', 'to some extent, it could be argued that'],
                ],
              },
              { type: 'warn', text: 'Мера важна. Три смягчения в одном предложении — «It could arguably be somewhat possible that…» — превращают мысль в кашу. Одного хватает.' },
              { type: 'tip', text: 'Обратная сторона: если вы уверены и располагаете данными, смягчать не нужно. «The data show» сильнее и честнее, чем «The data may possibly suggest», когда данные действительно показывают.' },
            ],
            vocab: ['tend-to', 'seem', 'appear', 'arguably', 'presumably', 'somewhat', 'relatively', 'largely'],
            exercises: [
              { type: 'choice', prompt: 'Как смягчить «This proves that…»?', options: ['This suggests that…', 'This absolutely proves that…', 'This is proof that…', 'This must prove that…'], answer: 'This suggests that…' },
              { type: 'choice', prompt: 'Как смягчить «People are lazy»?', options: ['People tend to be lazy', 'People are very lazy', 'All people are lazy', 'People are always lazy'], answer: 'People tend to be lazy' },
              { type: 'choice', prompt: 'Зачем нужно хеджирование в академическом письме?', options: ['Показать, что автор учитывает границы вывода', 'Сделать текст длиннее', 'Скрыть незнание', 'Соблюсти грамматику'], answer: 'Показать, что автор учитывает границы вывода' },
              { type: 'choice', prompt: 'Какая фраза перегружена смягчением?', options: ['It could arguably be somewhat possible that…', 'This appears to be true.', 'The results suggest a link.', 'This is arguably the best option.'], answer: 'It could arguably be somewhat possible that…' },
              { type: 'order', prompt: 'Собери: «Результаты, по-видимому, это подтверждают»', words: ['The', 'results', 'appear', 'to', 'confirm', 'this'], answer: 'The results appear to confirm this' },
            ],
          },
          {
            id: 'c1-u3-l3',
            title: 'Вежливость и дистанция',
            duration: 15,
            theory: [
              { type: 'p', text: 'Английская вежливость строится на дистанции: чем дальше форма от прямого приказа, тем вежливее. Отсюда странные на первый взгляд конструкции с прошедшим временем в настоящем смысле.' },
              {
                type: 'table',
                head: ['Прямо', 'Вежливо', 'Очень вежливо'],
                rows: [
                  ['Help me.', 'Can you help me?', 'Could you possibly help me?'],
                  ['I want a coffee.', 'I’d like a coffee.', 'I was wondering if I could get a coffee.'],
                  ['Send it today.', 'Please send it today.', 'It would be great if you could send it today.'],
                  ['You are wrong.', 'I’m not sure that’s right.', 'I wonder whether there might be another view.'],
                ],
              },
              { type: 'warn', text: 'Для русскоязычных это главная культурная ловушка. Прямое «I want» или «Give me» грамматически верно, но звучит требовательно почти до грубости. В русском прямота нейтральна, в английском — нет.' },
              { type: 'p', text: 'Несколько рабочих формул на каждый день:' },
              {
                type: 'table',
                head: ['Ситуация', 'Формула'],
                rows: [
                  ['просьба', 'Would you mind + -ing?'],
                  ['отказ', 'I’m afraid I can’t…'],
                  ['несогласие', 'I see your point, but…'],
                  ['предложение', 'How about we…?'],
                  ['напоминание', 'Just a gentle reminder that…'],
                ],
              },
              { type: 'tip', text: 'Would you mind opening the window? — ответ «No» здесь означает согласие: «нет, не возражаю». Логика обратная русской, и на этом легко ошибиться.' },
              { type: 'dialog', lines: [
                ['A', 'I was wondering if you could look at this report.', 'Я хотел спросить, не могли бы вы взглянуть на этот отчёт.'],
                ['B', 'Of course. Would you mind sending it by email?', 'Конечно. Не могли бы вы прислать его почтой?'],
                ['A', 'Not at all. I’m afraid it’s rather long.', 'Вовсе нет. Боюсь, он довольно длинный.'],
              ] },
            ],
            vocab: ['would', 'could', 'may', 'wish', 'rather', 'appear', 'acknowledge'],
            exercises: [
              { type: 'choice', prompt: 'Самый вежливый вариант просьбы', options: ['Could you possibly help me?', 'Help me.', 'You must help me.', 'I want you to help me.'], answer: 'Could you possibly help me?' },
              { type: 'choice', prompt: 'Как вежливо заказать кофе?', options: ['I’d like a coffee, please', 'I want a coffee', 'Give me a coffee', 'Coffee now'], answer: 'I’d like a coffee, please' },
              { type: 'choice', prompt: '«Would you mind opening the window?» — как согласиться?', options: ['No, not at all', 'Yes, of course', 'Yes, I mind', 'No, I don’t want'], answer: 'No, not at all' },
              { type: 'choice', prompt: 'Как вежливо не согласиться?', options: ['I see your point, but…', 'You are wrong', 'That is not true', 'No, absolutely not'], answer: 'I see your point, but…' },
              { type: 'order', prompt: 'Собери: «Боюсь, я не могу»', words: ['I’m', 'afraid', 'I', 'can’t'], answer: 'I’m afraid I can’t' },
            ],
          },
        ],
      },
      {
        id: 'c1-u4',
        title: 'Академическое письмо',
        icon: '🎓',
        lessons: [
          {
            id: 'c1-u4-l1',
            title: 'Регистр: формальный и разговорный',
            duration: 18,
            theory: [
              { type: 'p', text: 'Английский резко делится на регистры, и смешивать их нельзя. Разговорное слово в академическом тексте бросается в глаза так же, как спортивный костюм на защите диссертации.' },
              { type: 'p', text: 'Главное различие: разговорная речь любит фразовые глаголы, формальная — латинские заимствования.' },
              {
                type: 'table',
                head: ['Разговорно', 'Формально', 'Перевод'],
                rows: [
                  ['get', 'obtain / receive', 'получать'],
                  ['find out', 'discover / determine', 'выяснить'],
                  ['look into', 'investigate', 'исследовать'],
                  ['put off', 'postpone', 'откладывать'],
                  ['go up', 'increase', 'расти'],
                  ['go down', 'decrease / decline', 'снижаться'],
                  ['show', 'demonstrate / indicate', 'показывать'],
                  ['a lot of', 'a significant number of', 'много'],
                  ['but', 'however / nevertheless', 'но'],
                  ['so', 'therefore / consequently', 'поэтому'],
                ],
              },
              { type: 'warn', text: 'Сокращения в формальном письме недопустимы: don’t → do not, it’s → it is, can’t → cannot. Это самый заметный маркер регистра, и его нарушают чаще всего.' },
              { type: 'p', text: 'Ещё несколько правил формального текста:' },
              {
                type: 'table',
                head: ['Избегать', 'Использовать'],
                rows: [
                  ['I think that…', 'It can be argued that…'],
                  ['You can see that…', 'It is evident that…'],
                  ['Things / stuff', 'factors / aspects / elements'],
                  ['really / very big', 'considerable / substantial'],
                  ['kind of, sort of', '— (убрать вовсе)'],
                  ['восклицательные знаки', '— (не используются)'],
                ],
              },
              { type: 'tip', text: 'Не переусердствуйте. Текст, набитый латинизмами, читается тяжело и часто выдаёт неуверенность. Хорошая академическая проза — ясная, а не сложная.' },
            ],
            vocab: ['obtain', 'require', 'indicate', 'demonstrate', 'establish', 'occur', 'evidence', 'research'],
            exercises: [
              { type: 'choice', prompt: 'Формальный эквивалент «find out»', options: ['determine', 'get out', 'look up', 'figure'], answer: 'determine' },
              { type: 'choice', prompt: 'Формальный эквивалент «go up»', options: ['increase', 'grow up', 'raise up', 'lift'], answer: 'increase' },
              { type: 'choice', prompt: 'Что недопустимо в формальном письме?', options: ['сокращения вроде don’t', 'пассивный залог', 'длинные предложения', 'ссылки на источники'], answer: 'сокращения вроде don’t' },
              { type: 'choice', prompt: 'Формальный эквивалент «so»', options: ['therefore', 'and so', 'that is why so', 'because'], answer: 'therefore' },
              { type: 'choice', prompt: 'Как формально выразить «I think that…»?', options: ['It can be argued that…', 'I really think that…', 'In my opinion I think…', 'Everybody knows that…'], answer: 'It can be argued that…' },
              { type: 'order', prompt: 'Собери: «Это требует дальнейшего изучения»', words: ['This', 'requires', 'further', 'study'], answer: 'This requires further study' },
            ],
          },
          {
            id: 'c1-u4-l2',
            title: 'Связки и структура аргумента',
            duration: 15,
            theory: [
              { type: 'p', text: 'Академический текст держится на связках. Они показывают читателю, как одна мысль соотносится с другой, и без них даже верные аргументы рассыпаются.' },
              {
                type: 'table',
                head: ['Задача', 'Связки'],
                rows: [
                  ['добавить', 'furthermore, moreover, in addition'],
                  ['противопоставить', 'however, nevertheless, whereas, albeit'],
                  ['вывести следствие', 'therefore, consequently, thus, hence'],
                  ['уступить', 'although, despite, regardless of'],
                  ['проиллюстрировать', 'for instance, namely, in particular'],
                  ['подытожить', 'in conclusion, overall, to sum up'],
                ],
              },
              { type: 'warn', text: 'Пунктуация у связок жёсткая: however в начале предложения требует запятой после себя — «However, the results differ». Соединять два предложения через however запятой нельзя, нужна точка или точка с запятой.' },
              { type: 'p', text: 'Слова, которые часто путают:' },
              {
                type: 'table',
                head: ['Слово', 'После него идёт', 'Пример'],
                rows: [
                  ['although', 'предложение', 'Although it rained, we went.'],
                  ['despite', 'существительное или -ing', 'Despite the rain, we went.'],
                  ['whereas', 'противопоставление', 'He agreed, whereas she refused.'],
                  ['albeit', 'слово или оборот', 'A useful, albeit costly, method.'],
                ],
              },
              { type: 'tip', text: 'Типичная структура абзаца: утверждение → обоснование → пример → следствие. Связка ставится там, где меняется тип мысли, а не в каждом предложении подряд.' },
            ],
            vocab: ['furthermore', 'nevertheless', 'consequently', 'moreover', 'whereas', 'thus', 'hence', 'albeit'],
            exercises: [
              { type: 'choice', prompt: 'Какая связка вводит следствие?', options: ['consequently', 'furthermore', 'whereas', 'namely'], answer: 'consequently' },
              { type: 'choice', prompt: 'Что идёт после «despite»?', options: ['существительное или -ing', 'целое предложение', 'глагол в начальной форме', 'вопрос'], answer: 'существительное или -ing' },
              { type: 'choice', prompt: 'Что идёт после «although»?', options: ['целое предложение', 'существительное', 'только -ing', 'инфинитив'], answer: 'целое предложение' },
              { type: 'choice', prompt: 'Как правильно оформить «however» в начале предложения?', options: ['However, the results differ.', 'However the results differ.', 'However; the results differ.', 'However: the results differ.'], answer: 'However, the results differ.' },
              { type: 'order', prompt: 'Собери: «Более того, стоимость высока»', words: ['Furthermore', 'the', 'cost', 'is', 'high'], answer: 'Furthermore the cost is high' },
              { type: 'translate', prompt: 'Переведи: «Тем не менее, стоит попробовать» (nevertheless, we should try)', answer: 'nevertheless we should try' },
            ],
          },
          {
            id: 'c1-u4-l3',
            title: 'Безличность и номинализация',
            duration: 15,
            theory: [
              { type: 'p', text: 'Академический стиль убирает автора из текста. Внимание переносится с того, кто делает, на то, что происходит, — и для этого есть два основных приёма.' },
              { type: 'formula', text: 'Приём 1: безличные обороты вместо «я»', note: 'I think this is important → It is important to note that…' },
              {
                type: 'table',
                head: ['Личное', 'Безличное'],
                rows: [
                  ['I found that…', 'It was found that…'],
                  ['We can see…', 'It can be seen that…'],
                  ['I will show…', 'This paper demonstrates…'],
                  ['You should note…', 'It should be noted that…'],
                ],
              },
              { type: 'formula', text: 'Приём 2: номинализация — глагол превращается в существительное', note: 'The city grew rapidly → The rapid growth of the city' },
              {
                type: 'table',
                head: ['Глагол', 'Существительное', 'Пример'],
                rows: [
                  ['analyse', 'analysis', 'the analysis of data'],
                  ['grow', 'growth', 'rapid growth'],
                  ['assume', 'assumption', 'a false assumption'],
                  ['imply', 'implication', 'serious implications'],
                  ['develop', 'development', 'recent developments'],
                  ['decide', 'decision', 'a difficult decision'],
                ],
              },
              { type: 'warn', text: 'Оба приёма легко довести до абсурда. «It could be argued that the implementation of the modification of the process resulted in…» — грамматически безупречно и совершенно нечитаемо. Хороший текст чередует плотные конструкции с простыми.' },
              { type: 'p', text: 'Современная норма смягчилась: в естественных науках «we» давно допустимо, а во многих журналах даже приветствуется как более ясное.' },
              { type: 'tip', text: 'Проверка на перегруз: прочтите предложение вслух. Если не хватает дыхания или приходится возвращаться к началу — разбейте на два.' },
            ],
            vocab: ['assumption', 'implication', 'outcome', 'factor', 'impact', 'extent', 'approach', 'assess'],
            exercises: [
              { type: 'choice', prompt: 'Безличный вариант «I found that…»', options: ['It was found that…', 'I have found that…', 'We all found that…', 'Finding was that…'], answer: 'It was found that…' },
              { type: 'choice', prompt: 'Существительное от «assume»', options: ['assumption', 'assuming', 'assumement', 'assumance'], answer: 'assumption' },
              { type: 'choice', prompt: 'Существительное от «grow»', options: ['growth', 'growing', 'grownness', 'growment'], answer: 'growth' },
              { type: 'choice', prompt: 'В чём риск номинализации?', options: ['текст становится нечитаемым', 'появляются ошибки в артиклях', 'теряется прошедшее время', 'нарушается порядок слов'], answer: 'текст становится нечитаемым' },
              { type: 'order', prompt: 'Собери: «Следует отметить, что»', words: ['It', 'should', 'be', 'noted', 'that'], answer: 'It should be noted that' },
              { type: 'translate', prompt: 'Переведи: «В какой-то мере это верно» (to some extent)', answer: 'to some extent this is true' },
            ],
          },
        ],
      },
    ],
  },
];

/* ---------- Хелперы ---------- */

export function allLessons() {
  const out = [];
  for (const level of CURRICULUM) {
    for (const unit of level.units) {
      for (const lesson of unit.lessons) {
        out.push({ ...lesson, levelId: level.id, levelCode: level.code, unitId: unit.id, unitTitle: unit.title });
      }
    }
  }
  return out;
}

export function findLesson(id) {
  return allLessons().find((l) => l.id === id);
}

export function findLevel(id) {
  return CURRICULUM.find((l) => l.id === id);
}

/** Следующий незавершённый урок — то, что портал предлагает на главной. */
export function nextLesson(completedMap) {
  return allLessons().find((l) => !completedMap[l.id]) || null;
}

/**
 * Слова из пройденных уроков — только они попадают в повторение.
 *
 * Без этого фильтра тренажёр подсовывал бы новичку лексику из A1,
 * которую урок ещё не объяснил: слово без контекста запоминается плохо
 * и просто отнимает время.
 */
export function unlockedVocabIds(completedMap) {
  const ids = new Set();
  for (const lesson of allLessons()) {
    if (!completedMap[lesson.id]) continue;
    for (const id of lesson.vocab) ids.add(id);
  }
  return [...ids];
}

/**
 * Фразы для аудирования из пройденных уроков.
 *
 * Диалоги идут первыми: живая реплика ближе к настоящей речи, чем
 * образцовое предложение из словаря, и служебные слова в ней
 * проглатываются так же, как у носителей.
 */
export function listeningPhrases(completedMap) {
  const dialogs = [];
  const examples = [];
  const seen = new Set();

  const add = (list, en, ru, source) => {
    const key = en.toLowerCase();
    if (!en || seen.has(key)) return;
    seen.add(key);
    list.push({ en, ru, source });
  };

  for (const lesson of allLessons()) {
    if (!completedMap[lesson.id]) continue;

    for (const block of lesson.theory) {
      if (block.type !== 'dialog') continue;
      for (const [, en, ru] of block.lines) add(dialogs, en, ru, lesson.title);
    }

    for (const id of lesson.vocab) {
      const word = VOCAB_BY_ID[id];
      if (word) add(examples, word.example, word.exampleRu, lesson.title);
    }
  }

  return [...dialogs, ...examples];
}
