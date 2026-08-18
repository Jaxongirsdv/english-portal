/**
 * Проверка письменных работ. Провайдер выбирается в настройках.
 *
 * Поддерживаются два:
 *   claude — разбор заметно тоньше, но платный;
 *   gemini — бесплатный уровень без карты, качества хватает для разбора
 *            школьных ошибок.
 *
 * У бесплатного варианта есть неочевидное преимущество именно здесь:
 * ключ живёт в браузере, и утечка бесплатного ключа не стоит денег.
 * Для портала, выложенного в интернет, это весомее разницы в качестве.
 *
 * Слой полностью необязателен: без ключа портал работает как раньше.
 */

import { loadState, update } from './storage.js';

/* ---------- Общая схема разбора ---------- */

/**
 * Структура ответа. Схема нужна обоим провайдерам: без неё пришлось бы
 * выковыривать разбор из свободного текста, и любая смена формулировки
 * модели ломала бы приложение.
 */
const REVIEW_FIELDS = {
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
};

const REQUIRED = ['corrected', 'errors', 'comment', 'level'];

const SYSTEM = `Ты — преподаватель английского языка, который проверяет письменные работы русскоязычных учеников.

Разбирай текст ученика по существу:
- Исправляй настоящие ошибки, а не стилистические предпочтения. Если фраза звучит естественно, не трогай её.
- Объясняй каждую ошибку по-русски, коротко и понятно, с опорой на правило.
- Отдельно отмечай ошибки, типичные именно для русскоязычных: пропущенные артикли, «I am agree», порядок слов из русского, калька предлогов, Present Perfect с конкретным временем.
- Уровень определяй по фактической сложности текста, а не по количеству ошибок.
- Общий комментарий начинай с того, что действительно получилось, потом одно главное направление для работы. Без формальной похвалы.

Если ошибок нет, верни пустой список и скажи об этом в комментарии.`;

function buildTask({ task, text, level }) {
  return `Уровень ученика: ${level}.
Задание: ${task}

Работа ученика:
"""
${text}
"""`;
}

/* ---------- Провайдеры ---------- */

export const PROVIDERS = {
  claude: {
    label: 'Claude',
    keyField: 'apiKey',
    keyHint: 'sk-ant-…',
    console: 'console.anthropic.com',
    free: false,
    note: 'Разбор тоньше, но каждая проверка платная.',
  },
  gemini: {
    label: 'Gemini',
    keyField: 'geminiKey',
    keyHint: 'AIza…',
    console: 'aistudio.google.com/apikey',
    free: true,
    note: 'Бесплатный уровень без привязки карты. Для разбора школьных ошибок этого достаточно.',
  },
};

export function currentProvider() {
  const p = loadState().settings.aiProvider;
  return PROVIDERS[p] ? p : 'gemini';
}

export function setProvider(name) {
  if (!PROVIDERS[name]) return;
  update((s) => {
    s.settings.aiProvider = name;
  });
}

export function hasKey(provider = currentProvider()) {
  const field = PROVIDERS[provider].keyField;
  const key = loadState().settings[field];
  return typeof key === 'string' && key.trim().length > 0;
}

export function saveKey(key, provider = currentProvider()) {
  const field = PROVIDERS[provider].keyField;
  update((s) => {
    s.settings[field] = (key || '').trim();
  });
}

export function forgetKey(provider = currentProvider()) {
  const field = PROVIDERS[provider].keyField;
  update((s) => {
    s.settings[field] = '';
  });
}

/** Маска для показа в настройках — полный ключ на экран не выводим. */
export function maskedKey(provider = currentProvider()) {
  const key = loadState().settings[PROVIDERS[provider].keyField] || '';
  if (key.length < 12) return key ? '••••' : '';
  return `${key.slice(0, 6)}…${key.slice(-4)}`;
}

function keyOf(provider) {
  const key = loadState().settings[PROVIDERS[provider].keyField];
  if (!key) throw new Error('no-key');
  return key;
}

/* ---------- Claude ---------- */

/**
 * SDK подгружаем по требованию: он нужен только здесь, и незачем тащить
 * его в основной бандл, который должен открываться офлайн.
 */
let anthropicPromise = null;

