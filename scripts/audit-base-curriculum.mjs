import { CURRICULUM } from '../src/data/curriculum.js';
import { allGrammarItems } from '../src/data/grammar.js';
import { TEXTS } from '../src/data/reading.js';
import { VOCAB, VOCAB_BY_ID } from '../src/data/vocab.js';
import { WRITING_TASKS } from '../src/data/writing-tasks.js';
import { SCENARIOS } from '../src/core/dialogue.js';

const BASE_LEVELS = ['A0', 'A1', 'A2', 'B1', 'B2'];
const LEVEL_RANK = Object.fromEntries(BASE_LEVELS.map((level, index) => [level, index]));

function wordCount(text) {
  return String(text || '').trim().split(/\s+/).filter(Boolean).length;
}

function exerciseCounts(lessons) {
  return lessons.flatMap((lesson) => lesson.exercises).reduce((counts, exercise) => {
    counts[exercise.type] = (counts[exercise.type] || 0) + 1;
    return counts;
  }, {});
}

function levelMetrics(level, grammarItems) {
  const lessons = level.units.flatMap((unit) => unit.lessons);
  const vocabularyIds = [...new Set(lessons.flatMap((lesson) => lesson.vocab))];
  const readings = TEXTS.filter((text) => text.level === level.code);
  const exercises = exerciseCounts(lessons);
  const exerciseTotal = Object.values(exercises).reduce((sum, count) => sum + count, 0);
  const futureVocabulary = vocabularyIds
    .map((id) => VOCAB_BY_ID[id])
    .filter((word) => word && LEVEL_RANK[word.level] > LEVEL_RANK[level.code])
    .map((word) => `${word.en} (${word.level})`);

  return {
    level: level.code,
    units: level.units.length,
    lessons: lessons.length,
    plannedMinutes: lessons.reduce((sum, lesson) => sum + lesson.duration, 0),
    vocabulary: vocabularyIds.length,
    grammarPhrases: grammarItems.filter((item) => item.levelCode === level.code).length,
    exercises: { total: exerciseTotal, ...exercises },
    choiceSharePercent: Math.round(((exercises.choice || 0) / Math.max(1, exerciseTotal)) * 100),
    reading: {
      texts: readings.length,
      questions: readings.reduce((sum, text) => sum + text.questions.length, 0),
      words: readings.reduce(
        (sum, text) => sum + wordCount(text.paragraphs.join(' ')),
        0,
      ),
    },
    writingTasks: (WRITING_TASKS[level.code] || []).length,
    dialogueScenariosIntroduced: SCENARIOS.filter((scenario) => scenario.from === level.code).length,
    futureVocabulary,
    warnings: [
      !exercises.listen && 'no listening exercise in the curriculum path',
      level.code === 'B2' && (exercises.translate || 0) < lessons.length
        && 'fewer open translation tasks than lessons',
      futureVocabulary.length && 'vocabulary from a later level is introduced early',
    ].filter(Boolean),
  };
}

const levels = CURRICULUM.filter((level) => BASE_LEVELS.includes(level.code));
const grammarItems = allGrammarItems();
const usedVocabulary = new Set(
  levels.flatMap((level) => level.units.flatMap((unit) => unit.lessons.flatMap((lesson) => lesson.vocab))),
);
const report = {
  generatedAt: new Date().toISOString(),
  scope: 'A0-B2 foundation curriculum',
  totals: {
    levels: levels.length,
    units: levels.reduce((sum, level) => sum + level.units.length, 0),
    lessons: levels.reduce(
      (sum, level) => sum + level.units.reduce((unitSum, unit) => unitSum + unit.lessons.length, 0),
      0,
    ),
    plannedMinutes: levels.reduce(
      (sum, level) => sum + level.units.flatMap((unit) => unit.lessons)
        .reduce((lessonSum, lesson) => lessonSum + lesson.duration, 0),
      0,
    ),
    vocabularyInDeck: VOCAB.filter((word) => BASE_LEVELS.includes(word.level)).length,
    vocabularyUsedByBase: usedVocabulary.size,
    vocabularyUnusedByBase: VOCAB.filter(
      (word) => BASE_LEVELS.includes(word.level) && !usedVocabulary.has(word.id),
    ).length,
    grammarPhrases: grammarItems.filter((item) => BASE_LEVELS.includes(item.levelCode)).length,
    readingTexts: TEXTS.filter((text) => BASE_LEVELS.includes(text.level)).length,
    writingTasks: BASE_LEVELS.reduce((sum, level) => sum + (WRITING_TASKS[level] || []).length, 0),
    dialogueScenarios: SCENARIOS.filter((scenario) => BASE_LEVELS.includes(scenario.from)).length,
  },
  levels: levels.map((level) => levelMetrics(level, grammarItems)),
};

console.log(JSON.stringify(report, null, 2));
