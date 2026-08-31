import { TEXTS } from '../data/reading.js';
import { normalize } from './ui.js';

export const MILESTONE_QUESTION_COUNT = 12;
export const MILESTONE_SECTION_PASS_PERCENT = 67;

const SECTION_COUNTS = { knowledge: 6, reading: 3, listening: 3 };

function shuffled(items, random) {
  const result = [...items];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const swap = Math.floor(random() * (index + 1));
    [result[index], result[swap]] = [result[swap], result[index]];
  }
  return result;
}

function takeAcrossLessons(items, count, random) {
  const picked = [];
  const usedLessons = new Set();
  const pool = shuffled(items, random);

  for (const item of pool) {
    if (picked.length >= count) break;
    if (usedLessons.has(item.lessonId)) continue;
    picked.push(item);
    usedLessons.add(item.lessonId);
  }
  for (const item of pool) {
    if (picked.length >= count) break;
    if (!picked.includes(item)) picked.push(item);
  }
  return picked;
}

function knowledgeQuestions(level, random) {
  const exercises = level.units.flatMap((unit) => unit.lessons.flatMap((lesson) =>
    lesson.exercises.map((exercise, index) => ({
      ...exercise,
      sourceId: `${lesson.id}:${index}`,
      lessonId: lesson.id,
      lessonTitle: lesson.title,
    })),
  ));
  const production = exercises.filter((exercise) => ['order', 'translate'].includes(exercise.type));
  const recognition = exercises.filter((exercise) => exercise.type === 'choice');
  const selected = [
    ...takeAcrossLessons(production, 2, random),
    ...takeAcrossLessons(recognition, 4, random),
  ];

  return shuffled(selected, random).map((exercise) => ({
    id: `knowledge:${exercise.sourceId}`,
    section: 'knowledge',
    mode: exercise.type === 'choice' ? 'choice' : 'input',
    prompt: exercise.prompt,
    answer: exercise.answer,
    options: exercise.options ? shuffled(exercise.options, random) : null,
    source: exercise.lessonTitle,
  }));
}

function textQuestions(text, section, random) {
  return shuffled(text.questions, random).map((question, index) => ({
    id: `${section}:${text.id}:${index}:${question.answer}`,
    section,
    mode: 'choice',
    prompt: question.q,
    answer: question.answer,
    options: shuffled(question.options, random),
    source: text.title,
  }));
}

export function buildMilestoneAssessment(level, random = Math.random) {
  const texts = shuffled(TEXTS.filter((text) => text.level === level.code), random);
  if (texts.length < 2) throw new Error(`Milestone ${level.code} requires two level texts`);

  const readingText = texts[0];
  const listeningText = texts[1];
  const questions = [
    ...knowledgeQuestions(level, random),
    ...textQuestions(readingText, 'reading', random),
    ...textQuestions(listeningText, 'listening', random),
  ];
  if (questions.length !== MILESTONE_QUESTION_COUNT) {
    throw new Error(`Milestone ${level.code} produced ${questions.length} questions`);
  }
  return { questions, readingText, listeningText };
}

export function milestoneAnswerCorrect(question, value) {
  if (!question) return false;
  if (question.mode === 'choice') return value === question.answer;
  return normalize(value) === normalize(question.answer);
}

export function scoreMilestoneAssessment(questions, answers, overallPassPercent) {
  const sections = {};
  for (const [name, expected] of Object.entries(SECTION_COUNTS)) {
    const indexes = questions
      .map((question, index) => (question.section === name ? index : -1))
      .filter((index) => index >= 0);
    const correct = indexes.filter((index) => answers[index]).length;
    const total = indexes.length || expected;
    sections[name] = {
      correct,
      total,
      percent: Math.round((correct / total) * 100),
    };
  }
  const correct = answers.filter(Boolean).length;
  const total = questions.length;
  const percent = total ? Math.round((correct / total) * 100) : 0;
  const sectionsPassed = Object.values(sections)
    .every((section) => section.percent >= MILESTONE_SECTION_PASS_PERCENT);

  return {
    correct,
    total,
    percent,
    sections,
    passed: percent >= overallPassPercent && sectionsPassed,
  };
}
