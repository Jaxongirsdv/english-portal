/**
 * Словарь портала. Каждое слово — карточка для интервальных повторений.
 *
 * id      — стабильный ключ (по нему хранится прогресс, не менять!)
 * en/ru   — слово и перевод
 * ipa     — транскрипция
 * rus     — «русскими буквами», костыль для самого старта на A0
 * topic   — тема, по ней слова группируются в уроки
 * level   — уровень CEFR
 */

export const VOCAB = [
  /* ---------- A0: приветствия и вежливость ---------- */
  { id: 'hello', en: 'hello', ru: 'привет, здравствуйте', ipa: '/həˈloʊ/', rus: 'хэлоу', topic: 'greetings', level: 'A0', example: 'Hello! Nice to meet you.', exampleRu: 'Здравствуйте! Приятно познакомиться.' },
  { id: 'hi', en: 'hi', ru: 'привет (неформально)', ipa: '/haɪ/', rus: 'хай', topic: 'greetings', level: 'A0', example: 'Hi, how are you?', exampleRu: 'Привет, как дела?' },
  { id: 'goodbye', en: 'goodbye', ru: 'до свидания', ipa: '/ɡʊdˈbaɪ/', rus: 'гудбай', topic: 'greetings', level: 'A0', example: 'Goodbye! See you tomorrow.', exampleRu: 'До свидания! Увидимся завтра.' },
  { id: 'please', en: 'please', ru: 'пожалуйста (просьба)', ipa: '/pliːz/', rus: 'плиз', topic: 'greetings', level: 'A0', example: 'Water, please.', exampleRu: 'Воды, пожалуйста.' },
  { id: 'thank-you', en: 'thank you', ru: 'спасибо', ipa: '/ˈθæŋk juː/', rus: 'сэнк ю', topic: 'greetings', level: 'A0', example: 'Thank you very much!', exampleRu: 'Большое спасибо!' },
  { id: 'sorry', en: 'sorry', ru: 'извини(те)', ipa: '/ˈsɒri/', rus: 'сори', topic: 'greetings', level: 'A0', example: "Sorry, I'm late.", exampleRu: 'Извините, я опоздал.' },
  { id: 'yes', en: 'yes', ru: 'да', ipa: '/jes/', rus: 'йес', topic: 'greetings', level: 'A0', example: 'Yes, I do.', exampleRu: 'Да.' },
  { id: 'no', en: 'no', ru: 'нет', ipa: '/noʊ/', rus: 'ноу', topic: 'greetings', level: 'A0', example: "No, I don't.", exampleRu: 'Нет.' },
  { id: 'good-morning', en: 'good morning', ru: 'доброе утро', ipa: '/ɡʊd ˈmɔːnɪŋ/', rus: 'гуд монин', topic: 'greetings', level: 'A0', example: 'Good morning, everyone.', exampleRu: 'Доброе утро всем.' },
  { id: 'nice-to-meet-you', en: 'nice to meet you', ru: 'приятно познакомиться', ipa: '/naɪs tə ˈmiːt juː/', rus: 'найс ту мит ю', topic: 'greetings', level: 'A0', example: 'Nice to meet you, Anna.', exampleRu: 'Приятно познакомиться, Анна.' },

  /* ---------- A0: местоимения ---------- */
  { id: 'i', en: 'I', ru: 'я', ipa: '/aɪ/', rus: 'ай', topic: 'pronouns', level: 'A0', example: 'I am a student.', exampleRu: 'Я студент.' },
  { id: 'you', en: 'you', ru: 'ты, вы', ipa: '/juː/', rus: 'ю', topic: 'pronouns', level: 'A0', example: 'You are right.', exampleRu: 'Ты прав.' },
  { id: 'he', en: 'he', ru: 'он', ipa: '/hiː/', rus: 'хи', topic: 'pronouns', level: 'A0', example: 'He is my brother.', exampleRu: 'Он мой брат.' },
  { id: 'she', en: 'she', ru: 'она', ipa: '/ʃiː/', rus: 'ши', topic: 'pronouns', level: 'A0', example: 'She is a doctor.', exampleRu: 'Она врач.' },
  { id: 'it', en: 'it', ru: 'оно, это (о предмете)', ipa: '/ɪt/', rus: 'ит', topic: 'pronouns', level: 'A0', example: 'It is a book.', exampleRu: 'Это книга.' },
  { id: 'we', en: 'we', ru: 'мы', ipa: '/wiː/', rus: 'уи', topic: 'pronouns', level: 'A0', example: 'We are friends.', exampleRu: 'Мы друзья.' },
  { id: 'they', en: 'they', ru: 'они', ipa: '/ðeɪ/', rus: 'зэй', topic: 'pronouns', level: 'A0', example: 'They are at home.', exampleRu: 'Они дома.' },
  { id: 'my', en: 'my', ru: 'мой, моя', ipa: '/maɪ/', rus: 'май', topic: 'pronouns', level: 'A0', example: 'My name is Tom.', exampleRu: 'Меня зовут Том.' },
  { id: 'your', en: 'your', ru: 'твой, ваш', ipa: '/jɔː/', rus: 'ёр', topic: 'pronouns', level: 'A0', example: 'What is your name?', exampleRu: 'Как тебя зовут?' },
  { id: 'this', en: 'this', ru: 'этот, это', ipa: '/ðɪs/', rus: 'зис', topic: 'pronouns', level: 'A0', example: 'This is my house.', exampleRu: 'Это мой дом.' },
  { id: 'that', en: 'that', ru: 'тот, то', ipa: '/ðæt/', rus: 'зэт', topic: 'pronouns', level: 'A0', example: 'That is a car.', exampleRu: 'То — машина.' },

  /* ---------- A0: глагол to be ---------- */
  { id: 'am', en: 'am', ru: 'есть (форма для I)', ipa: '/æm/', rus: 'эм', topic: 'to-be', level: 'A0', example: 'I am happy.', exampleRu: 'Я счастлив.' },
  { id: 'is', en: 'is', ru: 'есть (для he/she/it)', ipa: '/ɪz/', rus: 'из', topic: 'to-be', level: 'A0', example: 'She is at work.', exampleRu: 'Она на работе.' },
  { id: 'are', en: 'are', ru: 'есть (для you/we/they)', ipa: '/ɑː/', rus: 'а', topic: 'to-be', level: 'A0', example: 'They are ready.', exampleRu: 'Они готовы.' },
  { id: 'not', en: 'not', ru: 'не', ipa: '/nɒt/', rus: 'нот', topic: 'to-be', level: 'A0', example: 'I am not tired.', exampleRu: 'Я не устал.' },

  /* ---------- A0: числа ---------- */
  { id: 'one', en: 'one', ru: 'один', ipa: '/wʌn/', rus: 'уан', topic: 'numbers', level: 'A0', example: 'I have one sister.', exampleRu: 'У меня одна сестра.' },
  { id: 'two', en: 'two', ru: 'два', ipa: '/tuː/', rus: 'ту', topic: 'numbers', level: 'A0', example: 'Two coffees, please.', exampleRu: 'Два кофе, пожалуйста.' },
  { id: 'three', en: 'three', ru: 'три', ipa: '/θriː/', rus: 'сри', topic: 'numbers', level: 'A0', example: 'Three days.', exampleRu: 'Три дня.' },
  { id: 'four', en: 'four', ru: 'четыре', ipa: '/fɔː/', rus: 'фор', topic: 'numbers', level: 'A0', example: 'Four people.', exampleRu: 'Четыре человека.' },
  { id: 'five', en: 'five', ru: 'пять', ipa: '/faɪv/', rus: 'файв', topic: 'numbers', level: 'A0', example: 'Five minutes.', exampleRu: 'Пять минут.' },
  { id: 'six', en: 'six', ru: 'шесть', ipa: '/sɪks/', rus: 'сикс', topic: 'numbers', level: 'A0', example: 'Six hours.', exampleRu: 'Шесть часов.' },
  { id: 'seven', en: 'seven', ru: 'семь', ipa: '/ˈsevn/', rus: 'сэвн', topic: 'numbers', level: 'A0', example: 'Seven days a week.', exampleRu: 'Семь дней в неделю.' },
  { id: 'eight', en: 'eight', ru: 'восемь', ipa: '/eɪt/', rus: 'эйт', topic: 'numbers', level: 'A0', example: 'Eight o’clock.', exampleRu: 'Восемь часов.' },
  { id: 'nine', en: 'nine', ru: 'девять', ipa: '/naɪn/', rus: 'найн', topic: 'numbers', level: 'A0', example: 'Nine students.', exampleRu: 'Девять студентов.' },
  { id: 'ten', en: 'ten', ru: 'десять', ipa: '/ten/', rus: 'тэн', topic: 'numbers', level: 'A0', example: 'Ten dollars.', exampleRu: 'Десять долларов.' },

  /* ---------- A0: базовые существительные ---------- */
  { id: 'name', en: 'name', ru: 'имя', ipa: '/neɪm/', rus: 'нэйм', topic: 'basics', level: 'A0', example: 'My name is Ivan.', exampleRu: 'Меня зовут Иван.' },
  { id: 'man', en: 'man', ru: 'мужчина', ipa: '/mæn/', rus: 'мэн', topic: 'basics', level: 'A0', example: 'That man is my father.', exampleRu: 'Тот мужчина — мой отец.' },
  { id: 'woman', en: 'woman', ru: 'женщина', ipa: '/ˈwʊmən/', rus: 'вумэн', topic: 'basics', level: 'A0', example: 'The woman is a teacher.', exampleRu: 'Эта женщина — учитель.' },
  { id: 'friend', en: 'friend', ru: 'друг', ipa: '/frend/', rus: 'фрэнд', topic: 'basics', level: 'A0', example: 'He is my friend.', exampleRu: 'Он мой друг.' },
  { id: 'house', en: 'house', ru: 'дом', ipa: '/haʊs/', rus: 'хаус', topic: 'basics', level: 'A0', example: 'This is a big house.', exampleRu: 'Это большой дом.' },
  { id: 'water', en: 'water', ru: 'вода', ipa: '/ˈwɔːtə/', rus: 'вотэ', topic: 'basics', level: 'A0', example: 'I drink water.', exampleRu: 'Я пью воду.' },
  { id: 'food', en: 'food', ru: 'еда', ipa: '/fuːd/', rus: 'фуд', topic: 'basics', level: 'A0', example: 'The food is good.', exampleRu: 'Еда вкусная.' },
  { id: 'book', en: 'book', ru: 'книга', ipa: '/bʊk/', rus: 'бук', topic: 'basics', level: 'A0', example: 'I read a book.', exampleRu: 'Я читаю книгу.' },
  { id: 'day', en: 'day', ru: 'день', ipa: '/deɪ/', rus: 'дэй', topic: 'basics', level: 'A0', example: 'Have a nice day!', exampleRu: 'Хорошего дня!' },
  { id: 'time', en: 'time', ru: 'время', ipa: '/taɪm/', rus: 'тайм', topic: 'basics', level: 'A0', example: 'What time is it?', exampleRu: 'Который час?' },
  { id: 'work', en: 'work', ru: 'работа; работать', ipa: '/wɜːk/', rus: 'уорк', topic: 'basics', level: 'A0', example: 'I go to work.', exampleRu: 'Я иду на работу.' },
  { id: 'city', en: 'city', ru: 'город', ipa: '/ˈsɪti/', rus: 'сити', topic: 'basics', level: 'A0', example: 'I live in a big city.', exampleRu: 'Я живу в большом городе.' },

  /* ---------- A1: базовые глаголы ---------- */
  { id: 'be', en: 'to be', ru: 'быть, являться', ipa: '/tə biː/', rus: 'ту би', topic: 'verbs', level: 'A1', example: 'I want to be a doctor.', exampleRu: 'Я хочу быть врачом.' },
  { id: 'have', en: 'to have', ru: 'иметь', ipa: '/tə hæv/', rus: 'ту хэв', topic: 'verbs', level: 'A1', example: 'I have a car.', exampleRu: 'У меня есть машина.' },
  { id: 'do', en: 'to do', ru: 'делать', ipa: '/tə duː/', rus: 'ту ду', topic: 'verbs', level: 'A1', example: 'What do you do?', exampleRu: 'Чем ты занимаешься?' },
  { id: 'go', en: 'to go', ru: 'идти, ехать', ipa: '/tə ɡoʊ/', rus: 'ту гоу', topic: 'verbs', level: 'A1', example: 'I go to school.', exampleRu: 'Я хожу в школу.' },
  { id: 'want', en: 'to want', ru: 'хотеть', ipa: '/tə wɒnt/', rus: 'ту вонт', topic: 'verbs', level: 'A1', example: 'I want coffee.', exampleRu: 'Я хочу кофе.' },
  { id: 'like', en: 'to like', ru: 'нравиться, любить', ipa: '/tə laɪk/', rus: 'ту лайк', topic: 'verbs', level: 'A1', example: 'I like music.', exampleRu: 'Мне нравится музыка.' },
  { id: 'know', en: 'to know', ru: 'знать', ipa: '/tə noʊ/', rus: 'ту ноу', topic: 'verbs', level: 'A1', example: "I don't know.", exampleRu: 'Я не знаю.' },
  { id: 'think', en: 'to think', ru: 'думать', ipa: '/tə θɪŋk/', rus: 'ту синк', topic: 'verbs', level: 'A1', example: 'I think you are right.', exampleRu: 'Думаю, ты прав.' },
  { id: 'see', en: 'to see', ru: 'видеть', ipa: '/tə siː/', rus: 'ту си', topic: 'verbs', level: 'A1', example: 'I see a bird.', exampleRu: 'Я вижу птицу.' },
  { id: 'come', en: 'to come', ru: 'приходить', ipa: '/tə kʌm/', rus: 'ту кам', topic: 'verbs', level: 'A1', example: 'Come here, please.', exampleRu: 'Подойди сюда, пожалуйста.' },
  { id: 'make', en: 'to make', ru: 'делать, создавать', ipa: '/tə meɪk/', rus: 'ту мэйк', topic: 'verbs', level: 'A1', example: 'I make breakfast.', exampleRu: 'Я готовлю завтрак.' },
  { id: 'say', en: 'to say', ru: 'сказать', ipa: '/tə seɪ/', rus: 'ту сэй', topic: 'verbs', level: 'A1', example: 'What did you say?', exampleRu: 'Что ты сказал?' },
  { id: 'live', en: 'to live', ru: 'жить', ipa: '/tə lɪv/', rus: 'ту лив', topic: 'verbs', level: 'A1', example: 'I live in Moscow.', exampleRu: 'Я живу в Москве.' },
  { id: 'speak', en: 'to speak', ru: 'говорить', ipa: '/tə spiːk/', rus: 'ту спик', topic: 'verbs', level: 'A1', example: 'I speak English.', exampleRu: 'Я говорю по-английски.' },
  { id: 'need', en: 'to need', ru: 'нуждаться', ipa: '/tə niːd/', rus: 'ту нид', topic: 'verbs', level: 'A1', example: 'I need help.', exampleRu: 'Мне нужна помощь.' },
  { id: 'can', en: 'can', ru: 'мочь, уметь', ipa: '/kæn/', rus: 'кэн', topic: 'verbs', level: 'A1', example: 'I can swim.', exampleRu: 'Я умею плавать.' },

  /* ---------- A1: семья ---------- */
  { id: 'family', en: 'family', ru: 'семья', ipa: '/ˈfæməli/', rus: 'фэмили', topic: 'family', level: 'A1', example: 'I love my family.', exampleRu: 'Я люблю свою семью.' },
  { id: 'mother', en: 'mother', ru: 'мама', ipa: '/ˈmʌðə/', rus: 'мазэ', topic: 'family', level: 'A1', example: 'My mother is a nurse.', exampleRu: 'Моя мама медсестра.' },
  { id: 'father', en: 'father', ru: 'папа', ipa: '/ˈfɑːðə/', rus: 'фазэ', topic: 'family', level: 'A1', example: 'His father works here.', exampleRu: 'Его отец работает здесь.' },
  { id: 'brother', en: 'brother', ru: 'брат', ipa: '/ˈbrʌðə/', rus: 'бразэ', topic: 'family', level: 'A1', example: 'I have two brothers.', exampleRu: 'У меня два брата.' },
  { id: 'sister', en: 'sister', ru: 'сестра', ipa: '/ˈsɪstə/', rus: 'систэ', topic: 'family', level: 'A1', example: 'My sister is ten.', exampleRu: 'Моей сестре десять.' },
  { id: 'son', en: 'son', ru: 'сын', ipa: '/sʌn/', rus: 'сан', topic: 'family', level: 'A1', example: 'Their son is a pilot.', exampleRu: 'Их сын — пилот.' },
  { id: 'daughter', en: 'daughter', ru: 'дочь', ipa: '/ˈdɔːtə/', rus: 'дотэ', topic: 'family', level: 'A1', example: 'My daughter loves cats.', exampleRu: 'Моя дочь любит кошек.' },
  { id: 'child', en: 'child', ru: 'ребёнок', ipa: '/tʃaɪld/', rus: 'чайлд', topic: 'family', level: 'A1', example: 'The child is sleeping.', exampleRu: 'Ребёнок спит.' },

  /* ---------- A1: цвета и признаки ---------- */
  { id: 'red', en: 'red', ru: 'красный', ipa: '/red/', rus: 'рэд', topic: 'adjectives', level: 'A1', example: 'A red apple.', exampleRu: 'Красное яблоко.' },
  { id: 'blue', en: 'blue', ru: 'синий', ipa: '/bluː/', rus: 'блу', topic: 'adjectives', level: 'A1', example: 'The sky is blue.', exampleRu: 'Небо синее.' },
  { id: 'green', en: 'green', ru: 'зелёный', ipa: '/ɡriːn/', rus: 'грин', topic: 'adjectives', level: 'A1', example: 'Green tea.', exampleRu: 'Зелёный чай.' },
  { id: 'black', en: 'black', ru: 'чёрный', ipa: '/blæk/', rus: 'блэк', topic: 'adjectives', level: 'A1', example: 'A black cat.', exampleRu: 'Чёрная кошка.' },
  { id: 'white', en: 'white', ru: 'белый', ipa: '/waɪt/', rus: 'уайт', topic: 'adjectives', level: 'A1', example: 'A white shirt.', exampleRu: 'Белая рубашка.' },
  { id: 'big', en: 'big', ru: 'большой', ipa: '/bɪɡ/', rus: 'биг', topic: 'adjectives', level: 'A1', example: 'A big city.', exampleRu: 'Большой город.' },
  { id: 'small', en: 'small', ru: 'маленький', ipa: '/smɔːl/', rus: 'смол', topic: 'adjectives', level: 'A1', example: 'A small room.', exampleRu: 'Маленькая комната.' },
  { id: 'good', en: 'good', ru: 'хороший', ipa: '/ɡʊd/', rus: 'гуд', topic: 'adjectives', level: 'A1', example: 'A good idea.', exampleRu: 'Хорошая идея.' },
  { id: 'bad', en: 'bad', ru: 'плохой', ipa: '/bæd/', rus: 'бэд', topic: 'adjectives', level: 'A1', example: 'Bad weather.', exampleRu: 'Плохая погода.' },
  { id: 'new', en: 'new', ru: 'новый', ipa: '/njuː/', rus: 'нью', topic: 'adjectives', level: 'A1', example: 'A new phone.', exampleRu: 'Новый телефон.' },
  { id: 'old', en: 'old', ru: 'старый', ipa: '/oʊld/', rus: 'оулд', topic: 'adjectives', level: 'A1', example: 'An old book.', exampleRu: 'Старая книга.' },
  { id: 'happy', en: 'happy', ru: 'счастливый', ipa: '/ˈhæpi/', rus: 'хэпи', topic: 'adjectives', level: 'A1', example: 'I am happy today.', exampleRu: 'Сегодня я счастлив.' },

  /* ---------- A1: время и место ---------- */
  { id: 'today', en: 'today', ru: 'сегодня', ipa: '/təˈdeɪ/', rus: 'тудэй', topic: 'time-place', level: 'A1', example: 'Today is Monday.', exampleRu: 'Сегодня понедельник.' },
  { id: 'tomorrow', en: 'tomorrow', ru: 'завтра', ipa: '/təˈmɒroʊ/', rus: 'тумороу', topic: 'time-place', level: 'A1', example: 'See you tomorrow.', exampleRu: 'Увидимся завтра.' },
  { id: 'yesterday', en: 'yesterday', ru: 'вчера', ipa: '/ˈjestədeɪ/', rus: 'йестэдэй', topic: 'time-place', level: 'A1', example: 'I was busy yesterday.', exampleRu: 'Вчера я был занят.' },
  { id: 'now', en: 'now', ru: 'сейчас', ipa: '/naʊ/', rus: 'нау', topic: 'time-place', level: 'A1', example: 'I am working now.', exampleRu: 'Я сейчас работаю.' },
  { id: 'here', en: 'here', ru: 'здесь', ipa: '/hɪə/', rus: 'хиэ', topic: 'time-place', level: 'A1', example: 'Come here.', exampleRu: 'Иди сюда.' },
  { id: 'there', en: 'there', ru: 'там', ipa: '/ðeə/', rus: 'зэа', topic: 'time-place', level: 'A1', example: 'She is over there.', exampleRu: 'Она вон там.' },
  { id: 'in', en: 'in', ru: 'в (внутри)', ipa: '/ɪn/', rus: 'ин', topic: 'time-place', level: 'A1', example: 'In the box.', exampleRu: 'В коробке.' },
  { id: 'on', en: 'on', ru: 'на (поверхности)', ipa: '/ɒn/', rus: 'он', topic: 'time-place', level: 'A1', example: 'On the table.', exampleRu: 'На столе.' },
  { id: 'at', en: 'at', ru: 'у, в (точке)', ipa: '/æt/', rus: 'эт', topic: 'time-place', level: 'A1', example: 'At home.', exampleRu: 'Дома.' },
  { id: 'with', en: 'with', ru: 'с (вместе)', ipa: '/wɪð/', rus: 'уиз', topic: 'time-place', level: 'A1', example: 'With my friend.', exampleRu: 'С моим другом.' },

  /* ---------- A1: вопросительные слова ---------- */
  { id: 'what', en: 'what', ru: 'что, какой', ipa: '/wɒt/', rus: 'уот', topic: 'questions', level: 'A1', example: 'What is this?', exampleRu: 'Что это?' },
  { id: 'where', en: 'where', ru: 'где, куда', ipa: '/weə/', rus: 'уэа', topic: 'questions', level: 'A1', example: 'Where do you live?', exampleRu: 'Где ты живёшь?' },
  { id: 'when', en: 'when', ru: 'когда', ipa: '/wen/', rus: 'уэн', topic: 'questions', level: 'A1', example: 'When does it start?', exampleRu: 'Когда это начинается?' },
  { id: 'who', en: 'who', ru: 'кто', ipa: '/huː/', rus: 'ху', topic: 'questions', level: 'A1', example: 'Who is that?', exampleRu: 'Кто это?' },
  { id: 'why', en: 'why', ru: 'почему', ipa: '/waɪ/', rus: 'уай', topic: 'questions', level: 'A1', example: 'Why are you late?', exampleRu: 'Почему ты опоздал?' },
  { id: 'how', en: 'how', ru: 'как', ipa: '/haʊ/', rus: 'хау', topic: 'questions', level: 'A1', example: 'How are you?', exampleRu: 'Как дела?' },
  { id: 'how-much', en: 'how much', ru: 'сколько (неисчисл.)', ipa: '/haʊ mʌtʃ/', rus: 'хау мач', topic: 'questions', level: 'A1', example: 'How much is it?', exampleRu: 'Сколько это стоит?' },
  { id: 'how-many', en: 'how many', ru: 'сколько (исчисл.)', ipa: '/haʊ ˈmeni/', rus: 'хау мэни', topic: 'questions', level: 'A1', example: 'How many people?', exampleRu: 'Сколько человек?' },

  /* ---------- A1: глаголы повседневных действий ---------- */
  { id: 'study', en: 'to study', ru: 'учиться, изучать', ipa: '/tə ˈstʌdi/', rus: 'ту стади', topic: 'daily-verbs', level: 'A1', example: 'I study English.', exampleRu: 'Я изучаю английский.' },
  { id: 'read', en: 'to read', ru: 'читать', ipa: '/tə riːd/', rus: 'ту рид', topic: 'daily-verbs', level: 'A1', example: 'She reads every day.', exampleRu: 'Она читает каждый день.' },
  { id: 'write', en: 'to write', ru: 'писать', ipa: '/tə raɪt/', rus: 'ту райт', topic: 'daily-verbs', level: 'A1', example: 'I write letters.', exampleRu: 'Я пишу письма.' },
  { id: 'eat', en: 'to eat', ru: 'есть, кушать', ipa: '/tə iːt/', rus: 'ту ит', topic: 'daily-verbs', level: 'A1', example: 'We eat at seven.', exampleRu: 'Мы едим в семь.' },
  { id: 'drink', en: 'to drink', ru: 'пить', ipa: '/tə drɪŋk/', rus: 'ту дринк', topic: 'daily-verbs', level: 'A1', example: 'He drinks coffee.', exampleRu: 'Он пьёт кофе.' },
  { id: 'sleep', en: 'to sleep', ru: 'спать', ipa: '/tə sliːp/', rus: 'ту слип', topic: 'daily-verbs', level: 'A1', example: 'I sleep eight hours.', exampleRu: 'Я сплю восемь часов.' },
  { id: 'play', en: 'to play', ru: 'играть', ipa: '/tə pleɪ/', rus: 'ту плэй', topic: 'daily-verbs', level: 'A1', example: 'They play football.', exampleRu: 'Они играют в футбол.' },
  { id: 'watch', en: 'to watch', ru: 'смотреть', ipa: '/tə wɒtʃ/', rus: 'ту уотч', topic: 'daily-verbs', level: 'A1', example: 'I watch films.', exampleRu: 'Я смотрю фильмы.' },
  { id: 'listen', en: 'to listen', ru: 'слушать', ipa: '/tə ˈlɪsn/', rus: 'ту лисн', topic: 'daily-verbs', level: 'A1', example: 'She listens to music.', exampleRu: 'Она слушает музыку.' },
  { id: 'drive', en: 'to drive', ru: 'водить машину', ipa: '/tə draɪv/', rus: 'ту драйв', topic: 'daily-verbs', level: 'A1', example: 'He drives to work.', exampleRu: 'Он ездит на работу на машине.' },
  { id: 'cook', en: 'to cook', ru: 'готовить', ipa: '/tə kʊk/', rus: 'ту кук', topic: 'daily-verbs', level: 'A1', example: 'I cook dinner.', exampleRu: 'Я готовлю ужин.' },
  { id: 'swim', en: 'to swim', ru: 'плавать', ipa: '/tə swɪm/', rus: 'ту суим', topic: 'daily-verbs', level: 'A1', example: 'Can you swim?', exampleRu: 'Ты умеешь плавать?' },
  { id: 'help', en: 'to help', ru: 'помогать', ipa: '/tə help/', rus: 'ту хэлп', topic: 'daily-verbs', level: 'A1', example: 'Can you help me?', exampleRu: 'Можешь мне помочь?' },
  { id: 'open', en: 'to open', ru: 'открывать', ipa: '/tə ˈoʊpən/', rus: 'ту оупэн', topic: 'daily-verbs', level: 'A1', example: 'Open the window, please.', exampleRu: 'Открой окно, пожалуйста.' },
  { id: 'close', en: 'to close', ru: 'закрывать', ipa: '/tə kloʊz/', rus: 'ту клоуз', topic: 'daily-verbs', level: 'A1', example: 'Close the door.', exampleRu: 'Закрой дверь.' },
  { id: 'give', en: 'to give', ru: 'давать', ipa: '/tə ɡɪv/', rus: 'ту гив', topic: 'daily-verbs', level: 'A1', example: 'Give me the key.', exampleRu: 'Дай мне ключ.' },
  { id: 'take', en: 'to take', ru: 'брать', ipa: '/tə teɪk/', rus: 'ту тэйк', topic: 'daily-verbs', level: 'A1', example: 'Take your bag.', exampleRu: 'Возьми свою сумку.' },
  { id: 'buy', en: 'to buy', ru: 'покупать', ipa: '/tə baɪ/', rus: 'ту бай', topic: 'daily-verbs', level: 'A1', example: 'I buy bread here.', exampleRu: 'Я покупаю здесь хлеб.' },
  { id: 'start', en: 'to start', ru: 'начинать', ipa: '/tə stɑːt/', rus: 'ту старт', topic: 'daily-verbs', level: 'A1', example: 'The film starts at eight.', exampleRu: 'Фильм начинается в восемь.' },
  { id: 'finish', en: 'to finish', ru: 'заканчивать', ipa: '/tə ˈfɪnɪʃ/', rus: 'ту финиш', topic: 'daily-verbs', level: 'A1', example: 'I finish work at six.', exampleRu: 'Я заканчиваю работу в шесть.' },

  /* ---------- A1: места ---------- */
  { id: 'school', en: 'school', ru: 'школа', ipa: '/skuːl/', rus: 'скул', topic: 'places', level: 'A1', example: 'My son goes to school.', exampleRu: 'Мой сын ходит в школу.' },
  { id: 'office', en: 'office', ru: 'офис', ipa: '/ˈɒfɪs/', rus: 'офис', topic: 'places', level: 'A1', example: 'She works in an office.', exampleRu: 'Она работает в офисе.' },
  { id: 'shop', en: 'shop', ru: 'магазин', ipa: '/ʃɒp/', rus: 'шоп', topic: 'places', level: 'A1', example: 'The shop is closed.', exampleRu: 'Магазин закрыт.' },
  { id: 'home', en: 'home', ru: 'дом (домой)', ipa: '/hoʊm/', rus: 'хоум', topic: 'places', level: 'A1', example: 'I am at home.', exampleRu: 'Я дома.' },
  { id: 'street', en: 'street', ru: 'улица', ipa: '/striːt/', rus: 'стрит', topic: 'places', level: 'A1', example: 'A quiet street.', exampleRu: 'Тихая улица.' },
  { id: 'room', en: 'room', ru: 'комната', ipa: '/ruːm/', rus: 'рум', topic: 'places', level: 'A1', example: 'My room is small.', exampleRu: 'Моя комната маленькая.' },
  { id: 'kitchen', en: 'kitchen', ru: 'кухня', ipa: '/ˈkɪtʃɪn/', rus: 'китчин', topic: 'places', level: 'A1', example: 'She is in the kitchen.', exampleRu: 'Она на кухне.' },
  { id: 'car', en: 'car', ru: 'машина', ipa: '/kɑː/', rus: 'ка', topic: 'places', level: 'A1', example: 'I have a new car.', exampleRu: 'У меня новая машина.' },
  { id: 'station', en: 'station', ru: 'вокзал, станция', ipa: '/ˈsteɪʃn/', rus: 'стэйшн', topic: 'places', level: 'A1', example: 'Meet me at the station.', exampleRu: 'Встретимся на вокзале.' },
  { id: 'restaurant', en: 'restaurant', ru: 'ресторан', ipa: '/ˈrestrɒnt/', rus: 'рестрон', topic: 'places', level: 'A1', example: 'A good restaurant.', exampleRu: 'Хороший ресторан.' },

  /* ---------- A1: дни недели и время ---------- */
  { id: 'monday', en: 'Monday', ru: 'понедельник', ipa: '/ˈmʌndeɪ/', rus: 'мандэй', topic: 'days', level: 'A1', example: 'I work on Monday.', exampleRu: 'Я работаю в понедельник.' },
  { id: 'tuesday', en: 'Tuesday', ru: 'вторник', ipa: '/ˈtjuːzdeɪ/', rus: 'тьюздэй', topic: 'days', level: 'A1', example: 'See you on Tuesday.', exampleRu: 'Увидимся во вторник.' },
  { id: 'wednesday', en: 'Wednesday', ru: 'среда', ipa: '/ˈwenzdeɪ/', rus: 'уэнздэй', topic: 'days', level: 'A1', example: 'Wednesday is busy.', exampleRu: 'Среда загруженная.' },
  { id: 'thursday', en: 'Thursday', ru: 'четверг', ipa: '/ˈθɜːzdeɪ/', rus: 'сёздэй', topic: 'days', level: 'A1', example: 'On Thursday I study.', exampleRu: 'В четверг я учусь.' },
  { id: 'friday', en: 'Friday', ru: 'пятница', ipa: '/ˈfraɪdeɪ/', rus: 'фрайдэй', topic: 'days', level: 'A1', example: 'Friday is my day off.', exampleRu: 'Пятница — мой выходной.' },
  { id: 'saturday', en: 'Saturday', ru: 'суббота', ipa: '/ˈsætədeɪ/', rus: 'сэтэдэй', topic: 'days', level: 'A1', example: 'We rest on Saturday.', exampleRu: 'Мы отдыхаем в субботу.' },
  { id: 'sunday', en: 'Sunday', ru: 'воскресенье', ipa: '/ˈsʌndeɪ/', rus: 'сандэй', topic: 'days', level: 'A1', example: 'Sunday is family day.', exampleRu: 'Воскресенье — семейный день.' },
  { id: 'week', en: 'week', ru: 'неделя', ipa: '/wiːk/', rus: 'уик', topic: 'days', level: 'A1', example: 'Next week I travel.', exampleRu: 'На следующей неделе я путешествую.' },
  { id: 'month', en: 'month', ru: 'месяц', ipa: '/mʌnθ/', rus: 'манс', topic: 'days', level: 'A1', example: 'In one month.', exampleRu: 'Через месяц.' },
  { id: 'year', en: 'year', ru: 'год', ipa: '/jɪə/', rus: 'йиэ', topic: 'days', level: 'A1', example: 'Happy New Year!', exampleRu: 'С Новым годом!' },
  { id: 'morning', en: 'morning', ru: 'утро', ipa: '/ˈmɔːnɪŋ/', rus: 'монин', topic: 'days', level: 'A1', example: 'In the morning I run.', exampleRu: 'Утром я бегаю.' },
  { id: 'evening', en: 'evening', ru: 'вечер', ipa: '/ˈiːvnɪŋ/', rus: 'ивнин', topic: 'days', level: 'A1', example: 'In the evening we talk.', exampleRu: 'Вечером мы разговариваем.' },
  { id: 'night', en: 'night', ru: 'ночь', ipa: '/naɪt/', rus: 'найт', topic: 'days', level: 'A1', example: 'Good night!', exampleRu: 'Спокойной ночи!' },

  /* ---------- A1: частота ---------- */
  { id: 'always', en: 'always', ru: 'всегда', ipa: '/ˈɔːlweɪz/', rus: 'олуэйз', topic: 'frequency', level: 'A1', example: 'I always drink tea.', exampleRu: 'Я всегда пью чай.' },
  { id: 'usually', en: 'usually', ru: 'обычно', ipa: '/ˈjuːʒuəli/', rus: 'южуэли', topic: 'frequency', level: 'A1', example: 'She usually works late.', exampleRu: 'Обычно она работает допоздна.' },
  { id: 'often', en: 'often', ru: 'часто', ipa: '/ˈɒfn/', rus: 'офн', topic: 'frequency', level: 'A1', example: 'We often meet.', exampleRu: 'Мы часто встречаемся.' },
  { id: 'sometimes', en: 'sometimes', ru: 'иногда', ipa: '/ˈsʌmtaɪmz/', rus: 'самтаймз', topic: 'frequency', level: 'A1', example: 'Sometimes I cook.', exampleRu: 'Иногда я готовлю.' },
  { id: 'never', en: 'never', ru: 'никогда', ipa: '/ˈnevə/', rus: 'нэвэ', topic: 'frequency', level: 'A1', example: 'He never sleeps late.', exampleRu: 'Он никогда не спит долго.' },

  /* ---------- A1: предметы ---------- */
  { id: 'table', en: 'table', ru: 'стол', ipa: '/ˈteɪbl/', rus: 'тэйбл', topic: 'objects', level: 'A1', example: 'The keys are on the table.', exampleRu: 'Ключи на столе.' },
  { id: 'chair', en: 'chair', ru: 'стул', ipa: '/tʃeə/', rus: 'чеэ', topic: 'objects', level: 'A1', example: 'Take a chair.', exampleRu: 'Возьми стул.' },
  { id: 'phone', en: 'phone', ru: 'телефон', ipa: '/foʊn/', rus: 'фоун', topic: 'objects', level: 'A1', example: 'My phone is old.', exampleRu: 'Мой телефон старый.' },
  { id: 'computer', en: 'computer', ru: 'компьютер', ipa: '/kəmˈpjuːtə/', rus: 'кэмпьютэ', topic: 'objects', level: 'A1', example: 'I work on a computer.', exampleRu: 'Я работаю за компьютером.' },
  { id: 'key', en: 'key', ru: 'ключ', ipa: '/kiː/', rus: 'ки', topic: 'objects', level: 'A1', example: 'Where is my key?', exampleRu: 'Где мой ключ?' },
  { id: 'bag', en: 'bag', ru: 'сумка', ipa: '/bæɡ/', rus: 'бэг', topic: 'objects', level: 'A1', example: 'A heavy bag.', exampleRu: 'Тяжёлая сумка.' },
  { id: 'money', en: 'money', ru: 'деньги', ipa: '/ˈmʌni/', rus: 'мани', topic: 'objects', level: 'A1', example: 'I have no money.', exampleRu: 'У меня нет денег.' },
  { id: 'door', en: 'door', ru: 'дверь', ipa: '/dɔː/', rus: 'до', topic: 'objects', level: 'A1', example: 'Close the door, please.', exampleRu: 'Закрой дверь, пожалуйста.' },
  { id: 'window', en: 'window', ru: 'окно', ipa: '/ˈwɪndoʊ/', rus: 'уиндоу', topic: 'objects', level: 'A1', example: 'Open the window.', exampleRu: 'Открой окно.' },

  /* ---------- A1: еда ---------- */
  { id: 'bread', en: 'bread', ru: 'хлеб', ipa: '/bred/', rus: 'брэд', topic: 'food', level: 'A1', example: 'Fresh bread.', exampleRu: 'Свежий хлеб.' },
  { id: 'milk', en: 'milk', ru: 'молоко', ipa: '/mɪlk/', rus: 'милк', topic: 'food', level: 'A1', example: 'Milk with coffee.', exampleRu: 'Молоко с кофе.' },
  { id: 'coffee', en: 'coffee', ru: 'кофе', ipa: '/ˈkɒfi/', rus: 'кофи', topic: 'food', level: 'A1', example: 'Two coffees, please.', exampleRu: 'Два кофе, пожалуйста.' },
  { id: 'tea', en: 'tea', ru: 'чай', ipa: '/tiː/', rus: 'ти', topic: 'food', level: 'A1', example: 'I drink tea in the morning.', exampleRu: 'Утром я пью чай.' },
  { id: 'apple', en: 'apple', ru: 'яблоко', ipa: '/ˈæpl/', rus: 'эпл', topic: 'food', level: 'A1', example: 'An apple a day.', exampleRu: 'По яблоку в день.' },
  { id: 'meat', en: 'meat', ru: 'мясо', ipa: '/miːt/', rus: 'мит', topic: 'food', level: 'A1', example: 'I don’t eat meat.', exampleRu: 'Я не ем мясо.' },

  /* ---------- A1: особые формы множественного числа ---------- */
  { id: 'children', en: 'children', ru: 'дети (мн. от child)', ipa: '/ˈtʃɪldrən/', rus: 'чилдрэн', topic: 'plurals', level: 'A1', example: 'The children are at school.', exampleRu: 'Дети в школе.' },
  { id: 'people', en: 'people', ru: 'люди (мн. от person)', ipa: '/ˈpiːpl/', rus: 'пипл', topic: 'plurals', level: 'A1', example: 'Many people live here.', exampleRu: 'Здесь живёт много людей.' },
  { id: 'men', en: 'men', ru: 'мужчины (мн. от man)', ipa: '/men/', rus: 'мэн', topic: 'plurals', level: 'A1', example: 'Two men are waiting.', exampleRu: 'Двое мужчин ждут.' },
  { id: 'women', en: 'women', ru: 'женщины (мн. от woman)', ipa: '/ˈwɪmɪn/', rus: 'уимин', topic: 'plurals', level: 'A1', example: 'The women work here.', exampleRu: 'Эти женщины работают здесь.' },

  /* ---------- A1: предлоги ---------- */
  { id: 'under', en: 'under', ru: 'под', ipa: '/ˈʌndə/', rus: 'андэ', topic: 'prepositions', level: 'A1', example: 'The cat is under the table.', exampleRu: 'Кот под столом.' },
  { id: 'behind', en: 'behind', ru: 'за, позади', ipa: '/bɪˈhaɪnd/', rus: 'бихайнд', topic: 'prepositions', level: 'A1', example: 'The car is behind the house.', exampleRu: 'Машина за домом.' },
  { id: 'between', en: 'between', ru: 'между', ipa: '/bɪˈtwiːn/', rus: 'битуин', topic: 'prepositions', level: 'A1', example: 'Between the shop and the bank.', exampleRu: 'Между магазином и банком.' },
  { id: 'next-to', en: 'next to', ru: 'рядом с', ipa: '/ˈnekst tuː/', rus: 'нэкст ту', topic: 'prepositions', level: 'A1', example: 'Sit next to me.', exampleRu: 'Сядь рядом со мной.' },
  { id: 'from', en: 'from', ru: 'из, от', ipa: '/frɒm/', rus: 'фром', topic: 'prepositions', level: 'A1', example: 'I am from Russia.', exampleRu: 'Я из России.' },
  { id: 'to', en: 'to', ru: 'в, к (направление)', ipa: '/tuː/', rus: 'ту', topic: 'prepositions', level: 'A1', example: 'I go to work.', exampleRu: 'Я иду на работу.' },

  /* ---------- A2: неправильные глаголы в прошедшем ---------- */
  { id: 'was', en: 'was', ru: 'был (для I, he, she, it)', ipa: '/wɒz/', rus: 'уоз', topic: 'past-verbs', level: 'A2', example: 'I was at home.', exampleRu: 'Я был дома.' },
  { id: 'were', en: 'were', ru: 'были (для you, we, they)', ipa: '/wɜː/', rus: 'уёр', topic: 'past-verbs', level: 'A2', example: 'They were late.', exampleRu: 'Они опоздали.' },
  { id: 'went', en: 'went', ru: 'пошёл, поехал (от go)', ipa: '/went/', rus: 'уэнт', topic: 'past-verbs', level: 'A2', example: 'I went to London.', exampleRu: 'Я ездил в Лондон.' },
  { id: 'saw', en: 'saw', ru: 'увидел (от see)', ipa: '/sɔː/', rus: 'со', topic: 'past-verbs', level: 'A2', example: 'I saw him yesterday.', exampleRu: 'Я видел его вчера.' },
  { id: 'had', en: 'had', ru: 'имел (от have)', ipa: '/hæd/', rus: 'хэд', topic: 'past-verbs', level: 'A2', example: 'We had a good time.', exampleRu: 'Мы хорошо провели время.' },
  { id: 'did', en: 'did', ru: 'сделал (от do)', ipa: '/dɪd/', rus: 'дид', topic: 'past-verbs', level: 'A2', example: 'What did you do?', exampleRu: 'Что ты делал?' },
  { id: 'made', en: 'made', ru: 'сделал, создал (от make)', ipa: '/meɪd/', rus: 'мэйд', topic: 'past-verbs', level: 'A2', example: 'She made a cake.', exampleRu: 'Она испекла торт.' },
  { id: 'said', en: 'said', ru: 'сказал (от say)', ipa: '/sed/', rus: 'сэд', topic: 'past-verbs', level: 'A2', example: 'He said nothing.', exampleRu: 'Он ничего не сказал.' },
  { id: 'came', en: 'came', ru: 'пришёл (от come)', ipa: '/keɪm/', rus: 'кэйм', topic: 'past-verbs', level: 'A2', example: 'She came late.', exampleRu: 'Она пришла поздно.' },
  { id: 'took', en: 'took', ru: 'взял (от take)', ipa: '/tʊk/', rus: 'тук', topic: 'past-verbs', level: 'A2', example: 'I took the bus.', exampleRu: 'Я поехал на автобусе.' },
  { id: 'gave', en: 'gave', ru: 'дал (от give)', ipa: '/ɡeɪv/', rus: 'гэйв', topic: 'past-verbs', level: 'A2', example: 'He gave me a book.', exampleRu: 'Он дал мне книгу.' },
  { id: 'got', en: 'got', ru: 'получил (от get)', ipa: '/ɡɒt/', rus: 'гот', topic: 'past-verbs', level: 'A2', example: 'I got your letter.', exampleRu: 'Я получил твоё письмо.' },
  { id: 'knew', en: 'knew', ru: 'знал (от know)', ipa: '/njuː/', rus: 'нью', topic: 'past-verbs', level: 'A2', example: 'I knew the answer.', exampleRu: 'Я знал ответ.' },
  { id: 'thought', en: 'thought', ru: 'думал (от think)', ipa: '/θɔːt/', rus: 'сот', topic: 'past-verbs', level: 'A2', example: 'I thought so.', exampleRu: 'Я так и думал.' },
  { id: 'spoke', en: 'spoke', ru: 'говорил (от speak)', ipa: '/spoʊk/', rus: 'споук', topic: 'past-verbs', level: 'A2', example: 'We spoke on Monday.', exampleRu: 'Мы говорили в понедельник.' },
  { id: 'wrote', en: 'wrote', ru: 'написал (от write)', ipa: '/roʊt/', rus: 'роут', topic: 'past-verbs', level: 'A2', example: 'She wrote a letter.', exampleRu: 'Она написала письмо.' },
  { id: 'ate', en: 'ate', ru: 'съел (от eat)', ipa: '/eɪt/', rus: 'эйт', topic: 'past-verbs', level: 'A2', example: 'We ate at home.', exampleRu: 'Мы поели дома.' },
  { id: 'drank', en: 'drank', ru: 'выпил (от drink)', ipa: '/dræŋk/', rus: 'дрэнк', topic: 'past-verbs', level: 'A2', example: 'He drank the milk.', exampleRu: 'Он выпил молоко.' },
  { id: 'bought', en: 'bought', ru: 'купил (от buy)', ipa: '/bɔːt/', rus: 'бот', topic: 'past-verbs', level: 'A2', example: 'I bought a car.', exampleRu: 'Я купил машину.' },

  /* ---------- A2: слова-маркеры времени ---------- */
  { id: 'ago', en: 'ago', ru: 'назад (о времени)', ipa: '/əˈɡoʊ/', rus: 'эгоу', topic: 'time-markers', level: 'A2', example: 'Two days ago.', exampleRu: 'Два дня назад.' },
  { id: 'last', en: 'last', ru: 'прошлый', ipa: '/lɑːst/', rus: 'ласт', topic: 'time-markers', level: 'A2', example: 'Last week I was ill.', exampleRu: 'На прошлой неделе я болел.' },
  { id: 'then', en: 'then', ru: 'тогда, потом', ipa: '/ðen/', rus: 'зэн', topic: 'time-markers', level: 'A2', example: 'And then we left.', exampleRu: 'А потом мы ушли.' },
  { id: 'before', en: 'before', ru: 'до, перед', ipa: '/bɪˈfɔː/', rus: 'бифо', topic: 'time-markers', level: 'A2', example: 'Before breakfast.', exampleRu: 'До завтрака.' },
  { id: 'after', en: 'after', ru: 'после', ipa: '/ˈɑːftə/', rus: 'афтэ', topic: 'time-markers', level: 'A2', example: 'After work I rest.', exampleRu: 'После работы я отдыхаю.' },
  { id: 'soon', en: 'soon', ru: 'скоро', ipa: '/suːn/', rus: 'сун', topic: 'time-markers', level: 'A2', example: 'See you soon!', exampleRu: 'До скорого!' },
  { id: 'later', en: 'later', ru: 'позже', ipa: '/ˈleɪtə/', rus: 'лэйтэ', topic: 'time-markers', level: 'A2', example: 'I will call you later.', exampleRu: 'Я позвоню тебе позже.' },
  { id: 'weekend', en: 'weekend', ru: 'выходные', ipa: '/ˌwiːkˈend/', rus: 'уикэнд', topic: 'time-markers', level: 'A2', example: 'Have a nice weekend!', exampleRu: 'Хороших выходных!' },
  { id: 'holiday', en: 'holiday', ru: 'отпуск, праздник', ipa: '/ˈhɒlədeɪ/', rus: 'холидэй', topic: 'time-markers', level: 'A2', example: 'We are on holiday.', exampleRu: 'Мы в отпуске.' },

  /* ---------- A2: действия для длительного времени ---------- */
  { id: 'wait', en: 'to wait', ru: 'ждать', ipa: '/tə weɪt/', rus: 'ту уэйт', topic: 'action-verbs', level: 'A2', example: 'I am waiting for you.', exampleRu: 'Я тебя жду.' },
  { id: 'run', en: 'to run', ru: 'бежать', ipa: '/tə rʌn/', rus: 'ту ран', topic: 'action-verbs', level: 'A2', example: 'He is running fast.', exampleRu: 'Он быстро бежит.' },
  { id: 'sit', en: 'to sit', ru: 'сидеть', ipa: '/tə sɪt/', rus: 'ту сит', topic: 'action-verbs', level: 'A2', example: 'She is sitting there.', exampleRu: 'Она сидит там.' },
  { id: 'stand', en: 'to stand', ru: 'стоять', ipa: '/tə stænd/', rus: 'ту стэнд', topic: 'action-verbs', level: 'A2', example: 'They are standing outside.', exampleRu: 'Они стоят снаружи.' },
  { id: 'talk', en: 'to talk', ru: 'разговаривать', ipa: '/tə tɔːk/', rus: 'ту ток', topic: 'action-verbs', level: 'A2', example: 'We are talking now.', exampleRu: 'Мы сейчас разговариваем.' },
  { id: 'wear', en: 'to wear', ru: 'носить (одежду)', ipa: '/tə weə/', rus: 'ту уэа', topic: 'action-verbs', level: 'A2', example: 'She is wearing a red dress.', exampleRu: 'На ней красное платье.' },
  { id: 'rain', en: 'to rain', ru: 'идти (о дожде)', ipa: '/tə reɪn/', rus: 'ту рэйн', topic: 'action-verbs', level: 'A2', example: 'It is raining.', exampleRu: 'Идёт дождь.' },
  { id: 'call', en: 'to call', ru: 'звонить, называть', ipa: '/tə kɔːl/', rus: 'ту кол', topic: 'action-verbs', level: 'A2', example: 'I will call you later.', exampleRu: 'Я позвоню тебе позже.' },

  /* ---------- A2: прилагательные для сравнения ---------- */
  { id: 'tall', en: 'tall', ru: 'высокий (о человеке)', ipa: '/tɔːl/', rus: 'тол', topic: 'comparison', level: 'A2', example: 'He is taller than me.', exampleRu: 'Он выше меня.' },
  { id: 'short', en: 'short', ru: 'короткий, низкий', ipa: '/ʃɔːt/', rus: 'шорт', topic: 'comparison', level: 'A2', example: 'A short answer.', exampleRu: 'Короткий ответ.' },
  { id: 'fast', en: 'fast', ru: 'быстрый', ipa: '/fɑːst/', rus: 'фаст', topic: 'comparison', level: 'A2', example: 'A fast car.', exampleRu: 'Быстрая машина.' },
  { id: 'slow', en: 'slow', ru: 'медленный', ipa: '/sloʊ/', rus: 'слоу', topic: 'comparison', level: 'A2', example: 'The train is slow.', exampleRu: 'Поезд медленный.' },
  { id: 'easy', en: 'easy', ru: 'лёгкий, простой', ipa: '/ˈiːzi/', rus: 'изи', topic: 'comparison', level: 'A2', example: 'An easy question.', exampleRu: 'Лёгкий вопрос.' },
  { id: 'difficult', en: 'difficult', ru: 'трудный', ipa: '/ˈdɪfɪkəlt/', rus: 'дификэлт', topic: 'comparison', level: 'A2', example: 'English is not difficult.', exampleRu: 'Английский не трудный.' },
  { id: 'expensive', en: 'expensive', ru: 'дорогой', ipa: '/ɪkˈspensɪv/', rus: 'икспэнсив', topic: 'comparison', level: 'A2', example: 'This phone is expensive.', exampleRu: 'Этот телефон дорогой.' },
  { id: 'cheap', en: 'cheap', ru: 'дешёвый', ipa: '/tʃiːp/', rus: 'чип', topic: 'comparison', level: 'A2', example: 'A cheap hotel.', exampleRu: 'Дешёвая гостиница.' },
  { id: 'hot', en: 'hot', ru: 'горячий, жаркий', ipa: '/hɒt/', rus: 'хот', topic: 'comparison', level: 'A2', example: 'The tea is hot.', exampleRu: 'Чай горячий.' },
  { id: 'cold', en: 'cold', ru: 'холодный', ipa: '/koʊld/', rus: 'коулд', topic: 'comparison', level: 'A2', example: 'A cold morning.', exampleRu: 'Холодное утро.' },
  { id: 'young', en: 'young', ru: 'молодой', ipa: '/jʌŋ/', rus: 'янг', topic: 'comparison', level: 'A2', example: 'She is very young.', exampleRu: 'Она очень молодая.' },
  { id: 'beautiful', en: 'beautiful', ru: 'красивый', ipa: '/ˈbjuːtɪfl/', rus: 'бьютифул', topic: 'comparison', level: 'A2', example: 'A beautiful city.', exampleRu: 'Красивый город.' },
  { id: 'interesting', en: 'interesting', ru: 'интересный', ipa: '/ˈɪntrəstɪŋ/', rus: 'интрэстин', topic: 'comparison', level: 'A2', example: 'An interesting book.', exampleRu: 'Интересная книга.' },
  { id: 'important', en: 'important', ru: 'важный', ipa: '/ɪmˈpɔːtnt/', rus: 'импотнт', topic: 'comparison', level: 'A2', example: 'This is important.', exampleRu: 'Это важно.' },
  { id: 'better', en: 'better', ru: 'лучше (от good)', ipa: '/ˈbetə/', rus: 'бэтэ', topic: 'comparison', level: 'A2', example: 'This is better.', exampleRu: 'Это лучше.' },
  { id: 'best', en: 'best', ru: 'лучший (от good)', ipa: '/best/', rus: 'бэст', topic: 'comparison', level: 'A2', example: 'My best friend.', exampleRu: 'Мой лучший друг.' },
  { id: 'worse', en: 'worse', ru: 'хуже (от bad)', ipa: '/wɜːs/', rus: 'уёрс', topic: 'comparison', level: 'A2', example: 'The weather is worse today.', exampleRu: 'Сегодня погода хуже.' },
  { id: 'than', en: 'than', ru: 'чем (при сравнении)', ipa: '/ðæn/', rus: 'зэн', topic: 'comparison', level: 'A2', example: 'Bigger than a house.', exampleRu: 'Больше, чем дом.' },

  /* ---------- A2: количество ---------- */
  { id: 'some', en: 'some', ru: 'немного, несколько', ipa: '/sʌm/', rus: 'сам', topic: 'quantifiers', level: 'A2', example: 'I need some water.', exampleRu: 'Мне нужно немного воды.' },
  { id: 'any', en: 'any', ru: 'сколько-нибудь, любой', ipa: '/ˈeni/', rus: 'эни', topic: 'quantifiers', level: 'A2', example: 'Have you got any money?', exampleRu: 'У тебя есть деньги?' },
  { id: 'much', en: 'much', ru: 'много (с неисчисляемыми)', ipa: '/mʌtʃ/', rus: 'мач', topic: 'quantifiers', level: 'A2', example: 'How much time?', exampleRu: 'Сколько времени?' },
  { id: 'many', en: 'many', ru: 'много (с исчисляемыми)', ipa: '/ˈmeni/', rus: 'мэни', topic: 'quantifiers', level: 'A2', example: 'Too many people.', exampleRu: 'Слишком много людей.' },
  { id: 'a-lot-of', en: 'a lot of', ru: 'много (универсально)', ipa: '/ə ˈlɒt əv/', rus: 'э лот ов', topic: 'quantifiers', level: 'A2', example: 'A lot of work.', exampleRu: 'Много работы.' },
  { id: 'few', en: 'a few', ru: 'мало, несколько (исчисл.)', ipa: '/ə fjuː/', rus: 'э фью', topic: 'quantifiers', level: 'A2', example: 'A few friends.', exampleRu: 'Несколько друзей.' },
  { id: 'little', en: 'a little', ru: 'мало, немного (неисчисл.)', ipa: '/ə ˈlɪtl/', rus: 'э литл', topic: 'quantifiers', level: 'A2', example: 'A little sugar.', exampleRu: 'Немного сахара.' },
  { id: 'enough', en: 'enough', ru: 'достаточно', ipa: '/ɪˈnʌf/', rus: 'инаф', topic: 'quantifiers', level: 'A2', example: 'That is enough.', exampleRu: 'Этого достаточно.' },

  /* ---------- A2: связки ---------- */
  { id: 'because', en: 'because', ru: 'потому что', ipa: '/bɪˈkɒz/', rus: 'бикоз', topic: 'connectors', level: 'A2', example: 'I stayed because it rained.', exampleRu: 'Я остался, потому что шёл дождь.' },
  { id: 'but', en: 'but', ru: 'но', ipa: '/bʌt/', rus: 'бат', topic: 'connectors', level: 'A2', example: 'Cheap but good.', exampleRu: 'Дёшево, но хорошо.' },
  { id: 'and', en: 'and', ru: 'и', ipa: '/ænd/', rus: 'энд', topic: 'connectors', level: 'A2', example: 'Bread and milk.', exampleRu: 'Хлеб и молоко.' },
  { id: 'or', en: 'or', ru: 'или', ipa: '/ɔː/', rus: 'о', topic: 'connectors', level: 'A2', example: 'Tea or coffee?', exampleRu: 'Чай или кофе?' },
  { id: 'also', en: 'also', ru: 'также, тоже', ipa: '/ˈɔːlsoʊ/', rus: 'олсоу', topic: 'connectors', level: 'A2', example: 'I also speak French.', exampleRu: 'Я также говорю по-французски.' },
  { id: 'very', en: 'very', ru: 'очень', ipa: '/ˈveri/', rus: 'вэри', topic: 'connectors', level: 'A2', example: 'Very good!', exampleRu: 'Очень хорошо!' },
  { id: 'will', en: 'will', ru: 'вспомогательный глагол будущего', ipa: '/wɪl/', rus: 'уил', topic: 'connectors', level: 'A2', example: 'I will help you.', exampleRu: 'Я тебе помогу.' },
  { id: 'going-to', en: 'going to', ru: 'собираться (о планах)', ipa: '/ˈɡoʊɪŋ tuː/', rus: 'гоуин ту', topic: 'connectors', level: 'A2', example: 'I am going to travel.', exampleRu: 'Я собираюсь путешествовать.' },

  /* ---------- B1: третья форма глагола (participle) ---------- */
  { id: 'been', en: 'been', ru: 'был (3-я форма от be)', ipa: '/biːn/', rus: 'бин', topic: 'participles', level: 'B1', example: 'I have been there.', exampleRu: 'Я там был.' },
  { id: 'gone', en: 'gone', ru: 'ушёл (3-я форма от go)', ipa: '/ɡɒn/', rus: 'гон', topic: 'participles', level: 'B1', example: 'He has gone home.', exampleRu: 'Он ушёл домой.' },
  { id: 'done', en: 'done', ru: 'сделан (3-я форма от do)', ipa: '/dʌn/', rus: 'дан', topic: 'participles', level: 'B1', example: 'The work is done.', exampleRu: 'Работа сделана.' },
  { id: 'seen', en: 'seen', ru: 'увиден (3-я форма от see)', ipa: '/siːn/', rus: 'син', topic: 'participles', level: 'B1', example: 'I have seen this film.', exampleRu: 'Я видел этот фильм.' },
  { id: 'taken', en: 'taken', ru: 'взят (3-я форма от take)', ipa: '/ˈteɪkən/', rus: 'тэйкэн', topic: 'participles', level: 'B1', example: 'The seat is taken.', exampleRu: 'Место занято.' },
  { id: 'given', en: 'given', ru: 'дан (3-я форма от give)', ipa: '/ˈɡɪvn/', rus: 'гивн', topic: 'participles', level: 'B1', example: 'We were given a map.', exampleRu: 'Нам дали карту.' },
  { id: 'written', en: 'written', ru: 'написан (3-я форма от write)', ipa: '/ˈrɪtn/', rus: 'ритн', topic: 'participles', level: 'B1', example: 'It was written in 1990.', exampleRu: 'Это было написано в 1990 году.' },
  { id: 'eaten', en: 'eaten', ru: 'съеден (3-я форма от eat)', ipa: '/ˈiːtn/', rus: 'итн', topic: 'participles', level: 'B1', example: 'Have you eaten?', exampleRu: 'Ты поел?' },
  { id: 'spoken', en: 'spoken', ru: 'сказан (3-я форма от speak)', ipa: '/ˈspoʊkən/', rus: 'споукэн', topic: 'participles', level: 'B1', example: 'English is spoken here.', exampleRu: 'Здесь говорят по-английски.' },
  { id: 'known', en: 'known', ru: 'известен (3-я форма от know)', ipa: '/noʊn/', rus: 'ноун', topic: 'participles', level: 'B1', example: 'I have known him for years.', exampleRu: 'Я знаю его много лет.' },
  { id: 'forgotten', en: 'forgotten', ru: 'забыт (3-я форма от forget)', ipa: '/fəˈɡɒtn/', rus: 'фэготн', topic: 'participles', level: 'B1', example: 'I have forgotten his name.', exampleRu: 'Я забыл его имя.' },
  { id: 'broken', en: 'broken', ru: 'сломан (3-я форма от break)', ipa: '/ˈbroʊkən/', rus: 'броукэн', topic: 'participles', level: 'B1', example: 'The window is broken.', exampleRu: 'Окно разбито.' },
  { id: 'built', en: 'built', ru: 'построен (3-я форма от build)', ipa: '/bɪlt/', rus: 'билт', topic: 'participles', level: 'B1', example: 'It was built in 1900.', exampleRu: 'Это построили в 1900 году.' },
  { id: 'found', en: 'found', ru: 'найден (3-я форма от find)', ipa: '/faʊnd/', rus: 'фаунд', topic: 'participles', level: 'B1', example: 'The keys were found.', exampleRu: 'Ключи нашлись.' },
  { id: 'lost', en: 'lost', ru: 'потерян (3-я форма от lose)', ipa: '/lɒst/', rus: 'лост', topic: 'participles', level: 'B1', example: 'I have lost my keys.', exampleRu: 'Я потерял ключи.' },
  { id: 'met', en: 'met', ru: 'встречен (3-я форма от meet)', ipa: '/met/', rus: 'мэт', topic: 'participles', level: 'B1', example: 'We have met before.', exampleRu: 'Мы уже встречались.' },
  { id: 'paid', en: 'paid', ru: 'оплачен (3-я форма от pay)', ipa: '/peɪd/', rus: 'пэйд', topic: 'participles', level: 'B1', example: 'The bill is paid.', exampleRu: 'Счёт оплачен.' },
  { id: 'sent', en: 'sent', ru: 'отправлен (3-я форма от send)', ipa: '/sent/', rus: 'сэнт', topic: 'participles', level: 'B1', example: 'The letter was sent.', exampleRu: 'Письмо отправлено.' },
  { id: 'told', en: 'told', ru: 'сказан (3-я форма от tell)', ipa: '/toʊld/', rus: 'тоулд', topic: 'participles', level: 'B1', example: 'I was told to wait.', exampleRu: 'Мне велели подождать.' },

  /* ---------- B1: маркеры Present Perfect ---------- */
  { id: 'ever', en: 'ever', ru: 'когда-либо', ipa: '/ˈevə/', rus: 'эвэ', topic: 'perfect-markers', level: 'B1', example: 'Have you ever been to Rome?', exampleRu: 'Ты когда-нибудь был в Риме?' },
  { id: 'already', en: 'already', ru: 'уже', ipa: '/ɔːlˈredi/', rus: 'олрэди', topic: 'perfect-markers', level: 'B1', example: 'I have already eaten.', exampleRu: 'Я уже поел.' },
  { id: 'yet', en: 'yet', ru: 'ещё (в вопросах и отрицаниях)', ipa: '/jet/', rus: 'йет', topic: 'perfect-markers', level: 'B1', example: 'Have you finished yet?', exampleRu: 'Ты уже закончил?' },
  { id: 'just', en: 'just', ru: 'только что', ipa: '/dʒʌst/', rus: 'джаст', topic: 'perfect-markers', level: 'B1', example: 'She has just left.', exampleRu: 'Она только что ушла.' },
  { id: 'since', en: 'since', ru: 'с (какого-то момента)', ipa: '/sɪns/', rus: 'синс', topic: 'perfect-markers', level: 'B1', example: 'I have lived here since 2020.', exampleRu: 'Я живу здесь с 2020 года.' },
  { id: 'for-period', en: 'for', ru: 'в течение (о периоде)', ipa: '/fɔː/', rus: 'фо', topic: 'perfect-markers', level: 'B1', example: 'I have worked here for five years.', exampleRu: 'Я работаю здесь пять лет.' },
  { id: 'recently', en: 'recently', ru: 'недавно', ipa: '/ˈriːsntli/', rus: 'рисэнтли', topic: 'perfect-markers', level: 'B1', example: 'I have seen him recently.', exampleRu: 'Я недавно его видел.' },

  /* ---------- B1: модальные глаголы ---------- */
  { id: 'must', en: 'must', ru: 'должен (внутренняя необходимость)', ipa: '/mʌst/', rus: 'маст', topic: 'modals', level: 'B1', example: 'I must go now.', exampleRu: 'Мне надо идти.' },
  { id: 'have-to', en: 'have to', ru: 'приходится (внешнее правило)', ipa: '/ˈhæv tuː/', rus: 'хэв ту', topic: 'modals', level: 'B1', example: 'I have to work on Saturday.', exampleRu: 'Мне приходится работать в субботу.' },
  { id: 'should', en: 'should', ru: 'следует (совет)', ipa: '/ʃʊd/', rus: 'шуд', topic: 'modals', level: 'B1', example: 'You should see a doctor.', exampleRu: 'Тебе стоит сходить к врачу.' },
  { id: 'might', en: 'might', ru: 'возможно, может быть', ipa: '/maɪt/', rus: 'майт', topic: 'modals', level: 'B1', example: 'It might rain later.', exampleRu: 'Возможно, позже пойдёт дождь.' },
  { id: 'may', en: 'may', ru: 'можно; возможно', ipa: '/meɪ/', rus: 'мэй', topic: 'modals', level: 'B1', example: 'May I come in?', exampleRu: 'Можно войти?' },
  { id: 'could', en: 'could', ru: 'мог бы (вежливо, возможность)', ipa: '/kʊd/', rus: 'куд', topic: 'modals', level: 'B1', example: 'Could you help me?', exampleRu: 'Не могли бы вы помочь?' },
  { id: 'allowed', en: 'allowed', ru: 'разрешено', ipa: '/əˈlaʊd/', rus: 'элауд', topic: 'modals', level: 'B1', example: 'Smoking is not allowed.', exampleRu: 'Курить запрещено.' },

  /* ---------- B1: условные предложения ---------- */
  { id: 'if', en: 'if', ru: 'если', ipa: '/ɪf/', rus: 'иф', topic: 'conditionals', level: 'B1', example: 'If it rains, we stay home.', exampleRu: 'Если пойдёт дождь, останемся дома.' },
  { id: 'unless', en: 'unless', ru: 'если не', ipa: '/ənˈles/', rus: 'энлес', topic: 'conditionals', level: 'B1', example: 'Unless you hurry, we will be late.', exampleRu: 'Если не поторопишься, опоздаем.' },

  /* ---------- B1: фразовые глаголы ---------- */
  { id: 'get-up', en: 'to get up', ru: 'вставать (с постели)', ipa: '/ˌɡet ˈʌp/', rus: 'гет ап', topic: 'phrasal-verbs', level: 'B1', example: 'I get up at seven.', exampleRu: 'Я встаю в семь.' },
  { id: 'look-for', en: 'to look for', ru: 'искать', ipa: '/ˈlʊk fɔː/', rus: 'лук фо', topic: 'phrasal-verbs', level: 'B1', example: 'I am looking for my keys.', exampleRu: 'Я ищу свои ключи.' },
  { id: 'turn-on', en: 'to turn on', ru: 'включать', ipa: '/ˌtɜːn ˈɒn/', rus: 'тён он', topic: 'phrasal-verbs', level: 'B1', example: 'Turn on the light.', exampleRu: 'Включи свет.' },
  { id: 'turn-off', en: 'to turn off', ru: 'выключать', ipa: '/ˌtɜːn ˈɒf/', rus: 'тён оф', topic: 'phrasal-verbs', level: 'B1', example: 'Turn off the TV, please.', exampleRu: 'Выключи телевизор, пожалуйста.' },
  { id: 'give-up', en: 'to give up', ru: 'бросать, сдаваться', ipa: '/ˌɡɪv ˈʌp/', rus: 'гив ап', topic: 'phrasal-verbs', level: 'B1', example: 'He gave up smoking.', exampleRu: 'Он бросил курить.' },
  { id: 'find-out', en: 'to find out', ru: 'выяснить, узнать', ipa: '/ˌfaɪnd ˈaʊt/', rus: 'файнд аут', topic: 'phrasal-verbs', level: 'B1', example: 'I need to find out the truth.', exampleRu: 'Мне нужно выяснить правду.' },
  { id: 'put-on', en: 'to put on', ru: 'надевать', ipa: '/ˌpʊt ˈɒn/', rus: 'пут он', topic: 'phrasal-verbs', level: 'B1', example: 'Put on your coat.', exampleRu: 'Надень пальто.' },
  { id: 'take-off', en: 'to take off', ru: 'снимать; взлетать', ipa: '/ˌteɪk ˈɒf/', rus: 'тэйк оф', topic: 'phrasal-verbs', level: 'B1', example: 'The plane takes off at six.', exampleRu: 'Самолёт взлетает в шесть.' },
  { id: 'look-after', en: 'to look after', ru: 'заботиться, присматривать', ipa: '/ˌlʊk ˈɑːftə/', rus: 'лук афтэ', topic: 'phrasal-verbs', level: 'B1', example: 'She looks after her parents.', exampleRu: 'Она заботится о родителях.' },
  { id: 'come-back', en: 'to come back', ru: 'возвращаться', ipa: '/ˌkʌm ˈbæk/', rus: 'кам бэк', topic: 'phrasal-verbs', level: 'B1', example: 'Come back soon!', exampleRu: 'Возвращайся скорее!' },
  { id: 'go-on', en: 'to go on', ru: 'продолжаться', ipa: '/ˌɡoʊ ˈɒn/', rus: 'гоу он', topic: 'phrasal-verbs', level: 'B1', example: 'Go on, I am listening.', exampleRu: 'Продолжай, я слушаю.' },
  { id: 'pick-up', en: 'to pick up', ru: 'подобрать, забрать', ipa: '/ˌpɪk ˈʌp/', rus: 'пик ап', topic: 'phrasal-verbs', level: 'B1', example: 'I will pick you up at eight.', exampleRu: 'Я заберу тебя в восемь.' },

  /* ---------- B1: глаголы ---------- */
  { id: 'build', en: 'to build', ru: 'строить', ipa: '/tə bɪld/', rus: 'ту билд', topic: 'b1-verbs', level: 'B1', example: 'They build houses.', exampleRu: 'Они строят дома.' },
  { id: 'invent', en: 'to invent', ru: 'изобретать', ipa: '/tʊ ɪnˈvent/', rus: 'ту инвэнт', topic: 'b1-verbs', level: 'B1', example: 'Bell invented the telephone.', exampleRu: 'Белл изобрёл телефон.' },
  { id: 'send', en: 'to send', ru: 'отправлять', ipa: '/tə send/', rus: 'ту сэнд', topic: 'b1-verbs', level: 'B1', example: 'Send me a message.', exampleRu: 'Отправь мне сообщение.' },
  { id: 'pay', en: 'to pay', ru: 'платить', ipa: '/tə peɪ/', rus: 'ту пэй', topic: 'b1-verbs', level: 'B1', example: 'I pay by card.', exampleRu: 'Я плачу картой.' },
  { id: 'tell', en: 'to tell', ru: 'рассказывать, сообщать', ipa: '/tə tel/', rus: 'ту тэл', topic: 'b1-verbs', level: 'B1', example: 'Tell me the truth.', exampleRu: 'Скажи мне правду.' },
  { id: 'meet', en: 'to meet', ru: 'встречать', ipa: '/tə miːt/', rus: 'ту мит', topic: 'b1-verbs', level: 'B1', example: 'Let’s meet tomorrow.', exampleRu: 'Давай встретимся завтра.' },
  { id: 'lose', en: 'to lose', ru: 'терять, проигрывать', ipa: '/tə luːz/', rus: 'ту луз', topic: 'b1-verbs', level: 'B1', example: 'Don’t lose the ticket.', exampleRu: 'Не потеряй билет.' },
  { id: 'find', en: 'to find', ru: 'находить', ipa: '/tə faɪnd/', rus: 'ту файнд', topic: 'b1-verbs', level: 'B1', example: 'I can’t find my phone.', exampleRu: 'Я не могу найти телефон.' },
  { id: 'break', en: 'to break', ru: 'ломать, разбивать', ipa: '/tə breɪk/', rus: 'ту брэйк', topic: 'b1-verbs', level: 'B1', example: 'Don’t break it.', exampleRu: 'Не сломай это.' },
  { id: 'forget', en: 'to forget', ru: 'забывать', ipa: '/tə fəˈɡet/', rus: 'ту фэгет', topic: 'b1-verbs', level: 'B1', example: 'Don’t forget your keys.', exampleRu: 'Не забудь ключи.' },
  { id: 'happen', en: 'to happen', ru: 'случаться, происходить', ipa: '/tə ˈhæpən/', rus: 'ту хэпэн', topic: 'b1-verbs', level: 'B1', example: 'What happened?', exampleRu: 'Что случилось?' },
  { id: 'try', en: 'to try', ru: 'пытаться, пробовать', ipa: '/tə traɪ/', rus: 'ту трай', topic: 'b1-verbs', level: 'B1', example: 'Try again.', exampleRu: 'Попробуй ещё раз.' },
  { id: 'learn', en: 'to learn', ru: 'учить, узнавать', ipa: '/tə lɜːn/', rus: 'ту лён', topic: 'b1-verbs', level: 'B1', example: 'I learn something new every day.', exampleRu: 'Я каждый день узнаю что-то новое.' },
  { id: 'change', en: 'to change', ru: 'менять, изменяться', ipa: '/tə tʃeɪndʒ/', rus: 'ту чэйндж', topic: 'b1-verbs', level: 'B1', example: 'Things change.', exampleRu: 'Всё меняется.' },

  /* ---------- B1: существительные ---------- */
  { id: 'job', en: 'job', ru: 'работа, должность', ipa: '/dʒɒb/', rus: 'джоб', topic: 'b1-nouns', level: 'B1', example: 'She has a new job.', exampleRu: 'У неё новая работа.' },
  { id: 'problem', en: 'problem', ru: 'проблема', ipa: '/ˈprɒbləm/', rus: 'проблэм', topic: 'b1-nouns', level: 'B1', example: 'No problem!', exampleRu: 'Без проблем!' },
  { id: 'idea', en: 'idea', ru: 'идея', ipa: '/aɪˈdɪə/', rus: 'айдиэ', topic: 'b1-nouns', level: 'B1', example: 'That is a good idea.', exampleRu: 'Это хорошая идея.' },
  { id: 'reason', en: 'reason', ru: 'причина', ipa: '/ˈriːzn/', rus: 'ризн', topic: 'b1-nouns', level: 'B1', example: 'There is no reason to wait.', exampleRu: 'Нет причин ждать.' },
  { id: 'decision', en: 'decision', ru: 'решение', ipa: '/dɪˈsɪʒn/', rus: 'дисижн', topic: 'b1-nouns', level: 'B1', example: 'It was a hard decision.', exampleRu: 'Это было трудное решение.' },

  /* ---------- B2: глаголы ---------- */
  { id: 'begin', en: 'to begin', ru: 'начинать', ipa: '/tə bɪˈɡɪn/', rus: 'ту бигин', topic: 'b2-verbs', level: 'B2', example: 'The meeting begins at nine.', exampleRu: 'Встреча начинается в девять.' },
  { id: 'become', en: 'to become', ru: 'становиться', ipa: '/tə bɪˈkʌm/', rus: 'ту бикам', topic: 'b2-verbs', level: 'B2', example: 'She became a doctor.', exampleRu: 'Она стала врачом.' },
  { id: 'bring', en: 'to bring', ru: 'приносить', ipa: '/tə brɪŋ/', rus: 'ту бринг', topic: 'b2-verbs', level: 'B2', example: 'Bring me the report.', exampleRu: 'Принеси мне отчёт.' },
  { id: 'understand', en: 'to understand', ru: 'понимать', ipa: '/tʊ ˌʌndəˈstænd/', rus: 'ту андэстэнд', topic: 'b2-verbs', level: 'B2', example: 'I don’t understand.', exampleRu: 'Я не понимаю.' },
  { id: 'hear', en: 'to hear', ru: 'слышать', ipa: '/tə hɪə/', rus: 'ту хиэ', topic: 'b2-verbs', level: 'B2', example: 'I can’t hear you.', exampleRu: 'Я тебя не слышу.' },
  { id: 'feel', en: 'to feel', ru: 'чувствовать', ipa: '/tə fiːl/', rus: 'ту фил', topic: 'b2-verbs', level: 'B2', example: 'I feel tired.', exampleRu: 'Я чувствую усталость.' },
  { id: 'keep', en: 'to keep', ru: 'хранить, продолжать', ipa: '/tə kiːp/', rus: 'ту кип', topic: 'b2-verbs', level: 'B2', example: 'Keep the change.', exampleRu: 'Сдачу оставьте себе.' },
  { id: 'leave', en: 'to leave', ru: 'уходить, оставлять', ipa: '/tə liːv/', rus: 'ту лив', topic: 'b2-verbs', level: 'B2', example: 'She left an hour ago.', exampleRu: 'Она ушла час назад.' },
  { id: 'sell', en: 'to sell', ru: 'продавать', ipa: '/tə sel/', rus: 'ту сэл', topic: 'b2-verbs', level: 'B2', example: 'They sell books here.', exampleRu: 'Здесь продают книги.' },
  { id: 'win', en: 'to win', ru: 'выигрывать', ipa: '/tə wɪn/', rus: 'ту уин', topic: 'b2-verbs', level: 'B2', example: 'We won the game.', exampleRu: 'Мы выиграли игру.' },
  { id: 'choose', en: 'to choose', ru: 'выбирать', ipa: '/tə tʃuːz/', rus: 'ту чуз', topic: 'b2-verbs', level: 'B2', example: 'Choose one.', exampleRu: 'Выбери один.' },
  { id: 'grow', en: 'to grow', ru: 'расти, выращивать', ipa: '/tə ɡroʊ/', rus: 'ту гроу', topic: 'b2-verbs', level: 'B2', example: 'The city is growing.', exampleRu: 'Город растёт.' },
  { id: 'realize', en: 'to realize', ru: 'осознавать', ipa: '/tə ˈrɪəlaɪz/', rus: 'ту риэлайз', topic: 'b2-verbs', level: 'B2', example: 'I realized my mistake.', exampleRu: 'Я осознал свою ошибку.' },
  { id: 'suggest', en: 'to suggest', ru: 'предлагать', ipa: '/tə səˈdʒest/', rus: 'ту сэджест', topic: 'b2-verbs', level: 'B2', example: 'He suggested a plan.', exampleRu: 'Он предложил план.' },
  { id: 'admit', en: 'to admit', ru: 'признавать', ipa: '/tʊ ədˈmɪt/', rus: 'ту эдмит', topic: 'b2-verbs', level: 'B2', example: 'He admitted his mistake.', exampleRu: 'Он признал свою ошибку.' },
  { id: 'refuse', en: 'to refuse', ru: 'отказываться', ipa: '/tə rɪˈfjuːz/', rus: 'ту рифьюз', topic: 'b2-verbs', level: 'B2', example: 'She refused to help.', exampleRu: 'Она отказалась помочь.' },
  { id: 'explain', en: 'to explain', ru: 'объяснять', ipa: '/tʊ ɪkˈspleɪn/', rus: 'ту иксплэйн', topic: 'b2-verbs', level: 'B2', example: 'Can you explain it?', exampleRu: 'Можешь объяснить?' },
  { id: 'promise', en: 'to promise', ru: 'обещать', ipa: '/tə ˈprɒmɪs/', rus: 'ту промис', topic: 'b2-verbs', level: 'B2', example: 'I promise to come.', exampleRu: 'Обещаю прийти.' },
  { id: 'complain', en: 'to complain', ru: 'жаловаться', ipa: '/tə kəmˈpleɪn/', rus: 'ту кэмплэйн', topic: 'b2-verbs', level: 'B2', example: 'He complained about the noise.', exampleRu: 'Он пожаловался на шум.' },
  { id: 'ask', en: 'to ask', ru: 'спрашивать, просить', ipa: '/tʊ ɑːsk/', rus: 'ту аск', topic: 'b2-verbs', level: 'B2', example: 'She asked me a question.', exampleRu: 'Она задала мне вопрос.' },
  { id: 'arrive', en: 'to arrive', ru: 'прибывать, приезжать', ipa: '/tʊ əˈraɪv/', rus: 'ту эрайв', topic: 'b2-verbs', level: 'B2', example: 'We arrived at six.', exampleRu: 'Мы приехали в шесть.' },

  /* ---------- B2: третьи формы ---------- */
  { id: 'begun', en: 'begun', ru: 'начат (3-я форма от begin)', ipa: '/bɪˈɡʌn/', rus: 'биган', topic: 'b2-participles', level: 'B2', example: 'The work has begun.', exampleRu: 'Работа началась.' },
  { id: 'brought', en: 'brought', ru: 'принесён (3-я форма от bring)', ipa: '/brɔːt/', rus: 'брот', topic: 'b2-participles', level: 'B2', example: 'He had brought the keys.', exampleRu: 'Он принёс ключи.' },
  { id: 'understood', en: 'understood', ru: 'понят (3-я форма от understand)', ipa: '/ˌʌndəˈstʊd/', rus: 'андэстуд', topic: 'b2-participles', level: 'B2', example: 'I hadn’t understood.', exampleRu: 'Я не понял.' },
  { id: 'heard', en: 'heard', ru: 'услышан (3-я форма от hear)', ipa: '/hɜːd/', rus: 'хёрд', topic: 'b2-participles', level: 'B2', example: 'I have heard about it.', exampleRu: 'Я слышал об этом.' },
  { id: 'felt', en: 'felt', ru: 'почувствован (3-я форма от feel)', ipa: '/felt/', rus: 'фэлт', topic: 'b2-participles', level: 'B2', example: 'She had felt ill.', exampleRu: 'Ей было плохо.' },
  { id: 'kept', en: 'kept', ru: 'сохранён (3-я форма от keep)', ipa: '/kept/', rus: 'кэпт', topic: 'b2-participles', level: 'B2', example: 'He had kept the letter.', exampleRu: 'Он сохранил письмо.' },
  { id: 'left-v3', en: 'left', ru: 'ушёл (3-я форма от leave)', ipa: '/left/', rus: 'лэфт', topic: 'b2-participles', level: 'B2', example: 'She had already left.', exampleRu: 'Она уже ушла.' },
  { id: 'sold', en: 'sold', ru: 'продан (3-я форма от sell)', ipa: '/soʊld/', rus: 'соулд', topic: 'b2-participles', level: 'B2', example: 'The car was sold.', exampleRu: 'Машину продали.' },
  { id: 'won', en: 'won', ru: 'выигран (3-я форма от win)', ipa: '/wʌn/', rus: 'уан', topic: 'b2-participles', level: 'B2', example: 'They have won again.', exampleRu: 'Они снова выиграли.' },
  { id: 'chosen', en: 'chosen', ru: 'выбран (3-я форма от choose)', ipa: '/ˈtʃoʊzn/', rus: 'чоузн', topic: 'b2-participles', level: 'B2', example: 'He was chosen.', exampleRu: 'Его выбрали.' },
  { id: 'grown', en: 'grown', ru: 'вырос (3-я форма от grow)', ipa: '/ɡroʊn/', rus: 'гроун', topic: 'b2-participles', level: 'B2', example: 'The city has grown.', exampleRu: 'Город вырос.' },

  /* ---------- B2: условные и сожаления ---------- */
  { id: 'would', en: 'would', ru: 'бы (нереальное действие)', ipa: '/wʊd/', rus: 'вуд', topic: 'b2-conditionals', level: 'B2', example: 'I would buy a house.', exampleRu: 'Я бы купил дом.' },
  { id: 'wish', en: 'to wish', ru: 'желать, сожалеть', ipa: '/tə wɪʃ/', rus: 'ту уиш', topic: 'b2-conditionals', level: 'B2', example: 'I wish I knew.', exampleRu: 'Жаль, что я не знаю.' },
  { id: 'rather', en: 'would rather', ru: 'предпочёл бы', ipa: '/wʊd ˈrɑːðə/', rus: 'вуд разэ', topic: 'b2-conditionals', level: 'B2', example: 'I would rather stay.', exampleRu: 'Я бы лучше остался.' },
  { id: 'otherwise', en: 'otherwise', ru: 'иначе, в противном случае', ipa: '/ˈʌðəwaɪz/', rus: 'азэуайз', topic: 'b2-conditionals', level: 'B2', example: 'Hurry, otherwise we will be late.', exampleRu: 'Поторопись, иначе опоздаем.' },
  { id: 'whether', en: 'whether', ru: 'ли (в косвенном вопросе)', ipa: '/ˈweðə/', rus: 'уэзэ', topic: 'b2-conditionals', level: 'B2', example: 'He asked whether I was ready.', exampleRu: 'Он спросил, готов ли я.' },

  /* ---------- B2: связки для рассуждения ---------- */
  { id: 'actually', en: 'actually', ru: 'на самом деле', ipa: '/ˈæktʃuəli/', rus: 'экчуэли', topic: 'b2-linkers', level: 'B2', example: 'Actually, I disagree.', exampleRu: 'На самом деле я не согласен.' },
  { id: 'probably', en: 'probably', ru: 'вероятно', ipa: '/ˈprɒbəbli/', rus: 'пробэбли', topic: 'b2-linkers', level: 'B2', example: 'He is probably right.', exampleRu: 'Он, вероятно, прав.' },
  { id: 'although', en: 'although', ru: 'хотя', ipa: '/ɔːlˈðoʊ/', rus: 'олзоу', topic: 'b2-linkers', level: 'B2', example: 'Although it rained, we went out.', exampleRu: 'Хотя шёл дождь, мы вышли.' },
  { id: 'however', en: 'however', ru: 'однако', ipa: '/haʊˈevə/', rus: 'хауэвэ', topic: 'b2-linkers', level: 'B2', example: 'However, there is a problem.', exampleRu: 'Однако есть проблема.' },
  { id: 'therefore', en: 'therefore', ru: 'поэтому, следовательно', ipa: '/ˈðeəfɔː/', rus: 'зэафо', topic: 'b2-linkers', level: 'B2', example: 'It was late, therefore we left.', exampleRu: 'Было поздно, поэтому мы ушли.' },
  { id: 'despite', en: 'despite', ru: 'несмотря на', ipa: '/dɪˈspaɪt/', rus: 'диспайт', topic: 'b2-linkers', level: 'B2', example: 'Despite the rain, we walked.', exampleRu: 'Несмотря на дождь, мы гуляли.' },
  { id: 'instead', en: 'instead', ru: 'вместо этого', ipa: '/ɪnˈsted/', rus: 'инстэд', topic: 'b2-linkers', level: 'B2', example: 'Let’s walk instead.', exampleRu: 'Давай лучше пройдёмся.' },

  /* ---------- B2: устойчивые сочетания ---------- */
  { id: 'make-a-decision', en: 'to make a decision', ru: 'принять решение', ipa: '/meɪk ə dɪˈsɪʒn/', rus: 'мэйк э дисижн', topic: 'collocations', level: 'B2', example: 'We must make a decision.', exampleRu: 'Мы должны принять решение.' },
  { id: 'do-homework', en: 'to do homework', ru: 'делать домашнее задание', ipa: '/duː ˈhoʊmwɜːk/', rus: 'ду хоумуёрк', topic: 'collocations', level: 'B2', example: 'He does his homework at night.', exampleRu: 'Он делает уроки вечером.' },
  { id: 'take-a-photo', en: 'to take a photo', ru: 'сделать фото', ipa: '/teɪk ə ˈfoʊtoʊ/', rus: 'тэйк э фоутоу', topic: 'collocations', level: 'B2', example: 'Let me take a photo.', exampleRu: 'Дай я сфотографирую.' },
  { id: 'pay-attention', en: 'to pay attention', ru: 'обращать внимание', ipa: '/peɪ əˈtenʃn/', rus: 'пэй этэншн', topic: 'collocations', level: 'B2', example: 'Pay attention to details.', exampleRu: 'Обращай внимание на детали.' },
  { id: 'keep-in-touch', en: 'to keep in touch', ru: 'поддерживать связь', ipa: '/kiːp ɪn ˈtʌtʃ/', rus: 'кип ин тач', topic: 'collocations', level: 'B2', example: 'Let’s keep in touch.', exampleRu: 'Давай не теряться.' },
  { id: 'make-sense', en: 'to make sense', ru: 'иметь смысл', ipa: '/meɪk ˈsens/', rus: 'мэйк сэнс', topic: 'collocations', level: 'B2', example: 'That makes sense.', exampleRu: 'Это логично.' },
  { id: 'heavy-rain', en: 'heavy rain', ru: 'сильный дождь', ipa: '/ˌhevi ˈreɪn/', rus: 'хэви рэйн', topic: 'collocations', level: 'B2', example: 'Heavy rain is expected.', exampleRu: 'Ожидается сильный дождь.' },
  { id: 'strong-coffee', en: 'strong coffee', ru: 'крепкий кофе', ipa: '/ˌstrɒŋ ˈkɒfi/', rus: 'стронг кофи', topic: 'collocations', level: 'B2', example: 'I need strong coffee.', exampleRu: 'Мне нужен крепкий кофе.' },

  /* ---------- B2: идиомы ---------- */
  { id: 'piece-of-cake', en: 'a piece of cake', ru: 'проще простого', ipa: '/ˌpiːs əv ˈkeɪk/', rus: 'пис ов кэйк', topic: 'idioms', level: 'B2', example: 'The test was a piece of cake.', exampleRu: 'Тест был проще простого.' },
  { id: 'under-the-weather', en: 'under the weather', ru: 'нездоровится', ipa: '/ˌʌndə ðə ˈweðə/', rus: 'андэ зэ уэзэ', topic: 'idioms', level: 'B2', example: 'I feel under the weather.', exampleRu: 'Мне что-то нездоровится.' },
  { id: 'once-in-a-while', en: 'once in a while', ru: 'время от времени', ipa: '/ˌwʌns ɪn ə ˈwaɪl/', rus: 'уанс ин э уайл', topic: 'idioms', level: 'B2', example: 'We meet once in a while.', exampleRu: 'Мы видимся время от времени.' },
  { id: 'break-the-ice', en: 'to break the ice', ru: 'разрядить обстановку', ipa: '/breɪk ði ˈaɪs/', rus: 'брэйк зи айс', topic: 'idioms', level: 'B2', example: 'A joke helped break the ice.', exampleRu: 'Шутка помогла разрядить обстановку.' },
  { id: 'cost-an-arm-and-a-leg', en: 'to cost an arm and a leg', ru: 'стоить целое состояние', ipa: '/kɒst ən ˈɑːm ənd ə ˈleɡ/', rus: 'кост эн ам энд э лэг', topic: 'idioms', level: 'B2', example: 'It cost an arm and a leg.', exampleRu: 'Это стоило целое состояние.' },
  { id: 'on-the-same-page', en: 'on the same page', ru: 'понимать друг друга', ipa: '/ɒn ðə ˌseɪm ˈpeɪdʒ/', rus: 'он зэ сэйм пэйдж', topic: 'idioms', level: 'B2', example: 'Are we on the same page?', exampleRu: 'Мы друг друга понимаем?' },

  /* ---------- C1: наречия для инверсии ---------- */
  { id: 'hardly', en: 'hardly', ru: 'едва, вряд ли', ipa: '/ˈhɑːdli/', rus: 'хадли', topic: 'inversion', level: 'C1', example: 'Hardly had I arrived when it started.', exampleRu: 'Едва я приехал, как это началось.' },
  { id: 'scarcely', en: 'scarcely', ru: 'едва ли', ipa: '/ˈskeəsli/', rus: 'скэасли', topic: 'inversion', level: 'C1', example: 'Scarcely could he speak.', exampleRu: 'Он едва мог говорить.' },
  { id: 'seldom', en: 'seldom', ru: 'редко', ipa: '/ˈseldəm/', rus: 'сэлдэм', topic: 'inversion', level: 'C1', example: 'Seldom do we see such talent.', exampleRu: 'Редко встретишь такой талант.' },
  { id: 'rarely', en: 'rarely', ru: 'редко', ipa: '/ˈreəli/', rus: 'рэали', topic: 'inversion', level: 'C1', example: 'Rarely have I been so surprised.', exampleRu: 'Редко я бывал так удивлён.' },
  { id: 'barely', en: 'barely', ru: 'едва, только-только', ipa: '/ˈbeəli/', rus: 'бэали', topic: 'inversion', level: 'C1', example: 'He barely finished in time.', exampleRu: 'Он едва успел вовремя.' },

  /* ---------- C1: сослагательное и требование ---------- */
  { id: 'insist', en: 'to insist', ru: 'настаивать', ipa: '/tʊ ɪnˈsɪst/', rus: 'ту инсист', topic: 'subjunctive', level: 'C1', example: 'She insisted that he leave.', exampleRu: 'Она настояла, чтобы он ушёл.' },
  { id: 'demand', en: 'to demand', ru: 'требовать', ipa: '/tə dɪˈmɑːnd/', rus: 'ту диманд', topic: 'subjunctive', level: 'C1', example: 'They demanded that we pay.', exampleRu: 'Они потребовали, чтобы мы заплатили.' },
  { id: 'recommend', en: 'to recommend', ru: 'рекомендовать', ipa: '/tə ˌrekəˈmend/', rus: 'ту рэкэмэнд', topic: 'subjunctive', level: 'C1', example: 'I recommend that he apply.', exampleRu: 'Я рекомендую, чтобы он подал заявку.' },
  { id: 'essential', en: 'essential', ru: 'необходимый', ipa: '/ɪˈsenʃl/', rus: 'исэншл', topic: 'subjunctive', level: 'C1', example: 'It is essential that she be present.', exampleRu: 'Необходимо, чтобы она присутствовала.' },
  { id: 'crucial', en: 'crucial', ru: 'решающий, ключевой', ipa: '/ˈkruːʃl/', rus: 'крушл', topic: 'subjunctive', level: 'C1', example: 'This is a crucial point.', exampleRu: 'Это ключевой момент.' },

  /* ---------- C1: смягчение и осторожность ---------- */
  { id: 'tend-to', en: 'to tend to', ru: 'иметь склонность', ipa: '/tend tuː/', rus: 'тэнд ту', topic: 'hedging', level: 'C1', example: 'Prices tend to rise.', exampleRu: 'Цены обычно растут.' },
  { id: 'seem', en: 'to seem', ru: 'казаться', ipa: '/tə siːm/', rus: 'ту сим', topic: 'hedging', level: 'C1', example: 'It seems to work.', exampleRu: 'Кажется, это работает.' },
  { id: 'appear', en: 'to appear', ru: 'представляться, казаться', ipa: '/tʊ əˈpɪə/', rus: 'ту эпиэ', topic: 'hedging', level: 'C1', example: 'The results appear to confirm this.', exampleRu: 'Результаты, по-видимому, это подтверждают.' },
  { id: 'arguably', en: 'arguably', ru: 'возможно, можно утверждать', ipa: '/ˈɑːɡjuəbli/', rus: 'агьюэбли', topic: 'hedging', level: 'C1', example: 'This is arguably the best option.', exampleRu: 'Пожалуй, это лучший вариант.' },
  { id: 'presumably', en: 'presumably', ru: 'предположительно', ipa: '/prɪˈzjuːməbli/', rus: 'призьюмэбли', topic: 'hedging', level: 'C1', example: 'He is presumably still working.', exampleRu: 'Он, предположительно, ещё работает.' },
  { id: 'somewhat', en: 'somewhat', ru: 'несколько, немного', ipa: '/ˈsʌmwɒt/', rus: 'самуот', topic: 'hedging', level: 'C1', example: 'The result is somewhat unclear.', exampleRu: 'Результат несколько неясен.' },
  { id: 'relatively', en: 'relatively', ru: 'относительно', ipa: '/ˈrelətɪvli/', rus: 'рэлэтивли', topic: 'hedging', level: 'C1', example: 'A relatively small change.', exampleRu: 'Относительно небольшое изменение.' },
  { id: 'largely', en: 'largely', ru: 'в значительной степени', ipa: '/ˈlɑːdʒli/', rus: 'ладжли', topic: 'hedging', level: 'C1', example: 'This is largely true.', exampleRu: 'Это в значительной степени верно.' },

  /* ---------- C1: академические глаголы ---------- */
  { id: 'obtain', en: 'to obtain', ru: 'получать (формально)', ipa: '/tʊ əbˈteɪn/', rus: 'ту эбтэйн', topic: 'academic-verbs', level: 'C1', example: 'We obtained the data in May.', exampleRu: 'Мы получили данные в мае.' },
  { id: 'require', en: 'to require', ru: 'требовать', ipa: '/tə rɪˈkwaɪə/', rus: 'ту рикуайэ', topic: 'academic-verbs', level: 'C1', example: 'This requires further study.', exampleRu: 'Это требует дальнейшего изучения.' },
  { id: 'indicate', en: 'to indicate', ru: 'указывать, свидетельствовать', ipa: '/tʊ ˈɪndɪkeɪt/', rus: 'ту индикэйт', topic: 'academic-verbs', level: 'C1', example: 'The data indicate a trend.', exampleRu: 'Данные указывают на тенденцию.' },
  { id: 'demonstrate', en: 'to demonstrate', ru: 'демонстрировать, показывать', ipa: '/tə ˈdemənstreɪt/', rus: 'ту дэмэнстрэйт', topic: 'academic-verbs', level: 'C1', example: 'The study demonstrates the effect.', exampleRu: 'Исследование демонстрирует эффект.' },
  { id: 'establish', en: 'to establish', ru: 'устанавливать', ipa: '/tʊ ɪˈstæblɪʃ/', rus: 'ту истэблиш', topic: 'academic-verbs', level: 'C1', example: 'It is difficult to establish the cause.', exampleRu: 'Трудно установить причину.' },
  { id: 'assume', en: 'to assume', ru: 'предполагать', ipa: '/tʊ əˈsjuːm/', rus: 'ту эсьюм', topic: 'academic-verbs', level: 'C1', example: 'Let us assume this is true.', exampleRu: 'Предположим, что это верно.' },
  { id: 'imply', en: 'to imply', ru: 'подразумевать', ipa: '/tʊ ɪmˈplaɪ/', rus: 'ту имплай', topic: 'academic-verbs', level: 'C1', example: 'This implies a deeper problem.', exampleRu: 'Это подразумевает более глубокую проблему.' },
  { id: 'emphasize', en: 'to emphasize', ru: 'подчёркивать', ipa: '/tʊ ˈemfəsaɪz/', rus: 'ту эмфэсайз', topic: 'academic-verbs', level: 'C1', example: 'I want to emphasize this point.', exampleRu: 'Я хочу подчеркнуть этот момент.' },
  { id: 'acknowledge', en: 'to acknowledge', ru: 'признавать', ipa: '/tʊ əkˈnɒlɪdʒ/', rus: 'ту экнолидж', topic: 'academic-verbs', level: 'C1', example: 'We must acknowledge the limits.', exampleRu: 'Следует признать ограничения.' },
  { id: 'consider', en: 'to consider', ru: 'рассматривать, считать', ipa: '/tə kənˈsɪdə/', rus: 'ту кэнсидэ', topic: 'academic-verbs', level: 'C1', example: 'Consider the following example.', exampleRu: 'Рассмотрим следующий пример.' },
  { id: 'occur', en: 'to occur', ru: 'происходить, встречаться', ipa: '/tʊ əˈkɜː/', rus: 'ту экё', topic: 'academic-verbs', level: 'C1', example: 'This rarely occurs.', exampleRu: 'Это редко случается.' },
  { id: 'maintain', en: 'to maintain', ru: 'утверждать; поддерживать', ipa: '/tə meɪnˈteɪn/', rus: 'ту мэйнтэйн', topic: 'academic-verbs', level: 'C1', example: 'He maintains that it is wrong.', exampleRu: 'Он утверждает, что это неверно.' },
  { id: 'assess', en: 'to assess', ru: 'оценивать', ipa: '/tʊ əˈses/', rus: 'ту эсэс', topic: 'academic-verbs', level: 'C1', example: 'We need to assess the risk.', exampleRu: 'Нужно оценить риск.' },

  /* ---------- C1: академические существительные ---------- */
  { id: 'evidence', en: 'evidence', ru: 'доказательства, данные', ipa: '/ˈevɪdəns/', rus: 'эвидэнс', topic: 'academic-nouns', level: 'C1', example: 'There is little evidence for this.', exampleRu: 'Доказательств этому мало.' },
  { id: 'research', en: 'research', ru: 'исследование', ipa: '/rɪˈsɜːtʃ/', rus: 'рисёч', topic: 'academic-nouns', level: 'C1', example: 'Recent research suggests otherwise.', exampleRu: 'Недавние исследования говорят об обратном.' },
  { id: 'approach', en: 'approach', ru: 'подход', ipa: '/əˈproʊtʃ/', rus: 'эпроуч', topic: 'academic-nouns', level: 'C1', example: 'A different approach is needed.', exampleRu: 'Нужен иной подход.' },
  { id: 'outcome', en: 'outcome', ru: 'результат, исход', ipa: '/ˈaʊtkʌm/', rus: 'ауткам', topic: 'academic-nouns', level: 'C1', example: 'The outcome was unexpected.', exampleRu: 'Результат оказался неожиданным.' },
  { id: 'factor', en: 'factor', ru: 'фактор', ipa: '/ˈfæktə/', rus: 'фэктэ', topic: 'academic-nouns', level: 'C1', example: 'Several factors are involved.', exampleRu: 'Задействовано несколько факторов.' },
  { id: 'impact', en: 'impact', ru: 'воздействие, влияние', ipa: '/ˈɪmpækt/', rus: 'импэкт', topic: 'academic-nouns', level: 'C1', example: 'The impact was significant.', exampleRu: 'Воздействие было значительным.' },
  { id: 'assumption', en: 'assumption', ru: 'предположение', ipa: '/əˈsʌmpʃn/', rus: 'эсампшн', topic: 'academic-nouns', level: 'C1', example: 'This rests on a false assumption.', exampleRu: 'Это опирается на ложное предположение.' },
  { id: 'implication', en: 'implication', ru: 'следствие, подтекст', ipa: '/ˌɪmplɪˈkeɪʃn/', rus: 'импликэйшн', topic: 'academic-nouns', level: 'C1', example: 'The implications are serious.', exampleRu: 'Последствия серьёзны.' },
  { id: 'extent', en: 'extent', ru: 'степень, мера', ipa: '/ɪkˈstent/', rus: 'икстэнт', topic: 'academic-nouns', level: 'C1', example: 'To some extent, this is true.', exampleRu: 'В какой-то мере это верно.' },

  /* ---------- C1: формальные связки ---------- */
  { id: 'furthermore', en: 'furthermore', ru: 'более того', ipa: '/ˌfɜːðəˈmɔː/', rus: 'фёзэмо', topic: 'formal-linkers', level: 'C1', example: 'Furthermore, the cost is high.', exampleRu: 'Более того, стоимость высока.' },
  { id: 'nevertheless', en: 'nevertheless', ru: 'тем не менее', ipa: '/ˌnevəðəˈles/', rus: 'нэвэзэлэс', topic: 'formal-linkers', level: 'C1', example: 'Nevertheless, we should try.', exampleRu: 'Тем не менее, стоит попробовать.' },
  { id: 'consequently', en: 'consequently', ru: 'следовательно', ipa: '/ˈkɒnsɪkwəntli/', rus: 'консикуэнтли', topic: 'formal-linkers', level: 'C1', example: 'Consequently, the plan failed.', exampleRu: 'Следовательно, план провалился.' },
  { id: 'moreover', en: 'moreover', ru: 'кроме того', ipa: '/mɔːˈroʊvə/', rus: 'мороувэ', topic: 'formal-linkers', level: 'C1', example: 'Moreover, it saves time.', exampleRu: 'Кроме того, это экономит время.' },
  { id: 'whereas', en: 'whereas', ru: 'тогда как', ipa: '/weərˈæz/', rus: 'уэарэз', topic: 'formal-linkers', level: 'C1', example: 'He agreed, whereas she did not.', exampleRu: 'Он согласился, тогда как она — нет.' },
  { id: 'thus', en: 'thus', ru: 'таким образом', ipa: '/ðʌs/', rus: 'зас', topic: 'formal-linkers', level: 'C1', example: 'Thus, the theory holds.', exampleRu: 'Таким образом, теория верна.' },
  { id: 'hence', en: 'hence', ru: 'отсюда, поэтому', ipa: '/hens/', rus: 'хэнс', topic: 'formal-linkers', level: 'C1', example: 'Hence the delay.', exampleRu: 'Отсюда и задержка.' },
  { id: 'albeit', en: 'albeit', ru: 'хотя и', ipa: '/ɔːlˈbiːɪt/', rus: 'олбиит', topic: 'formal-linkers', level: 'C1', example: 'A useful, albeit costly, method.', exampleRu: 'Полезный, хотя и дорогой, метод.' },
  { id: 'regardless', en: 'regardless', ru: 'независимо от', ipa: '/rɪˈɡɑːdləs/', rus: 'ригадлэс', topic: 'formal-linkers', level: 'C1', example: 'Regardless of the cost, we proceed.', exampleRu: 'Независимо от стоимости, мы продолжаем.' },
];

/** Быстрый доступ по id. */
export const VOCAB_BY_ID = Object.fromEntries(VOCAB.map((w) => [w.id, w]));

export function getWord(id) {
  return VOCAB_BY_ID[id];
}

export function wordsByTopic(topic) {
  return VOCAB.filter((w) => w.topic === topic);
}

export function allVocabIds() {
  return VOCAB.map((w) => w.id);
}
