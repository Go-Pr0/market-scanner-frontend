import './App.css';

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { RecentProvider } from './contexts/RecentContext';
import { AuthProvider } from './contexts/AuthContextNew';

// Components
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Home from './pages/Home';
import SymbolsPage from './pages/Symbols';
import TrendSpiderPage from './pages/TrendSpider';
import LoginPage from './pages/Login';
import TradeSetupPage from './pages/TradeSetup';
import TradeChatPage from './pages/TradeChat';
import ProfilePage from './pages/Profile';

function App() {
  return (
    <AuthProvider>
      <RecentProvider>
        <Router>
          <Routes>
            {/* Public route for login */}
            <Route path="/login" element={<LoginPage />} />
            
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
            <Route path="/trade-setup" element={
              <ProtectedRoute>
                <TradeSetupPage />
              </ProtectedRoute>
            } />
            <Route path="/trade-chat" element={
              <ProtectedRoute>
                <TradeChatPage />
              </ProtectedRoute>
            } />
            <Route path="/profile" element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            } />
          </Routes>
        </Router>
      </RecentProvider>
    </AuthProvider>
  );
}

export default App;