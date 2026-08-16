/**
 * Распознавание речи через Web Speech API.
 *
 * Важное ограничение, о котором честнее сказать сразу: это не фонетический
 * анализатор. Он не измеряет качество звуков и не ставит акцент — он лишь
 * отвечает на вопрос «понял ли распознаватель, что я сказал». Как приблизка
 * это работает: если движок стабильно слышит вместо think слово sink,
 * произношение действительно хромает. Но отсутствие ошибок здесь
 * не означает безупречный акцент.
 *
 * Работает в Chrome и Edge, требует интернета (звук уходит на сервер
 * распознавания) и разрешения на микрофон.
 */

/**
 * Ищем движок при каждом обращении, а не один раз при загрузке модуля:
 * в некоторых браузерах он появляется не сразу, да и подменить его
 * в проверках так гораздо проще.
 */
function getEngine() {
  if (typeof window === 'undefined') return null;
  return window.SpeechRecognition || window.webkitSpeechRecognition || null;
}

export function isSupported() {
  return !!getEngine();
}

/** Человеческие описания кодов ошибок Web Speech API. */
export const ERRORS = {
  'not-allowed': 'Нет доступа к микрофону. Разреши его в настройках браузера.',
  'service-not-allowed': 'Браузер запретил распознавание речи.',
  'no-speech': 'Ничего не услышал. Говори чуть громче и ближе к микрофону.',
  'audio-capture': 'Микрофон не найден.',
  network: 'Распознаванию нужен интернет — сейчас его нет.',
  aborted: 'Запись прервана.',
  unsupported: 'Этот браузер не умеет распознавать речь. Открой портал в Chrome или Edge.',
};

export function describeError(code) {
  return ERRORS[code] || `Не удалось распознать (${code}).`;
}

let active = null;

/** Останавливает текущую запись, если она идёт. */
export function cancel() {
  if (active) {
    try {
      active.abort();
    } catch {
      /* уже остановлена */
    }
    active = null;
  }
}

/**
 * Слушает одну фразу.
 * Возвращает массив гипотез: [{ transcript, confidence }, …]
 */
export function listen({ lang = 'en-US', timeout = 7000 } = {}) {
  return new Promise((resolve, reject) => {
    const Engine = getEngine();
    if (!Engine) {
      reject(new Error('unsupported'));
      return;
    }

    cancel();

    const recognition = new Engine();
    recognition.lang = lang;
    recognition.interimResults = false;
    recognition.continuous = false;
    recognition.maxAlternatives = 5; // несколько гипотез — точнее оценка

    let settled = false;
    const finish = (fn, value) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      active = null;
      fn(value);
    };

    // Некоторые браузеры не завершают распознавание сами — страхуемся
    const timer = setTimeout(() => {
      try {
        recognition.stop();
      } catch {
        /* уже остановлена */
      }
    }, timeout);

    recognition.onresult = (event) => {
      const result = event.results[0];
      const alternatives = Array.from({ length: result.length }, (_, i) => ({
        transcript: result[i].transcript,
        confidence: result[i].confidence,
      }));
      finish(resolve, alternatives);
    };

    recognition.onerror = (event) => finish(reject, new Error(event.error));

    // onend без результата означает, что речи не было
    recognition.onend = () => finish(reject, new Error('no-speech'));

    active = recognition;
    try {
      recognition.start();
    } catch (err) {
      finish(reject, err);
    }
  });
}
