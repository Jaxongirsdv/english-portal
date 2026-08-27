import { CURRICULUM, allLessons, findLesson } from '../data/curriculum.js';

export const MILESTONE_PASS_PERCENT = 80;

export function lessonsForLevel(level) {
  return level.units.flatMap((unit) => unit.lessons);
}

export function levelProgress(state, level) {
  const lessons = lessonsForLevel(level);
  const completed = lessons.filter((lesson) => state.lessons?.[lesson.id]);
  const scores = completed.map((lesson) => state.lessons[lesson.id].score || 0);
  return {
    done: completed.length,
    total: lessons.length,
    average: scores.length ? Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length) : 0,
    complete: lessons.length > 0 && completed.length === lessons.length,
  };
}

export function isLevelUnlocked(state, levelOrCode) {
  const index = typeof levelOrCode === 'string'
    ? CURRICULUM.findIndex((level) => level.code === levelOrCode || level.id === levelOrCode)
    : CURRICULUM.indexOf(levelOrCode);
  if (index <= 0) return index === 0;
  const level = CURRICULUM[index];
  const alreadyStarted = lessonsForLevel(level).some((lesson) => state.lessons?.[lesson.id]);
  return alreadyStarted || !!state.milestones?.[CURRICULUM[index - 1].id]?.passed;
}

export function isLessonUnlocked(state, lessonId) {
  if (state.lessons?.[lessonId]) return true;
  const lesson = findLesson(lessonId);
  if (!lesson) return false;
  const level = CURRICULUM.find((item) => item.id === lesson.levelId);
  if (!level || !isLevelUnlocked(state, level)) return false;
  const lessons = lessonsForLevel(level);
  const index = lessons.findIndex((item) => item.id === lessonId);
  return index === 0 || !!state.lessons?.[lessons[index - 1].id];
}

export function isMilestoneUnlocked(state, levelId) {
  const level = CURRICULUM.find((item) => item.id === levelId);
  return !!level && isLevelUnlocked(state, level) && levelProgress(state, level).complete;
}

export function nextCurriculumStep(state) {
  for (const level of CURRICULUM) {
    if (!isLevelUnlocked(state, level)) continue;
    const lesson = lessonsForLevel(level).find((item) => !state.lessons?.[item.id]);
    if (lesson) return { type: 'lesson', level, lesson: findLesson(lesson.id), route: `lesson:${lesson.id}` };
    if (!state.milestones?.[level.id]?.passed) {
      return { type: 'milestone', level, route: `milestone:${level.id}` };
    }
  }
  return null;
}

export function nextLevel(levelId) {
  const index = CURRICULUM.findIndex((level) => level.id === levelId);
  return index >= 0 ? CURRICULUM[index + 1] || null : null;
}

