/**
 * Задания для письменной практики.
 *
 * Подобраны так, чтобы на каждом уровне требовалась ровно та грамматика,
 * которую этот уровень и разбирает: A1 — Present Simple о себе,
 * A2 — прошедшее и планы, B1 — Present Perfect и условные, и так далее.
 * Тогда проверка бьёт по свежепройденному материалу, а не по случайному.
 */

export const WRITING_TASKS = {
  A0: [
    { prompt: 'Напиши три предложения о себе: имя, откуда ты, кем работаешь.', hint: 'My name is… I am from… I am a…', minWords: 10 },
    { prompt: 'Опиши свою семью: кто есть, чем занимаются.', hint: 'I have… My mother is…', minWords: 15 },
    { prompt: 'Поздоровайся и представься новому коллеге.', hint: 'Hello! My name is… Nice to meet you.', minWords: 10 },
  ],
  A1: [
    { prompt: 'Опиши свой обычный день: во сколько встаёшь, что делаешь, когда заканчиваешь.', hint: 'Present Simple, наречия частоты: usually, often, always', minWords: 30 },
    { prompt: 'Расскажи, что ты умеешь и чего не умеешь делать.', hint: 'can / can’t', minWords: 25 },
    { prompt: 'Опиши свою комнату: что где стоит.', hint: 'Предлоги места: in, on, under, next to', minWords: 30 },
    { prompt: 'Напиши, что у тебя есть и чего нет.', hint: 'have got / haven’t got', minWords: 25 },
  ],
  A2: [
    { prompt: 'Расскажи, как прошли твои прошлые выходные.', hint: 'Past Simple, неправильные глаголы, маркеры: last, ago', minWords: 40 },
    { prompt: 'Опиши свои планы на следующий месяц.', hint: 'going to для планов, will для решений', minWords: 40 },
    { prompt: 'Сравни два города, в которых ты бывал.', hint: 'Степени сравнения, than, the most', minWords: 45 },
    { prompt: 'Опиши, что происходит вокруг тебя прямо сейчас.', hint: 'Present Continuous', minWords: 35 },
  ],
  B1: [
    { prompt: 'Расскажи о самом интересном месте, где ты побывал, и что оно тебе дало.', hint: 'Present Perfect для опыта, Past Simple для деталей', minWords: 60 },
    { prompt: 'Опиши, что бы ты сделал, если бы выиграл крупную сумму.', hint: 'Условные первого типа, will', minWords: 55 },
    { prompt: 'Напиши, что тебе приходится делать на работе и что стоило бы изменить.', hint: 'have to, must, should', minWords: 55 },
    { prompt: 'Объясни, как делается что-то в твоей профессии, не называя исполнителя.', hint: 'Пассивный залог', minWords: 55 },
  ],
  B2: [
    { prompt: 'Опиши решение, о котором ты жалеешь, и как всё сложилось бы иначе.', hint: 'Условные третьего типа, I wish', minWords: 80 },
    { prompt: 'Перескажи разговор, который у тебя недавно был.', hint: 'Косвенная речь, согласование времён', minWords: 75 },
    { prompt: 'Аргументируй позицию: удалённая работа лучше офисной или нет.', hint: 'however, although, therefore; коллокации', minWords: 90 },
    { prompt: 'Расскажи, чем ты занимался последнее время и к чему это привело.', hint: 'Present Perfect Continuous, Past Perfect', minWords: 75 },
  ],
  C1: [
    { prompt: 'Напиши краткий аналитический комментарий о тенденции в твоей отрасли.', hint: 'Академический регистр, хеджирование, формальные связки', minWords: 110 },
    { prompt: 'Составь деловое письмо с вежливым отказом на предложение.', hint: 'Вежливая дистанция, I’m afraid, Should you…', minWords: 90 },
    { prompt: 'Разбери причины недавней ошибки в проекте и что следовало сделать.', hint: 'Модальные о прошлом: should have, could have', minWords: 100 },
    { prompt: 'Изложи спорный тезис так, чтобы не звучать категорично.', hint: 'tend to, arguably, it could be argued that', minWords: 100 },
  ],
};

export const LEVELS = ['A0', 'A1', 'A2', 'B1', 'B2', 'C1'];

export function tasksForLevel(level) {
  return WRITING_TASKS[level] || [];
}
