import { VOCAB } from '../data/vocab.js';
import { wordProgress } from '../core/srs.js';
import { esc, speakBtn } from '../core/ui.js';

let filter = 'all';
let query = '';

const TOPICS = {
  greetings: 'Приветствия',
  pronouns: 'Местоимения',
  'to-be': 'Глагол to be',
  numbers: 'Числа',
  basics: 'Базовые слова',
  verbs: 'Глаголы',
  family: 'Семья',
  adjectives: 'Прилагательные',
  'time-place': 'Время и место',
  questions: 'Вопросы',
  'daily-verbs': 'Действия',
  places: 'Места',
  days: 'Дни и время',
  frequency: 'Частота',
  objects: 'Предметы',
  food: 'Еда',
  plurals: 'Особые формы мн. ч.',
  prepositions: 'Предлоги',
  'past-verbs': 'Прошедшее время',
  'time-markers': 'Маркеры времени',
  'action-verbs': 'Действия в процессе',
  comparison: 'Сравнение',
  quantifiers: 'Количество',
  connectors: 'Связки',
  participles: '3-я форма глагола',
  'perfect-markers': 'Маркеры Perfect',
  modals: 'Модальные глаголы',
  conditionals: 'Условные',
  'phrasal-verbs': 'Фразовые глаголы',
  'b1-verbs': 'Глаголы B1',
  'b1-nouns': 'Существительные B1',
  'b2-verbs': 'Глаголы B2',
  'b2-participles': '3-я форма B2',
  'b2-conditionals': 'Сослагательное',
  'b2-linkers': 'Связки рассуждения',
  collocations: 'Устойчивые сочетания',
  idioms: 'Идиомы',
  inversion: 'Инверсия',
  subjunctive: 'Сослагательное C1',
  hedging: 'Смягчение',
  'academic-verbs': 'Академические глаголы',
  'academic-nouns': 'Академические существительные',
  'formal-linkers': 'Формальные связки',
};

export function setFilter(value) {
  filter = value;
}
export function setQuery(value) {
  query = value;
}

/** Значок для одной стороны карточки: 👁 узнавание, ✍️ воспроизведение. */
function sideBadge(icon, card, mastered) {
  if (!card) return `<span class="word-status new" title="ещё не начато">${icon} —</span>`;
  if (mastered) return `<span class="word-status mastered" title="выучено">${icon} ✓</span>`;
  return `<span class="word-status learning" title="в изучении">${icon} ${card.interval || 0}д</span>`;
}

export function renderVocab() {
  const q = query.trim().toLowerCase();

  const list = VOCAB.filter((w) => {
    if (filter !== 'all' && w.topic !== filter) return false;
    if (!q) return true;
    return w.en.toLowerCase().includes(q) || w.ru.toLowerCase().includes(q);
  });

  const topics = [...new Set(VOCAB.map((w) => w.topic))];

  return `
    <h1>Словарь</h1>
    <p class="subtitle">
      ${VOCAB.length} слов. Нажми 🔊, чтобы услышать произношение.
      Значки справа — две стороны карточки: 👁 узнавание (англ. → рус.)
      и ✍️ воспроизведение (рус. → англ.), у каждой свой интервал.
    </p>

    <input class="text-input mb-4" placeholder="Поиск по слову или переводу…"
           data-vocab-search value="${esc(query)}" />

    <div class="row mb-4" style="flex-wrap:wrap;gap:6px">
      <button class="chip${filter === 'all' ? ' active' : ''}"
              style="${filter === 'all' ? 'border-color:var(--accent);color:var(--accent)' : ''}"
              data-filter="all">Все</button>
      ${topics
        .map(
          (t) => `<button class="chip"
              style="${filter === t ? 'border-color:var(--accent);color:var(--accent)' : ''}"
              data-filter="${esc(t)}">${esc(TOPICS[t] || t)}</button>`,
        )
        .join('')}
    </div>

    ${
      list.length === 0
        ? '<div class="empty"><div class="empty-icon">🔍</div>Ничего не найдено</div>'
        : list
            .map((w) => {
              const p = wordProgress(w.id);
              return `
          <div class="word-card">
            ${speakBtn(w.en)}
            <div style="min-width:150px">
              <div class="word-en">${esc(w.en)}</div>
              <div class="word-ipa">${esc(w.ipa)} · <span class="word-rus">${esc(w.rus)}</span></div>
            </div>
            <div style="flex:1">
              <div class="word-ru">${esc(w.ru)}</div>
              <div class="faint">${esc(w.example)}</div>
            </div>
            <span class="row" style="gap:4px">
              ${sideBadge('👁', p.rec, p.recMastered)}
              ${sideBadge('✍️', p.prod, p.prodMastered)}
            </span>
          </div>`;
            })
            .join('')
    }
  `;
}
