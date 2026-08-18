/**
 * Разговор на английском.
 *
 * Всё остальное в портале — тренировка ради тренировки: вспомнил слово,
 * собрал фразу, получил интервал. Здесь язык впервые для чего-то нужен:
 * тебя понимают и отвечают. Ради этого его обычно и учат.
 *
 * Два правила, без которых раздел был бы вредным.
 *
 * Первое: собеседник говорит теми словами, которые ты уже проходил.
 * Разговор, где половина слов незнакома, не тренирует, а отбивает охоту.
 * Поэтому в запрос уходит список открытых уроками слов.
 *
 * Второе: приговор модели НЕ двигает интервалы повторений. Весь портал
 * построен на том, что прогресс меняют только объективные проверки —
 * совпало или не совпало. Языковая модель ошибается, спорит сама с собой
 * и легко хвалит; пустить её к карточкам значило бы вернуть самообман
 * через чёрный ход. Разговор даёт опыт и разбор ошибок, но не прогресс.
 */

import { askModel } from './ai.js';
import { getWord } from '../data/vocab.js';

/**
 * Сцены разговора. Привязаны к уровням: на A0 обсуждать планы на отпуск
 * бессмысленно, там ещё нет ни времён, ни лексики.
 */
export const SCENARIOS = [
  {
    id: 'meeting',
    title: 'Знакомство',
    icon: '👋',
    from: 'A0',
    goal: 'Познакомиться: имя, откуда ты, как дела.',
    opener: 'Hello! What is your name?',
    openerRu: 'Здравствуй! Как тебя зовут?',
  },
  {
    id: 'cafe',
    title: 'В кафе',
    icon: '☕',
    from: 'A1',
    goal: 'Заказать еду и напиток, спросить цену.',
    opener: 'Good afternoon! What would you like?',
    openerRu: 'Добрый день! Что будете заказывать?',
  },
  {
    id: 'directions',
    title: 'Как пройти',
    icon: '🗺️',
    from: 'A1',
    goal: 'Спросить дорогу и понять ответ.',
    opener: 'Excuse me, do you need help?',
    openerRu: 'Извините, вам помочь?',
  },
  {
    id: 'day',
    title: 'Как прошёл день',
    icon: '🌤️',
    from: 'A2',
    goal: 'Рассказать о вчерашнем дне и расспросить собеседника.',
    opener: 'Hi! How was your day yesterday?',
    openerRu: 'Привет! Как прошёл твой вчерашний день?',
  },
  {
    id: 'work',
    title: 'О работе',
    icon: '💼',
    from: 'B1',
    goal: 'Рассказать, чем занимаешься, и обсудить планы.',
    opener: 'So, what do you do for a living?',
    openerRu: 'Итак, чем ты занимаешься?',
  },
  {
    id: 'opinion',
    title: 'Своё мнение',
    icon: '💬',
    from: 'B2',
    goal: 'Высказать мнение и обосновать его.',
    opener: 'I think remote work is better than office work. Do you agree?',
    openerRu: 'Я думаю, удалённая работа лучше офисной. Согласен?',
  },
];

const LEVEL_ORDER = ['A0', 'A1', 'A2', 'B1', 'B2', 'C1'];

/** Сцены, доступные на этом уровне: остальные пока не по силам. */
export function scenariosFor(level) {
  const reached = LEVEL_ORDER.indexOf(level);
  return SCENARIOS.filter((s) => LEVEL_ORDER.indexOf(s.from) <= (reached < 0 ? 0 : reached));
}

export function getScenario(id) {
  return SCENARIOS.find((s) => s.id === id) || null;
}

/* ---------- Запрос к модели ---------- */

const REPLY_FIELDS = {
  reply: {
    type: 'string',
    description: 'Ответ собеседника по-английски, одно-два коротких предложения',
  },
  replyRu: {
    type: 'string',
    description: 'Перевод ответа на русский',
  },
  correction: {
    type: 'object',
    description: 'Разбор ошибки ученика. Если ошибок нет, поля пустые строки.',
    properties: {
      original: { type: 'string', description: 'Как написал ученик, или пустая строка' },
      fixed: { type: 'string', description: 'Как правильно, или пустая строка' },
      explanation: { type: 'string', description: 'Объяснение по-русски, одно предложение' },
    },
    required: ['original', 'fixed', 'explanation'],
  },
  suggestion: {
    type: 'string',
    description: 'Что ученик мог бы ответить дальше — одна короткая фраза по-английски',
  },
};

const REQUIRED = ['reply', 'replyRu', 'correction', 'suggestion'];

const SYSTEM = `Ты — доброжелательный собеседник в разговорном тренажёре для русскоязычного ученика.

Правила разговора:
- Отвечай коротко: одно-два предложения. Длинные реплики начинающий не дочитывает.
- Используй ТОЛЬКО те английские слова, которые ученик уже проходил (список дан ниже), плюс самые базовые служебные. Если нужного слова нет в списке, перефразируй.
- Задавай встречный вопрос, чтобы разговор продолжался. Разговор заканчивается только когда ученик сам уходит.
- Не переходи на русский в поле reply. Русский только в replyRu и в объяснении ошибки.

Про ошибки:
- Замечай ОДНУ, самую важную ошибку в последней реплике ученика. Не разбирай всё сразу — это отбивает охоту говорить.
- Если реплика понятна и грамматически верна, оставь поля correction пустыми строками. Мелкие огрехи стиля ошибкой не считай.
- Объясняй по-русски, одним предложением, без терминов без нужды.
- Никогда не исправляй смысл: если ученик сказал что-то верно, но не так, как сказал бы ты, — это не ошибка.

Подсказка suggestion: короткая фраза, которой ученик мог бы ответить. Она должна состоять из известных ему слов.`;

/** Список знакомых слов — то, чем собеседнику разрешено пользоваться. */
function vocabularyLine(wordIds) {
  const words = wordIds.map((id) => getWord(id)?.en).filter(Boolean);
  return words.length ? words.join(', ') : '(словарь пока пуст — обходись простейшими словами)';
}

export function buildPrompt({ scenario, level, wordIds, history }) {
  const lines = history.map((m) => `${m.role === 'user' ? 'Ученик' : 'Собеседник'}: ${m.en}`);
  return `Уровень ученика: ${level}.
Сцена: ${scenario.title}. ${scenario.goal}

Слова, знакомые ученику:
${vocabularyLine(wordIds)}

Разговор:
${lines.join('\n')}

Ответь на последнюю реплику ученика.`;
}

/**
 * Приводит ответ модели к предсказуемому виду.
 * Схема не гарантия: провайдер может вернуть пустую строку или потерять
 * поле, и экран не должен от этого разваливаться.
 */
export function normalizeReply(raw) {
  const c = raw?.correction || {};
  const hasCorrection = Boolean(String(c.original || '').trim() && String(c.fixed || '').trim());

  return {
    reply: String(raw?.reply || '').trim(),
    replyRu: String(raw?.replyRu || '').trim(),
    suggestion: String(raw?.suggestion || '').trim(),
    correction: hasCorrection
      ? {
          original: String(c.original).trim(),
          fixed: String(c.fixed).trim(),
          explanation: String(c.explanation || '').trim(),
        }
      : null,
  };
}

export async function sendTurn({ scenario, level, wordIds, history }) {
  const raw = await askModel({
    system: SYSTEM,
    prompt: buildPrompt({ scenario, level, wordIds, history }),
    schema: REPLY_FIELDS,
    required: REQUIRED,
  });
  const result = normalizeReply(raw);
  if (!result.reply) throw new Error('Пустой ответ от модели.');
  return result;
}
