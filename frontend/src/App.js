import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import '@/App.css';
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import Opportunities from './pages/Opportunities';
import Applications from './pages/Applications';
import Wallet from './pages/Wallet';
import Referrals from './pages/Referrals';
import Admin from './pages/Admin';
import { Toaster } from 'sonner';

const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/" />;
};

function App() {
  const [darkMode, setDarkMode] = useState(true);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <Dashboard darkMode={darkMode} setDarkMode={setDarkMode} />
              </PrivateRoute>
            }
          />
          <Route
            path="/opportunities"
            element={
              <PrivateRoute>
                <Opportunities darkMode={darkMode} setDarkMode={setDarkMode} />
              </PrivateRoute>
            }
          />
          <Route
            path="/applications"
            element={
              <PrivateRoute>
                <Applications darkMode={darkMode} setDarkMode={setDarkMode} />
              </PrivateRoute>
            }
          />
          <Route
            path="/wallet"
            element={
              <PrivateRoute>
                <Wallet darkMode={darkMode} setDarkMode={setDarkMode} />
              </PrivateRoute>
            }
          />
          <Route
            path="/referrals"
            element={
              <PrivateRoute>
                <Referrals darkMode={darkMode} setDarkMode={setDarkMode} />
              </PrivateRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <PrivateRoute>
                <Admin darkMode={darkMode} setDarkMode={setDarkMode} />
              </PrivateRoute>
            }
          />
        </Routes>
      </BrowserRouter>
      <Toaster position="top-center" richColors />
    </div>
  );
}

export default App;
