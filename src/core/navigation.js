export const NAV = [
  { id: 'dashboard', icon: '🏠', label: 'Главная' },
  { id: 'roadmap', icon: '🗺️', label: 'Учиться' },
  { id: 'review', icon: '🔁', label: 'Повторение' },
  { id: 'vocab', icon: '📖', label: 'Словарь' },
  { id: 'progress', icon: '📈', label: 'Прогресс' },
];

const SECTION_BY_ROUTE = {
  dashboard: 'dashboard',
  roadmap: 'roadmap',
  lesson: 'roadmap',
  reading: 'roadmap',
  dialogue: 'roadmap',
  review: 'review',
  pronounce: 'review',
  listening: 'review',
  writing: 'review',
  vocab: 'vocab',
  progress: 'progress',
  settings: 'progress',
};

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

/** Быстрые переходы между связанными способами учиться или повторять. */
export function sectionTabs(routeName) {
  return SECTION_TABS[primarySection(routeName)] || [];
}

export function parseRoute(target) {
  const [name, param] = String(target).split(':');
  return { name, param: param || null };
}
