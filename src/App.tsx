import { CountingCharacters, Menu, Navbar } from './features';

function App() {
  return (
    <div>
      <Navbar />
      <div className="container">
        <div className="columns">
          <div className="column is-narrow">
            <Menu />
          </div>
          <div className="column">
            <CountingCharacters />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
