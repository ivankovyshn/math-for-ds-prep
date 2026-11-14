import { useEffect, useState } from 'react';
import type { ExamResult, ModuleId, NodeId, Question } from './types.ts';
import { MODULE_BY_ID, NODE_BY_ID, nodeKey } from './data/modules.ts';
import { buildExam, buildNodeSession, buildReview } from './lib/session.ts';
import { useProgress } from './store/useProgress.ts';
import { Dashboard } from './views/Dashboard.tsx';
import { Exam } from './views/Exam.tsx';
import { ExamSummary } from './views/ExamSummary.tsx';
import { Quiz } from './views/Quiz.tsx';
import { QuestionBrowser } from './views/QuestionBrowser.tsx';

/** `run` changes on every (re)start so that the view remounts with fresh state. */
type View =
  | { name: 'home' }
  | { name: 'node'; moduleId: ModuleId; nodeId: NodeId; questions: Question[]; run: number }
  | { name: 'review'; questions: Question[]; run: number }
  | { name: 'exam'; questions: Question[]; run: number }
  | { name: 'examSummary'; result: ExamResult };

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

  // Author's page with the whole question bank: add #all to the address.
  const [showAll, setShowAll] = useState(window.location.hash === '#all');
  useEffect(() => {
    const onHash = () => setShowAll(window.location.hash === '#all');
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);
  if (showAll) return <QuestionBrowser />;

  const home = () => setView({ name: 'home' });
  const startNode = (moduleId: ModuleId, nodeId: NodeId) =>
    setView({ name: 'node', moduleId, nodeId, questions: buildNodeSession(moduleId, nodeId), run: Date.now() });
  const startReview = () => {
    const questions = buildReview(useProgress.getState().mistakes);
    if (questions.length) setView({ name: 'review', questions, run: Date.now() });
    else home();
  };
  const startExam = () => setView({ name: 'exam', questions: buildExam(), run: Date.now() });

  switch (view.name) {
    case 'home':
      return <Dashboard onStartNode={startNode} onStartReview={startReview} onStartExam={startExam} />;

    case 'node': {
      const node = NODE_BY_ID[view.nodeId];
      return (
        <Quiz
          key={view.run}
          title={`${MODULE_BY_ID[view.moduleId].title} · ${node.title}`}
          questions={view.questions}
          mode="lesson"
          nodeKey={nodeKey(view.moduleId, view.nodeId)}
          bonusXp={node.bonusXp}
          secondsPerQuestion={node.secondsPerQuestion}
          onExit={home}
          onRetry={() => startNode(view.moduleId, view.nodeId)}
        />
      );
    }

    case 'review':
      return <Quiz key={view.run} title="Review Mistakes" questions={view.questions} mode="review" onExit={home} onRetry={startReview} />;

    case 'exam':
      return <Exam key={view.run} questions={view.questions} onExit={home} onFinished={(result) => setView({ name: 'examSummary', result })} />;

    case 'examSummary':
      return <ExamSummary result={view.result} onExit={home} onReview={startReview} onRetake={startExam} />;
  }
}
