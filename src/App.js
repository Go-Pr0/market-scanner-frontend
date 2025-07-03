import './App.css';

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { RecentProvider } from './contexts/RecentContext';

// Pages
import Home from './pages/Home';
import SymbolsPage from './pages/Symbols';

function App() {
  return (
    <RecentProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/fully-diluted" element={<SymbolsPage />} />
        </Routes>
      </Router>
    </RecentProvider>
  );
}

export default App;
