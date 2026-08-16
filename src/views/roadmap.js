import { loadState } from '../core/storage.js';
import { CURRICULUM } from '../data/curriculum.js';
import { esc, progressBar, plural } from '../core/ui.js';

export function renderRoadmap() {
  const state = loadState();

  return `
    <h1>Дорожная карта</h1>
    <p class="subtitle">От нуля до Advanced. Уроки открываются по порядку — каждый следующий опирается на предыдущий.</p>

    ${CURRICULUM.map((level) => {
      const total = level.units.reduce((n, u) => n + u.lessons.length, 0);
      const done = level.units.reduce(
        (n, u) => n + u.lessons.filter((l) => state.lessons[l.id]).length,
        0,
      );
      const complete = total > 0 && done === total;

      return `
        <div class="level-card">
          <div class="level-head">
            <span class="level-code${complete ? ' done' : ''}">${esc(level.code)}</span>
            <strong style="font-size:17px">${esc(level.title)}</strong>
            <span class="faint" style="margin-left:auto">${
              total ? `${done} / ${total}` : 'скоро'
            }</span>
          </div>
          <div class="faint" style="margin-bottom:12px">${esc(level.goal)}</div>
          ${total ? progressBar((done / total) * 100, complete) : ''}

          ${level.units
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
                      return `
                        <button class="lesson-row" data-nav="lesson:${esc(lesson.id)}">
                          <span class="lesson-check${isDone ? ' done' : ''}">${isDone ? '✓' : ''}</span>
                          <span style="flex:1">${esc(lesson.title)}</span>
                          <span class="faint">${lesson.duration} мин</span>
                        </button>`;
                    })
                    .join('')}
                </div>`;
            })
            .join('')}
        </div>`;
    }).join('')}
  `;
}
