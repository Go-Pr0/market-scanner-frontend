import './App.css';

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { RecentProvider } from './contexts/RecentContext';
import { AuthProvider } from './contexts/AuthContext';

// Components
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Home from './pages/Home';
import SymbolsPage from './pages/Symbols';
import TrendSpiderPage from './pages/TrendSpider';
import VerificationPage from './pages/Verification';

function App() {
  return (
    <AuthProvider>
      <RecentProvider>
        <Router>
          <Routes>
            {/* Public route for verification */}
            <Route path="/verify" element={<VerificationPage />} />
            
            {/* Protected routes */}
            <Route path="/" element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            } />
            <Route path="/fully-diluted" element={
              <ProtectedRoute>
                <SymbolsPage />
              </ProtectedRoute>
            } />
            <Route path="/trendspider" element={
              <ProtectedRoute>
                <TrendSpiderPage />
              </ProtectedRoute>
            } />
          </Routes>
        </Router>
      </RecentProvider>
    </AuthProvider>
  );
}

export default App;
