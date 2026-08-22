import { renderDashboard } from '../views/dashboard.js';
import { renderRoadmap } from '../views/roadmap.js';
import { renderVocab } from '../views/vocab.js';
import { renderProgress } from '../views/progress.js';
import { renderSettings } from '../views/settings.js';
import * as Lesson from '../views/lesson.js';
import * as Review from '../views/review.js';
import * as Pronounce from '../views/pronounce.js';
import * as Listening from '../views/listening.js';
import * as Writing from '../views/writing.js';
import * as Dialogue from '../views/dialogue.js';
import * as Reading from '../views/reading.js';

const SCREEN_RENDERERS = {
  dashboard: () => renderDashboard(),
  roadmap: () => renderRoadmap(),
  lesson: () => Lesson.renderLesson(),
  review: () => Review.renderReview(),
  pronounce: () => Pronounce.renderPronounce(),
  listening: () => Listening.renderListening(),
  writing: () => Writing.renderWriting(),
  dialogue: () => Dialogue.renderDialogue(),
  reading: () => Reading.renderReading(),
  vocab: () => renderVocab(),
  progress: () => renderProgress(),
  settings: () => renderSettings(),
};

export function renderRoute(route) {
  return SCREEN_RENDERERS[route.name]?.() ?? '<div class="empty">Страница не найдена</div>';
}
