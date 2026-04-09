import { useState } from 'react';
import LandingPage from './components/LandingPage';
import AnalysisPage from './components/AnalysisPage';
import ResultsPage from './components/ResultsPage';
import BudgetPage from './components/BudgetPage';

type Page = 'landing' | 'analysis' | 'results' | 'budget';

export default function App() {
  const [page, setPage] = useState<Page>('landing');
  const [resultData, setResultData] = useState<any>(null);

  if (page === 'landing') {
    return (
      <LandingPage
        onStart={() => setPage('analysis')}
        onBudget={() => setPage('budget')}
      />
    );
  }

  if (page === 'analysis') {
    return (
      <AnalysisPage
        onBack={() => setPage('landing')}
        onComplete={(data) => {
          setResultData(data);
          setPage('results');
        }}
      />
    );
  }

  if (page === 'results') {
    return (
      <ResultsPage
        data={resultData}
        onBack={() => setPage('landing')}
        onNewAnalysis={() => setPage('analysis')}
        onBudget={() => setPage('budget')}
      />
    );
  }

  return (
    <BudgetPage
      onBack={() => setPage('landing')}
      onAnalyse={() => setPage('analysis')}
    />
  );
}
