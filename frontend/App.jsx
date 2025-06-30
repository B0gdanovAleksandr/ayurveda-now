import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link, useNavigate } from 'react-router-dom';
import AuthForm from './components/AuthForm';
import PulseAnalyzer from './components/PulseAnalyzer';
import HistoryList from './components/HistoryList';

const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('jwt');
  return token ? children : <Navigate to="/login" />;
};

const Navbar = ({ onLogout }) => (
  <nav className="bg-blue-700 text-white px-4 py-2 flex justify-between items-center">
    <div className="font-bold text-lg">Ayurveda Now</div>
    <div className="space-x-4">
      <Link to="/analyze" className="hover:underline">Анализ</Link>
      <Link to="/history" className="hover:underline">История</Link>
      <button onClick={onLogout} className="ml-4 bg-blue-900 px-3 py-1 rounded hover:bg-blue-800">Выйти</button>
    </div>
  </nav>
);

const App = () => {
  const [authed, setAuthed] = useState(!!localStorage.getItem('jwt'));

  const handleLogout = () => {
    localStorage.removeItem('jwt');
    setAuthed(false);
  };

  const handleAuth = () => {
    setAuthed(true);
  };

  return (
    <Router>
      {authed && <Navbar onLogout={handleLogout} />}
      <Routes>
        <Route path="/login" element={
          authed ? <Navigate to="/analyze" /> : <AuthForm onAuth={handleAuth} />
        } />
        <Route path="/analyze" element={
          <PrivateRoute><PulseAnalyzer /></PrivateRoute>
        } />
        <Route path="/history" element={
          <PrivateRoute><HistoryList /></PrivateRoute>
        } />
        <Route path="*" element={<Navigate to={authed ? "/analyze" : "/login"} />} />
      </Routes>
    </Router>
  );
};

export default App; 