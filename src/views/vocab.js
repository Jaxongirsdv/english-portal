import { VOCAB } from '../data/vocab.js';
import { wordProgress } from '../core/srs.js';
import { esc, speakBtn } from '../core/ui.js';
import { unlockedVocabIds } from '../data/curriculum.js';
import { loadState } from '../core/storage.js';

let filter = 'all';
let query = '';
let level = 'all';
let topic = 'all';
let scope = 'unlocked';
let sort = 'course';
let page = 1;
const PAGE_SIZE = 24;
const STATUS_FILTERS = new Set(['all', 'learning', 'mastered', 'due']);
const LEVELS = ['A0', 'A1', 'A2', 'B1', 'B2', 'C1'];

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
  if (STATUS_FILTERS.has(value)) filter = value;
  else if (TOPICS[value]) topic = value;
  else filter = 'all';
  page = 1;
}
export function setQuery(value) {
  query = value;
  page = 1;
}
export function setVocabControl(name, value) {
  if (name === 'level') level = LEVELS.includes(value) ? value : 'all';
  if (name === 'topic') topic = TOPICS[value] ? value : 'all';
  if (name === 'scope') scope = value === 'all' ? 'all' : 'unlocked';
  if (name === 'sort') sort = ['course', 'alpha', 'progress'].includes(value) ? value : 'course';
  page = 1;
}
export function setVocabPage(value) {
  const next = Number(value);
  if (!Number.isInteger(next) || next < 1) return false;
  page = next;
  return true;
}

/** Значок для одной стороны карточки: 👁 узнавание, ✍️ воспроизведение. */
function sideBadge(icon, card, mastered) {
  if (!card) return `<span class="word-status new" title="ещё не начато">${icon} —</span>`;
  if (mastered) return `<span class="word-status mastered" title="выучено">${icon} ✓</span>`;
  return `<span class="word-status learning" title="в изучении">${icon} ${card.interval || 0}д</span>`;
}

function wordPercent(p) {
  if (p.mastered) return 100;
  const intervals = [p.rec?.interval || 0, p.prod?.interval || 0];
  return Math.min(99, Math.round((intervals[0] / 21 + intervals[1] / 21) * 50));
}

