import { useEffect, useState } from 'react';
import type { ModuleId, Question } from './types.ts';
import { TEST_BONUS_XP, LESSON_BONUS_XP, MODULE_BY_ID, PRACTICE_MAX_MISTAKES, testKey, lessonKey } from './data/modules.ts';
import { LESSONS, LESSON_BY_ID, lessonsOf } from './data/questions.ts';
import { buildExtraSession, buildLessonSession, buildMistakes, buildMixedReview, buildModuleTest } from './lib/session.ts';
import { useProgress } from './store/useProgress.ts';
import { Dashboard } from './views/Dashboard.tsx';
import { Lecture } from './views/Lecture.tsx';
import { Quiz } from './views/Quiz.tsx';
import { QuestionBrowser } from './views/QuestionBrowser.tsx';

/** `run` changes on every (re)start so that the view remounts with fresh state. */
type View =
  | { name: 'home' }
  | { name: 'lecture'; lessonId: string; run: number }
  | { name: 'practice'; lessonId: string; questions: Question[]; run: number }
  | { name: 'extra'; lessonId: string; questions: Question[]; run: number }
  | { name: 'test'; moduleId: ModuleId; questions: Question[]; run: number }
  | { name: 'mistakes'; questions: Question[]; run: number }
  | { name: 'review'; questions: Question[]; run: number };

const lessonNumber = (lessonId: string) => lessonsOf(LESSON_BY_ID[lessonId].moduleId).findIndex((l) => l.id === lessonId) + 1;

export default function App() {
  const [view, setView] = useState<View>({ name: 'home' });
  const theme = useProgress((s) => s.theme);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme === 'dark' ? '#0e1422' : '#f4f6fb');
  }, [theme]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [view]);

  // Author's page with every lecture and question: add #all to the address.
  const [showAll, setShowAll] = useState(window.location.hash === '#all');
  useEffect(() => {
    const onHash = () => setShowAll(window.location.hash === '#all');
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);
  if (showAll) return <QuestionBrowser />;

  const home = () => setView({ name: 'home' });
  const openLecture = (lessonId: string) => setView({ name: 'lecture', lessonId, run: Date.now() });
  const startPractice = (lessonId: string) => setView({ name: 'practice', lessonId, questions: buildLessonSession(lessonId), run: Date.now() });
  const startExtra = (lessonId: string) => setView({ name: 'extra', lessonId, questions: buildExtraSession(lessonId), run: Date.now() });
  const startTest = (moduleId: ModuleId) => setView({ name: 'test', moduleId, questions: buildModuleTest(moduleId), run: Date.now() });
  const startMistakes = () => {
    const questions = buildMistakes(useProgress.getState().mistakes);
    if (questions.length) setView({ name: 'mistakes', questions, run: Date.now() });
    else home();
  };
  const startReview = () => {
    const completed = useProgress.getState().completedNodes;
    const questions = buildMixedReview(LESSONS.filter((l) => completed[lessonKey(l.id)]).map((l) => l.id));
    if (questions.length) setView({ name: 'review', questions, run: Date.now() });
    else home();
  };

  switch (view.name) {
    case 'home':
      return (
        <Dashboard
          onOpenLecture={openLecture}
          onStartPractice={startPractice}
          onStartExtra={startExtra}
          onStartTest={startTest}
          onStartMistakes={startMistakes}
          onStartReview={startReview}
        />
      );

    case 'lecture':
      return (
        <Lecture
          key={view.run}
          lesson={LESSON_BY_ID[view.lessonId]}
          number={lessonNumber(view.lessonId)}
          onExit={home}
          onStartPractice={() => startPractice(view.lessonId)}
          onOpenLecture={openLecture}
        />
      );

    case 'practice': {
      const lesson = LESSON_BY_ID[view.lessonId];
      return (
        <Quiz
          key={view.run}
          title={`Lesson ${lessonNumber(lesson.id)} · ${lesson.title}`}
          questions={view.questions}
          mode="lesson"
          nodeKey={lessonKey(lesson.id)}
          bonusXp={LESSON_BONUS_XP}
          onExit={home}
          onRetry={() => startPractice(lesson.id)}
          onOpenLecture={() => openLecture(lesson.id)}
          maxMistakes={PRACTICE_MAX_MISTAKES}
          onUnlockExtra={() => useProgress.getState().unlockExtra(lesson.id)}
          onStartExtra={() => startExtra(lesson.id)}
        />
      );
    }

    case 'extra': {
      const lesson = LESSON_BY_ID[view.lessonId];
      return (
        <Quiz
          key={view.run}
          title={`Lesson ${lessonNumber(lesson.id)} · Extra practice`}
          questions={view.questions}
          mode="lesson"
          nodeKey={lessonKey(lesson.id)}
          bonusXp={LESSON_BONUS_XP}
          onExit={home}
          onRetry={() => startExtra(lesson.id)}
          onOpenLecture={() => openLecture(lesson.id)}
        />
      );
    }

    case 'test':
      return (
        <Quiz
          key={view.run}
          title={`${MODULE_BY_ID[view.moduleId].title} · Module Test`}
          questions={view.questions}
          mode="lesson"
          nodeKey={testKey(view.moduleId)}
          bonusXp={TEST_BONUS_XP}
          onExit={home}
          onRetry={() => startTest(view.moduleId)}
        />
      );

    case 'mistakes':
      return <Quiz key={view.run} title="Mistakes" questions={view.questions} mode="mistakes" onExit={home} onRetry={startMistakes} />;

    case 'review':
      return <Quiz key={view.run} title="Review" questions={view.questions} mode="review" onExit={home} onRetry={startReview} />;
  }
}