async function askClaude({ system, prompt, schema, required }) {
  const apiKey = keyOf('claude');
  if (!anthropicPromise) {
    anthropicPromise = import('@anthropic-ai/sdk').then(({ default: A }) => A);
  }
  const Anthropic = await anthropicPromise;
  const client = new Anthropic({ apiKey, dangerouslyAllowBrowser: true });

  const response = await client.messages.create({
    model: 'claude-opus-5',
    max_tokens: 16000,
    system,
    // Задача узкая и хорошо описанная — средний уровень усилий даёт
    // то же качество разбора заметно дешевле
    output_config: {
      effort: 'medium',
      format: {
        type: 'json_schema',
        schema: {
          type: 'object',
          properties: schema,
          required,
          additionalProperties: false,
        },
      },
    },
    messages: [{ role: 'user', content: prompt }],
  });

  if (response.stop_reason === 'refusal') {
    throw new Error('Модель отказалась отвечать на это.');
  }
  const block = response.content.find((b) => b.type === 'text');
  if (!block) throw new Error('Пустой ответ от модели.');
  return JSON.parse(block.text);
}

/* ---------- Gemini ---------- */

const GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/interactions';
const GEMINI_MODEL = 'gemini-3.6-flash';

async function askGemini({ system, prompt, schema, required }) {
  const apiKey = keyOf('gemini');

  const response = await fetch(GEMINI_URL, {
    method: 'POST',
    headers: { 'x-goog-api-key': apiKey, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: GEMINI_MODEL,
      // Отдельного поля для системной инструкции здесь нет — кладём её
      // в начало запроса
      input: `${system}\n\n${prompt}`,
      response_format: {
        type: 'text',
        mime_type: 'application/json',
        // Без additionalProperties: схему принимает не любой набор
        // ключевых слов JSON Schema
        schema: { type: 'object', properties: schema, required },
      },
    }),
  });

  if (!response.ok) {
    const err = new Error(`gemini-${response.status}`);
    err.status = response.status;
    try {
      const body = await response.json();
      err.detail = body?.error?.message || body?.[0]?.error?.message;
    } catch {
      /* тело может быть не JSON */
    }
    throw err;
  }

  const data = await response.json();
  const step = data.steps?.find((s) => s.type === 'model_output') || data.steps?.at(-1);
  const text = step?.content?.find((c) => c.type === 'text')?.text;
  if (!text) throw new Error('Пустой ответ от модели.');
  return JSON.parse(text);
}

/* ---------- Общая точка входа ---------- */

export function describeError(err) {
  if (err?.message === 'no-key') return 'Не задан ключ. Добавь его в «Настройках».';

  const status = err?.status;
  if (status === 400 && err.detail) return `Запрос отклонён: ${err.detail}`;
  if (status === 401 || status === 403) return 'Ключ не принят. Проверь его в «Настройках».';
  if (status === 429) return 'Исчерпан лимит запросов. Подожди немного и попробуй снова.';
  if (status >= 500) return 'Сервис временно недоступен. Попробуй позже.';
  // Ответа нет — запрос не дошёл. navigator.onLine тут не помощник:
  // он показывает «онлайн» и при мёртвом соединении
  if (!status) {
    return (
      'Запрос не дошёл до сервиса. Обычно это обрыв связи, блокировщик ' +
      'в браузере или VPN. Интернет нужен только разбору письма ' +
      'и разговору — остальные разделы работают без сети.'
    );
  }
  return `Сервис ответил ошибкой: ${err?.detail || err?.message || 'неизвестная ошибка'}`;
}

/** Отправляет работу на проверку выбранным провайдером. */
/**
 * Единственный способ обратиться к модели.
 *
 * Провайдеры различаются формой запроса, но не задачей: и разбор письма,
 * и разговор просят структурированный ответ по схеме. Держать две копии
 * этих реализаций значило бы чинить любую ошибку сети дважды.
 */
export async function askModel({ system, prompt, schema, required }) {
  const ask = currentProvider() === 'claude' ? askClaude : askGemini;
  return ask({ system, prompt, schema, required });
}

export async function reviewWriting(input) {
  return askModel({
    system: SYSTEM,
    prompt: buildTask(input),
    schema: REVIEW_FIELDS,
    required: REQUIRED,
  });
}
