import type { DeeperLink, LectureSection, Lesson, ModuleId, Question, QuestionDraft, QuestionTemplate } from '../../types.ts';
import { CANONICAL_SEED, makeRng } from '../../lib/variants.ts';

/** `String.raw` as a tag: backslashes in LaTeX need no escaping. */
export const r = String.raw;

interface LessonInput {
  id: string;
  moduleId: ModuleId;
  title: string;
  blurb: string;
  minutes: number;
  lecture: LectureSection[];
  deeper?: DeeperLink[];
  questions: (QuestionDraft | QuestionTemplate)[];
  extra: (QuestionDraft | QuestionTemplate)[];
}

/** A fixed question as is; a template as its canonical variant plus the generator. */
function materialise(q: QuestionDraft | QuestionTemplate, moduleId: ModuleId, lessonId: string): Question {
  if ('generate' in q) return { ...q, ...q.generate(makeRng(CANONICAL_SEED)), moduleId, lessonId };
  return { ...q, moduleId, lessonId };
}

/** Builds a lesson and stamps its module and lesson id onto every question. */
export function defineLesson({ questions, extra, ...meta }: LessonInput): Lesson {
  return {
    ...meta,
    questions: questions.map((q) => materialise(q, meta.moduleId, meta.id)),
    extra: extra.map((q) => ({ ...materialise(q, meta.moduleId, meta.id), extra: true })),
  };
}
