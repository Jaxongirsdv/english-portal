import { loadState } from '../core/storage.js';
import { CURRICULUM } from '../data/curriculum.js';
import { reviewDebt } from '../core/analytics.js';
import {
  isLessonUnlocked,
  isLevelUnlocked,
  isMilestoneUnlocked,
  levelProgress,
} from '../core/curriculum-progress.js';
import { esc, progressBar, plural } from '../core/ui.js';

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
    <div class="callout warn mb-4">
      <span class="callout-label">Стоит разгрести</span>
      ${plural(waiting, 'слово', 'слова', 'слов')} из пройденных уроков
      ещё ни разу не повторялись. Новый урок добавит к ним ещё —
      а без повторения они выветрятся, и время на урок уйдёт впустую.
      <div class="mt-4">
        <button class="btn btn-primary" data-nav="review">Повторять</button>
      </div>
    </div>`;
}

export function renderRoadmap() {
  const state = loadState();

  return `
    <h1>Дорожная карта</h1>
    <p class="subtitle">От нуля до Advanced. Уроки открываются по порядку — каждый следующий опирается на предыдущий.</p>

    ${debtCallout(state)}

    ${CURRICULUM.map((level) => {
      const { total, done, complete } = levelProgress(state, level);
      const levelUnlocked = isLevelUnlocked(state, level);
      const milestone = state.milestones?.[level.id];
      const milestoneUnlocked = isMilestoneUnlocked(state, level.id);

      return `
        <div class="level-card${levelUnlocked ? '' : ' level-card--locked'}">
          <div class="level-head">
            <span class="level-code${milestone?.passed ? ' done' : ''}">${esc(level.code)}</span>
            <strong style="font-size:17px">${esc(level.title)}</strong>
            <span class="faint" style="margin-left:auto">${
              levelUnlocked ? `${done} / ${total}` : 'заблокировано'
            }</span>
          </div>
          <div class="faint" style="margin-bottom:12px">${esc(level.goal)}</div>
          ${levelUnlocked ? progressBar((done / total) * 100, milestone?.passed) : ''}

          ${levelUnlocked ? level.units
            .map((unit) => {
              const uDone = unit.lessons.filter((l) => state.lessons[l.id]).length;
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
                      const isDone = !!state.lessons[lesson.id];
                      const unlocked = isLessonUnlocked(state, lesson.id);
                      return `
                        <button class="lesson-row${unlocked ? '' : ' lesson-row--locked'}" ${unlocked ? `data-nav="lesson:${esc(lesson.id)}"` : 'disabled'}>
                          <span class="lesson-check${isDone ? ' done' : ''}">${isDone ? '✓' : unlocked ? '→' : '×'}</span>
                          <span style="flex:1">${esc(lesson.title)}</span>
                          <span class="faint">${unlocked ? `${lesson.duration} мин` : 'сначала предыдущий'}</span>
                        </button>`;
                    })
                    .join('')}
                </div>`;
            })
            .join('') : '<div class="curriculum-lock"><strong>Уровень пока закрыт</strong><span>Заверши milestone предыдущего уровня, чтобы продолжить.</span></div>'}

          ${levelUnlocked ? `<div class="milestone-row${milestoneUnlocked ? ' milestone-row--open' : ''}${milestone?.passed ? ' milestone-row--done' : ''}">
            <div class="milestone-row__icon">${milestone?.passed ? '✓' : milestoneUnlocked ? 'M' : '×'}</div>
            <div><strong>Milestone ${esc(level.code)}</strong><div class="faint">${milestone?.passed ? `Пройдено · лучший результат ${milestone.bestScore}%` : milestoneUnlocked ? '5 вопросов · нужно 80%' : `Откроется после ${total - done} оставшихся уроков`}</div></div>
            ${milestoneUnlocked && !milestone?.passed ? `<button class="btn btn-primary" data-nav="milestone:${esc(level.id)}">Пройти</button>` : ''}
          </div>` : ''}
        </div>`;
    }).join('')}
  `;
}
