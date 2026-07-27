import { Routes, Route } from 'react-router-dom';
import Header from '@/components/Header';
import HomePage from '@/pages/HomePage';
import TemperaturePatternPage from '@/pages/TemperaturePatternPage';
import YarnLibraryPage from '@/pages/YarnLibraryPage';
import PatternBuilderPage from '@/pages/PatternBuilderPage';

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-pink-50">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/temperatur" element={<TemperaturePatternPage />} />
          <Route path="/monsterbyggare" element={<PatternBuilderPage />} />
          <Route path="/garnbibliotek" element={<YarnLibraryPage />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
