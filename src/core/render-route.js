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
import { renderB2Speaking } from '../views/b2-speaking.js';
import { renderB2Mock } from '../views/b2-mock.js';
import { renderMilestone } from '../views/milestone.js';

const SCREEN_RENDERERS = {
  dashboard: () => renderDashboard(),
  roadmap: () => renderRoadmap(),
  lesson: () => Lesson.renderLesson(),
  milestone: () => renderMilestone(),
  review: () => Review.renderReview(),
  pronounce: () => Pronounce.renderPronounce(),
  listening: () => Listening.renderListening(),
  writing: () => Writing.renderWriting(),
  'b2-speaking': () => renderB2Speaking(),
  'b2-mock': () => renderB2Mock(),
  dialogue: () => Dialogue.renderDialogue(),
  reading: () => Reading.renderReading(),
  vocab: () => renderVocab(),
  progress: () => renderProgress(),
  settings: () => renderSettings(),
};

export function renderRoute(route) {
  return SCREEN_RENDERERS[route.name]?.() ?? '<div class="empty">Страница не найдена</div>';
}
