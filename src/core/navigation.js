export const NAV = [
  { id: 'dashboard', icon: '🏠', label: 'Главная' },
  { id: 'roadmap', icon: '🗺️', label: 'Учиться' },
  { id: 'review', icon: '🔁', label: 'Повторение' },
  { id: 'vocab', icon: '📖', label: 'Словарь' },
  { id: 'progress', icon: '📈', label: 'Прогресс' },
];

const SECTION_BY_ROUTE = {
  dashboard: 'dashboard',
  exam: 'dashboard',
  roadmap: 'roadmap',
  lesson: 'roadmap',
  milestone: 'roadmap',
  reading: 'roadmap',
  dialogue: 'roadmap',
  review: 'review',
  pronounce: 'review',
  listening: 'review',
  writing: 'review',
  'b2-reading': 'dashboard',
  'b2-listening': 'dashboard',
  'b2-writing': 'dashboard',
  'b2-full-mock': 'dashboard',
  'b2-speaking': 'dashboard',
  'b2-mock': 'dashboard',
  vocab: 'vocab',
  progress: 'progress',
  settings: 'progress',
};

const ROUTE_NAMES = new Set(Object.keys(SECTION_BY_ROUTE));

const SECTION_TABS = {
  dashboard: [
    { id: 'dashboard', label: 'Укрепить базу' },
    { id: 'exam', label: 'Экзамен B2' },
  ],
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

/** Быстрые переходы между связанными способами учиться или повторять. */
export function sectionTabs(routeName) {
  return SECTION_TABS[primarySection(routeName)] || [];
}

export function parseRoute(target) {
  const [name, param] = String(target).split(':');
  return { name, param: param || null };
}

/** Возвращает безопасный маршрут из hash, неизвестные адреса ведут на главную. */
export function routeFromHash(hash) {
  const target = String(hash || '').replace(/^#\/?/, '');
  const route = parseRoute(target || 'dashboard');
  return ROUTE_NAMES.has(route.name) ? route : { name: 'dashboard', param: null };
}

/** Собирает адрес GitHub Pages без зависимости от настройки сервера. */
export function routeHash(target) {
  const { name, param } = typeof target === 'string' ? parseRoute(target) : target;
  return `#/${name}${param ? `:${param}` : ''}`;
}

export function routeTarget(route) {
  return `${route.name}${route.param ? `:${route.param}` : ''}`;
}
