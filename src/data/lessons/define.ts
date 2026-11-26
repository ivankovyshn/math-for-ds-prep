import type { LectureSection, Lesson, ModuleId, QuestionDraft } from '../../types.ts';

/** `String.raw` as a tag: backslashes in LaTeX need no escaping. */
export const r = String.raw;

interface LessonInput {
  id: string;
  moduleId: ModuleId;
  title: string;
  blurb: string;
  minutes: number;
  lecture: LectureSection[];
  questions: QuestionDraft[];
  extra: QuestionDraft[];
}

/** Builds a lesson and stamps its module and lesson id onto every question. */
export function defineLesson({ questions, extra, ...meta }: LessonInput): Lesson {
  return {
    ...meta,
    questions: questions.map((q) => ({ ...q, moduleId: meta.moduleId, lessonId: meta.id })),
    extra: extra.map((q) => ({ ...q, moduleId: meta.moduleId, lessonId: meta.id, extra: true })),
  };
}
