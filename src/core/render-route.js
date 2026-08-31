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
import { renderExam } from '../views/exam.js';
import { renderB2Objective } from '../views/b2-objective.js';
import { renderB2Writing } from '../views/b2-writing.js';
import { renderFullMock } from '../views/b2-full-mock.js';

const SCREEN_RENDERERS = {
  dashboard: () => renderDashboard(),
  exam: () => renderExam(),
  roadmap: () => renderRoadmap(),
  lesson: () => Lesson.renderLesson(),
  milestone: () => renderMilestone(),
  review: () => Review.renderReview(),
  pronounce: () => Pronounce.renderPronounce(),
  listening: () => Listening.renderListening(),
  writing: () => Writing.renderWriting(),
  'b2-reading': () => renderB2Objective('Reading'),
  'b2-listening': () => renderB2Objective('Listening'),
  'b2-writing': () => renderB2Writing(),
  'b2-full-mock': () => renderFullMock(),
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