export function renderVocab() {
  const q = query.trim().toLowerCase();
  const unlocked = new Set(unlockedVocabIds(loadState().lessons));

  const list = VOCAB.filter((w) => {
    const p = wordProgress(w.id);
    const due = [p.rec, p.prod].some((card) => card && card.due <= new Date().toISOString().slice(0, 10));
    if (filter === 'learning' && (!p.started || p.mastered)) return false;
    if (filter === 'mastered' && !p.mastered) return false;
    if (filter === 'due' && !due) return false;
    if (scope === 'unlocked' && !unlocked.has(w.id)) return false;
    if (level !== 'all' && w.level !== level) return false;
    if (topic !== 'all' && w.topic !== topic) return false;
    if (!q) return true;
    return w.en.toLowerCase().includes(q) || w.ru.toLowerCase().includes(q);
  }).sort((a, b) => {
    if (sort === 'alpha') return a.en.localeCompare(b.en, 'en');
    if (sort === 'progress') return wordPercent(wordProgress(b.id)) - wordPercent(wordProgress(a.id));
    return VOCAB.indexOf(a) - VOCAB.indexOf(b);
  });

  const topics = [...new Set(VOCAB
    .filter((w) => (scope === 'all' || unlocked.has(w.id)) && (level === 'all' || w.level === level))
    .map((w) => w.topic))];
  const counts = VOCAB.reduce((out, w) => {
    const p = wordProgress(w.id);
    const due = [p.rec, p.prod].some((card) => card && card.due <= new Date().toISOString().slice(0, 10));
    out.learning += p.started && !p.mastered ? 1 : 0;
    out.mastered += p.mastered ? 1 : 0;
    out.due += due ? 1 : 0;
    return out;
  }, { learning: 0, mastered: 0, due: 0 });
  const pageCount = Math.max(1, Math.ceil(list.length / PAGE_SIZE));
  page = Math.min(page, pageCount);
  const visible = list.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return `
    <h1>Словарь</h1>
    <p class="subtitle">
      ${VOCAB.length} слов. Нажми 🔊, чтобы услышать произношение.
      Значки справа — две стороны карточки: 👁 узнавание (англ. → рус.)
      и ✍️ воспроизведение (рус. → англ.), у каждой свой интервал.
    </p>

    <div class="vocab-toolbar">
      <input class="text-input" placeholder="Поиск по слову или переводу…"
             data-vocab-search value="${esc(query)}" />
      <select class="theme-select" data-vocab-control="scope" aria-label="Доступность слов">
        <option value="unlocked" ${scope === 'unlocked' ? 'selected' : ''}>Открытые слова</option>
        <option value="all" ${scope === 'all' ? 'selected' : ''}>Весь словарь</option>
      </select>
    </div>

    <div class="vocab-statuses">
      <button class="chip${filter === 'all' ? ' active' : ''}"
              style="${filter === 'all' ? 'border-color:var(--accent);color:var(--accent)' : ''}"
              data-filter="all">Все</button>
      <button class="chip${filter === 'learning' ? ' active' : ''}" data-filter="learning">В изучении · ${counts.learning}</button>
      <button class="chip${filter === 'mastered' ? ' active' : ''}" data-filter="mastered">Выучено · ${counts.mastered}</button>
      <button class="chip${filter === 'due' ? ' active' : ''}" data-filter="due">К повторению · ${counts.due}</button>
    </div>

    <div class="vocab-controls">
      <label><span>Уровень</span><select class="theme-select" data-vocab-control="level">
        <option value="all">Все уровни</option>
        ${LEVELS.map((item) => `<option value="${item}" ${level === item ? 'selected' : ''}>${item}</option>`).join('')}
      </select></label>
      <label><span>Тема</span><select class="theme-select" data-vocab-control="topic">
        <option value="all">Все темы</option>
        ${topics.map((item) => `<option value="${esc(item)}" ${topic === item ? 'selected' : ''}>${esc(TOPICS[item] || item)}</option>`).join('')}
      </select></label>
      <label><span>Сортировка</span><select class="theme-select" data-vocab-control="sort">
        <option value="course" ${sort === 'course' ? 'selected' : ''}>По курсу</option>
        <option value="alpha" ${sort === 'alpha' ? 'selected' : ''}>По алфавиту</option>
        <option value="progress" ${sort === 'progress' ? 'selected' : ''}>По прогрессу</option>
      </select></label>
      <div class="vocab-result-count"><strong>${list.length}</strong><span>найдено</span></div>
    </div>

    ${
      list.length === 0
        ? '<div class="empty"><div class="empty-icon">🔍</div>Ничего не найдено</div>'
        : visible
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
              <div class="word-progress mt-2" title="Прогресс карточки: ${wordPercent(p)}%"><span style="width:${wordPercent(p)}%"></span></div>
            </div>
            <span class="row" style="gap:4px">
              ${sideBadge('👁', p.rec, p.recMastered)}
              ${sideBadge('✍️', p.prod, p.prodMastered)}
            </span>
          </div>`;
            })
            .join('')
    }
    ${list.length > PAGE_SIZE ? `<nav class="vocab-pagination" aria-label="Страницы словаря">
      <button class="btn btn-ghost" data-vocab-page="${page - 1}" ${page === 1 ? 'disabled' : ''}>← Назад</button>
      <span>Страница <strong>${page}</strong> из ${pageCount}</span>
      <button class="btn btn-ghost" data-vocab-page="${page + 1}" ${page === pageCount ? 'disabled' : ''}>Дальше →</button>
    </nav>` : ''}
  `;
}
