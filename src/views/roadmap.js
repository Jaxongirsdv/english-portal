import { loadState } from '../core/storage.js';
import { CURRICULUM } from '../data/curriculum.js';
import { reviewDebt } from '../core/analytics.js';
import {
  isLessonUnlocked,
  isLevelUnlocked,
  isMilestoneUnlocked,
  levelProgress,
  nextCurriculumStep,
} from '../core/curriculum-progress.js';
import { esc, progressBar, plural } from '../core/ui.js';
import { lessonStage } from '../core/lesson-progress.js';

/** С какого отставания предупреждение перестаёт быть придиркой. */
const DEBT_THRESHOLD = 15;

/**
 * Предупреждение о невыученном — ровно там, где выбирают следующий урок.
 *
 * Разбор прогресса про этот долг уже говорит, но он в другом разделе,
 * а решение «пройти ещё урок» принимается здесь. Каждый новый урок
 * добавляет слов в очередь, и если очередь и так не разбирается, урок
 * не приближает к цели — он просто увеличивает то, что забудется.
 *
 * Предупреждение не запрещает: человек вправе идти дальше, просто
 * теперь он видит цену.
 */
function debtCallout(state) {
  const { waiting } = reviewDebt(state);
  if (waiting < DEBT_THRESHOLD) return '';

  return `
    <div class="roadmap-debt mb-4">
      <div><span class="callout-label">Перед новым уроком</span><strong>${waiting} слов ждут первого повторения</strong></div>
      <p>Закрепи хотя бы короткую сессию, чтобы новый материал не вытеснил старый.</p>
      <button class="btn btn-primary" data-nav="review">Выбрать сессию</button>
    </div>`;
}

export function renderRoadmap() {
  const state = loadState();
  const next = nextCurriculumStep(state);

  return `
    <div class="roadmap-head">
      <div><span class="eyebrow">Твой маршрут</span><h1>Дорожная карта</h1><p class="subtitle">От нуля до Advanced. Каждый этап открывает следующий.</p></div>
      ${next ? `<div class="roadmap-next">
        <span>Сейчас в работе · ${esc(next.level.code)}</span>
        <strong>${next.type === 'lesson' ? esc(next.lesson.title) : `Milestone ${esc(next.level.code)}`}</strong>
        <button class="btn btn-primary" data-nav="${esc(next.route)}">Продолжить ${esc(next.level.code)} →</button>
      </div>` : '<div class="roadmap-next roadmap-next--done"><span>Маршрут завершён</span><strong>Все уровни пройдены</strong></div>'}
    </div>

    ${debtCallout(state)}

    <div class="roadmap-level-label"><span>Уровни курса</span><small>Завершённые уровни можно раскрыть</small></div>

    ${CURRICULUM.map((level) => {
      const { total, done, complete } = levelProgress(state, level);
      const levelUnlocked = isLevelUnlocked(state, level);
      const milestone = state.milestones?.[level.id];
      const milestoneUnlocked = isMilestoneUnlocked(state, level.id);
      const collapsed = !!milestone?.passed;
      const current = next?.level.id === level.id;

      return `
        <div class="level-card${levelUnlocked ? '' : ' level-card--locked'}${collapsed ? ' level-card--complete' : ''}${current ? ' level-card--current' : ''}">
          <div class="level-head">
            <span class="level-code${milestone?.passed ? ' done' : ''}">${esc(level.code)}</span>
            <strong style="font-size:17px">${esc(level.title)}</strong>
            <span class="faint" style="margin-left:auto">${
              collapsed ? `✓ ${total} уроков` : levelUnlocked ? `${done} / ${total}` : 'заблокировано'
            }</span>
            ${collapsed ? `<button class="btn btn-ghost level-expand" data-toggle-level="${esc(level.id)}" aria-expanded="false">Показать</button>` : ''}
          </div>
          ${!collapsed ? `<div class="faint" style="margin-bottom:12px">${esc(level.goal)}</div>` : ''}
          ${levelUnlocked && !collapsed ? progressBar((done / total) * 100, milestone?.passed) : ''}

          <div data-level-body="${esc(level.id)}" ${collapsed ? 'hidden' : ''}>
          ${levelUnlocked ? level.units
            .map((unit) => {
              const uDone = unit.lessons.filter((l) => lessonStage(state.lessons[l.id]) === 'mastered').length;
              const planned = unit.planned || unit.lessons.length === 0;
              return `
                <div class="unit${planned ? ' unit-planned' : ''}">
                  <div class="unit-icon">${esc(unit.icon || '📘')}</div>
                  <div style="flex:1">
                    <div class="unit-title">${esc(unit.title)}</div>
                    <div class="unit-meta">${
                      planned
                        ? 'в разработке'
                        : `${uDone} из ${plural(unit.lessons.length, 'урока', 'уроков', 'уроков')} пройдено`
                    }</div>
                  </div>
                  ${
                    planned
                      ? ''
                      : `<button class="btn btn-ghost" data-toggle-unit="${esc(unit.id)}">Уроки</button>`
                  }
                </div>
                <div data-unit-body="${esc(unit.id)}" hidden style="padding-left:46px">
                  ${unit.lessons
                    .map((lesson) => {
                      const stage = lessonStage(state.lessons[lesson.id]);
                      const isDone = stage === 'mastered';
                      const needsWork = stage === 'attempted' || stage === 'completed';
                      const unlocked = isLessonUnlocked(state, lesson.id);
                      return `
                        <button class="lesson-row${unlocked ? '' : ' lesson-row--locked'}" ${unlocked ? `data-nav="lesson:${esc(lesson.id)}"` : 'disabled'}>
                          <span class="lesson-check${isDone ? ' done' : needsWork ? ' needs-work' : ''}">${isDone ? '✓' : needsWork ? '!' : unlocked ? '→' : '×'}</span>
                          <span style="flex:1">${esc(lesson.title)}</span>
                          <span class="faint">${needsWork ? `${state.lessons[lesson.id].score || 0}% · закрепить` : unlocked ? `${lesson.duration} мин` : 'сначала 80% в предыдущем'}</span>
                        </button>`;
                    })
                    .join('')}
                </div>`;
            })
            .join('') : '<div class="curriculum-lock"><strong>Уровень пока закрыт</strong><span>Заверши milestone предыдущего уровня, чтобы продолжить.</span></div>'}

          ${levelUnlocked ? `<div class="milestone-row${milestoneUnlocked ? ' milestone-row--open' : ''}${milestone?.passed ? ' milestone-row--done' : ''}">
            <div class="milestone-row__icon">${milestone?.passed ? '✓' : milestoneUnlocked ? 'M' : '×'}</div>
            <div><strong>Milestone ${esc(level.code)}</strong><div class="faint">${milestone?.passed ? `Пройдено · лучший результат ${milestone.bestScore}%` : milestoneUnlocked ? '12 заданий · язык, Reading, Listening · нужно 80%' : `Откроется после ${total - done} оставшихся уроков`}</div></div>
            ${milestoneUnlocked && !milestone?.passed ? `<button class="btn btn-primary" data-nav="milestone:${esc(level.id)}">Пройти</button>` : ''}
          </div>` : ''}
          </div>
        </div>`;
    }).join('')}
  `;
}
