export const NAV = [
  { id: 'dashboard', icon: '🏠', label: 'Сегодня' },
  { id: 'roadmap', icon: '🗺️', label: 'Курс' },
  { id: 'review', icon: '🔁', label: 'Практика' },
  { id: 'vocab', icon: '📖', label: 'Словарь' },
  { id: 'progress', icon: '📈', label: 'Прогресс' },
];

export const EXAM_NAV = [
  { id: 'exam', icon: '◎', label: 'Сегодня' },
  { id: 'exam-skills', icon: '◇', label: 'Навыки' },
  { id: 'exam-mocks', icon: '◷', label: 'Пробники' },
  { id: 'exam-errors', icon: '!', label: 'Ошибки' },
  { id: 'exam-readiness', icon: '△', label: 'Готовность' },
];

export function navigationForProgram(program) {
  return program === 'exam' ? EXAM_NAV : NAV;
}

const SECTION_BY_ROUTE = {
  dashboard: 'dashboard',
  exam: 'exam',
  'exam-skills': 'exam-skills',
  'exam-mocks': 'exam-mocks',
  'exam-errors': 'exam-errors',
  'exam-readiness': 'exam-readiness',
  roadmap: 'roadmap',
  lesson: 'roadmap',
  milestone: 'roadmap',
  reading: 'roadmap',
  dialogue: 'roadmap',
  review: 'review',
  pronounce: 'review',
  listening: 'review',
  writing: 'review',
  'b2-reading': 'exam-skills',
  'b2-listening': 'exam-skills',
  'b2-writing': 'exam-skills',
  'b2-speaking': 'exam-skills',
  'b2-full-mock': 'exam-mocks',
  'b2-mock': 'exam-mocks',
  vocab: 'vocab',
  progress: 'progress',
  settings: 'progress',
};

const ROUTE_NAMES = new Set(Object.keys(SECTION_BY_ROUTE));

const PUBLIC_ROUTE = {
  dashboard: 'foundation/today',
  roadmap: 'foundation/course',
  lesson: 'foundation/lesson',
  milestone: 'foundation/milestone',
  reading: 'foundation/reading',
  dialogue: 'foundation/dialogue',
  review: 'foundation/practice',
  pronounce: 'foundation/pronunciation',
  listening: 'foundation/listening',
  writing: 'foundation/writing',
  vocab: 'foundation/vocab',
  progress: 'foundation/progress',
  settings: 'settings',
  exam: 'exam/today',
  'exam-skills': 'exam/skills',
  'exam-mocks': 'exam/mocks',
  'exam-errors': 'exam/errors',
  'exam-readiness': 'exam/readiness',
  'b2-reading': 'exam/reading',
  'b2-listening': 'exam/listening',
  'b2-writing': 'exam/writing',
  'b2-speaking': 'exam/speaking',
  'b2-mock': 'exam/diagnostic',
  'b2-full-mock': 'exam/full-mock',
};

const INTERNAL_ROUTE = Object.fromEntries(Object.entries(PUBLIC_ROUTE).map(([internal, publicName]) => [publicName, internal]));

const SECTION_TABS = {
  roadmap: [
    { id: 'roadmap', label: 'Уроки' },
    { id: 'reading', label: 'Чтение' },
    { id: 'dialogue', label: 'Диалоги' },
  ],
  review: [
    { id: 'review', label: 'Карточки' },
    { id: 'pronounce', label: 'Произношение' },
    { id: 'listening', label: 'Аудирование' },
    { id: 'writing', label: 'Письмо' },
  ],
};

/** Основной раздел для вложенного режима — нужен для подсветки меню. */
export function primarySection(routeName) {
  return SECTION_BY_ROUTE[routeName] || 'dashboard';
}

export function programForRoute(routeName, fallback = 'foundation') {
  if (routeName === 'settings') return fallback;
  return ['exam', 'exam-skills', 'exam-mocks', 'exam-errors', 'exam-readiness'].includes(primarySection(routeName))
    ? 'exam'
    : 'foundation';
}

/** Быстрые переходы между связанными способами учиться или повторять. */
export function sectionTabs(routeName) {
  return SECTION_TABS[primarySection(routeName)] || [];
}

export function parseRoute(target) {
  const [name, param] = String(target).split(':');
  return { name, param: param || null };
}

/** Возвращает безопасный маршрут из hash, неизвестные адреса ведут на главную. */
export function routeFromHash(hash, fallback = 'dashboard') {
  const target = String(hash || '').replace(/^#\/?/, '');
  const route = parseRoute(target || fallback);
  route.name = INTERNAL_ROUTE[route.name] || route.name;
  return ROUTE_NAMES.has(route.name) ? route : parseRoute(fallback);
}

/** Собирает адрес GitHub Pages без зависимости от настройки сервера. */
export function routeHash(target) {
  const { name, param } = typeof target === 'string' ? parseRoute(target) : target;
  const publicName = PUBLIC_ROUTE[name] || name;
  return `#/${publicName}${param ? `:${param}` : ''}`;
}

export function routeTarget(route) {
  return `${route.name}${route.param ? `:${route.param}` : ''}`;
}
