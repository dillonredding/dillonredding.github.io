import { Route, Routes } from 'react-router-dom';
import { ExercisesForProgrammersSummary, CountingCharacters, SayingHello, PrintingQuotes } from './features';
import { ExercisesForProgrammers, Home } from './layouts';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />}>
        <Route path="e4p" element={<ExercisesForProgrammers />}>
          <Route index element={<ExercisesForProgrammersSummary />} />
          <Route path="1" element={<SayingHello />} />
          <Route path="2" element={<CountingCharacters />} />
          <Route path="3" element={<PrintingQuotes />} />
        </Route>
      </Route>
    </Routes>
  );
}

export default App;
