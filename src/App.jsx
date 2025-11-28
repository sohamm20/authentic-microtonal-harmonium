import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Harmonium from './components/Harmonium';
import Tanpura from './components/Tanpura';
import './App.css';

function App() {
  return (
    <Router>
      <div className="app">
        <nav className="app-nav">
          <Link to="/" className="nav-link">Harmonium</Link>
          <Link to="/tanpura" className="nav-link">Tanpura</Link>
        </nav>
        <Routes>
          <Route path="/" element={<Harmonium />} />
          <Route path="/tanpura" element={<Tanpura />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
