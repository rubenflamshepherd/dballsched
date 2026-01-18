import { Routes, Route, Navigate } from 'react-router-dom';
import SchedulePage from './components/SchedulePage';
import bavapSchedule from './data/bavap-schedule.json';
import cClassHeroesSchedule from './data/c-class-heroes-schedule.json';

function App() {
  return (
    <Routes>
      <Route path="/bavap" element={<SchedulePage scheduleData={bavapSchedule} />} />
      <Route path="/c-class-heroes" element={<SchedulePage scheduleData={cClassHeroesSchedule} />} />
      <Route path="/" element={<Navigate to="/bavap" replace />} />
    </Routes>
  );
}

export default App;
