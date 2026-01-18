import { Routes, Route } from "react-router-dom";
import TeamSelector from "./components/TeamSelector";
import ScheduleView from "./components/ScheduleView";
import bavapData from "./data/bavap.json";
import cClassHeroesData from "./data/c-class-heroes.json";

function App() {
  return (
    <Routes>
      <Route path="/" element={<TeamSelector />} />
      <Route path="/bavap" element={<ScheduleView scheduleData={bavapData} />} />
      <Route path="/c-class-heroes" element={<ScheduleView scheduleData={cClassHeroesData} />} />
    </Routes>
  );
}

export default App;
