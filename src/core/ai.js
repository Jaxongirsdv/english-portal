/**
 * Проверка письменных работ через Claude API.
 *
 * Слой полностью необязателен: без ключа портал работает как раньше,
 * а этот раздел честно объясняет, чего не хватает. Ключ хранится
 * в localStorage и никуда, кроме api.anthropic.com, не уходит.
 *
 * О безопасности прямо: браузерный вызов означает, что ключ лежит
 * в этом браузере и виден любому, кто откроет консоль. Для личного
 * портала на своей машине это приемлемый размен, для публичного
 * сайта — нет. Подробнее в README.
 */

import { loadState, update } from './storage.js';

const MODEL = 'claude-opus-5';

/** Структура разбора. Схема гарантирует, что ответ разберётся без парсинга текста. */
const REVIEW_SCHEMA = {
  type: 'object',
  properties: {
    corrected: {
      type: 'string',
      description: 'Исправленный текст целиком, естественный английский',
    },
    errors: {
      type: 'array',
      description: 'Найденные ошибки, каждая отдельно',
      items: {
        type: 'object',
        properties: {
          original: { type: 'string', description: 'Фрагмент как написал ученик' },
          fixed: { type: 'string', description: 'Как должно быть' },
          kind: {
            type: 'string',
            enum: ['grammar', 'vocabulary', 'word-order', 'article', 'preposition', 'spelling', 'style'],
          },
          explanation: {
            type: 'string',
            description: 'Объяснение на русском языке, одно-два предложения',
          },
        },
        required: ['original', 'fixed', 'kind', 'explanation'],
        additionalProperties: false,
      },
    },
    comment: {
      type: 'string',
      description: 'Общий комментарий на русском: что удалось, над чем работать',
    },
    level: {
      type: 'string',
      enum: ['A0', 'A1', 'A2', 'B1', 'B2', 'C1'],
      description: 'Уровень, которому соответствует текст',
    },
  },
  required: ['corrected', 'errors', 'comment', 'level'],
  additionalProperties: false,
};

const SYSTEM = `Ты — преподаватель английского языка, который проверяет письменные работы русскоязычных учеников.

Разбирай текст ученика по существу:
- Исправляй настоящие ошибки, а не стилистические предпочтения. Если фраза звучит естественно, не трогай её.
- Объясняй каждую ошибку по-русски, коротко и понятно, с опорой на правило.
- Отдельно отмечай ошибки, типичные именно для русскоязычных: пропущенные артикли, «I am agree», порядок слов из русского, калька предлогов, Present Perfect с конкретным временем.
- Уровень определяй по фактической сложности текста, а не по количеству ошибок.
- Общий комментарий начинай с того, что действительно получилось, потом одно главное направление для работы. Без формальной похвалы.

Если ошибок нет, верни пустой список и скажи об этом в комментарии.`;

export function hasKey() {
  const key = loadState().settings.apiKey;
  return typeof key === 'string' && key.trim().length > 0;
}

export function saveKey(key) {
  update((s) => {
    s.settings.apiKey = (key || '').trim();
  });
}

export function forgetKey() {
  update((s) => {
    s.settings.apiKey = '';
  });
}

/** Маска для показа в настройках — полный ключ на экран не выводим. */
export function maskedKey() {
  const key = loadState().settings.apiKey || '';
  if (key.length < 12) return key ? '••••' : '';
  return `${key.slice(0, 7)}…${key.slice(-4)}`;
}

/**
 * SDK подгружаем по требованию: он нужен только здесь, и незачем
 * тащить его в основной бандл, который должен открываться офлайн.
 */
let clientPromise = null;

async function getClient() {
  const apiKey = loadState().settings.apiKey;
  if (!apiKey) throw new Error('no-key');

  if (!clientPromise) {
    clientPromise = import('@anthropic-ai/sdk').then(({ default: Anthropic }) => Anthropic);
  }
  const Anthropic = await clientPromise;

  return new Anthropic({
    apiKey,
    // Портал живёт в браузере: без этого флага SDK откажется работать.
    dangerouslyAllowBrowser: true,
  });
}

/** Понятные сообщения вместо кодов ошибок. */
export function describeError(err) {
  if (err?.message === 'no-key') {
    return 'Не задан ключ API. Добавь его в «Настройках».';
  }
  const status = err?.status;
  if (status === 401) return 'Ключ API не принят. Проверь его в «Настройках».';
  if (status === 403) return 'У ключа нет доступа к этой модели.';
  if (status === 429) return 'Слишком много запросов. Подожди минуту и попробуй снова.';
  if (status === 400) return `Запрос отклонён: ${err.message}`;
  if (status >= 500) return 'Сервис временно недоступен. Попробуй позже.';
  if (err?.name === 'APIConnectionError' || !navigator.onLine) {
    return 'Нет связи. Проверка письма — единственный раздел, которому нужен интернет.';
  }
  return `Не удалось проверить: ${err?.message || 'неизвестная ошибка'}`;
}

/**
 * Отправляет работу на проверку.
 * Возвращает объект по схеме REVIEW_SCHEMA.
 */
export async function reviewWriting({ task, text, level }) {
  const client = await getClient();

  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 16000,
    system: SYSTEM,
    // Задача узкая и хорошо описанная — средний уровень усилий здесь
    // даёт то же качество разбора заметно дешевле.
    output_config: {
      effort: 'medium',
      format: { type: 'json_schema', schema: REVIEW_SCHEMA },
    },
    messages: [
      {
        role: 'user',
        content: `Уровень ученика: ${level}.
Задание: ${task}

Работа ученика:
"""
${text}
"""`,
      },
    ],
  });

  if (response.stop_reason === 'refusal') {
    throw new Error('Модель отказалась разбирать этот текст.');
  }

  const block = response.content.find((b) => b.type === 'text');
  if (!block) throw new Error('Пустой ответ от модели.');

  return JSON.parse(block.text);
}
