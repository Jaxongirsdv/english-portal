export const NAV = [
  { id: 'dashboard', icon: '🏠', label: 'Главная' },
  { id: 'roadmap', icon: '🗺️', label: 'Дорожная карта' },
  { id: 'review', icon: '🔁', label: 'Повторение' },
  { id: 'pronounce', icon: '🎤', label: 'Произношение' },
  { id: 'listening', icon: '🎧', label: 'Аудирование' },
  { id: 'reading', icon: '📕', label: 'Чтение' },
  { id: 'writing', icon: '✍️', label: 'Письмо' },
  { id: 'dialogue', icon: '🗣️', label: 'Разговор' },
  { id: 'vocab', icon: '📖', label: 'Словарь' },
  { id: 'progress', icon: '📈', label: 'Разбор' },
  { id: 'settings', icon: '⚙️', label: 'Настройки' },
];

export function parseRoute(target) {
  const [name, param] = String(target).split(':');
  return { name, param: param || null };
}
