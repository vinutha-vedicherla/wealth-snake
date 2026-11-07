import { Navigate, Route, Routes } from 'react-router-dom';
import { GameProvider } from './game/GameProvider';
import GamePage from './pages/GamePage';
import ResultsPage from './pages/ResultsPage';
import StartPage from './pages/StartPage';

export default function App() {
  return (
    <GameProvider>
      <Routes>
        <Route path="/" element={<StartPage />} />
        <Route path="/play" element={<GamePage />} />
        <Route path="/results" element={<ResultsPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </GameProvider>
  );
}
